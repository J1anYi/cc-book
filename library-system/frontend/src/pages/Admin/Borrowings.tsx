import { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, message } from 'antd';
import { borrowingsService } from '../../services/borrowings';
import { Borrowing } from '../../types';

export default function AdminBorrowings() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const data = await borrowingsService.getBorrowings({
        status_filter: statusFilter,
        limit: 100,
      });
      setBorrowings(data);
    } catch (error) {
      message.error('获取借阅记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, [statusFilter]);

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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '读者',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: '书名',
      dataIndex: 'book_title',
      key: 'book_title',
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
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">借阅管理</h2>
        <Space>
          <span>状态筛选：</span>
          <Select
            style={{ width: 120 }}
            allowClear
            placeholder="全部"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'borrowed', label: '借阅中' },
              { value: 'returned', label: '已归还' },
              { value: 'overdue', label: '已逾期' },
            ]}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={borrowings}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
