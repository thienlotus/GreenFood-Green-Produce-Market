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
  Filter,
  Plus,
  HeadphonesIcon,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getChatConversations,
  getChatMessages,
  sendChatMessage,
  assignChatConversation,
  closeChatConversation,
  startFarmerAdminChat,
  ChatConversation,
  ChatMessageItem,
  formatChatTime,
  ChatConversationType
} from '@/lib/chatApi';
import { getAdminFarmersApi } from '@/lib/api';
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
  const [filterType, setFilterType] = useState<string>('farmer_admin'); // Mặc định mở mục Kênh Cửa Hàng / Nông Hộ

  // Modal mở chat mới với Gian Hàng Nông Hộ
  const [farmersList, setFarmersList] = useState<any[]>([]);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [initialFarmerMsg, setInitialFarmerMsg] = useState<string>('');
  const [creatingChat, setCreatingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load danh sách nông hộ cho Admin chọn chat
  useEffect(() => {
    async function loadFarmers() {
      try {
        const data = await getAdminFarmersApi();
        if (Array.isArray(data)) {
          setFarmersList(data);
          if (data.length > 0) {
            setSelectedFarmerId(data[0].id);
          }
        }
      } catch {
        // Ignored
      }
    }
    loadFarmers();
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getChatConversations({
        status: filterStatus,
        type: filterType !== 'all' ? filterType : undefined
      });
      setConversations(data);
      if (selectedConv && !data.some(c => c.id === selectedConv) && data.length > 0) {
        // Keep current selected if exists, else first
      }
    } catch {
      toast.error('Không thể tải danh sách chat!');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, selectedConv]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 7000);
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
      const interval = setInterval(() => loadMessages(selectedConv), 3500);
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
      fetchConversations();
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

  // Admin chủ động khởi tạo hội thoại với Nông Hộ
  const handleStartFarmerChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmerId) {
      toast.error('Vui lòng chọn gian hàng nông hộ');
      return;
    }
    setCreatingChat(true);
    try {
      const msg = initialFarmerMsg.trim() || 'Chào đối tác, Ban Quản Trị Sàn GreenFood liên hệ hỗ trợ vận hành gian hàng của bạn.';
      const res = await startFarmerAdminChat(selectedFarmerId, msg);
      if (res.success && res.data) {
        toast.success('Đã kết nối với Gian Hàng Nông Hộ!');
        setIsNewChatModalOpen(false);
        setInitialFarmerMsg('');
        setFilterType('farmer_admin');
        await fetchConversations();
        setSelectedConv(res.data.id);
      } else {
        toast.error('Không thể tạo cuộc trò chuyện với nông hộ');
      }
    } catch {
      toast.error('Lỗi kết nối khi khởi tạo chat');
    } finally {
      setCreatingChat(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-medium"><Clock size={11} /> Chờ phản hồi</span>;
      case 'assigned':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium"><User size={11} /> Đang xử lý</span>;
      case 'resolved':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-medium"><CheckCircle2 size={11} /> Đã xong</span>;
      case 'closed':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium"><XCircle size={11} /> Đã đóng</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: ChatConversationType) => {
    switch (type) {
      case 'farmer_admin':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-bold"><Store size={11} /> Sàn ↔ Cửa Hàng</span>;
      case 'customer_farmer':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold"><ShoppingBag size={11} /> Khách Mua ↔ Cửa Hàng</span>;
      default:
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold"><ShieldCheck size={11} /> Khách ↔ CSKH Sàn</span>;
    }
  };

  const selectedConvData = conversations.find(c => c.id === selectedConv);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
      {/* Sidebar - Conversation List */}
      <div className="w-88 md:w-96 border-r border-gray-200 flex flex-col bg-gray-50/40">
        <div className="p-4 border-b border-gray-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle size={20} className="text-emerald-600" />
              Quản Trị Tin Nhắn Sàn
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Nhắn tin cho Cửa hàng / Nông hộ"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Nhắn Nông Hộ</span>
              </button>
              <button onClick={fetchConversations} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Làm mới">
                <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-600' : 'text-gray-400'} />
              </button>
            </div>
          </div>

          {/* Phân loại Tab rõ rệt chuẩn Shopee Marketplace */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterType('farmer_admin')}
              className={`py-2 px-1 rounded-lg transition-all text-center flex flex-col items-center gap-1 ${
                filterType === 'farmer_admin'
                  ? 'bg-white text-purple-700 shadow-xs font-bold border border-purple-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-1">
                <Store size={14} className="text-purple-600" />
                <span>Cửa Hàng</span>
              </div>
              <span className="text-[10px] text-purple-600 font-normal">Sàn ↔ Nông hộ</span>
            </button>

            <button
              onClick={() => setFilterType('customer_admin')}
              className={`py-2 px-1 rounded-lg transition-all text-center flex flex-col items-center gap-1 ${
                filterType === 'customer_admin'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold border border-emerald-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-1">
                <User size={14} className="text-emerald-600" />
                <span>Khách Mua</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-normal">CSKH & Bot AI</span>
            </button>

            <button
              onClick={() => setFilterType('customer_farmer')}
              className={`py-2 px-1 rounded-lg transition-all text-center flex flex-col items-center gap-1 ${
                filterType === 'customer_farmer'
                  ? 'bg-white text-blue-700 shadow-xs font-bold border border-blue-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-1">
                <ShoppingBag size={14} className="text-blue-600" />
                <span>Giám Sát</span>
              </div>
              <span className="text-[10px] text-blue-600 font-normal">Khách ↔ Shop</span>
            </button>
          </div>

          {/* Bộ lọc trạng thái */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => setFilterType('all')}
              className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                filterType === 'all' ? 'bg-gray-200 text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Xem tất cả ({conversations.length})
            </button>
            <div className="flex items-center gap-1">
              <Filter size={12} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-0.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="all">Mọi trạng thái</option>
                <option value="open">Chờ hỗ trợ</option>
                <option value="assigned">Đang xử lý</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách hội thoại */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-gray-600">Chưa có hội thoại nào</p>
              <p className="mt-1 text-gray-400">
                {filterType === 'farmer_admin'
                  ? 'Chưa có trao đổi nào giữa Sàn và Nông Hộ. Nhấn "Nhắn Nông Hộ" bên trên để bắt đầu!'
                  : 'Không có tin nhắn phù hợp với bộ lọc hiện tại.'}
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              // Phân giải tiêu đề và thông tin thẻ chuẩn xác theo từng loại hội thoại
              let cardTitle = '';
              let cardSubtitle = '';
              let cardAvatar = null;

              if (conv.type === 'farmer_admin') {
                // 1. Luồng Sàn ↔ Gian Hàng Nông Hộ
                cardTitle = conv.farmer?.farm_name || 'Gian Hàng Nông Hộ';
                cardSubtitle = `Chủ vườn: ${conv.farmer?.user?.name || 'Đối tác'} • Kênh Người Bán`;
                cardAvatar = (
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-sm shrink-0">
                    <Store size={18} />
                  </div>
                );
              } else if (conv.type === 'customer_farmer') {
                // 2. Luồng Khách Mua ➔ Gian Hàng Nông Hộ (Sàn giám sát)
                const custName = conv.customer?.name || 'Khách Mua';
                const farmName = conv.farmer?.farm_name || 'Gian Hàng';
                cardTitle = `${custName} ➔ ${farmName}`;
                cardSubtitle = conv.product?.name ? `Sản phẩm: ${conv.product.name}` : 'Giao dịch mua bán nông sản';
                cardAvatar = (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-sm shrink-0">
                    <ShoppingBag size={18} />
                  </div>
                );
              } else {
                // 3. Luồng Khách Mua ↔ CSKH Sàn
                cardTitle = conv.customer?.name || 'Khách Mua Hàng';
                cardSubtitle = conv.customer?.phone || conv.customer?.email || 'Tư vấn CSKH Sàn GreenFood';
                cardAvatar = (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">
                    <User size={18} />
                  </div>
                );
              }

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
                      {cardAvatar}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {cleanVietnameseMojibake(cardTitle)}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {cardSubtitle}
                        </p>
                        <p className="text-[11px] text-gray-600 truncate mt-1 italic font-normal bg-gray-50 px-2 py-0.5 rounded">
                          &ldquo;{cleanVietnameseMojibake(conv.last_message?.message || conv.subject)}&rdquo;
                        </p>
                      </div>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {getTypeBadge(conv.type)}
                      {getStatusBadge(conv.status)}
                    </div>
                    <span className="text-gray-400">{conv.updated_at}</span>
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
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50/30">
            <div className="text-center max-w-md px-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <Store size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-800">Chọn cuộc trao đổi để xử lý</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Ban Quản Trị Sàn có thể hỗ trợ các Gian hàng Nông hộ (duyệt hồ sơ VietGAP, đối soát doanh thu) hoặc giải đáp cho Khách mua hàng theo đúng tiêu chuẩn sàn TMĐT Shopee.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus size={14} />
                  <span>Gửi tin nhắn cho Nông Hộ</span>
                </button>
              </div>
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
                    : selectedConvData?.type === 'customer_farmer'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {selectedConvData?.type === 'farmer_admin' ? (
                    <Store size={22} />
                  ) : selectedConvData?.type === 'customer_farmer' ? (
                    <ShoppingBag size={22} />
                  ) : (
                    <User size={22} />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">
                      {selectedConvData?.type === 'farmer_admin'
                        ? cleanVietnameseMojibake(selectedConvData?.farmer?.farm_name || 'Nông Hộ Đối Tác')
                        : selectedConvData?.type === 'customer_farmer'
                        ? `${cleanVietnameseMojibake(selectedConvData?.customer?.name || 'Khách')} ➔ ${cleanVietnameseMojibake(selectedConvData?.farmer?.farm_name || 'Gian Hàng')}`
                        : cleanVietnameseMojibake(selectedConvData?.customer?.name || 'Khách Mua Hàng')}
                    </h3>
                    {selectedConvData && getTypeBadge(selectedConvData.type)}
                  </div>

                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedConvData?.type === 'farmer_admin'
                      ? `Chủ gian hàng: ${selectedConvData?.farmer?.user?.name || 'Đối tác'} • ${selectedConvData?.farmer?.address || 'Kênh Người Bán'}`
                      : selectedConvData?.type === 'customer_farmer'
                      ? `Chế độ Sàn Giám Sát • Khách: ${selectedConvData?.customer?.phone || selectedConvData?.customer?.email || ''}`
                      : `${selectedConvData?.customer?.phone || selectedConvData?.customer?.email || 'Khách hàng GreenFood'}`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
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

            {/* Thông tin ngữ cảnh sản phẩm nếu có */}
            {selectedConvData?.product && (
              <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={14} className="text-amber-600" />
                  <span>Sản phẩm đính kèm trong cuộc trò chuyện: <strong>{selectedConvData.product.name}</strong></span>
                </div>
              </div>
            )}

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
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs md:text-sm shadow-2xs ${
                      isAdmin
                        ? isBot
                          ? 'bg-emerald-800 text-white rounded-br-2xs border border-emerald-700'
                          : 'bg-emerald-600 text-white rounded-br-2xs'
                        : isFarmer
                        ? 'bg-purple-50 text-purple-950 border border-purple-200 rounded-bl-2xs'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-2xs'
                    }`}>
                      {/* Tiêu đề người gửi */}
                      {!isAdmin && (
                        <div className="flex items-center gap-1 text-[11px] font-bold mb-1 opacity-75">
                          {isFarmer ? <Store size={12} className="text-purple-600" /> : <User size={12} />}
                          <span>{msg.sender_name || (isFarmer ? 'Chủ Gian Hàng Nông Hộ' : 'Khách Mua')}</span>
                        </div>
                      )}
                      {isAdmin && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-100 mb-1">
                          <ShieldCheck size={11} />
                          <span>Ban Quản Trị Sàn GreenFood</span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap leading-relaxed break-words font-normal">
                        {cleanVietnameseMojibake(msg.message)}
                      </p>

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
                      ? 'Nhập nội dung trao đổi với Gian Hàng Nông Hộ (Duyệt VietGAP, đối soát ví, hỗ trợ bán hàng)...'
                      : 'Nhập nội dung trả lời hỗ trợ...'
                  }
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all"
                  disabled={sending || selectedConvData?.status === 'closed'}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim() || selectedConvData?.status === 'closed'}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
                >
                  <Send size={15} />
                  <span>Gửi</span>
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* MODAL: BẮT ĐẦU CHAT VỚI GIAN HÀNG NÔNG HỘ */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Nhắn Tin Cho Gian Hàng Nông Hộ</h3>
                  <p className="text-xs text-gray-500">Kênh Trao Đổi Vận Hành Sàn GreenFood</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStartFarmerChat} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Chọn Gian Hàng Đối Tác Cần Trao Đổi:
                </label>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  required
                >
                  {farmersList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.farm_name} (Chủ vườn: {f.user?.name || 'Đối tác'} - {f.address || 'Việt Nam'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nội Dung Tin Nhắn Đầu Tiên:
                </label>
                <textarea
                  rows={3}
                  value={initialFarmerMsg}
                  onChange={(e) => setInitialFarmerMsg(e.target.value)}
                  placeholder="Ví dụ: Chào anh/chị, Ban Quản Trị Sàn GreenFood liên hệ thông báo về hồ sơ chứng nhận VietGAP và đối soát ví doanh thu tuần này..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingChat}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {creatingChat ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Đang kết nối...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Bắt đầu trao đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
