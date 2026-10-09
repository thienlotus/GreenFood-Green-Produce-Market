"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  CheckCheck, 
  Truck, 
  Gift, 
  CreditCard, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  X, 
  Volume2, 
  VolumeX, 
  Trash2,
  PackageCheck,
  ShieldCheck,
  ExternalLink,
  User
} from 'lucide-react';
import { useNotificationStore, NotificationItem, NotificationType } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';

export function formatNotificationTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) {
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `Hôm nay ${hours}:${mins}`;
    }
    if (diffDay === 1) {
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `Hôm qua ${hours}:${mins}`;
    }
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationType>('all');
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useAuthStore();
  const isUserLoggedIn = Boolean(mounted && isAuthenticated && user);

  const { 
    notifications, 
    soundEnabled, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    toggleSound,
    addNotification 
  } = useNotificationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Chỉ tính số thông báo chưa đọc khi người dùng ĐÃ ĐĂNG NHẬP
  const myNotifications = isUserLoggedIn 
    ? notifications.filter(item => !item.userId || item.userId === String(user?.id))
    : [];

  const unreadCount = isUserLoggedIn ? myNotifications.filter(n => !n.isRead).length : 0;

  // Lọc thông báo theo tab (chỉ áp dụng khi đã đăng nhập)
  const filteredNotifications = myNotifications.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'order') return item.type === 'order';
    if (activeTab === 'promotion') return item.type === 'promotion';
    if (activeTab === 'payment') return item.type === 'payment' || item.type === 'system';
    return item.type === activeTab;
  });

  const handleItemClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
    toast.success('Đã đánh dấu đọc tất cả thông báo!');
  };

  const getItemIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <Truck size={19} />
          </div>
        );
      case 'promotion':
        return (
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <Gift size={19} />
          </div>
        );
      case 'payment':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
            <CreditCard size={19} />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={19} />
          </div>
        );
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Chuông Thông Báo Trigger */}
      <button 
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative p-2.5 rounded-full transition-all cursor-pointer border shrink-0 group ${
          isOpen 
            ? 'bg-emerald-100/80 text-emerald-800 border-emerald-400 ring-4 ring-emerald-500/10' 
            : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200/80 hover:border-emerald-300'
        }`}
        aria-label="Thông báo"
        title={isUserLoggedIn ? 'Thông báo của bạn' : 'Đăng nhập để xem thông báo'}
      >
        <Bell 
          size={19} 
          className={`transition-transform duration-300 ${
            unreadCount > 0 ? 'text-emerald-700 group-hover:rotate-12' : 'text-slate-600 group-hover:scale-110'
          }`} 
        />
        
        {/* Unread Badge số đếm kiểu Shopee - CHỈ HIỆN KHI ĐÃ ĐĂNG NHẬP */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold text-[10px] leading-tight min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Kiểu Shopee */}
      {isOpen && (
        <div 
          className="absolute right-0 sm:-right-2 top-full mt-2.5 w-[360px] sm:w-[420px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.25)' }}
        >
          {/* Caret mũi tên nhọn trỏ lên icon chuông */}
          <div className="absolute -top-2 right-4 sm:right-6 w-3.5 h-3.5 bg-white border-t border-l border-slate-200 transform rotate-45 z-10" />

          {/* TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP -> ẨN HẾT THÔNG TIN NHẠY CẢM, YÊU CẦU ĐĂNG NHẬP */}
          {!isUserLoggedIn ? (
            <div className="relative z-20 bg-white p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
                <ShieldCheck size={34} className="text-emerald-600" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Đăng nhập để xem thông báo
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Thông tin lộ trình đơn hàng, tình trạng giao nhận và các voucher cá nhân được bảo mật riêng cho tài khoản của bạn.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1 max-w-xs mx-auto">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <User size={15} />
                  <span>Đăng nhập ngay</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all text-center"
                >
                  Chưa có tài khoản? Đăng ký
                </Link>
              </div>
            </div>
          ) : (
            /* TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP -> HIỂN THỊ ĐẦY ĐỦ THÔNG BÁO CỦA BẢN THÂN */
            <>
              {/* Header Thông Báo */}
              <div className="relative z-20 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Thông Báo Của Bạn
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} chưa đọc
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Nút bật/tắt âm thanh */}
                  <button
                    type="button"
                    onClick={toggleSound}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title={soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-slate-400" />}
                  </button>

                  {/* Nút Đọc tất cả */}
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      title="Đánh dấu tất cả là đã đọc"
                    >
                      <CheckCheck size={14} />
                      <span className="hidden sm:inline">Đã đọc tất cả</span>
                    </button>
                  )}
                </div>
              </div>

          {/* Category Tabs kiểu Shopee */}
          <div className="grid grid-cols-4 bg-slate-50/80 border-b border-slate-200/80 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold border border-slate-200/60'
                  : 'hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('order')}
              className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === 'order'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold border border-slate-200/60'
                  : 'hover:text-slate-900'
              }`}
            >
              Đơn hàng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('promotion')}
              className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === 'promotion'
                  ? 'bg-white text-rose-600 shadow-xs font-bold border border-slate-200/60'
                  : 'hover:text-slate-900'
              }`}
            >
              Ưu đãi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payment')}
              className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === 'payment'
                  ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200/60'
                  : 'hover:text-slate-900'
              }`}
            >
              Ví & Khác
            </button>
          </div>

          {/* List Danh Sách Thông Báo */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center text-slate-500 space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Bell size={24} className="text-emerald-500/70" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Chưa có thông báo nào</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Mọi cập nhật tình trạng đơn hàng, vận chuyển và voucher sốc sẽ hiển thị ngay tại đây.
                  </p>
                </div>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isUnread = !item.isRead;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`relative p-3.5 transition-all cursor-pointer group flex items-start gap-3 ${
                      isUnread 
                        ? 'bg-emerald-50/35 hover:bg-emerald-50/70 border-l-4 border-l-emerald-600' 
                        : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Icon danh mục */}
                    {getItemIcon(item.type)}

                    {/* Nội dung thông báo */}
                    <div className="flex-1 min-w-0 pr-5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h4 className={`text-xs sm:text-[13px] leading-snug line-clamp-1 ${
                          isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                        }`}>
                          {item.title}
                        </h4>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={11} className="text-slate-400" />
                          {formatNotificationTime(item.timestamp)}
                        </span>

                        {item.tag && (
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            item.type === 'promotion'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                              : item.type === 'order'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          }`}>
                            {item.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nút xóa nhanh thông báo trên hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                        toast.success('Đã xóa thông báo!');
                      }}
                      className="absolute top-3.5 right-3 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                      title="Xóa thông báo này"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Popover kiểu Shopee */}
          <div className="bg-slate-50 border-t border-slate-100 p-2.5 flex items-center justify-between text-xs">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2 text-emerald-700 hover:text-emerald-800 font-bold hover:bg-emerald-100/60 rounded-xl transition-all flex items-center justify-center gap-1 group"
            >
              <span>Xem tất cả thông báo</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </>
      )}
    </div>
  )}
</div>
  );
}
