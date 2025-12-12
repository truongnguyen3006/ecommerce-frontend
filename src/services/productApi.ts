// src/services/productApi.ts
import axiosClient from "@/lib/axiosClient";
import { Product, CreateProductRequest } from "@/types";

export const productApi = {
  // 1. Lấy danh sách sản phẩm
  // TypeScript đang báo lỗi vì nó nghĩ axios trả về AxiosResponse. 
  // Ta dùng "as unknown as Product[]" để khẳng định với nó là: "Tôi biết tôi đang làm gì, kết quả là mảng Product"
  getAll: async (): Promise<Product[]> => {
    return axiosClient.get('/api/product') as unknown as Product[];
  },
  
  // 2. Lấy chi tiết sản phẩm
  getById: async (id: number | string): Promise<Product> => {
    return axiosClient.get(`/api/product/${id}`) as unknown as Product;
  },

  // 3. Tạo sản phẩm mới
  create: async (data: CreateProductRequest): Promise<Product> => {
    return axiosClient.post('/api/product', data) as unknown as Product;
  },

  // 4. Cập nhật sản phẩm
  update: async (id: number | string, data: Partial<CreateProductRequest>): Promise<Product> => {
    return axiosClient.put(`/api/product/${id}`, data) as unknown as Product;
  },

  // 5. Xóa sản phẩm
  // Delete thường không trả về dữ liệu, nên ta ép kiểu về void hoặc any
  delete: async (id: number | string): Promise<void> => {
    return axiosClient.delete(`/api/product/${id}`) as unknown as void;
  }
};