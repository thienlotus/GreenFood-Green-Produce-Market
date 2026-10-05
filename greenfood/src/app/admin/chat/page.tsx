"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, Send, User, CheckCircle2, Clock, X, UserPlus, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getChatConversations,
  getChatMessages,
  sendChatMessage,
  assignChatConversation,
  closeChatConversation,
  ChatConversation,
  ChatMessageItem,
} from '@/lib/chatApi';
import { cleanVietnameseMojibake } from '@/data/vietnamAddress';

export default function AdminChatPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [convDetail, setConvDetail] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getChatConversations({ status: filterStatus });
      setConversations(data);
    } catch {
      toast.error('Không thể tải danh sách chat!');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const loadMessages = useCallback(async (convId: string) => {
    const data = await getChatMessages(convId);
    if (data) {
      setMessages(data.messages);
      setConvDetail(data.conversation);
    }
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv);
      const interval = setInterval(() => loadMessages(selectedConv), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConv, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || !user?.id || sending) return;
    setSending(true);
    const result = await sendChatMessage(selectedConv, user.id, 'admin', newMessage.trim());
    if (result.success && result.data) {
      setMessages(prev => [...prev, result.data!]);
      setNewMessage('');
    } else {
      toast.error('Gửi tin nhắn thất bại!');
    }
    setSending(false);
  };

  const handleAssign = async (convId: string) => {
    if (!user?.id) return;
    const result = await assignChatConversation(convId, user.id);
    if (result.success) {
      toast.success('Đã nhận xử lý cuộc hội thoại!');
      fetchConversations();
      if (selectedConv === convId) loadMessages(convId);
    }
  };

  const handleClose = async (convId: string) => {
    const result = await closeChatConversation(convId);
    if (result.success) {
      toast.success('Đã đóng cuộc hội thoại!');
      fetchConversations();
      if (selectedConv === convId) {
        setSelectedConv(null);
        setMessages([]);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium"><Clock size={12} /> Chờ hỗ trợ</span>;
      case 'assigned': return <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"><User size={12} /> Đang hỗ trợ</span>;
      case 'resolved': return <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"><CheckCircle2 size={12} /> Đã giải quyết</span>;
      case 'closed': return <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"><XCircle size={12} /> Đã đóng</span>;
      default: return null;
    }
  };

  const selectedConvData = conversations.find(c => c.id === selectedConv);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle size={20} className="text-emerald-600" />
              Live Chat
            </h2>
            <button onClick={fetchConversations} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw size={16} className={loading ? 'animate-spin text-emerald-600' : 'text-gray-400'} />
            </button>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tất cả</option>
            <option value="open">Chờ hỗ trợ</option>
            <option value="assigned">Đang hỗ trợ</option>
            <option value="closed">Đã đóng</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              Chưa có cuộc hội thoại nào
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`p-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedConv === conv.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {cleanVietnameseMojibake(conv.customer.name).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{cleanVietnameseMojibake(conv.customer.name)}</p>
                      <p className="text-xs text-gray-500 truncate">{cleanVietnameseMojibake(conv.last_message?.message || conv.subject)}</p>
                    </div>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  {getStatusBadge(conv.status)}
                  <span className="text-[10px] text-gray-400">{conv.updated_at}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">Chọn một cuộc hội thoại</p>
              <p className="text-sm">để bắt đầu hỗ trợ khách hàng</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  {cleanVietnameseMojibake(selectedConvData?.customer.name).charAt(0).toUpperCase() || 'K'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{cleanVietnameseMojibake(selectedConvData?.customer.name)}</p>
                  <p className="text-xs text-gray-500">
                    {selectedConvData?.customer.email || selectedConvData?.customer.phone || ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedConvData?.status === 'open' && (
                  <button
                    onClick={() => handleAssign(selectedConv)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <UserPlus size={14} />
                    Nhận xử lý
                  </button>
                )}
                {selectedConvData?.status !== 'closed' && (
                  <button
                    onClick={() => handleClose(selectedConv)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                  >
                    <X size={14} />
                    Đóng
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {messages.map((msg) => {
                const isAdmin = msg.sender_role === 'admin';
                const isBot = isAdmin && msg.message.startsWith('🤖');

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${
                      isAdmin
                        ? isBot
                          ? 'bg-emerald-700 text-white rounded-2xl rounded-br-md border border-emerald-600'
                          : 'bg-emerald-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                    } px-4 py-2.5`}>
                      {isBot && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-200 mb-1">
                          <span>🤖 Trợ lý AI (Gemini Flash)</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{cleanVietnameseMojibake(msg.message)}</p>
                      <p className={`text-[10px] mt-1 ${
                        isAdmin ? 'text-emerald-200' : 'text-gray-400'
                      }`}>
                        {msg.created_at}
                        {isAdmin && msg.is_read && ' ✓✓'}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {selectedConvData?.status !== 'closed' ? (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Nhập tin nhắn hỗ trợ..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-500">
                Cuộc hội thoại đã đóng
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
