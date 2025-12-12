'use client';

import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Spin, message } from 'antd';
import { ArrowUpOutlined, UserOutlined, ShoppingOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { userManagementApi } from '@/services/userManagementApi';
import { orderApi } from '@/services/orderApi';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    dailyRevenue: 0,
    newOrdersToday: 0,
    totalOrders: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 🚀 HIGH PERFORMANCE: Gọi song song 2 API cùng lúc thay vì chờ nhau
        const [usersData, ordersData] = await Promise.all([
          userManagementApi.getAll(),
          orderApi.getAllOrders()
        ]);

        // 1. Tính toán User
        const totalUsers = usersData.length;

        // 2. Tính toán Đơn hàng & Doanh thu
        // Lấy ngày hiện tại (dạng string YYYY-MM-DD để so sánh)
        const todayStr = new Date().toISOString().slice(0, 10);

        let revenueToday = 0;
        let ordersTodayCount = 0;

        // Cần kiểm tra ordersData có phải mảng không (tránh lỗi nếu API tạch)
        const safeOrders = Array.isArray(ordersData) ? ordersData : [];

        safeOrders.forEach(order => {
          // Chỉ tính các đơn đã hoàn thành hoặc đang xử lý (bỏ qua đơn hủy/lỗi nếu muốn)
          if (order.status !== 'FAILED' && order.status !== 'PAYMENT_FAILED') {
            
            // So sánh ngày đặt hàng với ngày hôm nay
            // order.orderDate string dạng "2025-12-08T..."
            if (order.orderDate && order.orderDate.startsWith(todayStr)) {
              revenueToday += order.totalPrice || 0;
              ordersTodayCount++;
            }
          }
        });

        setStats({
          totalUsers: totalUsers,
          dailyRevenue: revenueToday,
          newOrdersToday: ordersTodayCount,
          totalOrders: safeOrders.length
        });

      } catch (error) {
        console.error("Lỗi tải Dashboard:", error);
        message.warning("Không thể tải đầy đủ số liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" tip="Đang tổng hợp số liệu..." />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Tổng Quan</h2>
      
      <Row gutter={16}>
        {/* Cột 1: Người dùng */}
        <Col span={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng thành viên"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
            />
            <div className="text-gray-400 text-xs mt-2">Toàn bộ users trong hệ thống</div>
          </Card>
        </Col>

        {/* Cột 2: Doanh thu hôm nay */}
        <Col span={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Doanh thu hôm nay"
              value={stats.dailyRevenue}
              precision={0}
              valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
              prefix={<DollarCircleOutlined />}
              suffix="₫"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
             <div className="text-gray-400 text-xs mt-2">Tổng tiền đơn hàng trong ngày</div>
          </Card>
        </Col>

        {/* Cột 3: Đơn hàng mới */}
        <Col span={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đơn hàng mới (Hôm nay)"
              value={stats.newOrdersToday}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              suffix={`/ ${stats.totalOrders} tổng`}
            />
             <div className="text-gray-400 text-xs mt-2">Số đơn phát sinh trong ngày</div>
          </Card>
        </Col>
      </Row>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Chào mừng quay trở lại trang quản trị !</h3>
        <p className="text-gray-500">
            Hệ thống đang hoạt động ổn định. Số liệu được cập nhật theo thời gian thực mỗi khi bạn tải lại trang.
        </p>
      </div>
    </div>
  );
}