from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.book import Book
from app.models.user import User
from app.models.borrowing import Borrowing
from app.schemas.borrowing import BorrowingCreate, BorrowingResponse, BorrowingRenew
from app.routers.auth import get_current_user, get_current_librarian

router = APIRouter(prefix="/api/borrowings", tags=["borrowings"])


def build_borrowing_response(borrowing: Borrowing) -> dict:
    """Build response with book and user info."""
    return {
        **{c.name: getattr(borrowing, c.name) for c in borrowing.__table__.columns},
        "book_title": borrowing.book.title if borrowing.book else None,
        "book_author": borrowing.book.author if borrowing.book else None,
        "user_name": (borrowing.user.name or borrowing.user.username) if borrowing.user else None,
    }


@router.get("", response_model=list[BorrowingResponse])
def get_borrowings(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    query = db.query(Borrowing).options(
        joinedload(Borrowing.user),
        joinedload(Borrowing.book)
    )
    if status_filter:
        query = query.filter(Borrowing.status == status_filter)

    borrowings = query.offset(skip).limit(limit).all()
    return [build_borrowing_response(b) for b in borrowings]


@router.get("/my", response_model=list[BorrowingResponse])
def get_my_borrowings(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Borrowing).options(
        joinedload(Borrowing.user),
        joinedload(Borrowing.book)
    ).filter(Borrowing.user_id == current_user.id)
    if status_filter:
        query = query.filter(Borrowing.status == status_filter)

    borrowings = query.offset(skip).limit(limit).all()
    return [build_borrowing_response(b) for b in borrowings]


@router.post("", response_model=BorrowingResponse)
def create_borrowing(
    borrowing_data: BorrowingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Determine the user for this borrowing
    user_id = borrowing_data.user_id if current_user.role == "librarian" and borrowing_data.user_id else current_user.id

    # Check if book exists and is available
    book = db.query(Book).filter(Book.id == borrowing_data.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    if book.available_copies <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No available copies of this book"
        )

    # Create borrowing record
    borrowing = Borrowing(
        user_id=user_id,
        book_id=borrowing_data.book_id,
        due_date=borrowing_data.due_date,
        operator_id=current_user.id if current_user.role == "librarian" else None
    )

    # Decrease available copies
    book.available_copies -= 1

    db.add(borrowing)
    db.commit()
    db.refresh(borrowing)

    return build_borrowing_response(borrowing)


@router.put("/{borrowing_id}/return", response_model=BorrowingResponse)
def return_book(
    borrowing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    borrowing = db.query(Borrowing).filter(Borrowing.id == borrowing_id).first()
    if not borrowing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrowing record not found"
        )

    # Only the user who borrowed or a librarian can return
    if borrowing.user_id != current_user.id and current_user.role != "librarian":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to return this book"
        )

    if borrowing.return_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book already returned"
        )

    # Update borrowing record
    borrowing.return_date = date.today()
    borrowing.status = "returned"

    # Increase available copies
    book = db.query(Book).filter(Book.id == borrowing.book_id).first()
    if book:
        book.available_copies += 1

    db.commit()
    db.refresh(borrowing)

    return build_borrowing_response(borrowing)


@router.put("/{borrowing_id}/renew", response_model=BorrowingResponse)
def renew_borrowing(
    borrowing_id: int,
    renew_data: BorrowingRenew,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    borrowing = db.query(Borrowing).filter(Borrowing.id == borrowing_id).first()
    if not borrowing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrowing record not found"
        )

    # Only the user who borrowed or a librarian can renew
    if borrowing.user_id != current_user.id and current_user.role != "librarian":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to renew this borrowing"
        )

    if borrowing.return_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot renew a returned book"
        )

    if renew_data.new_due_date <= borrowing.due_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New due date must be after current due date"
        )

    borrowing.due_date = renew_data.new_due_date
    db.commit()
    db.refresh(borrowing)

    return build_borrowing_response(borrowing)
