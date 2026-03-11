"""通过 API 直接添加书籍"""
import requests

BASE_URL = "http://localhost:8001"

# 登录获取 token
login_resp = requests.post(
    f"{BASE_URL}/api/auth/login",
    data={"username": "admin", "password": "admin123"}
)
token = login_resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 书籍数据
books = [
    {
        "title": "Python编程从入门到实践",
        "isbn": "9787115428028",
        "author": "Eric Matthes",
        "publisher": "人民邮电出版社",
        "category": "编程",
        "location": "A区-1层-3架",
        "total_copies": 5,
        "available_copies": 5
    },
    {
        "title": "深入理解计算机系统",
        "isbn": "9787111544937",
        "author": "Randal E.Bryant",
        "publisher": "机械工业出版社",
        "category": "计算机",
        "location": "A区-2层-1架",
        "total_copies": 3,
        "available_copies": 3
    },
    {
        "title": "三体",
        "isbn": "9787536692930",
        "author": "刘慈欣",
        "publisher": "重庆出版社",
        "category": "科幻",
        "location": "B区-1层-2架",
        "total_copies": 10,
        "available_copies": 10
    },
    {
        "title": "活着",
        "isbn": "9787506365437",
        "author": "余华",
        "publisher": "作家出版社",
        "category": "文学",
        "location": "B区-2层-1架",
        "total_copies": 8,
        "available_copies": 8
    },
    {
        "title": "算法导论",
        "isbn": "9787111407010",
        "author": "Thomas H.Cormen",
        "publisher": "机械工业出版社",
        "category": "算法",
        "location": "A区-1层-5架",
        "total_copies": 4,
        "available_copies": 4
    }
]

# 添加书籍
for book in books:
    resp = requests.post(f"{BASE_URL}/api/books", json=book, headers=headers)
    if resp.status_code == 200:
        print(f"Added: {book['title']}")
    else:
        print(f"Failed to add {book['title']}: {resp.text}")

print("\nAll books added!")
