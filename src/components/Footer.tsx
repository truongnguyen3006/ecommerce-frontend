'use client';

import { usePathname } from 'next/navigation';
import { FacebookFilled, InstagramFilled, TwitterSquareFilled, YoutubeFilled, EnvironmentFilled } from '@ant-design/icons';
import Link from 'next/link';

export default function Footer() {
  const pathname = usePathname();

  // Ẩn Footer ở trang Admin, Login, Register giống Header
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const footerLinks = {
    help: ['Trạng thái đơn hàng', 'Giao hàng & Vận chuyển', 'Trả hàng', 'Phương thức thanh toán', 'Liên hệ'],
    about: ['Tin tức', 'Nghề nghiệp', 'Nhà đầu tư', 'Bền vững'],
    products: ['Giày', 'Quần áo', 'Phụ kiện', 'Hàng mới về']
  };

  return (
    <footer className="bg-[#111111] text-white pt-12 pb-6 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Top Section: Links & Social */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 border-b border-[#333] pb-12">
            
            {/* Cột 1: Menu chính (In hoa, đậm) */}
            <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-wider text-white mb-4">Tìm Cửa Hàng</h3>
                <h3 className="font-black text-sm uppercase tracking-wider text-white mb-4">Trở Thành Thành Viên</h3>
                <h3 className="font-black text-sm uppercase tracking-wider text-white mb-4">Gửi Phản Hồi</h3>
            </div>

            {/* Cột 2: Trợ giúp */}
            <div>
                <h3 className="font-bold text-sm uppercase text-gray-50 mb-4">Trợ Giúp</h3>
                <ul className="space-y-2 text-xs text-gray-400">
                    {footerLinks.help.map((item) => (
                        <li key={item}><Link href="#" className="hover:text-white transition-colors">{item}</Link></li>
                    ))}
                </ul>
            </div>

            {/* Cột 3: Về Nike */}
            <div>
                <h3 className="font-bold text-sm uppercase text-gray-50 mb-4">Về Store</h3>
                <ul className="space-y-2 text-xs text-gray-400">
                    {footerLinks.about.map((item) => (
                        <li key={item}><Link href="#" className="hover:text-white transition-colors">{item}</Link></li>
                    ))}
                </ul>
            </div>

             {/* Cột 4: Social Icons */}
             <div className="flex justify-start md:justify-end gap-4 text-gray-400">
                <FacebookFilled className="text-3xl hover:text-white cursor-pointer transition-colors" />
                <InstagramFilled className="text-3xl hover:text-white cursor-pointer transition-colors" />
                <TwitterSquareFilled className="text-3xl hover:text-white cursor-pointer transition-colors" />
                <YoutubeFilled className="text-3xl hover:text-white cursor-pointer transition-colors" />
            </div>
        </div>

        {/* Bottom Section: Copyright & Legal */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <div className="flex items-center gap-2">
                <EnvironmentFilled className="text-white" />
                <span className="text-white font-bold">Việt Nam</span>
                <span>© 2025 Store, Inc. All Rights Reserved</span>
            </div>
            
            <div className="flex flex-wrap gap-6">
                <Link href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
                <Link href="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
                <Link href="#" className="hover:text-white transition-colors">Chính sách Cookie</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}