import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.book import Book
from app.models.user import User
from app.schemas.book import BookCreate, BookUpdate, BookResponse
from app.routers.auth import get_current_user, get_current_librarian
from app.storage.factory import get_storage

router = APIRouter(prefix="/api/books", tags=["books"])


def get_book_with_presigned_url(book: Book) -> dict:
    """Get book data with presigned URL for cover image."""
    book_dict = {
        "id": book.id,
        "isbn": book.isbn,
        "title": book.title,
        "author": book.author,
        "publisher": book.publisher,
        "category": book.category,
        "total_copies": book.total_copies,
        "available_copies": book.available_copies,
        "location": book.location,
        "cover_image": None,
        "created_at": book.created_at
    }

    # Generate presigned URL if cover_image exists
    if book.cover_image:
        storage = get_storage()
        book_dict["cover_image"] = storage.get_file_url(book.cover_image)

    return book_dict


@router.get("")
def get_books(
    skip: int = 0,
    limit: int = 100,
    title: Optional[str] = None,
    author: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Book)
    if title:
        query = query.filter(Book.title.contains(title))
    if author:
        query = query.filter(Book.author.contains(author))
    if category:
        query = query.filter(Book.category == category)

    books = query.offset(skip).limit(limit).all()
    return [get_book_with_presigned_url(book) for book in books]


@router.get("/{book_id}")
def get_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    return get_book_with_presigned_url(book)


@router.post("", response_model=BookResponse)
def create_book(
    book_data: BookCreate,
    current_user: User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    # Check ISBN uniqueness if provided
    if book_data.isbn:
        if db.query(Book).filter(Book.isbn == book_data.isbn).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book with this ISBN already exists"
            )

    book = Book(**book_data.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.put("/{book_id}", response_model=BookResponse)
def update_book(
    book_id: int,
    book_data: BookUpdate,
    current_user: User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    update_data = book_data.model_dump(exclude_unset=True)

    # Check ISBN uniqueness if updating
    if "isbn" in update_data and update_data["isbn"]:
        existing = db.query(Book).filter(Book.isbn == update_data["isbn"]).first()
        if existing and existing.id != book_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book with this ISBN already exists"
            )

    for key, value in update_data.items():
        setattr(book, key, value)

    db.commit()
    db.refresh(book)
    return book


@router.post("/{book_id}/cover")
async def upload_cover(
    book_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    """Upload a cover image for a book."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        )

    # Read file data
    file_data = await file.read()

    # Generate unique filename (relative path)
    file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"covers/{book_id}_{uuid.uuid4().hex[:8]}.{file_ext}"

    # Upload to storage
    storage = get_storage()
    try:
        await storage.upload_file(file_data, filename, file.content_type)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )

    # Store only the relative filename in database
    book.cover_image = filename
    db.commit()
    db.refresh(book)

    # Return presigned URL for immediate use
    presigned_url = storage.get_file_url(filename)
    return {"message": "Cover uploaded successfully", "cover_image": presigned_url}


@router.delete("/{book_id}")
def delete_book(
    book_id: int,
    current_user: User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    db.delete(book)
    db.commit()
    return {"message": "Book deleted successfully"}
