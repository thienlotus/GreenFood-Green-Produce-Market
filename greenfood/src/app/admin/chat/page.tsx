"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageCircle,
  Send,
  User,
  CheckCircle2,
  Clock,
  X,
  UserPlus,
  XCircle,
  RefreshCw,
  Store,
  ShoppingBag,
  ShieldCheck,
  Filter
} from 'lucide-react';
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
  formatChatTime,
  ChatConversationType
} from '@/lib/chatApi';
import { cleanVietnameseMojibake } from '@/data/vietnamAddress';

export default function AdminChatPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getChatConversations({
        status: filterStatus,
        type: filterType !== 'all' ? filterType : undefined
      });
      setConversations(data);
    } catch {
      toast.error('Không thể tải danh sách chat!');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 8000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const loadMessages = useCallback(async (convId: string) => {
    const data = await getChatMessages(convId, 'admin');
    if (data) {
      setMessages(data.messages);
    }
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv);
      const interval = setInterval(() => loadMessages(selectedConv), 4000);
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
      case 'open':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium"><Clock size={12} /> Chờ hỗ trợ</span>;
      case 'assigned':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"><User size={12} /> Đang xử lý</span>;
      case 'resolved':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"><CheckCircle2 size={12} /> Đã xong</span>;
      case 'closed':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"><XCircle size={12} /> Đã đóng</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: ChatConversationType) => {
    switch (type) {
      case 'farmer_admin':
        return <span className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-semibold"><Store size={11} /> Nông Hộ ↔ Sàn</span>;
      case 'customer_farmer':
        return <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold"><ShoppingBag size={11} /> Khách ↔ Nông Hộ</span>;
      default:
        return <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-semibold"><ShieldCheck size={11} /> Khách ↔ CSKH</span>;
    }
  };

  const selectedConvData = conversations.find(c => c.id === selectedConv);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-88 md:w-96 border-r border-gray-200 flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle size={20} className="text-emerald-600" />
              Trung Tâm Tin Nhắn Sàn
            </h2>
            <button onClick={fetchConversations} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Làm mới">
              <RefreshCw size={16} className={loading ? 'animate-spin text-emerald-600' : 'text-gray-400'} />
            </button>
          </div>

          {/* Phân loại Tab theo logic Shopee */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg text-xs font-medium mb-3">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1.5 px-2 rounded-md transition-all text-center ${
                filterType === 'all' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('farmer_admin')}
              className={`py-1.5 px-2 rounded-md transition-all text-center flex items-center justify-center gap-1 ${
                filterType === 'farmer_admin' ? 'bg-white text-purple-700 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Store size={12} /> Nông Hộ
            </button>
            <button
              onClick={() => setFilterType('customer_admin')}
              className={`py-1.5 px-2 rounded-md transition-all text-center flex items-center justify-center gap-1 ${
                filterType === 'customer_admin' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User size={12} /> Khách Mua
            </button>
          </div>

          {/* Bộ lọc trạng thái */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="open">Chờ hỗ trợ</option>
              <option value="assigned">Đang xử lý</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>
        </div>

        {/* Danh sách hội thoại */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <MessageCircle size={36} className="mx-auto mb-2 opacity-30" />
              Chưa có cuộc hội thoại nào phù hợp
            </div>
          ) : (
            conversations.map((conv) => {
              const isFarmerChat = conv.type === 'farmer_admin';
              const title = isFarmerChat
                ? (conv.farmer?.farm_name || 'Gian hàng Nông hộ')
                : (conv.customer?.name || 'Khách hàng');
              const subtitle = isFarmerChat
                ? (conv.farmer?.address || 'Kênh Người Bán Nông Nghiệp')
                : (conv.customer?.phone || conv.customer?.email || 'Người mua hàng');

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv.id)}
                  className={`p-3.5 cursor-pointer transition-all hover:bg-emerald-50/50 ${
                    selectedConv === conv.id ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600 font-medium' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        isFarmerChat
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isFarmerChat ? <Store size={18} /> : cleanVietnameseMojibake(title).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {cleanVietnameseMojibake(title)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {cleanVietnameseMojibake(conv.last_message?.message || conv.subject)}
                        </p>
                      </div>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-[11px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {getTypeBadge(conv.type)}
                      {getStatusBadge(conv.status)}
                    </div>
                    <span className="text-[10px] text-gray-400">{conv.updated_at}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50/40">
            <div className="text-center max-w-sm px-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100/60 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <MessageCircle size={32} />
              </div>
              <p className="text-base font-bold text-gray-700">Chọn cuộc hội thoại để trao đổi</p>
              <p className="text-xs text-gray-500 mt-1">
                Admin sàn có thể hỗ trợ giải đáp trực tiếp với Nông hộ gian hàng hoặc khách mua hàng theo chuẩn sàn TMĐT Shopee.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base ${
                  selectedConvData?.type === 'farmer_admin'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {selectedConvData?.type === 'farmer_admin'
                    ? <Store size={22} />
                    : cleanVietnameseMojibake(selectedConvData?.customer?.name || 'K').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-base">
                      {selectedConvData?.type === 'farmer_admin'
                        ? cleanVietnameseMojibake(selectedConvData?.farmer?.farm_name || 'Nông Hộ Đối Tác')
                        : cleanVietnameseMojibake(selectedConvData?.customer?.name || 'Khách Mua Hàng')}
                    </p>
                    {selectedConvData && getTypeBadge(selectedConvData.type)}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedConvData?.type === 'farmer_admin'
                      ? `Chủ vườn: ${selectedConvData?.farmer?.user?.name || 'Đối tác'} • ${selectedConvData?.farmer?.address || ''}`
                      : `${selectedConvData?.customer?.phone || selectedConvData?.customer?.email || 'Khách hàng GreenFood'}`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {selectedConvData?.product && (
                  <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 mr-2">
                    <ShoppingBag size={14} className="text-amber-600" />
                    <span className="font-medium truncate max-w-40">{selectedConvData.product.name}</span>
                  </div>
                )}

                {selectedConvData?.status === 'open' && (
                  <button
                    onClick={() => handleAssign(selectedConv)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <UserPlus size={14} />
                    Nhận xử lý
                  </button>
                )}
                {selectedConvData?.status !== 'closed' && (
                  <button
                    onClick={() => handleClose(selectedConv)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <X size={14} />
                    Đóng
                  </button>
                )}
              </div>
            </div>

            {/* Messages Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60">
              {messages.map((msg) => {
                const isAdmin = msg.sender_role === 'admin';
                const isFarmer = msg.sender_role === 'farmer';
                const isBot = isAdmin && msg.message.startsWith('🤖');

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      isAdmin
                        ? isBot
                          ? 'bg-emerald-800 text-white rounded-br-xs border border-emerald-700'
                          : 'bg-emerald-600 text-white rounded-br-xs'
                        : isFarmer
                        ? 'bg-purple-50 text-purple-950 border border-purple-200 rounded-bl-xs'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs'
                    }`}>
                      {/* Tiêu đề người gửi */}
                      {!isAdmin && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold mb-1 opacity-75">
                          {isFarmer ? <Store size={12} className="text-purple-600" /> : <User size={12} />}
                          <span>{msg.sender_name || (isFarmer ? 'Nông Hộ' : 'Khách Hàng')}</span>
                        </div>
                      )}
                      {isBot && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-200 mb-1">
                          <span>🤖 Trợ lý AI (Gemini Flash)</span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap leading-relaxed break-words">{cleanVietnameseMojibake(msg.message)}</p>

                      <div className={`text-[10px] mt-1 text-right ${
                        isAdmin ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        {formatChatTime(msg)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    selectedConvData?.type === 'farmer_admin'
                      ? 'Nhập nội dung phản hồi cho Nông hộ (Duyệt VietGAP, đối soát, hướng dẫn bán hàng)...'
                      : 'Nhập nội dung trả lời hỗ trợ khách hàng...'
                  }
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all"
                  disabled={sending || selectedConvData?.status === 'closed'}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim() || selectedConvData?.status === 'closed'}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                >
                  <Send size={16} />
                  <span>Gửi</span>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
