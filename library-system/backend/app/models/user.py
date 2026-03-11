from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="reader")  # reader, librarian
    name = Column(String)
    phone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    borrowings = relationship("Borrowing", foreign_keys="Borrowing.user_id", back_populates="user")
