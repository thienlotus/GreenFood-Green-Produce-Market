"use client";

import { useState, useEffect } from 'react';
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
  Trash2, 
  ArrowLeft,
  Volume2, 
  VolumeX, 
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  ShoppingBag,
  PlusCircle
} from 'lucide-react';
import { useNotificationStore, NotificationItem, NotificationType } from '@/store/useNotificationStore';
import { formatNotificationTime } from '@/components/NotificationDropdown';
import { toast } from 'react-hot-toast';

export default function NotificationsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationType>('all');

  const {
    notifications,
    soundEnabled,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    toggleSound,
    resetDefaultNotifications,
    addNotification
  } = useNotificationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'order') return item.type === 'order';
    if (activeCategory === 'promotion') return item.type === 'promotion';
    if (activeCategory === 'payment') return item.type === 'payment' || item.type === 'system';
    return item.type === activeCategory;
  });

  const orderNotifsCount = notifications.filter(n => n.type === 'order' && !n.isRead).length;
  const promoNotifsCount = notifications.filter(n => n.type === 'promotion' && !n.isRead).length;
  const paymentNotifsCount = notifications.filter(n => (n.type === 'payment' || n.type === 'system') && !n.isRead).length;

  const handleTestNotification = () => {
    const randomOrder = 'GF-' + Math.floor(100000 + Math.random() * 900000);
    addNotification({
      title: `Đơn hàng #${randomOrder} vừa được đóng gói!`,
      message: `Hợp tác xã nông sản sạch đã chuẩn bị xong các kiện hàng tươi ngon của bạn. Đang bàn giao cho shipper.`,
      type: 'order',
      link: `/tracking?order=${randomOrder}`,
      orderCode: randomOrder,
      tag: 'Cập nhật kho',
    });
    toast.success('Đã nhận thông báo mới kiểu Shopee! 🔔');
  };

  const getItemIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <Truck size={24} />
          </div>
        );
      case 'promotion':
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <Gift size={24} />
          </div>
        );
      case 'payment':
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
            <CreditCard size={24} />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={24} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-xs"
            >
              <ArrowLeft size={14} /> Trang chủ
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800">Thông báo của tôi</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestNotification}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-all shadow-xs cursor-pointer"
              title="Tạo giả lập một thông báo mới để kiểm tra"
            >
              <PlusCircle size={14} />
              <span>Nhận thông báo thử nghiệm</span>
            </button>
            <button
              type="button"
              onClick={toggleSound}
              className="p-2 text-slate-600 hover:text-emerald-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-xs"
              title={soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Layout Grid: Cột Sidebar Danh Mục + Khung Danh Sách Thông Báo Kiểu Shopee */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI: DANH MỤC THÔNG BÁO KIỂU SHOPEE */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Trung Tâm Thông Báo</h2>
                  <p className="text-xs text-slate-500">Tin tức & cập nhật thời gian thực</p>
                </div>
              </div>

              {/* Sidebar Menu Items */}
              <nav className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bell size={18} className={activeCategory === 'all' ? 'text-white' : 'text-slate-500'} />
                    <span>Tất cả thông báo</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('order')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeCategory === 'order'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Truck size={18} className={activeCategory === 'order' ? 'text-white' : 'text-emerald-600'} />
                    <span>Cập nhật đơn hàng</span>
                  </div>
                  {orderNotifsCount > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeCategory === 'order' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {orderNotifsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('promotion')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeCategory === 'promotion'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Gift size={18} className={activeCategory === 'promotion' ? 'text-white' : 'text-rose-500'} />
                    <span>Khuyến mãi & Voucher</span>
                  </div>
                  {promoNotifsCount > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeCategory === 'promotion' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {promoNotifsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('payment')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeCategory === 'payment'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard size={18} className={activeCategory === 'payment' ? 'text-white' : 'text-blue-600'} />
                    <span>Ví & Cập nhật khác</span>
                  </div>
                  {paymentNotifsCount > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeCategory === 'payment' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {paymentNotifsCount}
                    </span>
                  )}
                </button>
              </nav>

              {/* Phím tắt tiện ích */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    markAllAsRead();
                    toast.success('Đã đánh dấu đã đọc tất cả!');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100/70 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                >
                  <CheckCheck size={15} />
                  <span>Đánh dấu Đã đọc tất cả</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetDefaultNotifications();
                    toast.success('Đã khôi phục các thông báo chuẩn!');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-transparent hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Khôi phục thông báo mặc định</span>
                </button>
              </div>
            </div>

            {/* Quick Links Banner */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-sm space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                GreenFood Market
              </span>
              <h3 className="text-sm font-bold leading-snug">
                Nông sản tươi ngon giao nhanh 2 giờ
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Theo dõi tình trạng đơn hàng hoặc khám phá thêm đặc sản từ hơn 500 nhà vườn VietGAP.
              </p>
              <div className="pt-1 flex gap-2">
                <Link
                  href="/tracking"
                  className="inline-flex items-center gap-1 bg-white text-emerald-700 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs hover:bg-emerald-50 transition-all"
                >
                  <span>Tra cứu đơn</span>
                  <ChevronRight size={14} />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all"
                >
                  <span>Đi chợ ngay</span>
                </Link>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: KHUNG DANH SÁCH THÔNG BÁO CHI TIẾT */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
              
              {/* Header List */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {activeCategory === 'all' && 'Tất cả thông báo'}
                    {activeCategory === 'order' && 'Cập nhật tình trạng đơn hàng'}
                    {activeCategory === 'promotion' && 'Khuyến mãi & Mã giảm giá'}
                    {activeCategory === 'payment' && 'Ví & Thông báo hệ thống'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hiển thị {filteredNotifications.length} thông báo
                  </p>
                </div>

                {filteredNotifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa tất cả thông báo hiện tại?')) {
                        clearAll();
                        toast.success('Đã xóa toàn bộ thông báo!');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Dọn sạch thông báo</span>
                  </button>
                )}
              </div>

              {/* Danh sách items */}
              {filteredNotifications.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-3">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Bell size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800">Không có thông báo nào</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Bạn đã xem hết các thông báo hoặc chưa có thông báo mới trong danh mục này.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((item) => {
                    const isUnread = !item.isRead;
                    return (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start gap-4 group ${
                          isUnread
                            ? 'bg-emerald-50/40 border-emerald-200/90 shadow-xs'
                            : 'bg-white hover:bg-slate-50/80 border-slate-200/70'
                        }`}
                      >
                        {/* Icon */}
                        {getItemIcon(item.type)}

                        {/* Chi tiết nội dung */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm sm:text-base ${
                                isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'
                              }`}>
                                {item.title}
                              </h4>
                              {isUnread && (
                                <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                                  MỚI
                                </span>
                              )}
                            </div>

                            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                              <Clock size={12} />
                              {formatNotificationTime(item.timestamp)}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                            {item.message}
                          </p>

                          {/* Action Bar dưới mỗi item */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              {item.tag && (
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${
                                  item.type === 'promotion'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                                    : item.type === 'order'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {item.tag}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Nút Xem Chi Tiết / Đến trang */}
                              {item.link && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    markAsRead(item.id);
                                    router.push(item.link!);
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                  <span>
                                    {item.type === 'order' ? 'Xem đơn hàng' : item.type === 'promotion' ? 'Dùng ngay' : 'Chi tiết'}
                                  </span>
                                  <ExternalLink size={12} />
                                </button>
                              )}

                              {/* Đánh dấu đã đọc */}
                              {isUnread && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    markAsRead(item.id);
                                    toast.success('Đã đánh dấu đã đọc');
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title="Đánh dấu đã đọc"
                                >
                                  <CheckCheck size={16} />
                                </button>
                              )}

                              {/* Xóa */}
                              <button
                                type="button"
                                onClick={() => {
                                  deleteNotification(item.id);
                                  toast.success('Đã xóa thông báo');
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Xóa thông báo này"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
