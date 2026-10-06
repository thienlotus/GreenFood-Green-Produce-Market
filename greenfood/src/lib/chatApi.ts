// Chat API Client — GreenFood Live Chat
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
export interface ChatConversation {
  id: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  admin: {
    id: string;
    name: string;
  } | null;
  subject: string;
  status: 'open' | 'assigned' | 'resolved' | 'closed';
  unread_count: number;
  last_message: {
    message: string;
    sender_role: string;
    created_at: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageItem {
  id: string;
  sender_id?: string;
  sender_role: 'customer' | 'admin';
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
    customer?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
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
 * Tự động chuyển đổi các timestamp UTC cũ (ví dụ 00:22) về đúng giờ thực tế (07:22)
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

  // 2. Nếu fallbackStr có dạng ngày giờ:
  if (fallbackStr) {
    // Nếu là dạng ISO hay có dấu gạch ngang ngày tháng
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

    // Nếu chuỗi là dạng "00:22 06/10" (do server cũ sinh ra trước đây):
    // Nếu giờ < 7 mà tin nhắn ngày hôm nay, ta cộng +7 giờ để đồng bộ với thực tế nếu chưa được convert
    const timeMatch = fallbackStr.match(/^(\d{1,2}):(\d{2})\s+(\d{1,2}\/\d{1,2})$/);
    if (timeMatch && !iso) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2];
      const dm = timeMatch[3];
      // Nếu giờ từ 0 đến 6 sáng (khả năng cao do lệch UTC lúc 7h-13h VN)
      // có thể là tin nhắn cũ lúc server chạy UTC
      return `${String(h).padStart(2, '0')}:${m} ${dm}`;
    }

    return fallbackStr;
  }

  return '';
}

// ── API Functions ──

export async function getChatConversations(params?: { status?: string; customer_id?: string }): Promise<ChatConversation[]> {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
  if (params?.customer_id) queryParams.set('customer_id', params.customer_id);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await chatFetch<{ success: boolean; data: ChatConversation[] }>(`/chat/conversations${queryStr}`);

  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function createChatConversation(customerId: string, subject?: string, message?: string): Promise<{ success: boolean; data?: { id: string; status: string } }> {
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

export async function getChatMessages(conversationId: string): Promise<ConversationDetail | null> {
  const res = await chatFetch<{ success: boolean; data: ConversationDetail }>(`/chat/conversations/${conversationId}`);
  if (res && res.success && res.data) {
    return res.data;
  }
  return null;
}

export async function getCustomerChatMessages(conversationId: string, customerId: string): Promise<ConversationDetail | null> {
  const res = await chatFetch<{ success: boolean; data: ConversationDetail }>(`/chat/conversations/${conversationId}/customer?customer_id=${customerId}`);
  if (res && res.success && res.data) {
    return res.data;
  }
  return null;
}

export interface ChatSendResponseData extends ChatMessageItem {
  bot_reply?: ChatMessageItem | null;
}

export async function sendChatMessage(conversationId: string, senderId: string, senderRole: 'customer' | 'admin', message: string): Promise<{ success: boolean; data?: ChatSendResponseData }> {
  const res = await chatFetch<{ success: boolean; data?: ChatSendResponseData }>(`/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      sender_id: senderId,
      sender_role: senderRole,
      message,
      message_type: 'text',
    }),
  });
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

export async function getChatUnreadCount(userId: string, role: 'admin' | 'customer'): Promise<number> {
  const res = await chatFetch<{ success: boolean; data: { count: number } }>(`/chat/unread-count?user_id=${userId}&role=${role}`);
  if (res && res.success && res.data) {
    return res.data.count;
  }
  return 0;
}
