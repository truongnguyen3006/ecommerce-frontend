'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Result, Button, Steps, Spin, Card, Typography } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
import axiosClient from '@/lib/axiosClient';

const { Title, Text } = Typography;

type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'PAYMENT_FAILED';

interface NotificationMessage {
  status: OrderStatus;
  message: string;
}

interface OrderApiResponse {
  orderNumber: string;
  status: OrderStatus;
}

// Gom State lại cho gọn
interface PageState {
  status: OrderStatus;
  msg: string;
  currentStep: number;
}

export default function OrderWaitingPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const [state, setState] = useState<PageState>({
    status: 'PENDING',
    msg: 'Đang xử lý đơn hàng...',
    currentStep: 1
  });

  const stompClientRef = useRef<Client | null>(null);

  // --- LOGIC GIỮ NGUYÊN 100% ---
  useEffect(() => {
    if (!orderNumber) return;

    // 1️⃣ ĐỊNH NGHĨA HÀM NGAY TRONG useEffect (Để tránh dependency loop)
    const checkStatusAndConnect = async () => {
      try {
        // Gọi API Check trạng thái
        const data = await axiosClient.get(`/api/order/${orderNumber}`) as OrderApiResponse;
        
        if (data && data.status) {
            // Logic tính toán step
            let newStep = 1;
            if (data.status === 'COMPLETED') newStep = 3;
            else if (data.status === 'FAILED' || data.status === 'PAYMENT_FAILED') newStep = 2;

            // Cập nhật state
            setState(prev => ({
                ...prev,
                status: data.status,
                msg: data.status === 'COMPLETED' ? 'Đã hoàn tất' : 'Đang xử lý...',
                currentStep: newStep
            }));
        }
      } catch (error) {
        console.error("⚠️ Không thể lấy trạng thái đơn hàng:", error);
      }
      
      // Sau khi check API xong thì mới kết nối Socket
      connectWebSocket();
    };

    // Hàm kết nối WebSocket tách riêng cho gọn
    const connectWebSocket = () => {
        if (stompClientRef.current?.active) return; // Nếu đang kết nối rồi thì thôi

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8087/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('✅ Connected to WebSocket!');
                client.subscribe(`/topic/order/${orderNumber}`, (message) => {
                    if (message.body) {
                        const notification = JSON.parse(message.body) as NotificationMessage;
                        
                        // Logic update khi nhận tin nhắn Socket
                        setState(prev => {
                            let newStep = 1;
                            if (notification.status === 'COMPLETED') newStep = 3;
                            else if (notification.status === 'FAILED' || notification.status === 'PAYMENT_FAILED') newStep = 2;
                            
                            return {
                                ...prev,
                                status: notification.status,
                                msg: notification.message,
                                currentStep: newStep
                            };
                        });
                    }
                });
            },
            onStompError: (frame) => {
                console.error('❌ Broker error:', frame.headers['message']);
            },
        });

        client.activate();
        stompClientRef.current = client;
    };

    // 2️⃣ SỬ DỤNG SETTIMEOUT
    const timerId = setTimeout(() => {
        checkStatusAndConnect();
    }, 100);

    // Cleanup
    return () => {
        clearTimeout(timerId); 
        if (stompClientRef.current && stompClientRef.current.active) {
            stompClientRef.current.deactivate();
        }
    };
  }, [orderNumber]); 

  // --- RENDER GIAO DIỆN MỚI ---
  
  // 1. TRẠNG THÁI CHỜ (PENDING)
  if (state.status === 'PENDING') {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card 
            bordered={false} 
            className="w-full max-w-2xl shadow-2xl rounded-3xl overflow-hidden"
            bodyStyle={{ padding: '3rem 2rem' }}
        >
          <div className="text-center space-y-6">
              <div className="relative inline-block">
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#1890ff' }} spin />} />
              </div>
              
              <div>
                  <Title level={2} className="!mb-2 !font-bold text-gray-800">Đang xử lý đơn hàng</Title>
                  <Text className="text-gray-500 text-lg">
                      Hệ thống đang kiểm tra tồn kho và xác nhận thanh toán.
                      <br/>Vui lòng không tắt trình duyệt.
                  </Text>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 mt-8 border border-gray-100">
                <Steps 
                  current={state.currentStep} 
                  items={[
                    { title: 'Đặt hàng', status: 'finish', icon: <CheckCircleOutlined className="text-lg"/> },
                    { title: 'Xử lý', status: 'process', icon: <LoadingOutlined className="text-lg"/> },
                    { title: 'Hoàn tất', status: 'wait' },
                  ]} 
                />
              </div>
          </div>
        </Card>
      </main>
    );
  }

  // 2. TRẠNG THÁI THÀNH CÔNG (COMPLETED)
  if (state.status === 'COMPLETED') {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card 
            bordered={false} 
            className="w-full max-w-2xl shadow-2xl rounded-3xl"
            bodyStyle={{ padding: '3rem 2rem' }}
        >
          <Result
            status="success"
            title={<span className="text-3xl font-bold text-green-600">Đặt hàng thành công!</span>}
            subTitle={
                <div className="mt-2 text-gray-500 text-base">
                    Mã đơn hàng: <span className="font-bold text-gray-800">{orderNumber}</span>
                    <br/>Cảm ơn bạn đã mua sắm tại cửa hàng.
                </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="home" 
                size="large"
                shape="round"
                className="bg-black hover:!bg-gray-800 min-w-[200px] h-12 font-semibold shadow-lg"
                onClick={() => router.push('/')}
              >
                Tiếp tục mua sắm
              </Button>,
            ]}
          />
          <div className="px-6 md:px-12 pb-2 mt-4 opacity-75 grayscale">
             <Steps 
              current={3} 
              size="small"
              items={[
                { title: 'Đặt hàng', status: 'finish' },
                { title: 'Xử lý', status: 'finish' },
                { title: 'Hoàn tất', status: 'finish' },
              ]} 
            />
          </div>
        </Card>
      </main>
    );
  }

  // 3. TRẠNG THÁI THẤT BẠI (FAILED)
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card 
        bordered={false} 
        className="w-full max-w-2xl shadow-2xl rounded-3xl"
        bodyStyle={{ padding: '3rem 2rem' }}
      >
        <Result
          status="error"
          title={<span className="text-3xl font-bold text-red-600">Đặt hàng thất bại</span>}
          subTitle={<span className="text-gray-500 text-lg block mt-2">{state.msg}</span>}
          extra={[
            <div key="actions" className="flex flex-col md:flex-row gap-4 justify-center mt-4">
                 <Button 
                    type="primary" 
                    danger
                    key="retry" 
                    size="large"
                    shape="round"
                    className="min-w-[160px] h-11 font-semibold shadow-md"
                    onClick={() => router.push('/checkout')}
                >
                    Thử lại ngay
                </Button>
                <Button 
                    key="home" 
                    size="large"
                    shape="round"
                    className="min-w-[160px] h-11 font-semibold"
                    icon={<HomeOutlined />} 
                    onClick={() => router.push('/')}
                >
                    Về trang chủ
                </Button>
            </div>
          ]}
        />
         <div className="px-6 md:px-12 pb-2 mt-6">
             <Steps 
              current={1} 
              items={[
                { title: 'Đặt hàng', status: 'finish' },
                { title: 'Xảy ra lỗi', status: 'error', icon: <CloseCircleOutlined /> },
                { title: 'Hoàn tất', status: 'wait' },
              ]} 
            />
          </div>
      </Card>
    </main>
  );
}