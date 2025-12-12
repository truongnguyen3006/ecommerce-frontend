'use client';

import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/services/productApi';
import { Spin, Result } from 'antd';
import Link from 'next/link';

// Định nghĩa lại kiểu dữ liệu cho khớp
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string; // Đây chính là "Men's Shoes", "Women's Shoes"
  imageUrl?: string;
  skuCode?: string;
}

export default function HomePage() {
  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
        const data = await productApi.getAll();
        return data as unknown as Product[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
        <div className="flex h-screen items-center justify-center bg-white">
            <Result status="500" title="Lỗi tải dữ liệu" />
        </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-20 px-4 md:px-12 pt-8">
      
      {/* Tiêu đề trang chủ (Optional) */}
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-black">Mới nhất & Nổi bật</h2>
      </div>

      {/* LƯỚI SẢN PHẨM - CHUẨN NIKE STYLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-4 gap-y-10">
        {products?.map((product: Product) => (
          <Link 
            href={`/product/${product.id}`} 
            key={product.id} 
            className="group block cursor-pointer"
          >
            {/* 1. KHUNG ẢNH: Nền xám #F5F5F5, vuông vức */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#F5F5F5]">
                <img 
                    alt={product.name}
                    src={product.imageUrl || "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245/air-jordan-1-low-mens-shoes-0LXhbn.png"}
                    className="h-full w-full object-contain mix-blend-multiply p-4 transition-opacity duration-500 group-hover:opacity-90"
                />
            </div>

            {/* 2. THÔNG TIN - Căn trái, không viền, font Helvetica/Arial */}
            <div className="mt-4 flex flex-col gap-1 px-1">
                {/* Tag "Just In" màu cam đất giống ảnh */}
                <span className="text-[#9E3500] font-medium text-sm">Just In</span>

                {/* Tên sản phẩm - Đen, Đậm */}
                <h3 className="text-base font-semibold text-black leading-tight">
                    {product.name}
                </h3>

                {/* Category - Màu xám nhạt */}
                <p className="text-base text-[#757575]">
                    {product.category || "Men's Shoes"}
                </p>
                
                {/* Giá tiền - Đen, dời xuống một chút */}
                <div className="mt-2 text-base font-medium text-black">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}