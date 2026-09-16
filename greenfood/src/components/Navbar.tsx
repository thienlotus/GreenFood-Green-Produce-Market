"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Menu, User, Download, Users, Bell, MapPin, ChevronDown, List, Map, Package, LogOut, ShieldCheck, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const { items, setIsOpen } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchKeyword.trim();
    if (!trimmed) {
      toast.error('Vui lòng nhập từ khóa tìm kiếm!');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm relative">
      {/* 1. TOP BAR */}
      <div className="bg-emerald-700 text-white text-xs hidden md:block">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center h-8">
          <div className="text-emerald-100 font-medium">
            Nông Sản Sạch Trực Tiếp Từ Vườn Đến Bếp Mọi Gia Đình
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 hover:text-emerald-200 cursor-pointer transition-colors">
              HOTLINE <a href="tel:02877702614" className="font-bold ml-1">028 7770 2614</a>
            </div>
            <div onClick={() => toast('Tính năng tải ứng dụng đang phát triển')} className="flex items-center gap-1 hover:text-emerald-200 cursor-pointer transition-colors">
              <Download size={14} /> Tải ứng dụng
            </div>
            <Link href="/partners" className="flex items-center gap-1 hover:text-emerald-200 transition-colors">
              <Users size={14} /> Dành cho Nông hộ
            </Link>
            {mounted && isAuthenticated && user && (
              <Link href="/profile" className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold transition-colors">
                <User size={13} /> Hồ sơ & Điểm thưởng VIP
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.jpg" alt="GreenFood Logo" className="h-10 w-10 object-contain rounded-lg shadow-sm mix-blend-multiply" />
            <span className="text-3xl font-medium text-emerald-600 hidden sm:block tracking-tight font-pacifico">GreenFood</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative">
            <input 
              type="text" 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Nhập nội dung tìm kiếm (vd: bưởi, sầu riêng, rau củ...)" 
              className="w-full pl-5 pr-12 py-3 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
            />
            <button 
              type="submit" 
              title="Tìm kiếm"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4 lg:gap-5 shrink-0">
            {/* Notification */}
            <button 
              onClick={() => toast('Tính năng thông báo đang phát triển', { icon: '🔔' })}
              className="hidden lg:flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 font-medium text-sm transition-colors cursor-pointer"
            >
              <Bell size={20} />
              <span>Thông báo</span>
            </button>

            {/* Auth Button / Profile Badge */}
            {mounted && isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-3 border-l pl-4 border-gray-200">
                {/* Clickable Profile Badge */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 px-3.5 py-1.5 rounded-2xl border border-emerald-200 transition-all shadow-xs group"
                  title="Xem và chỉnh sửa hồ sơ tài khoản"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-emerald-500 object-cover bg-white shrink-0"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1 max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <User size={10} />
                      <span>Hồ sơ cá nhân</span>
                    </span>
                  </div>
                </Link>

                {user.role === 'admin' && (
                  <Link href="/admin" className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1">
                    <ShieldCheck size={14} />
                    <span>Quản Trị</span>
                  </Link>
                )}

                <button 
                  onClick={() => {
                    logout();
                    toast.success('Đã đăng xuất!');
                  }}
                  className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="hidden md:flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 font-bold text-sm transition-colors border-l pl-5 border-gray-200"
              >
                <User size={20} />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Warehouse Pickup */}
            <div 
              onClick={() => toast.success('Đã cập nhật kho: TP. Hồ Chí Minh')}
              className="hidden xl:flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors"
            >
              <MapPin size={18} className="text-emerald-600" />
              <div className="flex flex-col text-[11px] leading-tight">
                <span>Giao hàng từ kho:</span>
                <b className="text-amber-600">Chọn kho gần bạn</b>
              </div>
            </div>

            {/* Mobile Profile Icon (Visible on small screens if logged in) */}
            {mounted && isAuthenticated && user && (
              <Link
                href="/profile"
                className="md:hidden flex items-center justify-center p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full"
                title="Hồ sơ tài khoản"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-emerald-500 object-cover bg-white"
                />
              </Link>
            )}

            {/* Cart */}
            <button 
              className="relative p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart size={24} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[11px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-emerald-600 p-2 cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MENU BAR (Desktop Only) */}
      <div className="hidden lg:block border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center h-12">
            
            {/* Mega Menu Toggle */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 h-full font-semibold text-sm hover:bg-emerald-700 transition-colors cursor-pointer">
                <List size={18} />
                Danh mục sản phẩm
                <ChevronDown size={16} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Content */}
              {isCategoryOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-100 py-2 z-50 rounded-b-lg">
                  {[
                    { name: 'Đi chợ online', href: '/category/di-cho-online' },
                    { name: 'Trái cây tươi ngon', href: '/category/trai-cay' },
                    { name: 'Trà - Cà phê - Socola', href: '/category/tra-ca-phe' },
                    { name: 'Đặc sản vùng miền', href: '/category/dac-san' },
                    { name: 'Nông hộ & Nhà vườn', href: '/farmers' }
                  ].map((cat) => (
                    <Link key={cat.name} href={cat.href} className="block px-5 py-3 hover:bg-emerald-50 hover:text-emerald-600 text-gray-700 text-sm font-medium transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Horizontal Links */}
            <nav className="flex items-center gap-6 ml-8">
              <Link href="/category/di-cho-online" className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 font-bold text-sm uppercase transition-colors">
                ĐI CHỢ ONLINE
              </Link>
              <Link href="/category/trai-cay" className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 font-bold text-sm uppercase transition-colors">
                TRÁI CÂY
              </Link>
              <Link href="/category/tra-ca-phe" className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 font-bold text-sm uppercase transition-colors">
                TRÀ - CÀ PHÊ
              </Link>
              <Link href="/category/dac-san" className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 font-bold text-sm uppercase transition-colors">
                ĐẶC SẢN
              </Link>
              <Link href="/map" className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-600 font-bold text-sm uppercase transition-colors">
                <Map size={15} /> BẢN ĐỒ NHÀ VƯỜN
              </Link>
              <Link href="/tracking" className="flex items-center gap-1.5 text-amber-700 hover:text-amber-600 font-bold text-sm uppercase transition-colors">
                <Package size={15} /> THEO DÕI ĐƠN
              </Link>
              {mounted && isAuthenticated && user && (
                <Link href="/profile" className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold text-sm uppercase transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <User size={15} /> HỒ SƠ CỦA TÔI
                </Link>
              )}
            </nav>

          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-black/40 backdrop-blur-xs z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-4/5 max-w-sm h-full shadow-2xl p-6 space-y-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* User Info Header in Drawer */}
            {mounted && isAuthenticated && user ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border border-emerald-500 object-cover bg-white"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{user.name}</h3>
                    <span className="text-[11px] font-semibold text-emerald-700 capitalize">
                      {user.role === 'admin' ? 'Quản trị viên' : user.role === 'vendor' ? 'Nông hộ' : 'Khách hàng'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <User size={14} />
                    <span>Xem hồ sơ & điểm VIP</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      toast.success('Đã đăng xuất!');
                    }}
                    className="text-rose-600 font-semibold hover:underline"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow"
              >
                <User size={18} />
                <span>Đăng nhập / Đăng ký</span>
              </Link>
            )}

            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm nông sản, hoa quả, nhà vườn..." 
                className="w-full pl-4 pr-11 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
              />
              <button 
                type="submit"
                title="Tìm kiếm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Search size={15} />
              </button>
            </form>

            {/* Navigation links */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3">Danh mục chính</span>
              {[
                { name: 'Đi chợ online', href: '/category/di-cho-online' },
                { name: 'Trái cây tươi ngon', href: '/category/trai-cay' },
                { name: 'Trà - Cà phê - Socola', href: '/category/tra-ca-phe' },
                { name: 'Đặc sản vùng miền', href: '/category/dac-san' },
                { name: 'Bản đồ nhà vườn', href: '/map' },
                { name: 'Theo dõi đơn hàng', href: '/tracking' },
                { name: 'Hồ sơ cá nhân & VIP', href: '/profile' },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 bg-purple-100 text-purple-800 rounded-xl font-bold text-xs"
              >
                Trang Quản Trị Hệ Thống
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
