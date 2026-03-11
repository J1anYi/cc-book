from app.database import SessionLocal
from app.models.book import Book

db = SessionLocal()
# 删除所有书籍
db.query(Book).delete()
db.commit()
print('All books deleted')
db.close()
