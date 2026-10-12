import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'all' | 'order' | 'promotion' | 'payment' | 'system';

export interface NotificationItem {
  id: string;
  type: 'order' | 'promotion' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: string; // ISO string or human formatted date
  isRead: boolean;
  link?: string;
  image?: string;
  tag?: string;
  orderCode?: string;
  amount?: number;
  userId?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'order',
    title: 'Giao hàng thành công: Đơn #GF-883921',
    message: 'Kiện hàng 2kg Bưởi da xanh Bến Tre & 1kg Dâu tây Đà Lạt đã được giao đến bạn. Hãy chia sẻ đánh giá để nhận 50 xu nhé!',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    isRead: false,
    link: '/tracking?order=GF-883921',
    orderCode: 'GF-883921',
    tag: 'Giao thành công',
  },
  {
    id: 'notif-2',
    type: 'promotion',
    title: 'VOUCHER KHỦNG 30K ĐÃ VÀO VÍ 🎁',
    message: 'Mã GREEN30 giảm 30.000đ cho đơn nông sản từ 200.000đ đã sẵn sàng. Áp dụng cho mọi loại trái cây & rau củ hữu cơ.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    link: '/products',
    tag: 'Voucher HOT',
  },
  {
    id: 'notif-3',
    type: 'order',
    title: 'Đang vận chuyển: Đơn hàng #GF-720194',
    message: 'Tài xế GHN đang giao rau củ quả chuẩn VietGAP từ nông hộ Bến Tre đến địa chỉ của bạn. Dự kiến giao hôm nay.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    link: '/tracking?order=GF-720194',
    orderCode: 'GF-720194',
    tag: 'Đang vận chuyển',
  },
  {
    id: 'notif-4',
    type: 'payment',
    title: 'Thanh toán thẻ ATM Napas thành công',
    message: 'Giao dịch thanh toán 185.000đ cho đơn hàng #GF-662910 đã được ngân hàng xác nhận thành công.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/tracking?order=GF-662910',
    orderCode: 'GF-662910',
    tag: 'Thẻ ATM Napas',
  },
  {
    id: 'notif-5',
    type: 'promotion',
    title: 'Flash Sale 12:00: Nông sản giảm sốc 35%',
    message: 'Sầu riêng Ri6 Tây Nguyên & Dưa lưới chuẩn VietGAP ưu đãi cực lớn. Số lượng có hạn trong ngày!',
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/products',
    tag: 'Flash Sale',
  },
  {
    id: 'notif-6',
    type: 'system',
    title: 'Chào mừng bạn đến với GreenFood Market! 🌱',
    message: 'Tặng ngay 100 Điểm VIP cho tài khoản mới. Chúc bạn có trải nghiệm mua sắm nông sản sạch tươi ngon!',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/profile',
    tag: 'Hệ thống',
  },
];

interface NotificationState {
  notifications: NotificationItem[];
  soundEnabled: boolean;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'> & { timestamp?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  toggleSound: () => void;
  resetDefaultNotifications: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      soundEnabled: true,

      addNotification: (item) => {
        const newItem: NotificationItem = {
          ...item,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: item.timestamp || new Date().toISOString(),
          isRead: false,
        };

        set((state) => ({
          notifications: [newItem, ...state.notifications],
        }));

        // Play chime if sound is enabled
        if (get().soundEnabled) {
          playNotificationChime();
        }
      },

      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      deleteNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      resetDefaultNotifications: () => {
        set({ notifications: DEFAULT_NOTIFICATIONS });
      },

      unreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },
    }),
    {
      name: 'gf_customer_notifications_storage',
    }
  )
);

/**
 * Âm thanh báo thông báo hiện đại dùng Web Audio API
 */
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Âm bổng mượt mà kiểu Shopee (E5 -> A5)
    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}
