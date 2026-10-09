// Chat API Client — GreenFood Live Chat (Shopee Multi-Vendor Logic)
import { getApiBaseUrl } from '@/lib/api';

// ── Helper fetch for chat ──
async function chatFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Types ──
export type ChatConversationType = 'customer_admin' | 'customer_farmer' | 'farmer_admin';

export interface ChatFarmerInfo {
  id: string;
  farm_name: string;
  address?: string;
  image_url?: string;
  rating?: number;
  user?: {
    id: string;
    name: string;
    phone?: string;
  } | null;
}

export interface ChatProductInfo {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
}

export interface ChatConversation {
  id: string;
  type: ChatConversationType;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  } | null;
  farmer?: ChatFarmerInfo | null;
  product?: ChatProductInfo | null;
  admin?: {
    id: string;
    name: string;
  } | null;
  subject: string;
  status: 'open' | 'assigned' | 'resolved' | 'closed';
  unread_count: number;
  last_message: {
    message: string;
    sender_role: 'customer' | 'admin' | 'farmer' | string;
    created_at: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageItem {
  id: string;
  sender_id?: string;
  sender_role: 'customer' | 'admin' | 'farmer';
  sender_name?: string;
  message: string;
  message_type: 'text' | 'image' | 'system';
  is_read: boolean;
  created_at: string;
  created_at_iso?: string;
}

export interface ConversationDetail {
  conversation: {
    id: string;
    type: ChatConversationType;
    customer?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    } | null;
    farmer?: ChatFarmerInfo | null;
    product?: ChatProductInfo | null;
    admin?: {
      id: string;
      name: string;
    } | null;
    subject?: string;
    status: string;
    admin_name?: string | null;
  };
  messages: ChatMessageItem[];
}

/**
 * Định dạng thời gian chat chuẩn theo múi giờ Việt Nam (UTC+7 / Asia/Ho_Chi_Minh)
 * Tự động chuyển đổi các timestamp UTC cũ về đúng giờ thực tế
 */
export function formatChatTime(msgOrTime: { created_at?: string; created_at_iso?: string } | string | undefined | null): string {
  if (!msgOrTime) return '';

  let iso: string | undefined;
  let fallbackStr: string | undefined;

  if (typeof msgOrTime === 'string') {
    fallbackStr = msgOrTime;
  } else {
    iso = msgOrTime.created_at_iso;
    fallbackStr = msgOrTime.created_at;
  }

  // 1. Nếu có created_at_iso chuẩn: parse và chuyển sang giờ Việt Nam
  if (iso) {
    try {
      const d = new Date(iso);
      if (!isNaN(d.getTime())) {
        const formatter = new Intl.DateTimeFormat('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          hour12: false,
        });
        const parts = formatter.formatToParts(d);
        const hour = parts.find(p => p.type === 'hour')?.value || '00';
        const minute = parts.find(p => p.type === 'minute')?.value || '00';
        const day = parts.find(p => p.type === 'day')?.value || '01';
        const month = parts.find(p => p.type === 'month')?.value || '01';
        return `${hour}:${minute} ${day}/${month}`;
      }
    } catch {
      // Fallback bên dưới
    }
  }

  // 2. Nếu fallbackStr có dạng ngày giờ
  if (fallbackStr) {
    if (fallbackStr.includes('T') || (fallbackStr.includes('-') && fallbackStr.length > 10)) {
      try {
        const d = new Date(fallbackStr);
        if (!isNaN(d.getTime())) {
          const formatter = new Intl.DateTimeFormat('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            hour12: false,
          });
          const parts = formatter.formatToParts(d);
          const hour = parts.find(p => p.type === 'hour')?.value || '00';
          const minute = parts.find(p => p.type === 'minute')?.value || '00';
          const day = parts.find(p => p.type === 'day')?.value || '01';
          const month = parts.find(p => p.type === 'month')?.value || '01';
          return `${hour}:${minute} ${day}/${month}`;
        }
      } catch {
        // Fallback
      }
    }

    const timeMatch = fallbackStr.match(/^(\d{1,2}):(\d{2})\s+(\d{1,2}\/\d{1,2})$/);
    if (timeMatch && !iso) {
      const h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2];
      const dm = timeMatch[3];
      return `${String(h).padStart(2, '0')}:${m} ${dm}`;
    }

    return fallbackStr;
  }

  return '';
}

// ── API Functions ──

export async function getChatConversations(params?: {
  status?: string;
  customer_id?: string;
  farmer_id?: string;
  type?: string;
}): Promise<ChatConversation[]> {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
  if (params?.customer_id) queryParams.set('customer_id', params.customer_id);
  if (params?.farmer_id) queryParams.set('farmer_id', params.farmer_id);
  if (params?.type && params.type !== 'all') queryParams.set('type', params.type);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await chatFetch<{ success: boolean; data: ChatConversation[] }>(`/chat/conversations${queryStr}`);

  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function createChatConversation(
  customerId: string,
  subject?: string,
  message?: string
): Promise<{ success: boolean; data?: { id: string; status: string } }> {
  const res = await chatFetch<{ success: boolean; data?: { id: string; status: string } }>('/chat/conversations', {
    method: 'POST',
    body: JSON.stringify({
      customer_id: customerId,
      subject: subject || 'Hỗ trợ khách hàng',
      message,
    }),
  });
  return { success: res?.success || false, data: res?.data };
}

/**
 * Khách hàng mở chat với Nông hộ (Shopee Shop Chat)
 */
export async function startCustomerFarmerChat(
  customerId: string,
  farmerId: string,
  productId?: string,
  message?: string
): Promise<{ success: boolean; data?: { id: string; type: string; status: string } }> {
  const res = await chatFetch<{ success: boolean; data?: { id: string; type: string; status: string } }>(
    '/chat/customer/conversations/farmer',
    {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        farmer_id: farmerId,
        product_id: productId,
        message,
      }),
    }
  );
  return { success: res?.success || false, data: res?.data };
}

/**
 * Nông hộ mở chat với Admin Sàn GreenFood
 */
export async function startFarmerAdminChat(
  farmerId: string,
  message?: string
): Promise<{ success: boolean; data?: { id: string; type: string; status: string } }> {
  const res = await chatFetch<{ success: boolean; data?: { id: string; type: string; status: string } }>(
    '/chat/farmer/conversations/admin',
    {
      method: 'POST',
      body: JSON.stringify({
        farmer_id: farmerId,
        message,
      }),
    }
  );
  return { success: res?.success || false, data: res?.data };
}

export async function getChatMessages(
  conversationId: string,
  viewerRole: 'admin' | 'customer' | 'farmer' = 'admin'
): Promise<ConversationDetail | null> {
  const res = await chatFetch<{ success: boolean; data: ConversationDetail }>(
    `/chat/conversations/${conversationId}?viewer_role=${viewerRole}`
  );
  if (res && res.success && res.data) {
    return res.data;
  }
  return null;
}

export async function getCustomerChatMessages(
  conversationId: string,
  customerId: string
): Promise<ConversationDetail | null> {
  const res = await chatFetch<{ success: boolean; data: ConversationDetail }>(
    `/chat/conversations/${conversationId}/customer?customer_id=${customerId}`
  );
  if (res && res.success && res.data) {
    return res.data;
  }
  return null;
}

export interface ChatSendResponseData extends ChatMessageItem {
  bot_reply?: ChatMessageItem | null;
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  senderRole: 'customer' | 'admin' | 'farmer',
  message: string
): Promise<{ success: boolean; data?: ChatSendResponseData }> {
  const res = await chatFetch<{ success: boolean; data?: ChatSendResponseData }>(
    `/chat/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({
        sender_id: senderId,
        sender_role: senderRole,
        message,
        message_type: 'text',
      }),
    }
  );
  return { success: res?.success || false, data: res?.data };
}

export async function assignChatConversation(conversationId: string, adminId: string): Promise<{ success: boolean }> {
  const res = await chatFetch<{ success: boolean }>(`/chat/conversations/${conversationId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ admin_id: adminId }),
  });
  return { success: res?.success || false };
}

export async function closeChatConversation(conversationId: string): Promise<{ success: boolean }> {
  const res = await chatFetch<{ success: boolean }>(`/chat/conversations/${conversationId}/close`, {
    method: 'PUT',
  });
  return { success: res?.success || false };
}

export async function getChatUnreadCount(
  userId?: string,
  role: 'admin' | 'customer' | 'farmer' = 'admin',
  farmerId?: string
): Promise<number> {
  const query = new URLSearchParams();
  if (userId) query.set('user_id', userId);
  query.set('role', role);
  if (farmerId) query.set('farmer_id', farmerId);

  const res = await chatFetch<{ success: boolean; data: { count: number } }>(`/chat/unread-count?${query.toString()}`);
  if (res && res.success && res.data) {
    return res.data.count;
  }
  return 0;
}
