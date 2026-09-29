"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  createChatConversation,
  getCustomerChatMessages,
  sendChatMessage,
  getChatUnreadCount,
  ChatMessageItem,
} from '@/lib/chatApi';

export default function ChatWidget() {
  const { user, isLoggedIn } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for unread count
  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;
    const checkUnread = async () => {
      const count = await getChatUnreadCount(user.id, 'customer');
      setUnreadCount(count);
    };
    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, [isLoggedIn, user?.id]);

  // Load messages when conversation is open
  const loadMessages = useCallback(async () => {
    if (!conversationId || !user?.id) return;
    const data = await getCustomerChatMessages(conversationId, user.id);
    if (data) {
      setMessages(data.messages);
      setAdminName(data.conversation.admin_name || null);
      setStatus(data.conversation.status);
    }
  }, [conversationId, user?.id]);

  useEffect(() => {
    if (isOpen && conversationId) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = async () => {
    setIsOpen(true);
    setUnreadCount(0);
    if (!conversationId && user?.id) {
      const result = await createChatConversation(user.id, 'Hỗ trợ khách hàng');
      if (result.success && result.data) {
        setConversationId(result.data.id);
      }
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId || !user?.id || sending) return;
    setSending(true);
    const result = await sendChatMessage(conversationId, user.id, 'customer', newMessage.trim());
    if (result.success && result.data) {
      setMessages(prev => [...prev, result.data!]);
      setNewMessage('');
    }
    setSending(false);
  };

  // Don't show widget if not logged in or is admin
  if (!isLoggedIn || user?.role === 'ADMIN') return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-110 flex items-center justify-center group"
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
          <span className="absolute right-16 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat hỗ trợ
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">GreenFood Hỗ Trợ</p>
                <p className="text-xs text-emerald-200">
                  {adminName ? `${adminName} đang hỗ trợ bạn` : 'Đang chờ nhân viên hỗ trợ...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                <p>Xin chào! Bạn cần hỗ trợ gì?</p>
                <p className="text-xs mt-1">Nhập tin nhắn bên dưới để bắt đầu</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_role === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${
                  msg.sender_role === 'customer'
                    ? 'bg-emerald-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                } px-3.5 py-2`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-[10px] mt-0.5 ${
                    msg.sender_role === 'customer' ? 'text-emerald-200' : 'text-gray-400'
                  }`}>
                    {msg.created_at}
                  </p>
                </div>
              </div>
            ))}
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
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
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
