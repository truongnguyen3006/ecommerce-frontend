'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Switch, message, Card, Avatar, Tooltip } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { userManagementApi, UserResponse } from '@/services/userManagementApi';
import type { ColumnsType } from 'antd/es/table';

export default function AdminUserPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userManagementApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error(error);
      message.error('Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (id: number, checked: boolean) => {
    try {
      await userManagementApi.updateStatus(id, checked);
      message.success(`Đã ${checked ? 'mở khóa' : 'khóa'} tài khoản thành công`);
      // Update state cục bộ để đỡ phải gọi lại API
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: checked } : u));
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const columns: ColumnsType<UserResponse> = [
    {
      title: 'Avatar',
      key: 'avatar',
      width: 80,
      render: (_, record) => (
        <Avatar 
            style={{ backgroundColor: '#f56a00' }} 
            icon={<UserOutlined />} 
            size="large"
        >
            {record.fullName ? record.fullName.charAt(0).toUpperCase() : 'U'}
        </Avatar>
      ),
    },
    {
      title: 'Thông tin cá nhân',
      key: 'info',
      render: (_, record) => (
        <div>
            <div className="font-bold text-base">{record.fullName || 'Chưa cập nhật tên'}</div>
            <div className="text-gray-500 text-sm">@{record.email.split('@')[0]}</div>
        </div>
      )
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-600">
                <MailOutlined /> {record.email}
            </div>
            {record.phoneNumber && (
                <div className="flex items-center gap-2 text-gray-600">
                    <PhoneOutlined /> {record.phoneNumber}
                </div>
            )}
        </div>
      )
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (text) => text || <span className="text-gray-400 italic">Chưa cập nhật</span>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <div className="flex flex-col gap-2">
            <Tag color={record.status ? 'green' : 'red'}>
                {record.status ? 'Hoạt động' : 'Đã khóa'}
            </Tag>
            <Tooltip title="Bật để mở khóa, Tắt để khóa">
                <Switch 
                    checked={record.status} 
                    onChange={(checked) => handleStatusChange(record.id, checked)} 
                    checkedChildren="Active"
                    unCheckedChildren="Block"
                />
            </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Card title={`Quản lý Người dùng (${users.length})`} className="shadow-md">
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8 }} 
      />
    </Card>
  );
}