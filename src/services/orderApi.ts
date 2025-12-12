import axiosClient from "@/lib/axiosClient";

// 1. Request khi Đặt hàng
export interface OrderRequest {
  items: {
    skuCode: string;
    quantity: number;
  }[];
}

// 2. Response khi Đặt hàng xong (Chỉ trả về orderNumber & message)
export interface OrderPlacementResponse {
  orderNumber: string;
  message: string;
}

// 3. Chi tiết từng món hàng (Dùng hiển thị trong Admin/Detail)
export interface OrderLineItem {
  id: number;
  skuCode: string;
  price: number;
  quantity: number;
  productName: string;
  color: string;
  size: string;
}

// 4. Response đầy đủ của Đơn hàng (Dùng cho Admin/List)
// Lưu ý: Bạn cần chắc chắn Backend DTO (OrderResponse.java) cũng có các trường totalPrice, orderDate
export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: string;
  totalPrice: number; 
  orderDate: string; 
  orderLineItemsList: OrderLineItem[];
}

export const orderApi = {
  // Khách hàng đặt hàng
  placeOrder: (data: OrderRequest) => {
    return axiosClient.post('/api/order', data) as Promise<OrderPlacementResponse>;
  },

  // Admin lấy danh sách tất cả đơn
  getAllOrders: () => {
    return axiosClient.get('/api/order') as Promise<OrderResponse[]>;
  },

  // Lấy chi tiết 1 đơn (Cho trang Waiting hoặc Admin Detail)
  getOrderById: (orderNumber: string) => {
    return axiosClient.get(`/api/order/${orderNumber}`) as Promise<OrderResponse>;
  }
};