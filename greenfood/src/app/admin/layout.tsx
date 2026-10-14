"use client";

import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import BrandLogo from '@/components/BrandLogo';
import AdminNotificationCenter from '@/components/admin/AdminNotificationCenter';
import { cleanVietnameseMojibake } from '@/data/vietnamAddress';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Tractor,
  Truck,
  Building2,
  MessageCircle, 
  Settings, 
  LogOut, 
  ExternalLink,
  Store,
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Mail,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { ALL_PRODUCTS } from '@/data/products';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pendingFarmerCount, setPendingFarmerCount] = useState(0);
  const [pendingB2bCount, setPendingB2bCount] = useState(0);
  const [pendingJobCount, setPendingJobCount] = useState(0);
  const [pendingContactCount, setPendingContactCount] = useState(0);
  const [pendingComplaintCount, setPendingComplaintCount] = useState(0);

  // Quick search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // User profile dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkPendingCounts() {
      try {
        const { 
          getAdminFarmersApi, 
          getAdminB2bInquiriesApi,
          getAdminJobApplicationsApi,
          getAdminContactInquiriesApi,
          getAdminCustomerComplaintsApi
        } = await import('@/lib/api');

        const [farmerData, b2bData, jobData, contactData, complaintData] = await Promise.all([
          getAdminFarmersApi().catch(() => []),
          getAdminB2bInquiriesApi({ status: 'PENDING' }).catch(() => ({ success: false, pending_count: 0 })),
          getAdminJobApplicationsApi({ status: 'PENDING' }).catch(() => ({ success: false, pending_count: 0 })),
          getAdminContactInquiriesApi({ status: 'PENDING' }).catch(() => ({ success: false, pending_count: 0 })),
          getAdminCustomerComplaintsApi({ status: 'PENDING' }).catch(() => ({ success: false, pending_count: 0 })),
        ]);

        if (Array.isArray(farmerData)) {
          setPendingFarmerCount(farmerData.filter(f => !f.is_verified).length);
        }
        if (b2bData?.pending_count !== undefined) setPendingB2bCount(b2bData.pending_count);
        if (jobData?.pending_count !== undefined) setPendingJobCount(jobData.pending_count);
        if (contactData?.pending_count !== undefined) setPendingContactCount(contactData.pending_count);
        if (complaintData?.pending_count !== undefined) setPendingComplaintCount(complaintData.pending_count);
      } catch {}
    }
    checkPendingCounts();
    const interval = setInterval(checkPendingCounts, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi trang quản trị');
    router.push('/login');
  };

  const navGroups: NavGroup[] = [
    {
      title: 'TỔNG QUAN',
      items: [
        { name: 'Dashboard', href: '/admin/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'QUẢN LÝ KINH DOANH',
      items: [
        { name: 'Đơn hàng & Doanh thu', href: '/admin/orders/', icon: ShoppingBag, badge: 'Mới' },
        { name: 'Sản phẩm nông sản', href: '/admin/products/', icon: Package },
        { 
          name: 'Nông hộ & Vùng trồng', 
          href: '/admin/farmers/', 
          icon: Tractor, 
          badge: pendingFarmerCount > 0 ? `${pendingFarmerCount} chờ duyệt` : undefined,
          highlight: pendingFarmerCount > 0
        },
        { 
          name: 'Khách sỉ & B2B', 
          href: '/admin/b2b/', 
          icon: Building2, 
          badge: pendingB2bCount > 0 ? `${pendingB2bCount} chờ` : undefined,
          highlight: pendingB2bCount > 0
        },
        { name: 'Vận chuyển GHN', href: '/admin/shipping/', icon: Truck },
      ],
    },
    {
      title: 'CHĂM SÓC KHÁCH HÀNG & PHẢN HỒI',
      items: [
        { name: 'Live Chat & Trợ lý AI', href: '/admin/chat/', icon: MessageCircle, badge: 'AI Flash', highlight: true },
        { 
          name: 'Tiếp nhận khiếu nại', 
          href: '/admin/complaints/', 
          icon: AlertTriangle, 
          badge: pendingComplaintCount > 0 ? `${pendingComplaintCount} xử lý` : undefined,
          highlight: pendingComplaintCount > 0
        },
        { 
          name: 'Liên hệ & Góp ý', 
          href: '/admin/contact/', 
          icon: Mail, 
          badge: pendingContactCount > 0 ? `${pendingContactCount} mới` : undefined,
          highlight: pendingContactCount > 0
        },
        { name: 'Khách hàng & User', href: '/admin/customers/', icon: Users },
        { name: 'Bản đồ nông hộ', href: '/map', icon: MapPin },
      ],
    },
    {
      title: 'TUYỂN DỤNG & NHÂN SỰ',
      items: [
        { 
          name: 'Tuyển dụng nhân sự', 
          href: '/admin/careers/', 
          icon: Briefcase, 
          badge: pendingJobCount > 0 ? `${pendingJobCount} hồ sơ` : undefined,
          highlight: pendingJobCount > 0
        },
      ],
    },
    {
      title: 'CẤU HÌNH HỆ THỐNG',
      items: [
        { name: 'Cài đặt chung', href: '/admin/settings/', icon: Settings },
      ],
    },
  ];

  const normalizePath = (p: string) => p?.replace(/\/+$/, '') || '/';

  const getPageTitle = () => {
    const norm = normalizePath(pathname);
    if (norm === '/admin') return 'Bảng điều khiển Tổng quan';
    if (norm.startsWith('/admin/orders')) return 'Quản lý Đơn hàng';
    if (norm.startsWith('/admin/products')) return 'Quản lý Sản phẩm';
    if (norm.startsWith('/admin/b2b')) return 'Khách sỉ & Doanh nghiệp (B2B)';
    if (norm.startsWith('/admin/chat')) return 'Live Chat & Trợ lý AI';
    if (norm.startsWith('/admin/complaints')) return 'Tiếp nhận & Xử lý Khiếu nại Dịch vụ';
    if (norm.startsWith('/admin/contact')) return 'Liên hệ & Góp ý Khách hàng';
    if (norm.startsWith('/admin/careers')) return 'Quản lý Tuyển dụng Nhân sự';
    if (norm.startsWith('/admin/customers')) return 'Người dùng & Phân quyền';
    if (norm.startsWith('/admin/farmers')) return 'Nông hộ & Vùng trồng';
    if (norm.startsWith('/admin/shipping')) return 'Cước phí vận chuyển GHN';
    if (norm.startsWith('/admin/settings')) return 'Cài đặt hệ thống';
    return 'Quản trị hệ thống';
  };

  useEffect(() => {
    const pageTitle = getPageTitle();
    document.title = `GreenFood Admin - ${pageTitle}`;
  }, [pathname]);

  // Quick search results
  const searchResults = searchQuery.trim()
    ? ALL_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#f8f9fa] flex text-slate-800 antialiased font-sans">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          />
        )}

        {/* Adminator Clean White Sidebar */}
        <aside className={`
          fixed md:sticky top-0 h-screen bg-white text-slate-700 z-50 flex flex-col 
          transition-all duration-300 ease-in-out border-r border-slate-200/90 shadow-sm
          ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
        `}>
          {/* Brand Header: 100% Đồng bộ logo thương hiệu GreenFood */}
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200/90 bg-white">
            <Link 
              href="/admin/" 
              className="flex items-center gap-2.5 overflow-hidden group py-1"
              title="GreenFood Admin"
            >
              <img
                src="/logo.png"
                alt="GreenFood Logo"
                className="w-9 h-9 object-contain shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-xs"
              />
              {!isSidebarCollapsed && (
                <div className="flex flex-col justify-center min-w-0 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="font-pacifico font-bold text-xl text-emerald-600 leading-none group-hover:text-emerald-700 transition-colors">
                      GreenFood
                    </span>
                    <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[9px] font-bold tracking-[0.16em] text-emerald-700 uppercase whitespace-nowrap mt-1 leading-none">
                    Nông sản sạch từ tâm
                  </span>
                </div>
              )}
            </Link>

            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto overflow-x-hidden no-scrollbar">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {group.title}
                  </p>
                )}
                {group.items.map((item) => {
                  const isActive = normalizePath(pathname) === normalizePath(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      title={item.name}
                      className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'} rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-600 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon 
                          size={19} 
                          className={`transition-colors shrink-0 ${
                            isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'
                          }`} 
                        />
                        {!isSidebarCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>

                      {!isSidebarCollapsed && item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                          isActive 
                            ? 'bg-emerald-600 text-white' 
                            : (item as any).highlight 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom Quick Actions */}
          <div className="p-3 border-t border-slate-200/90 bg-slate-50/70 space-y-2">
            {!isSidebarCollapsed ? (
              <div className="grid grid-cols-2 gap-2">
                <Link 
                  href="/farmers"
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all"
                  title="Mở Chợ Gian Hàng Nông Hộ"
                >
                  <Store size={14} className="text-emerald-600" />
                  <span>Chợ Nông Hộ</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all"
                  title="Đăng xuất quản trị"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link 
                  href="/farmers" 
                  target="_blank"
                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all" 
                  title="Chợ Nông Hộ"
                >
                  <Store size={18} />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Adminator Header Bar */}
          <header className="h-16 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-xs">
            {/* Left: Hamburger & Search Box */}
            <div className="flex items-center gap-3 md:gap-5 flex-1 max-w-xl">
              {/* Desktop toggle sidebar collapse */}
              <button
                onClick={() => setIsSidebarCollapsed(prev => !prev)}
                className="hidden md:flex p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title={isSidebarCollapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
              >
                <Menu size={20} />
              </button>

              {/* Mobile trigger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
                aria-label="Mở menu quản trị"
              >
                <Menu size={20} />
              </button>

              {/* Working Search Bar */}
              <div ref={searchContainerRef} className="relative flex-1 max-w-md">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Tìm nhanh nông sản, đơn hàng, nông hộ..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Instant Search Dropdown */}
                {isSearchFocused && searchQuery.trim() && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                    <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Kết quả tìm kiếm ({searchResults.length})
                    </div>
                    {searchResults.length > 0 ? (
                      searchResults.map(prod => (
                        <Link
                          key={prod.id}
                          href={`/admin/products/?search=${encodeURIComponent(prod.name)}`}
                          onClick={() => {
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img 
                              src={(prod.images && prod.images[0]) || '/products/dau-tay.jpg'} 
                              alt={prod.name} 
                              className="w-8 h-8 rounded-lg object-cover" 
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-600">{prod.name}</p>
                              <p className="text-[11px] text-slate-400">
                                {prod.variants?.[0]?.price ? `${prod.variants[0].price.toLocaleString('vi-VN')}đ / ${prod.variants[0].unit}` : prod.categoryName}
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-slate-400 group-hover:text-emerald-600" />
                        </Link>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-500">
                        Không tìm thấy kết quả phù hợp.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Notifications, Chat, External Links & User Profile */}
            <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
              {/* Server live indicator */}
              <div className="hidden xl:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px]">Máy chủ: Hoạt động</span>
              </div>

              {/* Interactive Notification Center (Bell with badge) */}
              <AdminNotificationCenter />

              {/* Chat Icon with real live link */}
              <Link
                href="/admin/chat/"
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Mở Live Chat & Tin nhắn khách hàng"
              >
                <MessageCircle size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </Link>

              {/* Quick links to Customer views */}
              <div className="hidden lg:flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <Link
                  href="/farmers"
                  target="_blank"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors"
                  title="Mở danh sách Gian Hàng Nông Hộ"
                >
                  <Store size={13} className="text-emerald-600" />
                  <span>Chợ Nông Hộ</span>
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Mở Trang Chủ website"
                >
                  <ExternalLink size={13} />
                  <span>Trang Chủ</span>
                </Link>
              </div>

              {/* User Profile Avatar with Dropdown */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {(() => {
                      const cleaned = cleanVietnameseMojibake(user?.name);
                      return (cleaned ? cleaned.charAt(0).toUpperCase() : 'Q');
                    })()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {(() => {
                        const raw = user?.name || '';
                        const cleaned = cleanVietnameseMojibake(raw);
                        if (user?.role?.toLowerCase() === 'admin' || /qu[aả|§]+n/i.test(cleaned) || /greenfood/i.test(cleaned) || /admin/i.test(cleaned)) {
                          return 'Quản trị viên GreenFood';
                        }
                        return cleaned || 'Quản trị viên GreenFood';
                      })()}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Trưởng ban quản trị</span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 divide-y divide-slate-100">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-bold text-slate-900">Quản trị viên GreenFood</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@greenfood.vn'}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        target="_blank"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                      >
                        <User size={15} />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                      <Link
                        href="/farmer"
                        target="_blank"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                      >
                        <Tractor size={15} />
                        <span>Kênh Nhà Vườn / Nông Hộ</span>
                      </Link>
                      <Link
                        href="/map"
                        target="_blank"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                      >
                        <MapPin size={15} />
                        <span>Bản đồ nông hộ (Khách hàng)</span>
                      </Link>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut size={15} />
                        <span>Đăng xuất hệ thống</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f9fa]">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}

