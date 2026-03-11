from typing import Optional

from app.config import settings
from app.storage.base import StorageStrategy


class OSSStorage(StorageStrategy):
    """Aliyun OSS storage strategy."""

    def __init__(self):
        # OSS client will be initialized when credentials are provided
        self._client = None
        self._bucket = None
        self._init_client()

    def _init_client(self):
        """Initialize OSS client if credentials are available."""
        if not settings.OSS_ACCESS_KEY_ID or not settings.OSS_ACCESS_KEY_SECRET:
            return

        try:
            import oss2
            auth = oss2.Auth(settings.OSS_ACCESS_KEY_ID, settings.OSS_ACCESS_KEY_SECRET)
            self._client = oss2.Bucket(auth, settings.OSS_ENDPOINT, settings.OSS_BUCKET_NAME)
        except Exception as e:
            print(f"OSS initialization error: {e}")

    async def upload_file(self, file_data: bytes, filename: str, content_type: str) -> str:
        """Upload a file to OSS and return its URL."""
        if not self._client:
            raise Exception("OSS not configured")

        try:
            self._client.put_object(filename, file_data, headers={'Content-Type': content_type})
            return self.get_file_url(filename)
        except Exception as e:
            raise Exception(f"OSS upload error: {e}")

    def get_file_url(self, filename: str) -> str:
        """Get the URL for a file."""
        if not self._client:
            return ""
        return f"https://{settings.OSS_BUCKET_NAME}.{settings.OSS_ENDPOINT}/{filename}"

    async def delete_file(self, filename: str) -> bool:
        """Delete a file from OSS."""
        if not self._client:
            return False

        try:
            self._client.delete_object(filename)
            return True
        except Exception as e:
            print(f"OSS delete error: {e}")
            return False
