from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import User, Book, Borrowing  # Import all models first
from app.routers import auth_router, users_router, books_router, borrowings_router

app = FastAPI(
    title="Library Management System",
    description="A library management system with user and book management",
    version="1.0.0"
)

# Create database tables after all models are imported
Base.metadata.create_all(bind=engine)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(books_router)
app.include_router(borrowings_router)


@app.get("/")
def root():
    return {"message": "Library Management System API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
