from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BookBase(BaseModel):
    isbn: Optional[str] = None
    title: str
    author: Optional[str] = None
    publisher: Optional[str] = None
    category: Optional[str] = None
    total_copies: int = 1
    available_copies: int = 1
    location: Optional[str] = None
    cover_image: Optional[str] = None


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    isbn: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    category: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    location: Optional[str] = None
    cover_image: Optional[str] = None


class BookResponse(BookBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
