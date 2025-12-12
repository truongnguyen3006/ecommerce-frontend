import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

// Gộp cả từ Keycloak và DB
export interface UserProfile {
  // Từ DB
  id?: number;
  keycloakId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  status?: boolean;
  
  // Từ Token Keycloak
  username?: string; 
  roles?: string[];
}

// Định nghĩa cấu trúc Token của Keycloak
interface KeycloakTokenPayload {
  sub: string;              // Keycloak ID
  preferred_username: string; // Username
  realm_access?: {
    roles: string[];
  };
  // ... các trường khác
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Login chỉ cần nhận token và data từ DB
  login: (token: string, dbUser?: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (token, dbUser) => {
        try {
          // 1. Giải mã Token để lấy username
          const decoded = jwtDecode<KeycloakTokenPayload>(token);
          const finalUser: UserProfile = {
            id: dbUser?.id,
            keycloakId: decoded.sub,
            fullName: dbUser?.fullName,
            email: dbUser?.email,
            phoneNumber: dbUser?.phoneNumber,
            address: dbUser?.address,
            status: dbUser?.status,

            username: decoded.preferred_username,
            roles: decoded.realm_access?.roles || [],   // luôn lấy từ TOKEN
          };
          // 3. Lưu vào State
          set({ user: finalUser, token, isAuthenticated: true });
          
          // 4. Lưu LocalStorage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('access_token', token);
          }
          console.log("DECODED TOKEN IN FE:", decoded);
          console.log("ROLES SAVED:", decoded.realm_access?.roles);

        } catch (error) {
          console.error("Lỗi decode token:", error);
        }

      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
        }
      },
    }),
    { //Chống mất dữ liệu khi F5
      name: 'flash-sale-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
  
);