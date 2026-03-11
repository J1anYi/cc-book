# cc-book

图书管理系统 - 前后端分离的全栈应用

## 技术栈

**后端：**
- Python 3.12
- FastAPI
- SQLAlchemy + SQLite
- JWT 认证

**前端：**
- React 18
- Vite
- TailwindCSS
- Ant Design

**存储：**
- MinIO / 阿里云 OSS（策略模式）

## 功能特性

- 用户注册/登录
- 图书浏览（列表/卡片视图）
- 借阅管理
- 管理员后台
- 图片上传（MinIO/OSS）

## 快速开始

### 后端

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
cp .env.example .env  # 配置环境变量
.venv/Scripts/uvicorn app.main:app --reload
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

## 默认管理员账户

- 用户名：admin
- 密码：admin123
