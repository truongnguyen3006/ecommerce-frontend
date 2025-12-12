import axiosClient from "@/lib/axiosClient";

export interface InventoryResponse {
  skuCode: string;
  quantity: number;
}

export const inventoryApi = {
  // SỬA TẠI ĐÂY: Thêm "as Promise<InventoryResponse>"
  // Để báo cho TypeScript biết: "Tin tôi đi, kết quả trả về chắc chắn là InventoryResponse, không phải AxiosResponse"
  getStock: (skuCode: string) => {
    return axiosClient.get(`/api/inventory/${skuCode}`) as Promise<InventoryResponse>;
  },
};