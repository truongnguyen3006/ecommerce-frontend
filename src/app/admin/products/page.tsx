'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Image, Tag, Card, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productApi } from '@/services/productApi';
import { Product } from '@/types';
import type { ColumnsType } from 'antd/es/table';

export default function AdminProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Ép kiểu an toàn thông qua unknown
      const data = await productApi.getAll() as unknown as Product[];
      setProducts(data);
    } catch (error: unknown) {
      console.error(error);
      message.error('Không tải được danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await productApi.delete(id);
      message.success('Đã xóa sản phẩm');
      fetchProducts(); 
    } catch (error: unknown) {
      message.error('Xóa thất bại');
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      align: 'center',
    },
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      render: (url: string) => (
        <Image 
          src={url} 
          width={50} 
          height={50} 
          style={{ objectFit: 'cover', borderRadius: 4 }} 
          fallback="https://via.placeholder.com/50"
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Giá gốc',
      dataIndex: 'price',
      // SỬA LỖI ANY: Khai báo kiểu record là Product
      render: (price: number | undefined, record: Product) => {
        // Fallback: Ưu tiên price (từ DTO), nếu không có lấy basePrice (từ Entity), cuối cùng là 0
        const displayPrice = price ?? record.basePrice ?? 0;
        return (
            <span className="text-gray-600 font-medium">
              {displayPrice.toLocaleString()} đ
            </span>
        );
      },
    },
    {
      title: 'SKU (Biến thể)',
      dataIndex: 'variants',
      render: (_, record: Product) => (
        <Tag color={record.variants && record.variants.length > 0 ? "blue" : "default"}>
          {record.variants ? record.variants.length : 0} variants
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record: Product) => (
        <Space size="small">
          <Link href={`/admin/products/edit/${record.id}`}>
            <Tooltip title="Chỉnh sửa">
                <Button type="primary" ghost icon={<EditOutlined />} size="small" />
            </Tooltip>
          </Link>

          <Popconfirm
            title="Xóa sản phẩm này?"
            description="Tất cả biến thể con cũng sẽ bị xóa!"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
                <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Danh sách sản phẩm" 
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchProducts}>Tải lại</Button>
          <Link href="/admin/products/create">
            <Button type="primary" icon={<PlusOutlined />} className="bg-black">
              Thêm mới
            </Button>
          </Link>
        </Space>
      }
    >
      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: true }} 
      />
    </Card>
  );
}