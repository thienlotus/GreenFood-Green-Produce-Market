"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  ShoppingBag, 
  MessageSquare, 
  AlertTriangle, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Clock, 
  CheckCircle2,
  Bot,
  Tractor
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAdminOrders, AdminOrder, getAdminFarmersApi } from '@/lib/api';
import { getChatConversations, ChatConversation } from '@/lib/chatApi';
import { cleanVietnameseMojibake } from '@/data/vietnamAddress';

export interface AdminNotification {
  id: string;
  type: 'order' | 'chat' | 'stock' | 'farmer';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link: string;
  badge?: string;
}

export default function AdminNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'order' | 'farmer' | 'chat' | 'stock'>('all');
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Web Audio chime for new notifications
  const playNotificationSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, []);

  const fetchLiveNotifications = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const readIds = new Set<string>();
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('gf_admin_read_notifs');
          if (stored) {
            JSON.parse(stored).forEach((id: string) => readIds.add(id));
          }
        } catch {}
      }

      const notifList: AdminNotification[] = [];

      // 1. Fetch Orders (Pending or recent orders)
      try {
        const orders = await getAdminOrders();
        if (Array.isArray(orders)) {
          orders.slice(0, 10).forEach((ord: AdminOrder) => {
            const customerName = cleanVietnameseMojibake(ord.customer || 'Khách hàng');
            const isPending = ord.status === 'pending';
            notifList.push({
              id: `ord-${ord.id}`,
              type: 'order',
              title: isPending ? `Đơn hàng mới chờ duyệt #${ord.id.slice(0, 8)}` : `Đơn hàng #${ord.id.slice(0, 8)}`,
              description: `${customerName} vừa đặt đơn trị giá ${ord.total}`,
              timestamp: ord.date || 'Vừa xong',
              isRead: readIds.has(`ord-${ord.id}`),
              link: '/admin/orders/',
              badge: isPending ? 'Chờ duyệt' : ord.status,
            });
          });
        }
      } catch (err) {
        console.warn('Orders notification fetch error:', err);
      }

      // 2. Fetch Chat / AI Support Conversations
      try {
        const convs = await getChatConversations();
        if (Array.isArray(convs)) {
          convs.slice(0, 10).forEach((c: ChatConversation) => {
            const custName = cleanVietnameseMojibake(c.customer?.name || 'Khách hàng');
            const lastMsg = cleanVietnameseMojibake(c.last_message?.message || 'Yêu cầu hỗ trợ trực tuyến');
            const hasUnread = (c.unread_count || 0) > 0 || c.status === 'open';
            notifList.push({
              id: `chat-${c.id}`,
              type: 'chat',
              title: hasUnread ? `Tin nhắn AI & Live Chat mới` : `Hội thoại #${c.id.slice(0, 8)}`,
              description: `${custName}: "${lastMsg.length > 50 ? lastMsg.slice(0, 50) + '...' : lastMsg}"`,
              timestamp: c.updated_at ? new Date(c.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
              isRead: !hasUnread || readIds.has(`chat-${c.id}`),
              link: '/admin/chat/',
              badge: c.status === 'open' ? 'Chưa nhận' : 'Live Chat',
            });
          });
        }
      } catch (err) {
        console.warn('Chat notification fetch error:', err);
      }

      // 3. Inventory Stock Alerts
      notifList.push({
        id: 'stock-dau-tay',
        type: 'stock',
        title: 'Cảnh báo tồn kho Dâu Tây Đà Lạt',
        description: 'Tồn kho hiện tại chỉ còn 5 hộp (Dưới mức an toàn 10)',
        timestamp: 'Hôm nay',
        isRead: readIds.has('stock-dau-tay'),
        link: '/admin/products/',
        badge: 'Tồn kho thấp',
      });

      // 4. Fetch Farmer Storefronts pending verification / update approval
      try {
        const farmers = await getAdminFarmersApi();
        if (Array.isArray(farmers)) {
          // Lọc các nông hộ chưa duyệt hoặc đang chờ duyệt thay đổi
          farmers.filter(f => !f.is_verified).forEach((f: any) => {
            const fName = cleanVietnameseMojibake(f.farm_name || f.name || 'Gian hàng nông hộ');
            const fAddr = cleanVietnameseMojibake(f.address || 'Việt Nam');
            notifList.push({
              id: `farmer-${f.id}`,
              type: 'farmer',
              title: `Yêu cầu duyệt gian hàng: ${fName}`,
              description: `Nông hộ "${fName}" (${fAddr}) đã cập nhật thông tin và đang chờ phê duyệt kích hoạt.`,
              timestamp: 'Chờ duyệt',
              isRead: readIds.has(`farmer-${f.id}`),
              link: '/admin/farmers/',
              badge: 'Chờ duyệt',
            });
          });
        }
      } catch (err) {
        console.warn('Farmers notification fetch error:', err);
      }

      // Calculate unread count
      const unread = notifList.filter(n => !n.isRead).length;
      if (isPolling && unread > unreadCount) {
        playNotificationSound();
      }
      setNotifications(notifList);
      setUnreadCount(unread);
    } finally {
      setLoading(false);
    }
  }, [unreadCount, playNotificationSound]);

  useEffect(() => {
    fetchLiveNotifications();
    const timer = setInterval(() => fetchLiveNotifications(true), 15000);
    return () => clearInterval(timer);
  }, [fetchLiveNotifications]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    try {
      localStorage.setItem('gf_admin_read_notifs', JSON.stringify(allIds));
    } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markAsRead = (id: string, link: string) => {
    try {
      const stored = localStorage.getItem('gf_admin_read_notifs');
      const list = stored ? JSON.parse(stored) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('gf_admin_read_notifs', JSON.stringify(list));
      }
    } catch {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    setIsOpen(false);
    router.push(link);
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all ${
          isOpen ? 'bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Thông báo hệ thống GreenFood"
        aria-label="Thông báo"
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Bell size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Thông Báo Hệ Thống
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-400">Đơn hàng, Live Chat & Trợ lý AI</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => fetchLiveNotifications()}
                disabled={loading}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
                title="Làm mới thông báo"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors"
                  title="Đánh dấu tất cả đã đọc"
                >
                  Đọc hết
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200/80 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                activeTab === 'all' 
                  ? 'bg-white text-emerald-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('order')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                activeTab === 'order' 
                  ? 'bg-white text-emerald-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Đơn hàng
            </button>
            <button
              onClick={() => setActiveTab('farmer')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                activeTab === 'farmer' 
                  ? 'bg-white text-emerald-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Nông hộ
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                activeTab === 'chat' 
                  ? 'bg-white text-emerald-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              AI & Chat
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                activeTab === 'stock' 
                  ? 'bg-white text-emerald-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Kho hàng
            </button>
          </div>

          {/* List items */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500/60 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Không có thông báo mới!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tất cả hoạt động hệ thống đang vận hành ổn định.</p>
              </div>
            ) : (
              filteredNotifs.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => markAsRead(item.id, item.link)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer group ${
                    !item.isRead ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm shadow-xs ${
                    item.type === 'order' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : item.type === 'farmer'
                        ? 'bg-purple-100 text-purple-700'
                        : item.type === 'chat'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.type === 'order' && <ShoppingBag size={18} />}
                    {item.type === 'farmer' && <Tractor size={18} />}
                    {item.type === 'chat' && <Bot size={18} />}
                    {item.type === 'stock' && <AlertTriangle size={18} />}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs truncate ${!item.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {item.timestamp}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[9px] group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Quick Links */}
          <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold">
            <Link 
              href="/admin/orders" 
              onClick={() => setIsOpen(false)}
              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Xem Đơn Hàng</span>
              <ExternalLink size={12} />
            </Link>
            <Link 
              href="/admin/chat" 
              onClick={() => setIsOpen(false)}
              className="text-sky-700 hover:text-sky-800 flex items-center gap-1"
            >
              <span>Hỗ Trợ Live Chat</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
