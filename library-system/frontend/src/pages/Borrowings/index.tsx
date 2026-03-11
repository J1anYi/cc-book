import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, DatePicker, Modal, Form, message } from 'antd';
import { ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { borrowingsService } from '../../services/borrowings';
import { Borrowing } from '../../types';

export default function Borrowings() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [renewForm] = Form.useForm();

  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const data = await borrowingsService.getMyBorrowings();
      setBorrowings(data);
    } catch (error) {
      message.error('获取借阅记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleReturn = async (id: number) => {
    try {
      await borrowingsService.returnBook(id);
      message.success('归还成功');
      fetchBorrowings();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || '归还失败');
    }
  };

  const handleRenew = async (values: { new_due_date: dayjs.Dayjs }) => {
    if (!selectedBorrowing) return;

    try {
      await borrowingsService.renewBorrowing(
        selectedBorrowing.id,
        values.new_due_date.format('YYYY-MM-DD')
      );
      message.success('续借成功');
      setRenewModalOpen(false);
      renewForm.resetFields();
      fetchBorrowings();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      message.error(err.response?.data?.detail || '续借失败');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'borrowed':
        return <Tag color="blue">借阅中</Tag>;
      case 'returned':
        return <Tag color="green">已归还</Tag>;
      case 'overdue':
        return <Tag color="red">已逾期</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: '书名',
      dataIndex: 'book_title',
      key: 'book_title',
    },
    {
      title: '作者',
      dataIndex: 'book_author',
      key: 'book_author',
    },
    {
      title: '借阅日期',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
      width: 120,
    },
    {
      title: '应还日期',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
    },
    {
      title: '归还日期',
      dataIndex: 'return_date',
      key: 'return_date',
      width: 120,
      render: (date: string | null) => date || '-',
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: unknown, record: Borrowing) => getStatusTag(record.status),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Borrowing) => (
        <Space>
          {record.status === 'borrowed' && (
            <>
              <Button
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleReturn(record.id)}
              >
                归还
              </Button>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSelectedBorrowing(record);
                  setRenewModalOpen(true);
                }}
              >
                续借
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">我的借阅</h2>

      <Table
        columns={columns}
        dataSource={borrowings}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="续借"
        open={renewModalOpen}
        onCancel={() => {
          setRenewModalOpen(false);
          renewForm.resetFields();
        }}
        onOk={() => renewForm.submit()}
      >
        <Form
          form={renewForm}
          onFinish={handleRenew}
          layout="vertical"
          initialValues={{
            new_due_date: selectedBorrowing
              ? dayjs(selectedBorrowing.due_date).add(14, 'day')
              : dayjs().add(14, 'day'),
          }}
        >
          <Form.Item
            name="new_due_date"
            label="新的归还日期"
            rules={[{ required: true, message: '请选择新的归还日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) =>
                current && current < dayjs().startOf('day')
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
