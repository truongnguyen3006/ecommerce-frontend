'use client';

import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { authApi, LoginRequest, KeycloakTokenResponse } from '@/services/authApi';
import { useAuthStore, UserProfile } from '@/store/useAuthStore';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // --- LOGIC GIỮ NGUYÊN ---
  const handleLogin = async (values: LoginRequest) => {
    try {
      setLoading(true);

      const res = (await authApi.login({
        username: values.username,
        password: values.password
      })) as unknown as KeycloakTokenResponse;

      const accessToken = res.access_token;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('access_token', accessToken);
        if (res.refresh_token){
          sessionStorage.setItem('refresh_token', res.refresh_token);
        } 
      }

      let userProfile: UserProfile | undefined = undefined;
      
      try {
          userProfile = (await authApi.getMe()) as unknown as UserProfile;
          console.log("User Profile fetched:", userProfile);
      } catch (err) {
          console.error("Lỗi lấy thông tin user:", err);
      }

      login(accessToken, userProfile);

      const { user } = useAuthStore.getState();
      const isAdmin = user?.roles?.includes('admin');

      
      if (isAdmin) {
        message.success(`Xin chào Admin ${userProfile?.fullName || values.username}!`);
         router.replace('/admin');
      } else {
        message.success(`Đăng nhập thành công!`);
        router.replace('/');
      }

    } catch (error: unknown) {
      console.error(error);
      message.error('Đăng nhập thất bại! Vui lòng kiểm tra tài khoản/mật khẩu.');
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white text-gray-900 font-sans">
      <div className="w-full max-w-md p-6">
        
        {/* LOGO & HEADING */}
        <div className="text-center mb-10">
            {/* Giả lập Logo Nike bằng SVG đơn giản hoặc Text */}
            <div className="flex justify-center mb-4">
                <svg className="w-16 h-6" viewBox="0 0 50 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.6 11.2C3.8 11.2 3.2 10.6 3.2 9.8C3.2 9 3.8 8.4 4.6 8.4C5.4 8.4 6 9 6 9.8C6 10.6 5.4 11.2 4.6 11.2ZM4.6 0C2 0 0 2 0 4.6V11.4C0 14 2 16 4.6 16H45.4C48 16 50 14 50 11.4V4.6C50 2 48 0 45.4 0H4.6Z" fill="black"/>
                </svg>
            </div>
            <Title level={2} className="!font-black !mb-2 uppercase tracking-tighter">
                Đăng nhập tài khoản
            </Title>
            <Text className="text-gray-500 font-medium">
                Chào mừng bạn trở lại với Nike Store
            </Text>
        </div>

        <Form
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
          className="space-y-4"
        >
          <Form.Item<LoginRequest>
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
            className="mb-4"
          >
            <Input 
                placeholder="Tên đăng nhập" 
                className="rounded-lg h-12 border-gray-300 hover:border-black focus:border-black transition-colors"
            />
          </Form.Item>

          <Form.Item<LoginRequest>
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
            className="mb-6"
          >
            <Input.Password 
                placeholder="Mật khẩu" 
                className="rounded-lg h-12 border-gray-300 hover:border-black focus:border-black transition-colors"
            />
          </Form.Item>

          <div className="flex justify-between items-center mb-6 text-sm">
             <span className="text-gray-400">Quên mật khẩu?</span>
             <Link href="/register" className="text-black font-bold hover:underline">
                 Đăng ký ngay
             </Link>
          </div>

          <Form.Item>
            <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading} 
                className="bg-black text-white hover:!bg-gray-800 h-12 rounded-full font-bold uppercase tracking-wide shadow-lg border-none"
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
        
        <div className="mt-8 text-center text-xs text-gray-400">
            Bằng cách đăng nhập, bạn đồng ý với Chính sách bảo mật và Điều khoản sử dụng của chúng tôi.
        </div>
      </div>
    </div>
  );
}