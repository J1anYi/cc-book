import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { BookOutlined, UserOutlined, ReadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { booksService } from '../../services/books';
import { borrowingsService } from '../../services/borrowings';
import { Book, Borrowing } from '../../types';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [myBorrowings, setMyBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, borrowingsData] = await Promise.all([
          booksService.getBooks({ limit: 100 }),
          user?.role === 'reader'
            ? borrowingsService.getMyBorrowings()
            : borrowingsService.getBorrowings({ limit: 100 }),
        ]);
        setBooks(booksData);
        setMyBorrowings(borrowingsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.role]);

  const totalBooks = books.length;
  const availableBooks = books.filter((b) => b.available_copies > 0).length;
  const myActiveBorrowings = myBorrowings.filter((b) => b.status === 'borrowed').length;
  const returnedBooks = myBorrowings.filter((b) => b.status === 'returned').length;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">
        欢迎回来，{user?.name || user?.username}！
      </h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="图书总数"
              value={totalBooks}
              prefix={<BookOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="可借图书"
              value={availableBooks}
              prefix={<ReadOutlined className="text-green-500" />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title={user?.role === 'librarian' ? '借出中' : '我的借阅'}
              value={myActiveBorrowings}
              prefix={<UserOutlined className="text-orange-500" />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="已归还"
              value={returnedBooks}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {user?.role === 'librarian' && (
        <Card title="快捷操作" className="mt-6">
          <p className="text-gray-500">
            使用左侧菜单访问用户管理、图书管理和借阅管理功能。
          </p>
        </Card>
      )}
    </div>
  );
}
