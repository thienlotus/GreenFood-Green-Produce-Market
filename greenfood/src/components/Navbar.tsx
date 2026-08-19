"use client";

import Link from 'next/link';
import { ShoppingCart, Search, Menu, User, Download, Users, Bell, MapPin, ChevronDown, List, Map, Package } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const { items, setIsOpen } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm relative">
      {/* 1. TOP BAR */}
      <div className="bg-emerald-700 text-white text-xs hidden md:block">
        <div className="container mx-auto px-4 lg:px-8 flex justify-end items-center h-8 gap-6">
          <div className="flex items-center gap-1 hover:text-emerald-200 cursor-pointer transition-colors">
            HOTLINE <a href="tel:02877702614" className="font-bold ml-1">028 7770 2614</a>
          </div>
          <div onClick={() => toast('Tính năng tải ứng dụng đang phát triển')} className="flex items-center gap-1 hover:text-emerald-200 cursor-pointer transition-colors">
            <Download size={14} /> Tải ứng dụng
          </div>
          <div onClick={() => toast('Trang Cộng tác viên đang phát triển')} className="flex items-center gap-1 hover:text-emerald-200 cursor-pointer transition-colors">
            <Users size={14} /> Dành cho Cộng tác viên
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
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder="Nhập nội dung tìm kiếm (vd: bưởi, sầu riêng...)" 
              className="w-full pl-5 pr-12 py-3 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
            />
            <button onClick={() => toast.error('Vui lòng nhập từ khóa tìm kiếm!')} className="absolute right-1 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors">
              <Search size={18} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Notification */}
            <button 
              onClick={() => toast('Tính năng thông báo đang phát triển', { icon: '🔔' })}
              className="hidden lg:flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 font-medium text-sm transition-colors"
            >
              <Bell size={20} />
              <span>Thông báo</span>
            </button>

            {/* Auth Dropdown / Login */}
            {mounted && isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-4 border-l pl-5 border-gray-200">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-gray-800">{user.name}</span>
                  <span className="text-[10px] text-gray-500 capitalize">
                    {user.role === 'admin' ? 'Quản trị viên' : user.role === 'vendor' ? 'Nông hộ' : 'Khách hàng'}
                  </span>
                </div>
                {user.role === 'admin' && (
                  <Link href="/admin" className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                    Trang Quản Trị
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    toast.success('Đã đăng xuất!');
                  }}
                  className="text-gray-500 hover:text-rose-500 text-sm font-medium transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="hidden md:flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 font-medium text-sm transition-colors border-l pl-5 border-gray-200"
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

            {/* Cart */}
            <button 
              className="relative p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors ml-2"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart size={24} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[11px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="md:hidden text-gray-600 p-2">
              <Menu size={24} />
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
              <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 h-full font-semibold text-sm hover:bg-emerald-700 transition-colors">
                <List size={18} />
                Danh mục sản phẩm
                <ChevronDown size={16} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Content */}
              {isCategoryOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-100 py-2 z-50 rounded-b-lg">
                  {['Đi chợ online', 'Trái cây tươi ngon', 'Trà - Cà phê - Socola', 'Đặc sản vùng miền', 'Đồ sấy - Ăn vặt'].map((cat) => (
                    <Link key={cat} href="#" className="block px-5 py-3 hover:bg-emerald-50 hover:text-emerald-600 text-gray-700 text-sm font-medium transition-colors">
                      {cat}
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
            </nav>

          </div>
        </div>
      </div>
    </header>
  );
}
