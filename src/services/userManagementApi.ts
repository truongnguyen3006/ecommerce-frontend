import axiosClient from "@/lib/axiosClient";

export interface UserResponse {
  id: number;
  keycloakId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: boolean; // true = Active, false = Blocked
}

export const userManagementApi = {
  // Lấy danh sách user
  getAll: async (): Promise<UserResponse[]> => {
    return axiosClient.get('/api/user') as unknown as UserResponse[];
  },

  // Admin khóa/mở khóa user
  updateStatus: async (id: number, enabled: boolean): Promise<UserResponse> => {
    return axiosClient.patch(`/api/user/admin/${id}/status`, { enabled }) as unknown as UserResponse;
  }
};