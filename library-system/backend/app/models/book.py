from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String, unique=True, index=True)
    title = Column(String, nullable=False, index=True)
    author = Column(String, index=True)
    publisher = Column(String)
    category = Column(String, index=True)
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)
    location = Column(String)
    cover_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
