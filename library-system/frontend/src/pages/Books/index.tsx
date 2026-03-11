import { useEffect, useState } from 'react';
import { Table, Input, Button, Space, Modal, Form, DatePicker, message, Tag, Card, Row, Col, Segmented } from 'antd';
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { booksService } from '../../services/books';
import { borrowingsService } from '../../services/borrowings';
import { useAuthStore } from '../../store/authStore';
import { Book } from '../../types';

type ViewMode = 'list' | 'card';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowForm] = Form.useForm();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('booksViewMode') as ViewMode) || 'list';
  });
  const { user } = useAuthStore();

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('booksViewMode', mode);
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await booksService.getBooks({
        title: searchTitle || undefined,
        limit: 100,
      });
      setBooks(data);
    } catch (error) {
      message.error('获取图书列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBorrow = async (values: { due_date: dayjs.Dayjs }) => {
    if (!selectedBook) return;

    try {
      await borrowingsService.createBorrowing({
        book_id: selectedBook.id,
        due_date: values.due_date.format('YYYY-MM-DD'),
      });
      message.success('借阅成功');
      setBorrowModalOpen(false);
      borrowForm.resetFields();
      fetchBooks();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || '借阅失败');
    }
  };

  const columns = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      width: 120,
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
      title: '库存',
      key: 'copies',
      width: 100,
      render: (_: unknown, record: Book) => (
        <span>
          {record.available_copies}/{record.total_copies}
        </span>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_: unknown, record: Book) => (
        <Tag color={record.available_copies > 0 ? 'green' : 'red'}>
          {record.available_copies > 0 ? '可借' : '已借完'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Book) => (
        <Button
          type="primary"
          size="small"
          disabled={record.available_copies === 0}
          onClick={() => {
            setSelectedBook(record);
            setBorrowModalOpen(true);
          }}
        >
          借阅
        </Button>
      ),
    },
  ];

  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {books.map((book) => (
        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={book.id}>
          <Card
            hoverable
            className="h-full"
            cover={
              <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
                {book.cover_image ? (
                  <img
                    alt={book.title}
                    src={book.cover_image}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <AppstoreOutlined className="text-4xl mb-2" />
                    <div className="text-sm">暂无封面</div>
                  </div>
                )}
              </div>
            }
            actions={[
              <Button
                type="primary"
                size="small"
                disabled={book.available_copies === 0}
                onClick={() => {
                  setSelectedBook(book);
                  setBorrowModalOpen(true);
                }}
              >
                {book.available_copies > 0 ? '借阅' : '已借完'}
              </Button>,
            ]}
          >
            <Card.Meta
              title={
                <div className="truncate" title={book.title}>
                  {book.title}
                </div>
              }
              description={
                <div className="space-y-1">
                  <div className="truncate text-gray-500" title={book.author || ''}>
                    {book.author || '未知作者'}
                  </div>
                  <div className="flex justify-between items-center">
                    <Tag color={book.available_copies > 0 ? 'green' : 'red'} className="text-xs">
                      {book.available_copies}/{book.total_copies}
                    </Tag>
                    <span className="text-xs text-gray-400">{book.category || '未分类'}</span>
                  </div>
                </div>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <Table
      columns={columns}
      dataSource={books}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Space>
          <Input
            placeholder="搜索书名"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onPressEnter={fetchBooks}
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={fetchBooks}>
            搜索
          </Button>
        </Space>

        <Segmented
          value={viewMode}
          onChange={(value) => handleViewModeChange(value as ViewMode)}
          options={[
            { value: 'list', icon: <UnorderedListOutlined />, label: '列表' },
            { value: 'card', icon: <AppstoreOutlined />, label: '卡片' },
          ]}
        />
      </div>

      {viewMode === 'card' ? renderCardView() : renderListView()}

      <Modal
        title={`借阅《${selectedBook?.title}》`}
        open={borrowModalOpen}
        onCancel={() => {
          setBorrowModalOpen(false);
          borrowForm.resetFields();
        }}
        onOk={() => borrowForm.submit()}
      >
        <Form
          form={borrowForm}
          onFinish={handleBorrow}
          layout="vertical"
          initialValues={{ due_date: dayjs().add(30, 'day') }}
        >
          <Form.Item
            name="due_date"
            label="归还日期"
            rules={[{ required: true, message: '请选择归还日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
