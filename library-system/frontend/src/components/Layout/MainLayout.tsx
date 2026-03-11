import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import {
  BookOutlined,
  ReadOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: '图书浏览',
    },
    {
      key: '/borrowings',
      icon: <ReadOutlined />,
      label: '我的借阅',
    },
    ...(user?.role === 'librarian'
      ? [
          {
            key: 'admin',
            icon: <SettingOutlined />,
            label: '系统管理',
            children: [
              { key: '/admin/users', label: '用户管理' },
              { key: '/admin/books', label: '图书管理' },
              { key: '/admin/borrowings', label: '借阅管理' },
            ],
          },
        ]
      : []),
  ];

  const getSelectedKeys = () => {
    const path = location.pathname;
    return [path];
  };

  const getOpenKeys = () => {
    if (location.pathname.startsWith('/admin')) {
      return ['admin'];
    }
    return [];
  };

  return (
    <Layout className="min-h-screen">
      <Sider width={220} className="bg-white shadow-md">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-blue-600">图书管理系统</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
        />
      </Sider>
      <Layout>
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between">
          <div className="text-lg font-medium">
            {menuItems.find((item) => item.key === location.pathname)?.label ||
              '图书管理系统'}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="cursor-pointer flex items-center gap-2">
              <Avatar icon={<UserOutlined />} />
              <span>{user?.name || user?.username}</span>
              <span className="text-gray-400 text-sm">
                ({user?.role === 'librarian' ? '管理员' : '读者'})
              </span>
            </div>
          </Dropdown>
        </Header>
        <Content className="m-6 p-6 bg-white rounded-lg shadow-sm">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
