import io
import time
import random
from typing import Optional
from functools import lru_cache
from datetime import timedelta

from minio import Minio
from minio.error import S3Error

from app.config import settings
from app.storage.base import StorageStrategy


class MinioStorage(StorageStrategy):
    """MinIO storage strategy with presigned URLs and caching."""

    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE.lower() == "true"
        )
        self.bucket = settings.MINIO_BUCKET
        self._ensure_bucket()

        # URL cache: {filename: (url, expire_time)}
        self._url_cache: dict = {}

        # Presigned URL expiration time in seconds (1 hour)
        self._presigned_expire = 3600

        # Cache expire offset: 5-10 minutes random before presigned expire
        # to prevent cache avalanche
        self._cache_offset_min = 300   # 5 minutes
        self._cache_offset_max = 600   # 10 minutes

    def _ensure_bucket(self):
        """Ensure the bucket exists."""
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
        except S3Error as e:
            print(f"MinIO bucket check error: {e}")

    def _get_cache_expire_time(self) -> float:
        """Get random cache expire time (presigned_expire - 5~10 minutes)."""
        random_offset = random.randint(self._cache_offset_min, self._cache_offset_max)
        return time.time() + self._presigned_expire - random_offset

    def _get_cached_url(self, filename: str) -> Optional[str]:
        """Get cached URL if not expired."""
        if filename in self._url_cache:
            url, expire_time = self._url_cache[filename]
            if time.time() < expire_time:
                return url
            else:
                # Cache expired, remove it
                del self._url_cache[filename]
        return None

    async def upload_file(self, file_data: bytes, filename: str, content_type: str) -> str:
        """Upload a file to MinIO and return a presigned URL."""
        try:
            self.client.put_object(
                self.bucket,
                filename,
                io.BytesIO(file_data),
                length=len(file_data),
                content_type=content_type
            )

            # Generate and cache presigned URL
            url = self.client.presigned_get_object(self.bucket, filename, expires=timedelta(seconds=self._presigned_expire))
            cache_expire = self._get_cache_expire_time()
            self._url_cache[filename] = (url, cache_expire)

            return url
        except S3Error as e:
            raise Exception(f"MinIO upload error: {e}")

    def get_file_url(self, filename: str) -> str:
        """Get a presigned URL for a file with caching."""
        if not filename:
            return ""

        # Handle legacy data: if filename is already a full URL, return it as-is
        if filename.startswith("http://") or filename.startswith("https://"):
            return filename

        # Check cache first
        cached_url = self._get_cached_url(filename)
        if cached_url:
            return cached_url

        # Generate new presigned URL
        try:
            url = self.client.presigned_get_object(self.bucket, filename, expires=timedelta(seconds=self._presigned_expire))
            cache_expire = self._get_cache_expire_time()
            self._url_cache[filename] = (url, cache_expire)
            return url
        except S3Error as e:
            print(f"MinIO get URL error: {e}")
            return ""

    async def delete_file(self, filename: str) -> bool:
        """Delete a file from MinIO."""
        try:
            self.client.remove_object(self.bucket, filename)
            # Remove from cache
            if filename in self._url_cache:
                del self._url_cache[filename]
            return True
        except S3Error as e:
            print(f"MinIO delete error: {e}")
            return False
