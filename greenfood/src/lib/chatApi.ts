// Chat API Client — GreenFood Live Chat

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// ── Helper fetch for chat ──
async function chatFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
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
