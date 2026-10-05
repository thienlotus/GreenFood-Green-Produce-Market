"use client";

import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
  MessageCircle, 
  Settings, 
  LogOut, 
  ExternalLink,
  Search,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';

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
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi trang quản trị');
  };

  const navGroups: NavGroup[] = [
    {
      title: 'TỔNG QUAN',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      title: 'QUẢN LÝ KINH DOANH',
      items: [
        { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingBag, badge: 'Mới' },
        { name: 'Sản phẩm', href: '/admin/products', icon: Package },
        { name: 'Nông hộ & Vườn', href: '/admin/farmers', icon: Tractor },
        { name: 'Phí giao hàng GHN', href: '/admin/shipping', icon: Truck },
      ],
    },
    {
      title: 'CHĂM SÓC & HỖ TRỢ',
      items: [
        { name: 'Live Chat & AI Bot', href: '/admin/chat', icon: MessageCircle, badge: 'AI Flash', highlight: true },
        { name: 'Khách hàng & User', href: '/admin/customers', icon: Users },
      ],
    },
    {
      title: 'CẤU HÌNH HỆ THỐNG',
      items: [
        { name: 'Cài đặt chung', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Bảng điều khiển Tổng quan';
    if (pathname.startsWith('/admin/orders')) return 'Quản lý Đơn hàng';
    if (pathname.startsWith('/admin/products')) return 'Quản lý Sản phẩm';
    if (pathname.startsWith('/admin/chat')) return 'Live Chat & Trợ lý AI';
    if (pathname.startsWith('/admin/customers')) return 'Người dùng & Phân quyền';
    if (pathname.startsWith('/admin/farmers')) return 'Nông hộ & Vùng trồng';
    if (pathname.startsWith('/admin/shipping')) return 'Cước phí vận chuyển GHN';
    if (pathname.startsWith('/admin/settings')) return 'Cài đặt hệ thống';
    return 'Quản trị hệ thống';
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}

        {/* Professional Sidebar */}
        <aside className={`
          fixed md:sticky top-0 h-screen w-72 bg-slate-900 text-slate-300 z-50 flex flex-col 
          transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl md:shadow-none
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <BrandLogo variant="dark" size="sm" href="/admin" showTagline={true} />
              <span className="text-[9px] font-extrabold tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase shrink-0">
                ADMIN
              </span>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-5 px-3.5 space-y-6 overflow-y-auto no-scrollbar">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-900/40'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon 
                          size={18} 
                          className={`transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                          }`} 
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : (item as any).highlight 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-slate-800 text-slate-400'
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

          {/* Admin User Mini Card & Actions */}
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow">
                {cleanVietnameseMojibake(user?.name) ? cleanVietnameseMojibake(user?.name).charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{cleanVietnameseMojibake(user?.name) || 'Lê Vũ Thiên'}</p>
                <p className="text-[11px] text-emerald-400 truncate">Quản trị viên trưởng</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link 
                href="/"
                target="_blank"
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Mở website giao diện khách hàng"
              >
                <ExternalLink size={14} className="text-amber-400" />
                <span>Xem Store</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/30 transition-colors"
              >
                <LogOut size={14} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Enterprise Header */}
          <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-xs">
            {/* Left: Mobile trigger & Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
                aria-label="Mở menu quản trị"
              >
                <Menu size={20} />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Trang quản trị</span>
                <ChevronRight size={14} />
                <span className="text-slate-800 font-semibold">{getPageTitle()}</span>
              </div>
            </div>

            {/* Right: Quick search, status & actions */}
            <div className="flex items-center gap-3">
              {/* Server live indicator */}
              <div className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Hệ thống: Sẵn sàng</span>
              </div>

              {/* Notification icon & interactive center */}
              <AdminNotificationCenter />

              {/* Quick Store link */}
              <Link
                href="/"
                target="_blank"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ExternalLink size={14} />
                <span>Xem Cửa Hàng</span>
              </Link>

              {/* Profile Avatar */}
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {cleanVietnameseMojibake(user?.name) ? cleanVietnameseMojibake(user?.name).charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </header>

          {/* Page Content Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/70">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
