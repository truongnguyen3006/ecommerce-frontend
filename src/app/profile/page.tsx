'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Avatar, Typography, message, Skeleton, Divider, Tag } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, RollbackOutlined, SafetyCertificateOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi, UpdateProfileRequest } from '@/services/authApi';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, login } = useAuthStore(); 
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // --- LOGIC GIỮ NGUYÊN 100% ---
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
      });
    }
  }, [isAuthenticated, user, router, form]);

  const handleUpdate = async (values: UpdateProfileRequest) => {
    setLoading(true);
    try {
      const updatedUser = await authApi.updateProfile(values);
      
      const currentToken = localStorage.getItem('access_token');
      if (currentToken) {
         login(currentToken, updatedUser);
      }

      message.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error: unknown) { 
      if (axios.isAxiosError(error) && error.response) {
        const msg = error.response.data?.message || 'Có lỗi xảy ra khi cập nhật';
        message.error(msg);
      } else if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Lỗi không xác định');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 flex justify-center"><Skeleton active paragraph={{ rows: 6 }} className="max-w-2xl" /></div>;

  // --- GIAO DIỆN MỚI ---
  return (
    <div className="min-h-screen bg-white md:bg-gray-50 flex justify-center py-8 md:py-12 px-4 font-sans">
      <div className="w-full max-w-4xl">
        
        {/* Header Tiêu đề nằm ngoài Card */}
        <div className="mb-6 flex justify-between items-end px-2">
             <div>
                <Title level={2} className="!m-0 !font-black tracking-tight uppercase">Hồ sơ của tôi</Title>
                <Text type="secondary">Quản lý thông tin cá nhân và bảo mật</Text>
             </div>
             {/* Nút Edit nằm đây để dễ thao tác */}
             {!isEditing && (
                <Button 
                    type="default" 
                    shape="round"
                    icon={<EditOutlined />} 
                    onClick={() => setIsEditing(true)}
                    className="hover:!border-black hover:!text-black font-medium"
                >
                    Chỉnh sửa
                </Button>
             )}
        </div>

        <Card 
            bordered={false}
            className="w-full shadow-xl rounded-3xl overflow-hidden"
            bodyStyle={{ padding: 0 }} // Reset padding để tự layout
        >
            <div className="flex flex-col md:flex-row">
                
                {/* CỘT TRÁI: AVATAR & INFO SIDEBAR */}
                <div className="md:w-1/3 bg-gray-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
                    <div className="relative mb-4">
                        <Avatar 
                            size={140} 
                            icon={<UserOutlined />} 
                            className="bg-gray-200 text-gray-400 border-4 border-white shadow-lg"
                            src={null} 
                        />
                        <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 m-0 text-center">{user.username}</h2>
                    <div className="mt-2">
                        <Tag icon={<SafetyCertificateOutlined />} color="black" className="px-3 py-1 rounded-full border-none">
                            TechSale Member
                        </Tag>
                    </div>
                    
                    <div className="mt-8 w-full space-y-3 hidden md:block">
                        <div className="p-3 bg-white rounded-xl text-xs text-gray-500 shadow-sm border border-gray-100 text-center">
                            Tham gia từ: 2024
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: FORM */}
                <div className="flex-1 p-8 bg-white">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdate}
                        disabled={!isEditing}
                        requiredMark={false} // Ẩn dấu sao đỏ cho sạch
                        size="large"
                    >
                        {/* Nhóm 1: Thông tin cơ bản */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Thông tin cơ bản</h3>
                            
                            <Form.Item 
                                label={<span className="font-semibold text-gray-700">Họ và tên</span>} 
                                name="fullName" 
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input placeholder="Nhập họ và tên" className="rounded-lg font-medium text-gray-900" />
                            </Form.Item>

                            <Form.Item 
                                label={<span className="font-semibold text-gray-700">Email</span>} 
                                name="email" 
                                rules={[{ type: 'email' }]}
                            >
                                <Input 
                                    prefix={<MailOutlined className="text-gray-400" />} 
                                    placeholder="example@email.com" 
                                    className="rounded-lg text-gray-600 bg-gray-50 border-gray-200"
                                    // Thường email không cho sửa, nếu muốn chặn thì thêm readOnly
                                />
                            </Form.Item>
                        </div>

                        <Divider className="my-6" />

                        {/* Nhóm 2: Liên hệ */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Liên hệ & Giao hàng</h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <Form.Item 
                                    label={<span className="font-semibold text-gray-700">Số điện thoại</span>} 
                                    name="phoneNumber"
                                >
                                    <Input 
                                        prefix={<PhoneOutlined className="text-gray-400" />} 
                                        placeholder="0987..." 
                                        className="rounded-lg" 
                                    />
                                </Form.Item>

                                <Form.Item 
                                    label={<span className="font-semibold text-gray-700">Địa chỉ</span>} 
                                    name="address"
                                >
                                    <Input.TextArea 
                                        rows={3} 
                                        placeholder="Số nhà, đường, phường, quận..." 
                                        className="rounded-lg !resize-none"
                                        showCount={isEditing}
                                        maxLength={200}
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-gray-100">
                                <Button 
                                    size="large"
                                    className="rounded-full px-8 border-gray-300 hover:border-gray-400 hover:text-gray-600"
                                    onClick={() => {
                                        setIsEditing(false);
                                        form.resetFields();
                                    }} 
                                    icon={<RollbackOutlined />}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loading}
                                    icon={<SaveOutlined />}
                                    size="large"
                                    className="bg-black text-white hover:!bg-gray-800 rounded-full px-8 shadow-lg border-none font-bold"
                                >
                                    Lưu thay đổi
                                </Button>
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}