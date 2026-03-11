from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class BorrowingBase(BaseModel):
    book_id: int
    due_date: date


class BorrowingCreate(BorrowingBase):
    user_id: Optional[int] = None  # Optional for admin to specify user


class BorrowingRenew(BaseModel):
    new_due_date: date


class BorrowingResponse(BaseModel):
    id: int
    user_id: int
    book_id: int
    borrow_date: date
    due_date: date
    return_date: Optional[date] = None
    status: str
    operator_id: Optional[int] = None
    created_at: datetime

    # Additional info
    book_title: Optional[str] = None
    book_author: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
