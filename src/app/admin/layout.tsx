'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, message, Spin } from 'antd'; 
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  PlusCircleOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); 
  
  // Lấy user từ Store
  const { user, logout, isAuthenticated } = useAuthStore();
  
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); 
  const [isChecking, setIsChecking] = useState(true); // Thêm trạng thái loading riêng

  useEffect(() => {
    const checkAuth = () => {
        // 1. Kiểm tra Token trong LocalStorage (Nguồn sự thật đáng tin cậy nhất khi vừa reload)
        // Cần check window để tránh lỗi SSR
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        // Trường hợp 1: Không có token trong localStorage -> Chắc chắn chưa đăng nhập
        if (!token) {
            router.push('/login');
            return;
        }

        // Trường hợp 2: Có token nhưng Store chưa load xong (User null hoặc isAuthenticated false)
        // -> Đây chính là lúc vừa reload trang. Ta KHÔNG redirect, mà chờ (return) để effect chạy lại lần sau.
        if (!user || !isAuthenticated) {
             console.log("⏳ Đang đợi Hydration từ localStorage...");
             return; 
        }

        // Trường hợp 3: Đã có đủ thông tin, bắt đầu check quyền Admin
        if (!user?.roles?.includes('admin')) {
             message.error('Bạn không có quyền truy cập trang Admin!');
             router.push('/');
             return;
        }

        // Tất cả ok -> Cho phép hiển thị
        setIsAuthorized(true);
        setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, router, user]); // Effect sẽ chạy lại khi user/isAuthenticated thay đổi (tức là khi Store load xong)

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Màn hình Loading: Hiện khi chưa authorized HOẶC (quan trọng) khi store chưa load xong user
  // Sửa logic: Nếu đang authorized thì hiện nội dung, nếu không thì hiện Spin
  // Nhưng để tránh nháy, ta dùng biến isAuthorized làm chốt chặn.
  
  if (!isAuthorized) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
           <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
        </div>
      );
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm',
      children: [
        { key: '/admin/products', label: <Link href="/admin/products">Danh sách</Link> },
        { key: '/admin/products/create', label: <Link href="/admin/products/create">Thêm mới</Link>, icon: <PlusCircleOutlined /> },
      ],
    },
    {
      key: '/admin/orders',
      icon: <ShoppingOutlined />,
      label: <Link href="/admin/orders">Đơn hàng</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link href="/admin/users">Người dùng</Link>,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light" className="border-r border-gray-200">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
           <h1 className={`font-black text-xl transition-all ${collapsed ? 'hidden' : 'block'}`}>ADMIN</h1>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={[pathname]} 
          defaultOpenKeys={['/admin/products']}
          items={menuItems}
          className="border-none"
        />
      </Sider>
      
      <Layout>
        <Header className="bg-white px-4 border-b border-gray-200 flex justify-between items-center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          
          <div className="flex items-center gap-4">
             <span className="font-semibold">{user?.fullName || user?.username || 'Admin'}</span>
             <Button icon={<LogoutOutlined />} onClick={handleLogout} danger type="text">Logout</Button>
          </div>
        </Header>
        
        <Content className="m-4 p-6 bg-white rounded-lg shadow-sm overflow-auto">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}