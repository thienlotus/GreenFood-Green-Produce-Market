"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, Search, Menu, User, Download, Users, Bell, MapPin, 
  ChevronDown, List, Map, Package, LogOut, ShieldCheck, X,
  ShoppingBag, Apple, Coffee, Gift, Store
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import BrandLogo from '@/components/BrandLogo';

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
      {/* 1. TOP BAR - Modern Dark Glassmorphic Strip */}
      <div className="bg-slate-950 text-slate-300 text-xs hidden md:block border-b border-slate-900/80">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center h-8">
          <div className="flex items-center gap-3 text-slate-300 font-medium">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Nông sản sạch từ nhà vườn
            </span>
            <span className="hidden lg:inline text-slate-400">
              Giao hỏa tốc 2H • 100% Chuẩn VietGAP & OCOP
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <a 
              href="tel:02877702614" 
              className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all shadow-xs"
            >
              <span>HOTLINE:</span>
              <span className="text-white">028 7770 2614</span>
            </a>
            <div onClick={() => toast('Tính năng tải ứng dụng đang phát triển')} className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors text-[11px]">
              <Download size={13} /> Tải ứng dụng
            </div>
            <Link href="/farmer" className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors text-[11px]">
              <Store size={13} /> Kênh Người Bán
            </Link>
            <Link href="/partners" className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors text-[11px]">
              <Users size={13} /> Dành cho Nông hộ
            </Link>
            {mounted && isAuthenticated && user && (
              <Link href="/profile" className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition-colors text-[11px]">
                <User size={12} /> Hồ sơ & Điểm VIP
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER - Modern Glassmorphic Elevation */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-3.5 lg:py-4 min-h-[5rem] lg:min-h-[5.5rem] gap-2.5 sm:gap-3 lg:gap-5">
          {/* Brand Logo Đồng Bộ Chuẩn */}
          <div className="shrink-0">
            <BrandLogo variant="light" size="md" href="/" />
          </div>

          {/* Search Bar - Mở rộng tối đa chiều ngang, không bao giờ bị cắt chữ */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 min-w-[280px] max-w-4xl mx-1 sm:mx-2 lg:mx-3 relative">
            <div className="w-full relative flex items-center bg-slate-100/80 hover:bg-slate-100 border border-slate-200/90 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-full transition-all duration-300 shadow-inner pl-4 pr-1.5 py-1.5">
              <Search size={18} className="text-emerald-600/70 mr-2.5 shrink-0" />
              <input 
                type="text" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm nông sản tươi ngon, bưởi da xanh, sầu riêng, rau củ..." 
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none min-w-0"
              />
              <button 
                type="submit" 
                title="Tìm kiếm"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer shrink-0 ml-2 whitespace-nowrap"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
            {/* Notification Icon - Thu gọn thành icon tròn nhỏ tinh tế (không còn chữ Thông báo) */}
            <button 
              onClick={() => toast('Tính năng thông báo đang phát triển', { icon: '🔔' })}
              className="relative p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all cursor-pointer border border-slate-200/80 hover:border-emerald-300 shrink-0 group"
              aria-label="Thông báo"
              title="Thông báo"
            >
              <Bell size={19} className="text-emerald-700 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Auth Button / Profile Badge */}
            {mounted && isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2 border-l pl-2.5 sm:pl-3 border-slate-200">
                {/* Clickable Profile Badge */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 bg-slate-100/90 hover:bg-emerald-50/90 text-slate-900 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200/90 hover:border-emerald-300 transition-all shadow-xs group"
                  title="Xem và chỉnh sửa hồ sơ tài khoản"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-emerald-500 object-cover bg-white shrink-0 shadow-xs"
                  />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 max-w-[110px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <User size={10} />
                      <span>Hồ sơ</span>
                    </span>
                  </div>
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-purple-500/20 hover:scale-105 active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ShieldCheck size={14} />
                    <span className="hidden sm:inline">Quản Trị</span>
                  </Link>
                )}

                <button 
                  onClick={() => {
                    logout();
                    toast.success('Đã đăng xuất!');
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="hidden md:flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-bold text-xs bg-slate-100/80 hover:bg-emerald-50 px-4 py-2 rounded-full border border-slate-200 transition-all whitespace-nowrap"
              >
                <User size={16} />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Warehouse Pickup (Chỉ hiện trên màn hình siêu rộng 2XL để ưu tiên không gian tìm kiếm) */}
            <div 
              onClick={() => toast.success('Đã cập nhật kho: TP. Hồ Chí Minh')}
              className="hidden 2xl:flex items-center gap-2 bg-emerald-50/90 text-emerald-950 px-3 py-1.5 rounded-full border border-emerald-200/80 cursor-pointer hover:bg-emerald-100/90 transition-all shadow-xs shrink-0"
            >
              <MapPin size={15} className="text-emerald-600 shrink-0" />
              <div className="flex flex-col text-[11px] leading-tight">
                <span className="text-slate-500">Kho hàng:</span>
                <b className="text-emerald-800 font-bold">TP. HCM</b>
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

            {/* Cart Button */}
            <button 
              className="relative p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all cursor-pointer border border-slate-200/80 hover:border-emerald-300"
              onClick={() => setIsOpen(true)}
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={22} className="text-emerald-700" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-700 hover:text-emerald-600 p-2 cursor-pointer rounded-xl hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MENU BAR (Desktop Only) - Tối ưu hiển thị đầy đủ 100% các mục lựa chọn, không bị tràn hay mất chữ */}
      <div className="hidden lg:block border-t border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-3 lg:px-4 xl:px-6">
          <div className="flex items-center gap-1.5 xl:gap-2.5 2xl:gap-3.5 h-12 xl:h-13 py-1 overflow-x-auto no-scrollbar scroll-smooth">
            
            {/* Mega Menu Toggle */}
            <div 
              className="relative flex items-center shrink-0"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button className="flex items-center gap-1 xl:gap-1.5 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white px-2.5 xl:px-3.5 py-1.5 rounded-full font-bold text-[11px] xl:text-xs 2xl:text-[13px] tracking-wide whitespace-nowrap shadow-xs hover:shadow-md hover:shadow-emerald-950/20 active:scale-95 transition-all duration-300 cursor-pointer shrink-0">
                <List size={13} className="shrink-0" />
                <span>Danh mục nông sản</span>
                <ChevronDown size={11} className={`transition-transform duration-300 shrink-0 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Content */}
              {isCategoryOpen && (
                <div className="absolute top-full left-0 w-64 bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/90 py-2.5 z-50 rounded-2xl mt-1.5 animate-fadeIn">
                  {[
                    { name: 'Đi chợ online', href: '/category/di-cho-online/', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50' },
                    { name: 'Trái cây tươi ngon', href: '/category/trai-cay/', icon: Apple, color: 'text-rose-600 bg-rose-50' },
                    { name: 'Trà - Cà phê - Socola', href: '/category/tra-ca-phe/', icon: Coffee, color: 'text-amber-700 bg-amber-50' },
                    { name: 'Đặc sản vùng miền', href: '/category/dac-san/', icon: Gift, color: 'text-purple-600 bg-purple-50' },
                    { name: 'Agrishow Triển lãm', href: '/category/agrishow/', icon: Store, color: 'text-teal-600 bg-teal-50' },
                    { name: 'Nông hộ & Nhà vườn', href: '/farmers/', icon: Users, color: 'text-sky-600 bg-sky-50' }
                  ].map((cat) => {
                    const IconComp = cat.icon;
                    return (
                      <Link 
                        key={cat.name} 
                        href={cat.href} 
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50/80 hover:text-emerald-800 text-slate-700 text-xs font-semibold transition-all group"
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                          <IconComp size={15} />
                        </span>
                        <span>{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Horizontal Links - Tinh gọn khoảng cách và kích thước, vừa vặn hoàn toàn trên mọi màn hình */}
            <nav className="flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2 min-w-0">
              <Link 
                href="/category/di-cho-online/" 
                className="px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs 2xl:text-[13px] font-bold text-slate-800 hover:text-emerald-900 hover:bg-emerald-50 transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 group"
              >
                <ShoppingBag size={13} className="text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                <span>Đi chợ online</span>
              </Link>
              <Link 
                href="/category/trai-cay/" 
                className="px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs 2xl:text-[13px] font-bold text-slate-800 hover:text-emerald-900 hover:bg-rose-50 transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 group"
              >
                <Apple size={13} className="text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
                <span>Trái cây tươi</span>
              </Link>
              <Link 
                href="/category/tra-ca-phe/" 
                className="px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs 2xl:text-[13px] font-bold text-slate-800 hover:text-emerald-900 hover:bg-amber-50 transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 group"
              >
                <Coffee size={13} className="text-amber-700 group-hover:scale-110 transition-transform shrink-0" />
                <span>Trà & Cà phê</span>
              </Link>
              <Link 
                href="/category/dac-san/" 
                className="px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs 2xl:text-[13px] font-bold text-slate-800 hover:text-emerald-900 hover:bg-purple-50 transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 group"
              >
                <Gift size={13} className="text-purple-600 group-hover:scale-110 transition-transform shrink-0" />
                <span>Đặc sản</span>
              </Link>
              <Link 
                href="/farmers" 
                className="px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs 2xl:text-[13px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-300/80 transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 shadow-xs group"
              >
                <Store size={13} className="text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                <span>Gian hàng nông hộ</span>
              </Link>
              <Link 
                href="/map/" 
                className="px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs 2xl:text-[13px] font-bold text-slate-800 hover:text-emerald-900 hover:bg-emerald-50 transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 group"
              >
                <Map size={13} className="text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                <span>Bản đồ nhà vườn</span>
              </Link>
              <Link 
                href="/tracking/" 
                className="px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs 2xl:text-[13px] font-bold text-amber-900 hover:text-amber-950 bg-amber-50/90 hover:bg-amber-100 border border-amber-300/80 transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 shadow-xs group"
              >
                <Package size={13} className="text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
                <span>Theo dõi đơn</span>
              </Link>
              {mounted && isAuthenticated && user && (
                <Link 
                  href="/profile/" 
                  className="px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-full text-[11px] xl:text-xs 2xl:text-[13px] font-bold text-teal-900 hover:text-teal-950 bg-teal-50/90 hover:bg-teal-100 border border-teal-300/80 transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 shadow-xs group"
                >
                  <User size={13} className="text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Hồ sơ của tôi</span>
                </Link>
              )}
            </nav>

          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-black/40 backdrop-blur-xs z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-4/5 max-w-sm h-full shadow-2xl p-6 space-y-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Brand Logo in Drawer Đồng Bộ */}
            <div className="pb-3 border-b border-gray-100">
              <BrandLogo variant="light" size="sm" href="/" />
            </div>

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
                { name: 'Đi chợ online', href: '/category/di-cho-online/', icon: ShoppingBag, color: 'text-emerald-600' },
                { name: 'Trái cây tươi ngon', href: '/category/trai-cay/', icon: Apple, color: 'text-rose-500' },
                { name: 'Trà - Cà phê - Socola', href: '/category/tra-ca-phe/', icon: Coffee, color: 'text-amber-700' },
                { name: 'Đặc sản vùng miền', href: '/category/dac-san/', icon: Gift, color: 'text-purple-600' },
                { name: 'Gian hàng nông hộ', href: '/farmers/', icon: Store, color: 'text-emerald-700' },
                { name: 'Bản đồ nhà vườn', href: '/map/', icon: Map, color: 'text-emerald-600' },
                { name: 'Theo dõi đơn hàng', href: '/tracking/', icon: Package, color: 'text-amber-600' },
                { name: 'Hồ sơ cá nhân & VIP', href: '/profile/', icon: User, color: 'text-teal-600' },
              ].map((link) => {
                const IconComp = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <IconComp size={16} className={link.color} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
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
