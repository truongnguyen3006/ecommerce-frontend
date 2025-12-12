# E-commerce Frontend (Next.js & Real-time Optimization)

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)

## 📖 Giới thiệu
Đây là ứng dụng phía Client (Frontend) cho hệ thống **Thương mại điện tử Microservices Hiệu năng cao**. Ứng dụng được xây dựng trên nền tảng **Next.js 16 (App Router)**, tập trung tối đa vào trải nghiệm người dùng (UX) và tốc độ phản hồi.

Dự án áp dụng các kỹ thuật tiên tiến như **Server-Side Rendering (SSR)** để tối ưu SEO, **WebSockets** để cập nhật trạng thái đơn hàng thời gian thực, và mô hình **BFF (Backend for Frontend)** giả lập thông qua Proxy để bảo mật hệ thống.

## 🚀 Các tính năng & Kỹ thuật nổi bật

### 1. Tối ưu hóa Hiệu năng
- **Server-Side Rendering (SSR):** Render trước giao diện trên server giúp giảm thời gian tải trang ban đầu (FCP) và tối ưu hóa SEO.
- **Optimistic UI (Giao diện lạc quan):** Các thao tác như "Thêm vào giỏ hàng" phản hồi ngay lập tức trên giao diện trước khi server xác nhận.
- **Client-side State Management:** Sử dụng **Zustand** kết hợp với `localStorage` để quản lý giỏ hàng bền vững mà không gây tải cho Database khi chưa cần thiết.

### 2. Trải nghiệm Thời gian thực
- **WebSocket Integration:** Tích hợp thư viện `@stomp/stompjs` và `SockJS` để kết nối trực tiếp với **Notification Service**.
- **Live Order Tracking:** Khách hàng nhận được thông báo trạng thái đơn hàng ngay lập tức mà không cần reload trang.

### 3. Kiến trúc & Bảo mật
- **API Proxying (Rewrites):** Cấu hình Next.js Rewrites để định tuyến toàn bộ API request qua một cổng duy nhất, giải quyết triệt để vấn đề **CORS** và che giấu cấu trúc hạ tầng Microservices phía sau.
- **Secure Authentication:** Sử dụng **Axios Interceptors** để tự động đính kèm JWT Access Token và cơ chế **Silent Refresh Token** tự động khi phiên đăng nhập hết hạn.

## 🛠 Tech Stack

| Hạng mục | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 | App Router, Server Components. |
| **Library** | React 19 | Hooks, Context API. |
| **Language** | TypeScript | Static typing cho code an toàn hơn. |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework. |
| **UI Kit** | Ant Design v5 | Bộ component chuẩn doanh nghiệp. |
| **State Mngt** | Zustand | Quản lý Client State (Cart, Auth). |
| **Data Fetching**| TanStack Query | Quản lý Server State (Caching, Re-fetching). |
| **Real-time** | SockJS, STOMP | Giao thức WebSocket. |

## ⚙️ Hướng dẫn Cài đặt & Chạy

### Bước 1: Yêu cầu tiên quyết
- Node.js 18.17 trở lên  
- npm hoặc yarn  

### Bước 2: Cài đặt thư viện
```bash
npm install
# hoặc
yarn install
Bước 3: Cấu hình môi trường

Tạo file .env.local tại thư mục gốc:

# Địa chỉ của API Gateway (Nginx hoặc Spring Cloud Gateway)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Địa chỉ của Notification Service (WebSocket)
NEXT_PUBLIC_WS_URL=http://localhost:8087

Bước 4: Chạy Server phát triển
npm run dev


Truy cập http://localhost:3000
 trên trình duyệt để trải nghiệm.

📂 Cấu trúc dự án
├── app/                 # Next.js App Router (Pages & Layouts)
│   ├── (auth)/          # Route nhóm cho Login/Register
│   ├── checkout/        # Trang thanh toán
│   └── order/           # Trang theo dõi đơn hàng (Real-time)
├── components/          # Reusable UI Components
├── lib/                 # Các tiện ích cấu hình (Axios, WebSocket)
├── store/               # Zustand Stores (useCartStore, useAuthStore)
├── services/            # API Service definitions
└── public/              # Static assets (Images, Icons)

📝 License

Dự án này là phần Frontend của đề tài nghiên cứu khoa học/niên luận ngành Mạng máy tính & Truyền thông dữ liệu.

Phát triển bởi Nguyen Lam Truong
