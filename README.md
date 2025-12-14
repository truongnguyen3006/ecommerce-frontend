# 🛍️ E-commerce Frontend (Next.js & Real-time Optimization)

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)

## 📖 Giới thiệu

Đây là ứng dụng phía Client (Frontend) cho hệ thống **Thương mại điện tử Microservices Hiệu năng cao**. Ứng dụng được xây dựng trên nền tảng **Next.js 16 (App Router)**, tập trung tối đa vào trải nghiệm người dùng (UX) và tốc độ phản hồi trong các kịch bản tải cao như Flash Sale.

Dự án áp dụng các kỹ thuật tiên tiến như **Server-Side Rendering (SSR)** để tối ưu SEO, **WebSockets** để cập nhật trạng thái đơn hàng thời gian thực, và mô hình **BFF (Backend for Frontend)** giả lập thông qua Proxy để bảo mật hệ thống.

---

## 🚀 Các tính năng & Kỹ thuật nổi bật

### 1. Tối ưu hóa Hiệu năng & SEO
* **Server-Side Rendering (SSR):** Render trước giao diện trên server giúp giảm thời gian hiển thị nội dung đầu tiên (FCP) và tối ưu hóa SEO tốt hơn so với SPA truyền thống.
* **Optimistic UI (Giao diện lạc quan):** Các thao tác như "Thêm vào giỏ hàng" phản hồi ngay lập tức trên giao diện sử dụng **Zustand**, giúp người dùng cảm thấy hệ thống chạy tức thì trong khi server xử lý ngầm.
* **Caching thông minh:** Sử dụng **TanStack Query** để quản lý Server State, tự động cache và làm mới dữ liệu nền mà không cần reload trang.

### 2. Trải nghiệm Thời gian thực (Real-time)
* **WebSocket Integration:** Tích hợp thư viện `@stomp/stompjs` và `SockJS` để kết nối trực tiếp với **Notification Service**.
* **Live Order Tracking:** Khách hàng nhận được thông báo trạng thái đơn hàng (Đặt thành công/Hết hàng) ngay lập tức thông qua kênh WebSocket riêng biệt.

### 3. Kiến trúc & Bảo mật
* **API Proxying (Rewrites):** Cấu hình Next.js Rewrites để định tuyến toàn bộ API request qua một cổng duy nhất, giải quyết triệt để vấn đề **CORS** và che giấu cấu trúc hạ tầng Microservices phía sau.
* **Secure Authentication:** Sử dụng **Axios Interceptors** để tự động đính kèm JWT Access Token vào header và cơ chế **Silent Refresh Token** để tự động cấp lại token mới khi phiên đăng nhập hết hạn.

---

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

---

## ⚙️ Hướng dẫn Cài đặt & Chạy (Installation)

### Bước 1: Yêu cầu tiên quyết (Prerequisites)
Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài đặt:
* [**Node.js**](https://nodejs.org/) (Phiên bản v18.17 trở lên, khuyến nghị v20.x LTS).
* [**Git**](https://git-scm.com/) để tải mã nguồn.

### Bước 2: Tải mã nguồn
Mở Terminal và chạy lệnh sau để clone dự án về máy:

```bash
git clone [https://github.com/truongnguyen3006/ecommerce-frontend.git](https://github.com/truongnguyen3006/ecommerce-frontend.git)
cd ecommerce-frontend

### Bước 3: Cài đặt thư viện (Dependencies)

Chạy lệnh sau để cài đặt các gói phụ thuộc.  
Sử dụng cờ `--legacy-peer-deps` để tránh xung đột version với React 19:

```bash
npm install --legacy-peer-deps


### Bước 4: Cấu hình môi trường
### Tạo file .env.local tại thư mục gốc và thêm cấu hình kết nối Backend:
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8087

### Bước 5: Chạy Server phát triển
### Khởi động server Next.js ở chế độ development bằng lệnh:
npm run dev
### Được thực hiện bởi:
* [**Nguyen Lam Truong**](https://github.com/truongnguyen3006).
