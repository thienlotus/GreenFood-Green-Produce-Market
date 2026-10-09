"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, X, Minimize2, Sparkles, Bot, UserCheck, Store, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  createChatConversation,
  startCustomerFarmerChat,
  getChatConversations,
  getCustomerChatMessages,
  getChatMessages,
  sendChatMessage,
  getChatUnreadCount,
  ChatMessageItem,
  formatChatTime,
  ChatConversation
} from '@/lib/chatApi';

const QUICK_PROMPTS = [
  { label: '🥦 Rau củ VietGAP', query: 'Rau củ quả tại GreenFood có chuẩn VietGAP không?' },
  { label: '🚚 Phí ship GHN', query: 'Phí giao hàng qua GHN và thời gian nhận hàng như thế nào?' },
  { label: '💳 Thanh toán Thẻ ATM', query: 'Shop có hỗ trợ thanh toán qua Thẻ ATM nội địa Napas không?' },
  { label: '🎁 Mã khuyến mãi', query: 'Hiện GreenFood có mã voucher giảm giá nào không?' },
  { label: '👨‍💼 Gặp nhân viên', query: 'Tôi muốn gặp nhân viên tư vấn trực tiếp' },
];

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentChatType, setCurrentChatType] = useState<'customer_admin' | 'customer_farmer'>('customer_admin');
  const [currentFarmerInfo, setCurrentFarmerInfo] = useState<{ id: string; name: string; product_name?: string } | null>(null);
  const [customerConversations, setCustomerConversations] = useState<ChatConversation[]>([]);
  const [showConvList, setShowConvList] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lắng nghe sự kiện mở chat từ trang chi tiết nhà vườn hoặc chi tiết sản phẩm
  useEffect(() => {
    const handleOpenChatEvent = async (e: Event) => {
      const customEvent = e as CustomEvent<{
        farmer_id: string;
        farmer_name: string;
        product_id?: string;
        product_name?: string;
        initial_message?: string;
      }>;

      if (!customEvent.detail || !user?.id) return;
      const { farmer_id, farmer_name, product_id, product_name, initial_message } = customEvent.detail;

      setIsOpen(true);
      setShowConvList(false);
      setCurrentChatType('customer_farmer');
      setCurrentFarmerInfo({ id: farmer_id, name: farmer_name, product_name });

      const res = await startCustomerFarmerChat(user.id, farmer_id, product_id, initial_message);
      if (res.success && res.data) {
        setConversationId(res.data.id);
        const data = await getChatMessages(res.data.id, 'customer');
        if (data) {
          setMessages(data.messages);
        }
      }
    };

    window.addEventListener('gf-open-chat', handleOpenChatEvent);
    return () => window.removeEventListener('gf-open-chat', handleOpenChatEvent);
  }, [user?.id]);

  // Poll for unread count
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const checkUnread = async () => {
      const count = await getChatUnreadCount(user.id, 'customer');
      setUnreadCount(count);
    };
    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  // Load danh sách hội thoại của khách hàng
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getChatConversations({ customer_id: user.id });
      setCustomerConversations(data);
    } catch {
      // Ignored
    }
  }, [user?.id]);

  // Load messages when conversation is open
  const loadMessages = useCallback(async () => {
    if (!conversationId || !user?.id) return;
    const data = await getChatMessages(conversationId, 'customer');
    if (data) {
      setMessages(data.messages);
      setAdminName(data.conversation.admin_name || null);
      setStatus(data.conversation.status);
    }
  }, [conversationId, user?.id]);

  useEffect(() => {
    if (isOpen && conversationId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleOpen = async () => {
    setIsOpen(true);
    setUnreadCount(0);
    loadConversations();
    if (!conversationId && user?.id) {
      const result = await createChatConversation(user.id, 'Hỗ trợ khách hàng');
      if (result.success && result.data) {
        setConversationId(result.data.id);
        setCurrentChatType('customer_admin');
        setTimeout(async () => {
          const data = await getChatMessages(result.data!.id, 'customer');
          if (data) {
            setMessages(data.messages);
          }
        }, 500);
      }
    }
  };

  const handleSelectConversation = async (conv: ChatConversation) => {
    setConversationId(conv.id);
    setCurrentChatType(conv.type === 'customer_farmer' ? 'customer_farmer' : 'customer_admin');
    if (conv.farmer) {
      setCurrentFarmerInfo({
        id: conv.farmer.id,
        name: conv.farmer.farm_name,
        product_name: conv.product?.name
      });
    } else {
      setCurrentFarmerInfo(null);
    }
    setShowConvList(false);
    const data = await getChatMessages(conv.id, 'customer');
    if (data) {
      setMessages(data.messages);
    }
  };

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || !conversationId || !user?.id || sending) return;
    setSending(true);
    const result = await sendChatMessage(conversationId, user.id, 'customer', textToSend.trim());
    if (result.success && result.data) {
      const newMsgs: ChatMessageItem[] = [
        {
          id: result.data.id,
          sender_id: result.data.sender_id,
          sender_role: result.data.sender_role,
          message: result.data.message,
          message_type: result.data.message_type,
          is_read: result.data.is_read,
          created_at: result.data.created_at,
        }
      ];
      if (result.data.bot_reply) {
        newMsgs.push(result.data.bot_reply);
      }
      setMessages(prev => [...prev, ...newMsgs]);
      setNewMessage('');
    }
    setSending(false);
  };

  const handleSend = () => {
    handleSendPrompt(newMessage);
  };

  // Don't show widget if not logged in or is admin
  if (!isAuthenticated || user?.role === 'admin') return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Mở khung chat hỗ trợ"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        >
          <div className="relative">
            <MessageCircle size={26} />
            <Sparkles size={12} className="absolute -top-1 -right-1 text-amber-300 animate-pulse" />
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow">
              {unreadCount}
            </span>
          )}
          <span className="absolute right-16 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
            Chat hỗ trợ AI 24/7 🌱
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[410px] h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3.5 flex items-center justify-between shadow-sm relative z-20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white shrink-0 relative">
                {currentChatType === 'customer_farmer' ? (
                  <Store size={18} />
                ) : adminName ? (
                  <UserCheck size={18} />
                ) : (
                  <Bot size={18} />
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-600 rounded-full"></span>
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    loadConversations();
                    setShowConvList(prev => !prev);
                  }}
                  className="flex items-center gap-1 font-semibold text-sm hover:underline text-left"
                  title="Nhấn để xem danh sách chat"
                >
                  <span className="truncate max-w-[190px]">
                    {currentChatType === 'customer_farmer'
                      ? (currentFarmerInfo?.name || 'Gian Hàng Nông Hộ')
                      : 'GreenFood Live Chat'}
                  </span>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${showConvList ? 'rotate-180' : ''}`} />
                </button>
                <p className="text-[11px] text-emerald-100 truncate mt-0.2">
                  {currentChatType === 'customer_farmer'
                    ? (currentFarmerInfo?.product_name ? `Hỏi về: ${currentFarmerInfo.product_name}` : 'Chat trực tiếp với chủ vườn')
                    : (adminName ? `${adminName} đang hỗ trợ` : 'Trợ lý AI sẵn sàng 24/7')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/90 shrink-0"
              aria-label="Thu nhỏ chatbox"
            >
              <Minimize2 size={17} />
            </button>
          </div>

          {/* Dropdown danh sách phòng chat khách hàng (Shopee Chat Multi-Vendor) */}
          {showConvList && (
            <div className="bg-white border-b border-gray-200 p-2 max-h-56 overflow-y-auto shadow-md animate-in slide-in-from-top-2 text-xs divide-y divide-gray-100 z-10">
              <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Chọn cuộc trò chuyện</span>
                <button
                  onClick={() => handleOpen()}
                  className="text-emerald-600 hover:underline font-bold"
                >
                  + Chat với Sàn AI
                </button>
              </div>
              {customerConversations.map((c) => {
                const isFarmer = c.type === 'customer_farmer';
                const name = isFarmer
                  ? (c.farmer?.farm_name || 'Gian Hàng Nông Hộ')
                  : 'Sàn GreenFood (AI & CSKH)';

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c)}
                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between gap-2 hover:bg-emerald-50/60 ${
                      conversationId === c.id ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isFarmer ? <Store size={14} className="text-purple-600 shrink-0" /> : <Bot size={14} className="text-emerald-600 shrink-0" />}
                      <span className="truncate">{name}</span>
                    </div>
                    {c.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick suggestions chips (Chỉ hiện khi chat với Sàn CSKH / AI Bot) */}
          {currentChatType === 'customer_admin' && (
            <div className="bg-emerald-50/80 border-b border-emerald-100/60 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <span className="text-[11px] font-semibold text-emerald-800 shrink-0 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" /> Gợi ý:
              </span>
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendPrompt(prompt.query)}
                  disabled={sending}
                  className="shrink-0 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-10">
                <Bot size={36} className="mx-auto mb-2 text-emerald-500 opacity-60 animate-bounce" />
                <p className="font-medium text-gray-600">Xin chào Quý khách!</p>
                <p className="text-xs mt-1 text-gray-400">Em là Trợ lý AI GreenFood. Bạn có thể chọn câu hỏi gợi ý bên trên hoặc nhập tin nhắn nhé!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isCustomer = msg.sender_role === 'customer';
              const isBot = !isCustomer && (msg.message.startsWith('🤖') || !adminName);

              return (
                <div
                  key={msg.id}
                  className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[82%] ${
                    isCustomer
                      ? 'bg-emerald-600 text-white rounded-2xl rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100'
                  } px-3.5 py-2.5`}>
                    {!isCustomer && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mb-1">
                        {isBot ? (
                          <>
                            <Sparkles size={11} className="text-amber-500" />
                            <span>Trợ lý GreenFood AI</span>
                          </>
                        ) : (
                          <>
                            <UserCheck size={11} className="text-blue-600" />
                            <span>{adminName || 'Chuyên viên tư vấn'}</span>
                          </>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    <p className={`text-[10px] mt-1 text-right ${
                      isCustomer ? 'text-emerald-100' : 'text-gray-400'
                    }`}>
                      {formatChatTime(msg)}
                    </p>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 px-3.5 py-2.5 text-xs text-gray-500 flex items-center gap-2">
                  <Bot size={14} className="text-emerald-600 animate-spin" />
                  <span>Trợ lý AI đang soạn phản hồi...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {status !== 'closed' ? (
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Nhập câu hỏi (VD: cước ship, rau củ quả...)"
                  className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-40 shadow-sm"
                  aria-label="Gửi tin nhắn"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-500">
              Cuộc hội thoại đã kết thúc
            </div>
          )}
        </div>
      )}
    </>
  );
}
