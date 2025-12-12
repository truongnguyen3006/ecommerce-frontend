import axiosClient from "@/lib/axiosClient";
import { UserProfile } from "@/store/useAuthStore";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  password?: string; // Nếu muốn đổi pass
}

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const authApi = {
  login: (data: LoginRequest) => {
    return axiosClient.post<KeycloakTokenResponse>('/auth/login', data);
  },

  register: (data: RegisterRequest) => {
    return axiosClient.post<UserProfile>('/auth/register', data);
  },

  getMe: () => {
    return axiosClient.get<UserProfile>('/api/user/me');
  },

  refreshToken: async (token: string): Promise<KeycloakTokenResponse> => {
    return axiosClient.post('/auth/refresh', { refreshToken: token });
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await axiosClient.patch('/api/user/me', data);
    // Ép kiểu "Double Cast" để đánh lừa TypeScript
    return response as unknown as UserProfile;
  }

};