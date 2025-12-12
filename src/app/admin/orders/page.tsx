'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Card, message, Button, Space, Modal, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { orderApi, OrderResponse } from '@/services/orderApi'; 
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

export default function AdminOrderPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State cho Modal chi tiết
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Gọi API thật từ backend
      const data = await orderApi.getAllOrders(); 
      // Sắp xếp đơn mới nhất lên đầu
      const sortedData = Array.isArray(data) ? data.reverse() : [];
      setOrders(sortedData);
    } catch (error) {
      console.error(error);
      message.error('Lỗi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'PENDING': return 'gold';
      case 'FAILED': return 'red';
      case 'PAYMENT_FAILED': return 'magenta';
      default: return 'blue';
    }
  };

  const columns: ColumnsType<OrderResponse> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <span className="font-mono font-bold text-blue-600">{text}</span>
    },
    {
      title: 'Số lượng SP',
      key: 'quantity',
      render: (_, record) => (
        <span>{record.orderLineItemsList?.length || 0} món</span>
      )
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => (
        <span className="text-gray-500 text-sm">
           {date ? new Date(date).toLocaleString('vi-VN') : ''}
        </span>
      ),
      sorter: (a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => <span className="text-red-600 font-bold">{price?.toLocaleString()} đ</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
           <Button 
             icon={<EyeOutlined />} 
             size="small" 
             onClick={() => {
               setSelectedOrder(record);
               setIsModalOpen(true);
             }}
           >
             Chi tiết
           </Button>
        </Space>
      )
    }
  ];

  return (
    <Card title={`Quản lý Đơn hàng (${orders.length})`} className="shadow-sm">
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="id" 
        loading={loading} 
        pagination={{ pageSize: 10 }}
      />

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <Modal 
        title={`Chi tiết đơn hàng: ${selectedOrder?.orderNumber}`}
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>
        ]}
        width={700}
      >
        {selectedOrder && (
          <div>
             <div className="flex justify-between mb-4 border-b pb-2">
                <Text strong>Trạng thái: <Tag color={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Tag></Text>
                <Text type="secondary">ID: {selectedOrder.id}</Text>
             </div>

             <Table 
               dataSource={selectedOrder.orderLineItemsList}
               rowKey="id"
               pagination={false}
               size="small"
               columns={[
                 { title: 'SKU', dataIndex: 'skuCode', className: 'font-mono' },
                 { title: 'Sản phẩm', dataIndex: 'productName' },
                 { title: 'Màu/Size', render: (_, r) => `${r.color} / ${r.size}` },
                 { title: 'SL', dataIndex: 'quantity' },
                 { title: 'Giá', dataIndex: 'price', render: (v) => v?.toLocaleString() + ' đ' },
                 { 
                   title: 'Thành tiền', 
                   render: (_, r) => <span className="font-bold">{(r.price * r.quantity).toLocaleString()} đ</span> 
                 }
               ]}
             />

             <div className="flex justify-end mt-4 pt-4 border-t">
                <Text className="text-lg">Tổng cộng: <span className="text-red-600 font-bold text-xl">{selectedOrder.totalPrice?.toLocaleString()} đ</span></Text>
             </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}