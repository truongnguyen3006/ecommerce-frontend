# 🛍️ E-commerce Frontend (Next.js & Real-time Optimization)

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)

## 📖 Giới thiệu

Đây là ứng dụng phía Client (Frontend) cho hệ thống **Thương mại điện tử Microservices Hiệu năng cao**. [cite_start]Ứng dụng được xây dựng trên nền tảng **Next.js 16 (App Router)**, tập trung tối đa vào trải nghiệm người dùng (UX) và tốc độ phản hồi trong các kịch bản tải cao như Flash Sale[cite: 4028].

[cite_start]Dự án áp dụng các kỹ thuật tiên tiến như **Server-Side Rendering (SSR)** để tối ưu SEO, **WebSockets** để cập nhật trạng thái đơn hàng thời gian thực, và mô hình **BFF (Backend for Frontend)** giả lập thông qua Proxy để bảo mật hệ thống[cite: 3778, 3798, 4031].

---

## 🚀 Các tính năng & Kỹ thuật nổi bật

### 1. Tối ưu hóa Hiệu năng & SEO
* [cite_start]**Server-Side Rendering (SSR):** Render trước giao diện trên server giúp giảm thời gian hiển thị nội dung đầu tiên (FCP) và tối ưu hóa SEO tốt hơn so với SPA truyền thống[cite: 3779].
* [cite_start]**Optimistic UI (Giao diện lạc quan):** Các thao tác như "Thêm vào giỏ hàng" phản hồi ngay lập tức trên giao diện sử dụng **Zustand**, giúp người dùng cảm thấy hệ thống chạy tức thì trong khi server xử lý ngầm[cite: 4037].
* [cite_start]**Caching thông minh:** Sử dụng **TanStack Query** để quản lý Server State, tự động cache và làm mới dữ liệu nền mà không cần reload trang[cite: 3788].

### 2. Trải nghiệm Thời gian thực (Real-time)
* [cite_start]**WebSocket Integration:** Tích hợp thư viện `@stomp/stompjs` và `SockJS` để kết nối trực tiếp với **Notification Service**[cite: 3798].
* [cite_start]**Live Order Tracking:** Khách hàng nhận được thông báo trạng thái đơn hàng (Đặt thành công/Hết hàng) ngay lập tức thông qua kênh WebSocket riêng biệt[cite: 4042].

### 3. Kiến trúc & Bảo mật
* [cite_start]**API Proxying (Rewrites):** Cấu hình Next.js Rewrites để định tuyến toàn bộ API request qua một cổng duy nhất, giải quyết triệt để vấn đề **CORS** và che giấu cấu trúc hạ tầng Microservices phía sau[cite: 4031].
* [cite_start]**Secure Authentication:** Sử dụng **Axios Interceptors** để tự động đính kèm JWT Access Token vào header và cơ chế **Silent Refresh Token** để tự động cấp lại token mới khi phiên đăng nhập hết hạn [cite: 3793-3796].

---

## 🛠 Tech Stack

| Hạng mục | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 | [cite_start]App Router, Server Components[cite: 4257]. |
| **Library** | React 19 | [cite_start]Hooks, Context API[cite: 4257]. |
| **Language** | TypeScript | Static typing cho code an toàn hơn. |
| **Styling** | Tailwind CSS v4 | [cite_start]Utility-first CSS framework[cite: 4260]. |
| **UI Kit** | Ant Design v5 | [cite_start]Bộ component chuẩn doanh nghiệp[cite: 4257]. |
| **State Mngt** | Zustand | [cite_start]Quản lý Client State (Cart, Auth)[cite: 4262]. |
| **Data Fetching**| TanStack Query | [cite_start]Quản lý Server State (Caching, Re-fetching)[cite: 4262]. |
| **Real-time** | SockJS, STOMP | [cite_start]Giao thức WebSocket[cite: 4264]. |

---

## ⚙️ Hướng dẫn Cài đặt & Chạy (Installation)

### Bước 1: Yêu cầu tiên quyết (Prerequisites)
Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài đặt:
* [cite_start][**Node.js**](https://nodejs.org/) (Phiên bản v18.17 trở lên, khuyến nghị v20.x LTS hoặc v22.x)[cite: 4219].
* [**Git**](https://git-scm.com/) để tải mã nguồn.

### Bước 2: Tải mã nguồn
Mở Terminal và chạy lệnh sau để clone dự án về máy:

```bash
git clone [https://github.com/truongnguyen3006/ecommerce-frontend.git](https://github.com/truongnguyen3006/ecommerce-frontend.git)
cd ecommerce-frontend

Bước 3: Cài đặt thư viện (Dependencies)

Do dự án sử dụng React 19 (phiên bản mới nhất), có thể xảy ra xung đột với một số thư viện cũ. Hãy sử dụng lệnh sau để cài đặt an toàn theo khuyến nghị:

# Sử dụng npm (Khuyên dùng)
npm install --legacy-peer-deps

# Hoặc sử dụng yarn
yarn install

Bước 4: Cấu hình môi trường

Tạo file .env.local tại thư mục gốc của dự án và thêm cấu hình kết nối tới Backend (API Gateway):

# Địa chỉ của Nginx Load Balancer hoặc API Gateway
NEXT_PUBLIC_API_URL=http://localhost:8080

# Cấu hình WebSocket (Notification Service)
NEXT_PUBLIC_WS_URL=http://localhost:8087

Bước 5: Chạy Server phát triển
Khởi động server Next.js ở chế độ development bằng lệnh:

npm run dev

Dạ đã hiểu ý bạn. Bạn muốn phần lời dẫn, giải thích phải là văn bản bình thường (Markdown text), chỉ có câu lệnh mới bỏ vào khung code.

Dưới đây là nội dung file README.md cho Frontend được trình bày lại đúng chuẩn, đẹp mắt và dễ đọc để bạn copy:

Markdown

# 🛍️ E-commerce Frontend (Next.js & Real-time Optimization)

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)

## 📖 Giới thiệu

Đây là ứng dụng phía Client (Frontend) cho hệ thống **Thương mại điện tử Microservices Hiệu năng cao**. [cite_start]Ứng dụng được xây dựng trên nền tảng **Next.js 16 (App Router)**, tập trung tối đa vào trải nghiệm người dùng (UX) và tốc độ phản hồi trong các kịch bản tải cao như Flash Sale[cite: 4028].

[cite_start]Dự án áp dụng các kỹ thuật tiên tiến như **Server-Side Rendering (SSR)** để tối ưu SEO, **WebSockets** để cập nhật trạng thái đơn hàng thời gian thực, và mô hình **BFF (Backend for Frontend)** giả lập thông qua Proxy để bảo mật hệ thống[cite: 3778, 3798, 4031].

---

## 🚀 Các tính năng & Kỹ thuật nổi bật

### 1. Tối ưu hóa Hiệu năng & SEO
* [cite_start]**Server-Side Rendering (SSR):** Render trước giao diện trên server giúp giảm thời gian hiển thị nội dung đầu tiên (FCP) và tối ưu hóa SEO tốt hơn so với SPA truyền thống[cite: 3779].
* [cite_start]**Optimistic UI (Giao diện lạc quan):** Các thao tác như "Thêm vào giỏ hàng" phản hồi ngay lập tức trên giao diện sử dụng **Zustand**, giúp người dùng cảm thấy hệ thống chạy tức thì trong khi server xử lý ngầm[cite: 4037].
* [cite_start]**Caching thông minh:** Sử dụng **TanStack Query** để quản lý Server State, tự động cache và làm mới dữ liệu nền mà không cần reload trang[cite: 3788].

### 2. Trải nghiệm Thời gian thực (Real-time)
* [cite_start]**WebSocket Integration:** Tích hợp thư viện `@stomp/stompjs` và `SockJS` để kết nối trực tiếp với **Notification Service**[cite: 3798].
* [cite_start]**Live Order Tracking:** Khách hàng nhận được thông báo trạng thái đơn hàng (Đặt thành công/Hết hàng) ngay lập tức thông qua kênh WebSocket riêng biệt[cite: 4042].

### 3. Kiến trúc & Bảo mật
* [cite_start]**API Proxying (Rewrites):** Cấu hình Next.js Rewrites để định tuyến toàn bộ API request qua một cổng duy nhất, giải quyết triệt để vấn đề **CORS** và che giấu cấu trúc hạ tầng Microservices phía sau[cite: 4031].
* [cite_start]**Secure Authentication:** Sử dụng **Axios Interceptors** để tự động đính kèm JWT Access Token vào header và cơ chế **Silent Refresh Token** để tự động cấp lại token mới khi phiên đăng nhập hết hạn [cite: 3793-3796].

---

## 🛠 Tech Stack

| Hạng mục | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 | [cite_start]App Router, Server Components[cite: 4257]. |
| **Library** | React 19 | [cite_start]Hooks, Context API[cite: 4257]. |
| **Language** | TypeScript | Static typing cho code an toàn hơn. |
| **Styling** | Tailwind CSS v4 | [cite_start]Utility-first CSS framework[cite: 4260]. |
| **UI Kit** | Ant Design v5 | [cite_start]Bộ component chuẩn doanh nghiệp[cite: 4257]. |
| **State Mngt** | Zustand | [cite_start]Quản lý Client State (Cart, Auth)[cite: 4262]. |
| **Data Fetching**| TanStack Query | [cite_start]Quản lý Server State (Caching, Re-fetching)[cite: 4262]. |
| **Real-time** | SockJS, STOMP | [cite_start]Giao thức WebSocket[cite: 4264]. |

---

## ⚙️ Hướng dẫn Cài đặt & Chạy (Installation)

### Bước 1: Yêu cầu tiên quyết (Prerequisites)
Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài đặt:
* [cite_start][**Node.js**](https://nodejs.org/) (Phiên bản v18.17 trở lên, khuyến nghị v20.x LTS hoặc v22.x)[cite: 4219].
* [**Git**](https://git-scm.com/) để tải mã nguồn.

### Bước 2: Tải mã nguồn
Mở Terminal và chạy lệnh sau để clone dự án về máy:

```bash
git clone [https://github.com/truongnguyen3006/ecommerce-frontend.git](https://github.com/truongnguyen3006/ecommerce-frontend.git)
cd ecommerce-frontend
Bước 3: Cài đặt thư viện (Dependencies)
Do dự án sử dụng React 19 (phiên bản mới nhất), có thể xảy ra xung đột với một số thư viện cũ. Hãy sử dụng lệnh sau để cài đặt an toàn theo khuyến nghị:

Bash

# Sử dụng npm (Khuyên dùng)
npm install --legacy-peer-deps

# Hoặc sử dụng yarn
yarn install
Bước 4: Cấu hình môi trường
Tạo file .env.local tại thư mục gốc của dự án và thêm cấu hình kết nối tới Backend (API Gateway):

Đoạn mã

# Địa chỉ của Nginx Load Balancer hoặc API Gateway
NEXT_PUBLIC_API_URL=http://localhost:8080

# Cấu hình WebSocket (Notification Service)
NEXT_PUBLIC_WS_URL=http://localhost:8087
Bước 5: Chạy Server phát triển
Khởi động server Next.js ở chế độ development bằng lệnh:

Bash

npm run dev
Sau khi khởi động thành công, hãy truy cập địa chỉ sau trên trình duyệt để trải nghiệm: 👉 http://localhost:3001 (hoặc port 3000 tùy cấu hình máy bạn).

📂 Cấu trúc dự án
├── app/                 # Next.js App Router (Pages & Layouts) [cite: 3912]
│   ├── (auth)/          # Route nhóm cho Login/Register
│   ├── checkout/        # Trang thanh toán
│   ├── admin/           # Trang quản trị viên
│   └── order/           # Trang theo dõi đơn hàng (Real-time)
├── components/          # Reusable UI Components (Header, Footer...) [cite: 3913]
├── lib/                 # Các tiện ích cấu hình (Axios Client, WebSocket Provider) [cite: 3914]
├── store/               # Zustand Stores (useCartStore, useAuthStore) [cite: 3917]
├── services/            # API Service definitions (tách biệt logic gọi API) [cite: 3915]
└── public/              # Static assets (Images, Icons)

Dự án được thực hiện bởi:
Nguyễn Lâm Trường
