from abc import ABC, abstractmethod
from typing import Optional


class StorageStrategy(ABC):
    """Abstract base class for storage strategies."""

    @abstractmethod
    async def upload_file(self, file_data: bytes, filename: str, content_type: str) -> str:
        """Upload a file and return its URL."""
        pass

    @abstractmethod
    def get_file_url(self, filename: str) -> str:
        """Get the URL for a file."""
        pass

    @abstractmethod
    async def delete_file(self, filename: str) -> bool:
        """Delete a file."""
        pass
