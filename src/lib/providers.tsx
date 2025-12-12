'use client'; // <--- BẮT BUỘC: File này chạy ở phía Client

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Tạo QueryClient một lần duy nhất
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Không tự gọi lại API khi chuyển tab
        retry: 1, // Thử lại 1 lần nếu lỗi mạng
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AntdRegistry>
        {children}
      </AntdRegistry>
    </QueryClientProvider>
  );
}