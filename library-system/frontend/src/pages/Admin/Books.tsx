import { useEffect, useState, useRef } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Popconfirm, Upload, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import { booksService } from '../../services/books';
import { Book } from '../../types';

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBookId, setUploadingBookId] = useState<number | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await booksService.getBooks({ limit: 100 });
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

  const handleSubmit = async (values: Partial<Book>) => {
    try {
      if (editingBook) {
        await booksService.updateBook(editingBook.id, values);
        message.success('更新成功');
      } else {
        await booksService.createBook(values);
        message.success('添加成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingBook(null);
      fetchBooks();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await booksService.deleteBook(id);
      message.success('删除成功');
      fetchBooks();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || '删除失败');
    }
  };

  const handleCoverUpload = async (bookId: number, file: File) => {
    setUploadingBookId(bookId);
    try {
      await booksService.uploadCover(bookId, file);
      message.success('封面上传成功');
      fetchBooks();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || '上传失败');
    } finally {
      setUploadingBookId(null);
    }
  };

  const columns = [
    {
      title: '封面',
      key: 'cover',
      width: 80,
      render: (_: unknown, record: Book) => (
        <div className="w-12 h-16 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
          {record.cover_image ? (
            <Image
              src={record.cover_image}
              alt={record.title}
              width={48}
              height={64}
              className="object-cover"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <PictureOutlined className="text-gray-400 text-xl" />
          )}
        </div>
      ),
    },
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
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: unknown, record: Book) => (
        <Space>
          <Button
            size="small"
            icon={<UploadOutlined />}
            loading={uploadingBookId === record.id}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  handleCoverUpload(record.id, file);
                }
              };
              input.click();
            }}
          >
            封面
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingBook(record);
              form.setFieldsValue(record);
              setModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这本书吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">图书管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBook(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          添加图书
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={books}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBook ? '编辑图书' : '添加图书'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingBook(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{ total_copies: 1, available_copies: 1 }}
        >
          <Form.Item
            name="title"
            label="书名"
            rules={[{ required: true, message: '请输入书名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="isbn" label="ISBN">
            <Input />
          </Form.Item>
          <Form.Item name="author" label="作者">
            <Input />
          </Form.Item>
          <Form.Item name="publisher" label="出版社">
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input />
          </Form.Item>
          <Form.Item name="location" label="存放位置">
            <Input />
          </Form.Item>
          <Form.Item name="total_copies" label="总数量">
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="available_copies" label="可借数量">
            <InputNumber min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
