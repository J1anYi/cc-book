from app.config import settings
from app.storage.base import StorageStrategy
from app.storage.minio_storage import MinioStorage
from app.storage.oss_storage import OSSStorage


_storage_instance: StorageStrategy = None


def get_storage() -> StorageStrategy:
    """Get the storage instance based on configuration."""
    global _storage_instance

    if _storage_instance is None:
        storage_type = settings.STORAGE_TYPE.lower()

        if storage_type == "minio":
            _storage_instance = MinioStorage()
        elif storage_type == "oss":
            _storage_instance = OSSStorage()
        else:
            # Default to MinIO
            _storage_instance = MinioStorage()

    return _storage_instance


def reset_storage():
    """Reset the storage instance (useful for testing)."""
    global _storage_instance
    _storage_instance = None
