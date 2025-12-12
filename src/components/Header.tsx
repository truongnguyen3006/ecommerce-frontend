'use client';

import Link from 'next/link';
import { Badge, Dropdown, MenuProps, Avatar, message } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, ThunderboltFilled, SearchOutlined, HeartOutlined } from '@ant-design/icons';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Logic ẩn Header ở trang Admin/Login - GIỮ NGUYÊN
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
        message.warning("Vui lòng đăng nhập để xem giỏ hàng!");
        router.push('/login');
    } else {
        router.push('/checkout');
    }
  };

  // --- CẤU HÌNH MENU USER ---
  const userMenu: MenuProps['items'] = [
    {
      key: 'info',
      label: (
        <div className="px-2 py-1 cursor-default">
           <div className="font-bold text-gray-900 text-base">
             {/* Ưu tiên hiển thị FullName, nếu không có thì Username */}
             {user?.fullName || user?.username || 'Khách hàng'}
           </div>
           {/* SỬA: Bỏ dấu @. Hiển thị email hoặc dòng text thay thế */}
           <div className="text-xs text-gray-500">
             {user?.email || 'Thành viên '}
           </div>
        </div>
      ),
      disabled: true, // Không cho click dòng này
    },
    { type: 'divider' },
    {
      key: 'profile',
      label: <Link href="/profile" className="font-medium">Hồ sơ cá nhân</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'orders',
      label: <Link href="/orders" className="font-medium">Đơn hàng của tôi</Link>,
      icon: <ShoppingCartOutlined />,
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="w-full font-sans">
        {/* 1. TOP BAR */}
        <div className="bg-[#f5f5f5] h-9 flex justify-between items-center px-6 md:px-12 text-[11px] font-semibold text-gray-600 hidden md:flex">
            {/* Bên trái: Link phụ */}
            <div>
               {/* Nếu chưa đăng nhập thì mới hiện mời tham gia thành viên */}
               {!isAuthenticated && (
                 <>
                   <Link href="/register" className="cursor-pointer hover:text-black">Tham gia thành viên</Link>
                   <span className="mx-3">|</span>
                 </>
               )}
               <Link href="/help" className="cursor-pointer hover:text-black">Trợ giúp</Link>
            </div>

            {/* Bên phải: Login/Register hoặc Khoảng trắng */}
            <div className="flex gap-4">
                {!isAuthenticated ? (
                    <>
                        <Link href="/register" className="hover:text-black">Đăng ký</Link>
                        <span className="text-gray-400">|</span>
                        <Link href="/login" className="hover:text-black">Đăng nhập</Link>
                    </>
                ) : (
                    // SỬA: Khi đã đăng nhập, ẩn dòng "Xin chào" đi cho sạch
                    // Có thể để trống hoặc để một thông báo nhỏ nếu muốn
                    <span className="text-gray-400">Giao hàng miễn phí cho đơn từ 500k</span>
                )}
            </div>
        </div>

        {/* 2. MAIN HEADER */}
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 h-16 md:h-20 flex items-center justify-between px-6 md:px-12 transition-all shadow-sm">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 group">
                <ThunderboltFilled className="text-3xl md:text-4xl text-black transition-transform duration-300 group-hover:scale-110" />
                <span className="font-black text-xl md:text-2xl tracking-tighter italic">STORE</span>
            </Link>

            {/* Menu Giữa (Desktop) */}
            <nav className="hidden md:flex items-center gap-8 font-bold text-sm md:text-base absolute left-1/2 transform -translate-x-1/2">
                {['Sản phẩm', 'Nam', 'Nữ', 'Trẻ em'].map((item) => (
                    <Link key={item} href="/products" className="relative group py-2">
                        <span className="group-hover:text-gray-500 transition-colors text-black uppercase tracking-tight">
                            {item}
                        </span>
                        {/* Hiệu ứng gạch chân khi hover */}
                        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                ))}
                <Link href="#" className="relative group py-2">
                    <span className="text-red-600 uppercase tracking-tight font-black group-hover:text-red-700">Sale</span>
                </Link>
            </nav>

            {/* Actions (Phải) */}
            <div className="flex items-center gap-4 md:gap-6">
                
                {/* Search & Wishlist (Ẩn trên mobile cho gọn) */}
                <div className="hidden md:flex gap-4">
                    <div className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
                        <SearchOutlined className="text-xl text-black" />
                    </div>
                    <div className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
                        <HeartOutlined className="text-xl text-black" />
                    </div>
                </div>

                {/* Cart */}
                <div 
                  className="cursor-pointer relative group" 
                  onClick={handleCartClick} 
                >
                    <div className="w-10 h-10 rounded-full group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                        <Badge count={cartCount} showZero offset={[0, -5]} size="small" color="black">
                            <ShoppingCartOutlined className="text-2xl text-black" />
                        </Badge>
                    </div>
                </div>
                
                {/* User Dropdown */}
                {isAuthenticated && user ? (
                <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow trigger={['click']}>
                    <div className="cursor-pointer hover:opacity-80 transition-opacity ml-2">
                        <Avatar 
                            className="bg-black text-white font-bold border-2 border-white shadow-md" 
                            size="large"
                            src={null} // Nếu có link ảnh thì điền vào đây
                        >
                            {/* Lấy chữ cái đầu của Tên hoặc Username */}
                            {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                    </div>
                </Dropdown>
                ) : (
                    // Mobile: Nút Login nhanh
                    <Link href="/login" className="md:hidden font-bold text-sm bg-black text-white px-3 py-1 rounded-full">
                        Vào
                    </Link>
                )}
            </div>
        </header>
    </div>
  );
}