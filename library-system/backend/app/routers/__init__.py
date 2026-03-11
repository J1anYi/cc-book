from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.books import router as books_router
from app.routers.borrowings import router as borrowings_router

__all__ = ["auth_router", "users_router", "books_router", "borrowings_router"]
