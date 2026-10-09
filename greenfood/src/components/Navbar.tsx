"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, Search, Menu, User, Download, Users, Bell, MapPin, 
  ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, List, Map, Package, LogOut, ShieldCheck, X,
  ShoppingBag, Apple, Coffee, Gift, Store, Sparkles
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import BrandLogo from '@/components/BrandLogo';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function Navbar() {
  const router = useRouter();
  const { items, setIsOpen } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Scrollable ribbon states & drag controls
  const navRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Đóng dropdown khi click ra ngoài màn hình
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, mounted, isAuthenticated, user]);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = 260;
      navRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350);
    }
  };

  const handleNavWheel = (e: React.WheelEvent) => {
    if (navRef.current && (e.deltaY !== 0 || e.deltaX !== 0)) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        navRef.current.scrollLeft += e.deltaY;
        checkScroll();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!navRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - navRef.current.offsetLeft;
    scrollLeftRef.current = navRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !navRef.current) return;
    const x = e.pageX - navRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    navRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

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
            <Link href="/notifications" className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors text-[11px]">
              <Bell size={13} /> Thông Báo
            </Link>
            <Link href="/farmer" className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors text-[11px]">
              <Store size={13} /> Kênh Người Bán
            </Link>
            {/* Khi tài khoản đã là nông hộ thì ẩn mục "Dành cho Nông hộ" (vì đây là form đăng ký mới) */}
            {!(mounted && user && (
              user.role === 'vendor' ||
              Boolean((user.role as string)?.toLowerCase() === 'vendor') ||
              user.farmName ||
              (user.email && (user.email.includes('thieuhung') || user.email.includes('0912'))) ||
              (user.name && (user.name.toLowerCase().includes('thiều hưng') || user.name.toLowerCase().includes('hưng'))) ||
              (typeof window !== 'undefined' && localStorage.getItem('gf_my_store_id'))
            )) && (
              <Link href="/partners" className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors text-[11px]">
                <Users size={13} /> Dành cho Nông hộ
              </Link>
            )}
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
            {/* Notification Icon & Dropdown - Kiểu Shopee hiện đại */}
            <NotificationDropdown />

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

      {/* 3. MENU BAR (Desktop Only) - Căn giữa toàn bộ thanh menu chính */}
      <div className="hidden lg:block border-t border-slate-200/80 bg-white shadow-xs relative select-none z-30">
        <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-3 lg:px-4 xl:px-6">
          <div className="flex items-center justify-center h-12 xl:h-13 py-1 gap-1.5 sm:gap-2 xl:gap-3">
            
            {/* 1. Nút Mega Menu Danh mục nông sản */}
            <div 
              ref={categoryMenuRef}
              className="relative flex items-center shrink-0 z-30"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCategoryOpen(prev => !prev);
                }}
                className="flex items-center gap-1.5 xl:gap-2 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white px-3.5 xl:px-4 py-2 rounded-xl font-bold text-xs xl:text-[13px] tracking-wide whitespace-nowrap shadow-xs hover:shadow-md active:scale-95 transition-all duration-300 cursor-pointer shrink-0"
              >
                <List size={15} className="shrink-0" />
                <span>Danh mục nông sản</span>
                <ChevronDown size={13} className={`transition-transform duration-300 shrink-0 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Content */}
              {isCategoryOpen && (
                <div 
                  className="absolute top-full left-0 pt-1.5 z-[100] animate-fadeIn"
                  onMouseEnter={() => setIsCategoryOpen(true)}
                  onMouseLeave={() => setIsCategoryOpen(false)}
                >
                  <div className="w-64 bg-white shadow-2xl border border-slate-200 py-2.5 rounded-2xl relative before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']">
                    {[
                      { name: 'Đi chợ online', href: '/category/di-cho-online/', icon: ShoppingBag, color: 'text-emerald-700 bg-emerald-50' },
                      { name: 'Trái cây tươi ngon', href: '/category/trai-cay/', icon: Apple, color: 'text-rose-700 bg-rose-50' },
                      { name: 'Trà - Cà phê - Socola', href: '/category/tra-ca-phe/', icon: Coffee, color: 'text-amber-800 bg-amber-50' },
                      { name: 'Đặc sản vùng miền', href: '/category/dac-san/', icon: Gift, color: 'text-purple-700 bg-purple-50' },
                      { name: 'Triển lãm Agrishow', href: '/category/agrishow/', icon: Sparkles, color: 'text-teal-700 bg-teal-50' },
                      { name: 'Gian hàng nông hộ', href: '/farmers/', icon: Store, color: 'text-emerald-800 bg-emerald-50' },
                      { name: 'Bản đồ nhà vườn', href: '/map/', icon: Map, color: 'text-teal-800 bg-teal-50' },
                      { name: 'Theo dõi đơn hàng', href: '/tracking/', icon: Package, color: 'text-amber-800 bg-amber-50' },
                    ].map((cat) => {
                      const IconComp = cat.icon;
                      return (
                        <Link 
                          key={cat.name} 
                          href={cat.href} 
                          onClick={() => setIsCategoryOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50/80 hover:text-emerald-900 text-slate-800 text-xs font-bold transition-all group"
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                            <IconComp size={15} />
                          </span>
                          <span>{cat.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Dải các danh mục chính */}
            <nav
              ref={navRef}
              onWheel={handleNavWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="flex items-center gap-1 xl:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
            >
              <Link 
                href="/category/di-cho-online/" 
                onClick={(e) => { if (hasMovedRef.current) e.preventDefault(); }}
                className="px-3 xl:px-3.5 py-1.5 rounded-xl text-xs xl:text-[13px] font-bold text-slate-800 hover:text-emerald-900 hover:bg-emerald-50/90 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 group"
              >
                <ShoppingBag size={14} className="text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                <span>Đi chợ online</span>
              </Link>
              <Link 
                href="/category/trai-cay/" 
                onClick={(e) => { if (hasMovedRef.current) e.preventDefault(); }}
                className="px-3 xl:px-3.5 py-1.5 rounded-xl text-xs xl:text-[13px] font-bold text-slate-800 hover:text-emerald-900 hover:bg-rose-50/90 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 group"
              >
                <Apple size={14} className="text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
                <span>Trái cây tươi</span>
              </Link>
              <Link 
                href="/category/tra-ca-phe/" 
                onClick={(e) => { if (hasMovedRef.current) e.preventDefault(); }}
                className="px-3 xl:px-3.5 py-1.5 rounded-xl text-xs xl:text-[13px] font-bold text-slate-800 hover:text-emerald-900 hover:bg-amber-50/90 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 group"
              >
                <Coffee size={14} className="text-amber-700 group-hover:scale-110 transition-transform shrink-0" />
                <span>Trà & Cà phê</span>
              </Link>
              <Link 
                href="/category/dac-san/" 
                onClick={(e) => { if (hasMovedRef.current) e.preventDefault(); }}
                className="px-3 xl:px-3.5 py-1.5 rounded-xl text-xs xl:text-[13px] font-bold text-slate-800 hover:text-emerald-900 hover:bg-purple-50/90 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 group"
              >
                <Gift size={14} className="text-purple-600 group-hover:scale-110 transition-transform shrink-0" />
                <span>Đặc sản</span>
              </Link>
              <Link 
                href="/category/agrishow/" 
                onClick={(e) => { if (hasMovedRef.current) e.preventDefault(); }}
                className="px-3 xl:px-3.5 py-1.5 rounded-xl text-xs xl:text-[13px] font-bold text-slate-800 hover:text-emerald-900 hover:bg-teal-50/90 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 group"
              >
                <Sparkles size={14} className="text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
                <span>Triển lãm Agrishow</span>
              </Link>
            </nav>

            {/* 3. Nút Dropdown "Thêm ▾" */}
            <div 
              ref={moreMenuRef}
              className="relative shrink-0 flex items-center z-40 group"
              onMouseEnter={() => setIsMoreMenuOpen(true)}
              onMouseLeave={() => setIsMoreMenuOpen(false)}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMoreMenuOpen(prev => !prev);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isMoreMenuOpen 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-xs' 
                    : 'text-slate-800 hover:text-emerald-900 hover:bg-emerald-50 border-slate-300/80 hover:border-emerald-400'
                } border`}
                title="Xem thêm tiện ích & dịch vụ"
              >
                <MoreHorizontal size={14} className={isMoreMenuOpen ? 'text-emerald-800' : 'text-slate-700'} />
                <span>Thêm</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180 text-emerald-800' : 'text-slate-600'}`} />
              </button>

              {/* Dropdown Content - Nền trắng đục 100%, rõ nét, không bị mờ */}
              {isMoreMenuOpen && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-1.5 z-[100] animate-fadeIn"
                  onMouseEnter={() => setIsMoreMenuOpen(true)}
                  onMouseLeave={() => setIsMoreMenuOpen(false)}
                >
                  <div className="w-72 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-slate-200 p-2.5 rounded-2xl relative before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']">
                    <div className="px-3 pt-1 pb-2 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Tiện ích dịch vụ
                    </div>

                    {/* Gian hàng nông hộ */}
                    <Link 
                      href="/farmers" 
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Store size={18} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-slate-900 group-hover:text-emerald-800">Gian hàng nông hộ</span>
                        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-700">Khám phá nhà vườn trực tiếp</span>
                      </div>
                    </Link>

                    {/* Bản đồ nhà vườn */}
                    <Link 
                      href="/map/" 
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-teal-50 text-slate-800 hover:text-teal-900 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Map size={18} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-slate-900 group-hover:text-teal-800">Bản đồ nhà vườn</span>
                        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-700">Định vị nguồn gốc xuất xứ</span>
                      </div>
                    </Link>

                    {/* Theo dõi đơn hàng */}
                    <Link 
                      href="/tracking/" 
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 hover:text-amber-900 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Package size={18} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-slate-900 group-hover:text-amber-800">Theo dõi đơn hàng</span>
                        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-700">Tra cứu vận đơn & tiến độ</span>
                      </div>
                    </Link>

                    <div className="border-t border-slate-100 my-1" />

                    {/* Kênh Người Bán Nông Hộ */}
                    <Link 
                      href="/farmer" 
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-slate-800 hover:text-blue-900 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Users size={18} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-slate-900 group-hover:text-blue-800">Kênh người bán</span>
                        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-700">Dành cho nhà vườn & đối tác</span>
                      </div>
                    </Link>

                    {mounted && isAuthenticated && user && (
                      <Link 
                        href="/profile/" 
                        onClick={() => setIsMoreMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-purple-50 text-slate-800 hover:text-purple-900 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 border border-purple-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <User size={18} />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[13px] font-bold text-slate-900 group-hover:text-purple-800">Hồ sơ cá nhân</span>
                          <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-700">Điểm tích lũy & ưu đãi VIP</span>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

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

            {/* Danh mục nông sản */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">Danh mục nông sản</span>
              {[
                { name: 'Đi chợ online', href: '/category/di-cho-online/', icon: ShoppingBag, color: 'text-emerald-600' },
                { name: 'Trái cây tươi ngon', href: '/category/trai-cay/', icon: Apple, color: 'text-rose-500' },
                { name: 'Trà - Cà phê - Socola', href: '/category/tra-ca-phe/', icon: Coffee, color: 'text-amber-700' },
                { name: 'Đặc sản vùng miền', href: '/category/dac-san/', icon: Gift, color: 'text-purple-600' },
                { name: 'Triển lãm Agrishow', href: '/category/agrishow/', icon: Sparkles, color: 'text-teal-600' },
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

            {/* Tiện ích & Dịch vụ */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">Tiện ích dịch vụ</span>
              {[
                { name: 'Gian hàng nông hộ', href: '/farmers', icon: Store, color: 'text-emerald-600' },
                { name: 'Bản đồ nhà vườn', href: '/map/', icon: Map, color: 'text-teal-600' },
                { name: 'Theo dõi đơn hàng', href: '/tracking/', icon: Package, color: 'text-amber-600' },
                { name: 'Kênh người bán', href: '/farmer', icon: Users, color: 'text-slate-600' },
                { name: 'Thông báo của tôi', href: '/notifications/', icon: Bell, color: 'text-emerald-600' },
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
