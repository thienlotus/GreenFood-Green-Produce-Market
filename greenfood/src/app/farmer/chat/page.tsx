"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, Send, User, CheckCircle2, Clock, X, RefreshCw, 
  Store, ShoppingBag, ShieldCheck, Filter, Plus, HeadphonesIcon, 
  ArrowLeft, Phone, Search, ChevronRight, Eye, Sparkles, AlertCircle,
  Truck, Check, UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  getChatConversations, 
  getChatMessages, 
  sendChatMessage, 
  startFarmerAdminChat,
  startFarmerCustomerChat, 
  formatChatTime,
  ChatConversation, 
  ChatMessageItem 
} from '@/lib/chatApi';
import { getAdminFarmersApi, getFarmerOrdersApi, VendorOrderData } from '@/lib/api';
import { cleanVietnameseMojibake } from '@/data/vietnamAddress';

export default function FarmerChatPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [farmers, setFarmers] = useState<any[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [loadingFarmers, setLoadingFarmers] = useState(true);

  // Chat State
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [tabFilter, setTabFilter] = useState<'all' | 'customer_farmer' | 'farmer_admin'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal nhắn tin cho khách hàng đã mua
  const [recentOrders, setRecentOrders] = useState<VendorOrderData[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 1. Tải danh sách gian hàng & phân quyền
  useEffect(() => {
    async function loadFarmers() {
      setLoadingFarmers(true);
      try {
        const data = await getAdminFarmersApi();
        if (Array.isArray(data) && data.length > 0) {
          if (!isAdmin) {
            // Nông hộ thông thường
            const myFarm = data.find((f: any) => {
              if (f.user_id && user?.id && String(f.user_id) === String(user.id)) return true;
              if (f.user?.email && user?.email && f.user.email.toLowerCase() === user.email.toLowerCase()) return true;
              if (f.user?.phone && user?.phone && f.user.phone === user.phone) return true;
              if (user?.farmName && (f.farm_name || '').toLowerCase().includes(user.farmName.toLowerCase())) return true;
              if (user?.name && ((f.farm_name || '').toLowerCase().includes(user.name.toLowerCase()))) return true;
              return false;
            });
            if (myFarm) {
              setFarmers([myFarm]);
              setSelectedFarmerId(myFarm.id);
            } else {
              setFarmers(data);
              setSelectedFarmerId(data[0].id);
            }
          } else {
            // Admin: xem được tất cả
            setFarmers(data);
            setSelectedFarmerId(prev => prev || data[0].id);
          }
        }
      } catch (err) {
        console.error('Lỗi tải danh sách nông hộ:', err);
      } finally {
        setLoadingFarmers(false);
      }
    }
    loadFarmers();
  }, [user, isAdmin]);

  const currentFarmer = useMemo(() => {
    return farmers.find(f => f.id === selectedFarmerId) || (farmers.length > 0 ? farmers[0] : null);
  }, [farmers, selectedFarmerId]);

  // 2. Tải danh sách hội thoại của gian hàng hiện tại
  const loadConversations = useCallback(async () => {
    if (!currentFarmer?.id) return;
    try {
      const data = await getChatConversations({ farmer_id: currentFarmer.id, role: 'farmer' });
      setConversations(data);
      if (!selectedConvId && data.length > 0) {
        setSelectedConvId(data[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải hội thoại:', err);
    }
  }, [currentFarmer?.id, selectedConvId]);

  useEffect(() => {
    if (currentFarmer?.id) {
      loadConversations();
      const interval = setInterval(loadConversations, 2500);
      return () => clearInterval(interval);
    }
  }, [currentFarmer?.id, loadConversations]);

  // 3. Tải tin nhắn của cuộc trò chuyện đang chọn
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const data = await getChatMessages(convId, 'farmer');
      if (data) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
    }
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
      const interval = setInterval(() => loadMessages(selectedConvId), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedConvId, loadMessages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  // 4. Nông hộ gửi tin nhắn
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || sendingMessage) return;

    const senderIdentifier = currentFarmer?.user_id || currentFarmer?.id || user?.id || '';
    if (!senderIdentifier) {
      toast.error('Chưa xác định được danh tính gian hàng');
      return;
    }

    setSendingMessage(true);
    try {
      const res = await sendChatMessage(selectedConvId, senderIdentifier, 'farmer', newMessage.trim());
      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data!]);
        setNewMessage('');
        loadConversations();
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 50);
      } else {
        toast.error('Gửi tin nhắn thất bại, vui lòng thử lại.');
      }
    } catch {
      toast.error('Lỗi kết nối khi gửi tin nhắn');
    } finally {
      setSendingMessage(false);
    }
  };

  // 5. Nông hộ mở chat với Admin Sàn GreenFood
  const handleStartAdminChat = async () => {
    if (!currentFarmer?.id) return;
    try {
      toast.loading('Đang kết nối Ban Quản Trị Sàn...');
      const res = await startFarmerAdminChat(
        currentFarmer.id,
        `Xin chào Ban Quản Trị GreenFood, gian hàng ${currentFarmer.farm_name} cần hỗ trợ vận hành sàn.`
      );
      toast.dismiss();
      if (res.success && res.data) {
        toast.success('Đã kết nối với Ban Quản Trị Sàn GreenFood!');
        await loadConversations();
        setSelectedConvId(res.data.id);
        setTabFilter('farmer_admin');
      }
    } catch {
      toast.dismiss();
      toast.error('Không thể kết nối Ban Quản Trị');
    }
  };

  // 6. Tải đơn hàng gần đây để chọn khách nhắn tin
  const handleOpenCustomerModal = async () => {
    if (!currentFarmer?.id) return;
    setIsCustomerModalOpen(true);
    setLoadingOrders(true);
    try {
      const orders = await getFarmerOrdersApi(currentFarmer.id, { limit: 10 });
      setRecentOrders(orders);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoadingOrders(false);
    }
  };

  // 7. Nông hộ chủ động mở chat với khách hàng từ đơn hàng
  const handleStartCustomerChat = async (order: VendorOrderData) => {
    if (!currentFarmer?.id) return;
    const customerId = order.customer_id || order.order?.customer_id;
    if (!customerId) {
      toast.error('Khách hàng đặt dạng khách vãng lai, vui lòng liên hệ qua số điện thoại!');
      return;
    }

    try {
      toast.loading('Đang mở cuộc trò chuyện với khách...');
      const res = await startFarmerCustomerChat(
        currentFarmer.id,
        customerId,
        order.items?.[0]?.product_id,
        `Dạ chào bạn, nhà vườn ${currentFarmer.farm_name} liên hệ tư vấn về đơn hàng #${order.sub_order_number || order.id} ạ!`
      );
      toast.dismiss();
      if (res.success && res.data) {
        const custName = order.customer_name || order.order?.shipping_address?.full_name || 'khách hàng';
        toast.success(`Đã mở chat với khách hàng ${custName}!`);
        setIsCustomerModalOpen(false);
        await loadConversations();
        setSelectedConvId(res.data.id);
        setTabFilter('customer_farmer');
      }
    } catch {
      toast.dismiss();
      toast.error('Không thể mở chat với khách');
    }
  };

  // Lọc danh sách hội thoại
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      // Lọc tab
      if (tabFilter !== 'all' && c.type !== tabFilter) return false;
      // Lọc tìm kiếm
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const custName = (c.customer?.name || '').toLowerCase();
        const custPhone = (c.customer?.phone || '').toLowerCase();
        const lastMsg = (c.last_message?.message || '').toLowerCase();
        const subject = (c.subject || '').toLowerCase();
        return custName.includes(query) || custPhone.includes(query) || lastMsg.includes(query) || subject.includes(query);
      }
      return true;
    });
  }, [conversations, tabFilter, searchTerm]);

  const selectedConv = useMemo(() => {
    return conversations.find(c => c.id === selectedConvId);
  }, [conversations, selectedConvId]);

  const totalUnread = useMemo(() => {
    return conversations.reduce((acc, cur) => acc + (cur.unread_count || 0), 0);
  }, [conversations]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* ── TOP HEADER KÊNH NGƯỜI BÁN ── */}
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/farmer" 
              className="p-2 bg-emerald-800/80 hover:bg-emerald-700 rounded-xl transition text-emerald-100 flex items-center gap-1.5 text-xs font-semibold"
              title="Về Kênh Quản Lý Nông Hộ"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Kênh Nông Hộ</span>
            </Link>
            <div className="h-6 w-px bg-emerald-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-700/80 flex items-center justify-center text-xl shadow-inner border border-emerald-600">
                💬
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-white tracking-tight">Kênh Chat Nông Hộ</h1>
                  <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Shopee Style
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200">
                  Tương tác 2 chiều với Khách mua hàng & Ban Quản Trị Sàn GreenFood
                </p>
              </div>
            </div>
          </div>

          {/* Chọn Gian Hàng & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Dropdown chọn gian hàng */}
            <div className="flex items-center gap-2 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800">
              <Store size={15} className="text-emerald-400 shrink-0" />
              <select
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer max-w-[160px] md:max-w-[220px] truncate"
              >
                {farmers.map((f) => (
                  <option key={f.id} value={f.id} className="bg-emerald-900 text-white">
                    {f.farm_name}
                  </option>
                ))}
              </select>
            </div>

            {totalUnread > 0 && (
              <span className="bg-rose-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full animate-bounce">
                {totalUnread} tin mới
              </span>
            )}

            {currentFarmer?.id && (
              <Link
                href={`/farmers/${currentFarmer.id}`}
                target="_blank"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-xs font-semibold text-emerald-100 transition shadow-sm"
              >
                <Eye size={14} />
                <span>Xem gian hàng</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── CHAT MAIN WORKSPACE ── */}
      <div className="flex-1 container mx-auto px-4 lg:px-8 py-4 flex flex-col min-h-0">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/90 flex flex-col md:flex-row flex-1 overflow-hidden h-[calc(100vh-6.5rem)]">
          
          {/* CỘT TRÁI: DANH SÁCH TIN NHẮN (380px) */}
          <div className="w-full md:w-88 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
            {/* Top Toolbar */}
            <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MessageCircle size={15} className="text-emerald-600" />
                  Hộp Thư Gian Hàng ({conversations.length})
                </span>
                <button
                  onClick={loadConversations}
                  className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition"
                  title="Làm mới danh sách tin nhắn"
                >
                  <RefreshCw size={15} />
                </button>
              </div>

              {/* Nút hành động nhanh: Chat với Admin Sàn & Khách hàng */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleStartAdminChat}
                  className="py-2 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition shadow-xs"
                >
                  <HeadphonesIcon size={14} />
                  <span>Chat BQT Sàn</span>
                </button>
                <button
                  onClick={handleOpenCustomerModal}
                  className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition shadow-xs"
                >
                  <Plus size={14} />
                  <span>Nhắn Khách Mua</span>
                </button>
              </div>

              {/* Ô tìm kiếm hội thoại */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm khách hàng, số điện thoại, tin nhắn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              {/* 3 Tabs phân loại */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setTabFilter('all')}
                  className={`py-1.5 rounded-lg transition text-center ${
                    tabFilter === 'all' 
                      ? 'bg-white text-emerald-800 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({conversations.length})
                </button>
                <button
                  onClick={() => setTabFilter('customer_farmer')}
                  className={`py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
                    tabFilter === 'customer_farmer' 
                      ? 'bg-white text-blue-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShoppingBag size={12} />
                  Khách mua
                </button>
                <button
                  onClick={() => setTabFilter('farmer_admin')}
                  className={`py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
                    tabFilter === 'farmer_admin' 
                      ? 'bg-white text-purple-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck size={12} />
                  BQT Sàn
                </button>
              </div>
            </div>

            {/* Danh sách cuộc trò chuyện */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <MessageCircle size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold text-slate-600">Chưa có cuộc trò chuyện nào</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hãy bấm &ldquo;Chat BQT Sàn&rdquo; hoặc chờ khách hàng gửi câu hỏi về nông sản!
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isAdminChat = conv.type === 'farmer_admin';
                  const title = isAdminChat
                    ? 'Ban Quản Trị Sàn GreenFood'
                    : (conv.customer?.name || 'Khách Mua Hàng');
                  const isSelected = selectedConvId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`p-3.5 cursor-pointer transition-all hover:bg-emerald-50/50 ${
                        isSelected 
                          ? 'bg-emerald-50/90 border-l-4 border-l-emerald-600 shadow-xs' 
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAdminChat
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {isAdminChat ? (
                              <ShieldCheck size={18} />
                            ) : (
                              cleanVietnameseMojibake(title).charAt(0).toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {cleanVietnameseMojibake(title)}
                              </p>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                isAdminChat 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {isAdminChat ? 'BQT Sàn' : 'Khách Mua'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                              {cleanVietnameseMojibake(conv.last_message?.message || conv.subject)}
                            </p>
                          </div>
                        </div>

                        {conv.unread_count > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-extrabold rounded-full px-1.5 py-0.5 shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <span>
                          {conv.product?.name ? `📦 ${conv.product.name}` : (isAdminChat ? 'Hỗ trợ sàn' : 'Tư vấn nông sản')}
                        </span>
                        <span>{conv.updated_at}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CỘT PHẢI: KHUNG CHAT CHI TIẾT */}
          <div className="flex-1 flex flex-col bg-white">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/40 p-6">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <MessageCircle size={32} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Chọn cuộc trò chuyện để trả lời</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Nông hộ có thể giải đáp các thắc mắc về rau củ, trái cây cho người mua hoặc trao đổi trực tiếp với Ban Quản Trị GreenFood.
                  </p>
                  <button
                    onClick={handleStartAdminChat}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shadow-sm inline-flex items-center gap-1.5"
                  >
                    <HeadphonesIcon size={14} />
                    <span>Mở Chat Với BQT Sàn</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Partner Header */}
                {(() => {
                  const isAdminChat = selectedConv.type === 'farmer_admin';
                  const partnerTitle = isAdminChat 
                    ? 'Ban Quản Trị Sàn GreenFood' 
                    : (selectedConv.customer?.name || 'Khách Mua Hàng');
                  const partnerPhone = selectedConv.customer?.phone;
                  const partnerEmail = selectedConv.customer?.email;

                  return (
                    <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                          isAdminChat
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {isAdminChat ? <ShieldCheck size={22} /> : cleanVietnameseMojibake(partnerTitle).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base">
                              {cleanVietnameseMojibake(partnerTitle)}
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isAdminChat 
                                ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {isAdminChat ? 'Kênh Hỗ Trợ Sàn' : 'Khách Mua Hàng'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            {partnerPhone && (
                              <a href={`tel:${partnerPhone}`} className="hover:text-emerald-600 font-semibold flex items-center gap-1">
                                <Phone size={11} /> {partnerPhone}
                              </a>
                            )}
                            {partnerEmail && <span>• {partnerEmail}</span>}
                            {isAdminChat && <span>Đội ngũ Giám sát & Vận hành Sàn GreenFood 24/7</span>}
                          </p>
                        </div>
                      </div>

                      {partnerPhone && (
                        <a 
                          href={`tel:${partnerPhone}`}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Phone size={13} />
                          <span className="hidden sm:inline">Gọi Khách</span>
                        </a>
                      )}
                    </div>
                  );
                })()}

                {/* Banner Nông sản khách đang quan tâm */}
                {selectedConv.product && (
                  <div className="p-2.5 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-amber-100 text-amber-900 rounded-lg shrink-0">
                        <ShoppingBag size={15} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider block">
                          Nông sản khách đang hỏi tư vấn:
                        </span>
                        <p className="font-bold text-slate-900 truncate">
                          {selectedConv.product.name}
                        </p>
                      </div>
                    </div>
                    {selectedConv.product.slug && (
                      <Link
                        href={`/product/${selectedConv.product.slug}`}
                        target="_blank"
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold shrink-0 transition"
                      >
                        Xem sản phẩm
                      </Link>
                    )}
                  </div>
                )}

                {/* Bong bóng tin nhắn */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Chưa có tin nhắn nào trong cuộc trò chuyện này. Hãy gửi phản hồi đầu tiên!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_role === 'farmer';
                      const isAdmin = msg.sender_role === 'admin';

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : isAdmin
                              ? 'bg-purple-100 text-purple-950 border border-purple-200 rounded-bl-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                          }`}>
                            {!isMe && (
                              <div className="flex items-center gap-1 font-bold text-[10px] mb-1 opacity-80">
                                {isAdmin ? <ShieldCheck size={11} className="text-purple-700" /> : <User size={11} />}
                                <span>{msg.sender_name || (isAdmin ? 'Ban Quản Trị Sàn' : 'Khách Mua')}</span>
                              </div>
                            )}

                            <p className="whitespace-pre-wrap leading-relaxed break-words font-normal">
                              {cleanVietnameseMojibake(msg.message)}
                            </p>

                            <div className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                              isMe ? 'text-white/70' : 'text-slate-400'
                            }`}>
                              <span>{formatChatTime(msg)}</span>
                              {isMe && <Check size={10} />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Mẫu phản hồi nhanh chuẩn Shopee Seller */}
                <div className="px-3.5 pt-2 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1 border-t border-slate-100">
                  <span className="text-slate-400 shrink-0 text-[10px] font-bold">Mẫu nhanh:</span>
                  <button
                    type="button"
                    onClick={() => setNewMessage('Dạ chào bạn, nông sản bên nhà vườn vừa thu hái tươi mới 100% hôm nay ạ!')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-full shrink-0 transition"
                  >
                    🌿 Nông sản vừa thu hái 100%
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessage('Đơn hàng của bạn đã được nhà vườn đóng gói cẩn thận và gửi đối tác GHN rồi nhé!')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-full shrink-0 transition"
                  >
                    📦 Đã chuẩn bị gửi GHN
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessage('Dạ chào BQT Sàn, gian hàng cần hỗ trợ đối soát doanh thu và duyệt nông sản ạ!')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 rounded-full shrink-0 transition"
                  >
                    💬 Yêu cầu BQT sàn hỗ trợ
                  </button>
                </div>

                {/* Form gửi tin nhắn */}
                <div className="p-3 border-t border-slate-200 bg-white">
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={
                        selectedConv.type === 'farmer_admin'
                          ? 'Nhập nội dung trao đổi với Ban Quản Trị Sàn...'
                          : 'Nhập nội dung tư vấn cho khách hàng...'
                      }
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                    >
                      <Send size={14} />
                      <span>Gửi</span>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL CHỌN KHÁCH HÀNG ĐỂ NHẮN TIN CHĂM SÓC ── */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Chọn Khách Hàng Đã Mua Để Nhắn Tin</h3>
                  <p className="text-[11px] text-slate-500">Gửi thông báo tiến độ đóng gói & CSKH</p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {loadingOrders ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                  Đang tải danh sách khách mua...
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Chưa có đơn hàng nào từ khách.
                </div>
              ) : (
                recentOrders.map((ord) => {
                  const custName = ord.customer_name || ord.order?.shipping_address?.full_name || 'Khách hàng';
                  const custPhone = ord.customer_phone || ord.order?.shipping_address?.phone || '';

                  return (
                    <div
                      key={ord.id}
                      className="p-3 border border-slate-200 rounded-xl hover:bg-emerald-50/50 transition flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-slate-900">{custName}</p>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                            #{ord.sub_order_number}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          SĐT: {custPhone || 'Chưa cập nhật'} • {ord.items?.[0]?.product_name || 'Nông sản'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleStartCustomerChat(ord)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs shrink-0"
                      >
                        <MessageCircle size={13} />
                        <span>Mở Chat</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 text-right">
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
