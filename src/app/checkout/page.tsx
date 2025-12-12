'use client';

import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, Typography, message, Divider, Spin, Row, Col } from 'antd';
import { DeleteOutlined, ArrowRightOutlined, ShoppingOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/services/orderApi';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const { Title } = Typography;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeFromCart, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!isAuthenticated && !token) {
      message.warning('Vui lòng đăng nhập để thanh toán!');
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  if (!isAuthenticated && !token) {
    return (
        <div className="min-h-screen flex justify-center items-center bg-white">
            <Spin size="large" />
        </div>
    ); 
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        items: items.map((item) => ({
          skuCode: item.skuCode,
          quantity: item.quantity,
        })),
      };
      const response = await orderApi.placeOrder(payload);
      message.success('Đã gửi đơn hàng thành công!');
      clearCart(); 
      router.push(`/checkout/waiting/${response.orderNumber}`);
    } catch (error) {
      console.error(error);
      message.error('Đặt hàng thất bại, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', 'đ');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-4">
        <div className="bg-gray-50 p-8 rounded-full mb-6">
            <ShoppingOutlined className="text-6xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-gray-900">Giỏ hàng của bạn đang trống</h2>
        <Button 
            type="primary" 
            size="large" 
            onClick={() => router.push('/')}
            className="bg-black text-white hover:!bg-gray-800 h-12 px-8 rounded-full font-semibold shadow-lg"
        >
          Khám phá ngay
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* SỬA 1: Bỏ phần đếm số lượng ở đây, chỉ để tiêu đề Thanh Toán cho gọn */}
        <div className="mb-8">
            <Title level={1} className="!m-0 !font-black tracking-tight text-3xl md:text-4xl">
                Thanh Toán
            </Title>
        </div>
        
        <Row gutter={[40, 24]}>
            
            {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <Col xs={24} lg={15}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* SỬA 2: Thêm tiêu đề Header cho khung sản phẩm ở đây */}
                    <div className="px-6 pt-6 pb-2 border-b border-gray-50 flex justify-between items-center">
                         <h2 className="text-lg font-bold text-gray-900 m-0">Giỏ hàng</h2>
                         <span className="text-gray-500 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                            {items.length} sản phẩm
                         </span>
                    </div>

                    <div className="p-6 space-y-6">
                        {items.map((item) => (
                            <div key={item.skuCode} className="flex gap-4 md:gap-6 py-2 group">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                                        <div className="flex-1 pr-4">
                                            <h3 className="font-bold text-base text-gray-900 leading-snug hover:text-blue-600 transition-colors line-clamp-2">
                                                <Link href={`/product/${item.id}`}>
                                                    {item.name}
                                                </Link>
                                            </h3>
                                            
                                            <div className="text-gray-500 text-sm mt-1.5 flex flex-wrap items-center gap-2">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">{item.category}</span>
                                                <span className="text-gray-300">|</span>
                                                <span>Size {item.selectedSize}</span>
                                                <span className="text-gray-300">|</span>
                                                <span>{item.selectedColor}</span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-bold text-base text-gray-900">
                                                {formatMoney(item.price * item.quantity)}
                                            </div>
                                            {item.quantity > 1 && (
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {formatMoney(item.price)} / cái
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-2 md:mt-0">
                                        <div className="text-sm text-gray-600 font-medium">
                                            x{item.quantity}
                                        </div>
                                        
                                        <Button 
                                            type="text" 
                                            size="small"
                                            icon={<DeleteOutlined />} 
                                            onClick={() => removeFromCart(item.skuCode)}
                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 px-2"
                                        >
                                            <span className="hidden md:inline">Xóa</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Col>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
            <Col xs={24} lg={9}>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                    <h3 className="text-lg font-bold mb-6 text-gray-900">Chi tiết thanh toán</h3>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tạm tính</span>
                            <span className="font-medium">{formatMoney(totalPrice())}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Vận chuyển</span>
                            <span className="text-green-600 font-medium">Miễn phí</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 my-4 pt-4">
                        <div className="flex justify-between items-end">
                            <span className="text-base font-bold text-gray-900">Tổng cộng</span>
                            <span className="text-2xl font-black text-blue-600 leading-none">
                                {formatMoney(totalPrice())}
                            </span>
                        </div>
                        <p className="text-right text-xs text-gray-400 mt-2">(Đã bao gồm VAT)</p>
                    </div>

                    <Button 
                        type="primary" 
                        block 
                        size="large" 
                        loading={isSubmitting}
                        onClick={handlePlaceOrder}
                        className="bg-black text-white hover:!bg-gray-800 h-12 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all mt-4 flex items-center justify-center gap-2"
                    >
                        Thanh Toán <ArrowRightOutlined />
                    </Button>
                    
                    <div className="mt-6 bg-gray-50 rounded-lg p-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <SafetyCertificateOutlined className="text-green-600 text-lg" /> 
                        <span>Giảm giá cho đơn hàng trên 5 triệu</span>
                    </div>
                </div>
            </Col>
        </Row>
      </div>
    </main>
  );
}