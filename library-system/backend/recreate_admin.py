"""重新创建管理员账户"""
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.utils.auth import get_password_hash

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# 删除旧的管理员
db.query(User).filter(User.username == 'admin').delete()
db.commit()

# 创建新管理员
admin = User(
    username='admin',
    password_hash=get_password_hash('admin123'),
    name='系统管理员',
    role='librarian'
)
db.add(admin)
db.commit()
print('Admin user recreated successfully')
db.close()
