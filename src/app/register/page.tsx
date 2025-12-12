'use client';

import { Form, Input, Button, Card, message, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined, SolutionOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authApi, RegisterRequest } from '@/services/authApi';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- LOGIC GIỮ NGUYÊN ---
  const onFinish = async (values: RegisterRequest) => {
    setLoading(true);
    try {
      await authApi.register(values);
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
      
    } catch (error: unknown) { 
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <Card 
        bordered={false}
        className="w-full max-w-xl shadow-2xl rounded-2xl overflow-hidden"
        bodyStyle={{ padding: '2.5rem' }}
      >
        <div className="text-center mb-8">
          <Title level={2} className="!font-black uppercase tracking-tight !mb-2">Trở thành thành viên</Title>
          <Text className="text-gray-500">Tạo hồ sơ Nike Member của bạn để nhận ưu đãi và mua sắm sớm nhất.</Text>
        </div>

        <Form
          name="register_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          scrollToFirstError
          requiredMark={false} // Ẩn dấu sao đỏ, nhìn sạch hơn
        >
          {/* --- NHÓM 1: THÔNG TIN TÀI KHOẢN --- */}
          <div className="mb-6">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Thông tin tài khoản</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                name="username"
                label={<span className="font-semibold text-gray-700">Tên đăng nhập</span>}
                rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
                >
                <Input placeholder="Ví dụ: nike_fan_123" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                name="password"
                label={<span className="font-semibold text-gray-700">Mật khẩu</span>}
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' }
                ]}
                >
                <Input.Password placeholder="******" className="rounded-lg" />
                </Form.Item>
             </div>
          </div>

          {/* --- NHÓM 2: THÔNG TIN CÁ NHÂN --- */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Thông tin cá nhân</h3>
            
            <Form.Item
                name="fullName"
                label={<span className="font-semibold text-gray-700">Họ và tên</span>}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
                <Input placeholder="Nhập họ tên đầy đủ" className="rounded-lg" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                name="email"
                label={<span className="font-semibold text-gray-700">Email</span>}
                rules={[
                    { type: 'email', message: 'Email không hợp lệ!' },
                    { required: true, message: 'Vui lòng nhập email!' }
                ]}
                >
                <Input placeholder="name@example.com" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                name="phoneNumber"
                label={<span className="font-semibold text-gray-700">Số điện thoại</span>}
                rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
                >
                <Input placeholder="09xxxxxxx" className="rounded-lg" />
                </Form.Item>
            </div>

            <Form.Item
                name="address"
                label={<span className="font-semibold text-gray-700">Địa chỉ nhận hàng</span>}
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
            >
                <Input.TextArea 
                rows={3} 
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." 
                className="rounded-lg !resize-none"
                />
            </Form.Item>
          </div>

          <Form.Item className="mt-8 mb-4">
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading} 
              size="large"
              className="bg-black text-white hover:!bg-gray-800 h-12 rounded-full font-bold uppercase tracking-wide shadow-lg border-none"
            >
              Đăng Ký Thành Viên
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text className="text-gray-500">Đã là thành viên? </Text>
          <Link href="/login" className="font-bold text-black border-b border-black hover:text-gray-600 transition-colors">
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  );
}