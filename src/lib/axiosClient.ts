import axios from 'axios';
import { authApi } from '@/services/authApi';

const axiosClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Đã đúng (Đang dùng sessionStorage.getItem('access_token'))
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token'); // <-- Giữ nguyên
      
      const isRefreshRequest = config.url?.includes('/auth/refresh');
      
      if (token && !isRefreshRequest) {
          config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    //  QUAN TRỌNG: Chặn vòng lặp vô tận
    // Nếu API bị lỗi chính là API refresh -> Logout ngay
    if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
        console.log("Refresh Failed -> Logout");
        // ✅ ĐÃ SỬA
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('flash-sale-auth'); // Key của Zustand store
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
    }

    // Logic Refresh Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error("No refresh token");

        // Gọi API Refresh
        const res = await authApi.refreshToken(refreshToken);
        
        // Lưu token mới
        sessionStorage.setItem('access_token', res.access_token);
        sessionStorage.setItem('refresh_token', res.refresh_token);

        // Gắn token mới và gọi lại request cũ
        originalRequest.headers.Authorization = `Bearer ${res.access_token}`;
        return axiosClient(originalRequest);

      } catch (refreshError) {
        // Nếu refresh thất bại -> Logout
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('flash-sale-auth');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;