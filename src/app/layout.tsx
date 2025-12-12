import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import DynamicHeader from "@/components/DynamicHeader";
import DynamicFooter from "@/components/DynamicFooter";

export const metadata: Metadata = {
  title: "Flash Sale System",
  description: "High Performance Microservices Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 flex flex-col min-h-screen"> {/* Thêm flex, min-h-screen để footer luôn ở đáy */}
        <Providers>
          
          {/* Header luôn ở trên cùng */}
          <DynamicHeader />
          
          {/* Phần nội dung chính: Thêm flex-grow để nó đẩy Footer xuống */}
          <main className="flex-grow">
             {children}
          </main>

          {/* Footer luôn ở dưới cùng */}
          <DynamicFooter />

        </Providers>
      </body>
    </html>
  );
}