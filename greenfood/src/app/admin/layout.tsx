"use client";

import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Tractor,
  Truck,
  Settings,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi trang quản trị');
  };

  const navItems = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Khách hàng', href: '/admin/customers', icon: Users },
    { name: 'Nông hộ', href: '/admin/farmers', icon: Tractor },
    { name: 'Phí giao hàng', href: '/admin/shipping', icon: Truck },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex sticky top-0 h-screen">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <span className="text-2xl font-bold text-emerald-700 font-[family-name:var(--font-pacifico)] tracking-tight">GreenFood Admin</span>
          </div>
          
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link 
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors w-full"
            >
              <ArrowLeft size={18} />
              Về trang khách
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors w-full"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Admin Header (Mobile / Top) */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-800 hidden md:block">Quản trị hệ thống</h1>
              <span className="text-xl font-bold text-emerald-700 md:hidden font-[family-name:var(--font-pacifico)]">GreenFood Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                A
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8 flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
