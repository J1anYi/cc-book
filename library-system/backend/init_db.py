"""
初始化脚本：创建初始管理员账户
运行方式：python -m app.init_db
"""
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.utils.auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

def init_admin():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("Admin user already exists")
            return

        # Create admin user
        admin = User(
            username="admin",
            password_hash=get_password_hash("admin123"),
            name="系统管理员",
            role="librarian"
        )
        db.add(admin)
        db.commit()
        print("Admin user created successfully")
        print("Username: admin")
        print("Password: admin123")
    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_admin()
