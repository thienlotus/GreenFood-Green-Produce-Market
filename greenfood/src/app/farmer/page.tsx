"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  Tractor, Package, TrendingUp, DollarSign, Plus, Eye, 
  CheckCircle, AlertCircle, RefreshCw, Store, Settings, 
  MapPin, Phone, ShieldCheck, Leaf, Sparkles, Lock, ArrowLeft,
  Truck, Clock, CreditCard, Wallet, ArrowUpRight, FileText,
  Building2, Check, X, Search, Filter, MessageCircle, Send,
  User as UserIcon, ShoppingBag, HeadphonesIcon, Edit2, Trash2,
  Image as ImageIcon, History, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getAdminFarmersApi, 
  updateFarmerProfileApi, 
  getFarmerOrdersApi, 
  updateFarmerOrderStatusApi, 
  getFarmerWalletApi, 
  updateFarmerBankApi,
  requestFarmerWithdrawalApi,
  getFarmerWithdrawalsApi,
  FarmerWithdrawalRequest,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  VendorOrderData,
  FarmerWalletData
} from '@/lib/api';
import { 
  getChatConversations, 
  getChatMessages, 
  sendChatMessage, 
  startFarmerAdminChat, 
  formatChatTime,
  ChatConversation, 
  ChatMessageItem 
} from '@/lib/chatApi';
import { cleanVietnameseMojibake } from '@/data/vietnamAddress';
import { resolveCoordinatesFromAddress } from '@/lib/geoUtils';
import { useAuthStore } from '@/store/useAuthStore';

const PRODUCT_CATEGORIES = [
  { id: 1, name: 'Trái cây tươi' },
  { id: 2, name: 'Rau củ hữu cơ' },
  { id: 3, name: 'Nấm sạch VietGAP' },
  { id: 4, name: 'Trà & Cà phê' },
  { id: 5, name: 'Gạo & Nông sản khô' },
  { id: 6, name: 'Gia vị truyền thống' },
  { id: 7, name: 'Đặc sản vùng miền' },
];

const SAMPLE_PRODUCT_IMAGES = [
  { label: 'Sầu riêng Ri6', url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=500' },
  { label: 'Bưởi da xanh', url: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=500' },
  { label: 'Rau hữu cơ', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500' },
  { label: 'Cà chua bi', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500' },
  { label: 'Nấm tươi', url: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=500' },
  { label: 'Trà xanh / Chè', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500' },
  { label: 'Cà phê Robusta', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500' },
  { label: 'Mật ong rừng', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500' },
];

export default function FarmerPortalPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [farmers, setFarmers] = useState<any[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'wallet' | 'products' | 'profile' | 'chat'>('dashboard');

  // Shopee Chat State cho Kênh Người Bán Nông Hộ
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [newChatMessage, setNewChatMessage] = useState<string>('');
  const [chatTabFilter, setChatTabFilter] = useState<'all' | 'customer_farmer' | 'farmer_admin'>('all');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [farmerUnreadChatCount, setFarmerUnreadChatCount] = useState<number>(0);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const previousUnreadCountRef = useRef<number>(0);

  // Vendor Orders State
  const [orders, setOrders] = useState<VendorOrderData[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Vendor Wallet & Withdrawal State
  const [wallet, setWallet] = useState<FarmerWalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    bank_account_number: '',
    bank_account_name: ''
  });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawals, setWithdrawals] = useState<FarmerWithdrawalRequest[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawNote, setWithdrawNote] = useState<string>('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Farmer Products Management State
  const [farmerProducts, setFarmerProducts] = useState<any[]>([]);
  const [farmerProductsLoading, setFarmerProductsLoading] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: 1,
    price: '',
    unit: '1kg',
    stock: '100',
    badge: 'Chính vụ VietGAP',
    image_url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=500',
    description: '',
    is_seasonal: true,
  });
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form State cho Tab Profile
  const [profileForm, setProfileForm] = useState({
    farm_name: '',
    address: '',
    latitude: '',
    longitude: '',
    specialty: '',
    story: '',
    ghn_province_id: '',
    ghn_district_id: '',
    ghn_ward_code: '',
    ghn_address: '',
    ghn_shop_id: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // 3 Nông hộ đại diện 3 miền chuẩn mã Giao Hàng Nhanh (GHN) từ app 5sao.dev
  const GHN_DEMO_PRESETS = [
    {
      region: 'Miền Bắc',
      name: 'Trang Trại Mộc Châu',
      shop_id: 217561,
      province_id: 266,
      district_id: 1976,
      ward_code: '141015',
      address: 'Trang Trại Cờ Đỏ Mộc Châu, Phường Mộc Lỵ, Huyện Mộc Châu, Sơn La'
    },
    {
      region: 'Miền Trung / Tây Nguyên',
      name: 'Nông Trại Xanh Đà Lạt',
      shop_id: 227221,
      province_id: 209,
      district_id: 2104,
      ward_code: '91597',
      address: 'Nhà Văn Hóa Thôn Đạ Nhar Thôn Đạ Nhar, Xã Quốc Oai, Huyện Đạ Huoai, Lâm Đồng'
    },
    {
      region: 'Miền Nam',
      name: 'Vườn Trái Cây Chú Ba',
      shop_id: 217559,
      province_id: 213,
      district_id: 3158,
      ward_code: '560301',
      address: 'Khu Pho 2 Thi Tran Cho Lach Huyen Cho Lach Tinh Ben Tre, Thị trấn Chợ Lách, Huyện Chợ Lách, Bến Tre'
    }
  ];

  const handleApplyGhnPreset = (preset: typeof GHN_DEMO_PRESETS[0]) => {
    setProfileForm(prev => ({
      ...prev,
      ghn_shop_id: String(preset.shop_id),
      ghn_province_id: String(preset.province_id),
      ghn_district_id: String(preset.district_id),
      ghn_ward_code: preset.ward_code,
      ghn_address: preset.address
    }));
    toast.success(`Đã chọn kho GHN #${preset.shop_id} (${preset.region}): ${preset.name}`);
  };

  // Load và phân quyền bảo mật dữ liệu gian hàng
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAdminFarmersApi();
        if (Array.isArray(data) && data.length > 0) {
          if (!isAdmin) {
            // NÔNG HỘ THÔNG THƯỜNG: CHỈ ĐƯỢC PHÉP TRUY CẬP VÀ XEM DỮ LIỆU CỦA CHÍNH MÌNH
            const myFarm = data.find((f: any) => {
              if (f.user_id && user?.id && String(f.user_id) === String(user.id)) return true;
              if (f.user?.email && user?.email && f.user.email.toLowerCase() === user.email.toLowerCase()) return true;
              if (f.user?.phone && user?.phone && f.user.phone === user.phone) return true;
              if (user?.farmName && (f.farm_name || '').toLowerCase().includes(user.farmName.toLowerCase())) return true;
              if (user?.name && ((f.farm_name || '').toLowerCase().includes(user.name.toLowerCase()) || (f.user?.name && f.user.name.toLowerCase().includes(user.name.toLowerCase())))) return true;
              if (
                ((user?.email && (user.email.includes('thieuhung') || user.email.includes('0912'))) ||
                 (user?.name && (user.name.toLowerCase().includes('thiều hưng') || user.name.toLowerCase().includes('hưng')))) &&
                ((f.farm_name || '').toLowerCase().includes('thiều hưng') || String(f.id) === '01a111cf-de77-727c-bf12-292c04160d6c')
              ) {
                return true;
              }
              if (typeof window !== 'undefined') {
                const savedId = localStorage.getItem('gf_my_store_id');
                if (savedId && savedId === f.id) return true;
              }
              return false;
            });

            if (myFarm) {
              setFarmers([myFarm]);
              setSelectedFarmerId(myFarm.id);
            } else {
              setFarmers([]);
              setSelectedFarmerId('');
            }
          } else {
            // QUẢN TRỊ VIÊN: Cho phép quản trị và hỗ trợ tất cả các gian hàng
            setFarmers(data);
            setSelectedFarmerId(prev => prev || data[0].id);
          }
        } else {
          setFarmers([]);
          setSelectedFarmerId('');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu kênh người bán', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, isAdmin]);

  // Gian hàng hiện tại được cấp quyền quản lý
  const currentFarmer = useMemo(() => {
    if (farmers.length === 0) return null;
    return farmers.find(f => f.id === selectedFarmerId) || farmers[0] || null;
  }, [farmers, selectedFarmerId]);

  // Load danh sách đơn hàng của Nông Hộ (Vendor Orders)
  const loadOrders = useCallback(async () => {
    if (!currentFarmer?.id) return;
    setOrdersLoading(true);
    try {
      const data = await getFarmerOrdersApi(currentFarmer.id, {
        status: orderFilterStatus,
        search: orderSearch
      });
      setOrders(data);
    } catch (err) {
      console.error('Lỗi tải đơn hàng nông hộ:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [currentFarmer?.id, orderFilterStatus, orderSearch]);

  // Load thông tin ví tiền của Nông Hộ (Vendor Wallet)
  const loadWallet = useCallback(async () => {
    if (!currentFarmer?.id) return;
    setWalletLoading(true);
    try {
      const data = await getFarmerWalletApi(currentFarmer.id);
      if (data) {
        setWallet(data);
        setBankForm({
          bank_name: data.bank_info?.bank_name || '',
          bank_account_number: data.bank_info?.bank_account_number || '',
          bank_account_name: data.bank_info?.bank_account_name || ''
        });
      }
    } catch (err) {
      console.error('Lỗi tải thông tin ví nông hộ:', err);
    } finally {
      setWalletLoading(false);
    }
  }, [currentFarmer?.id]);

  // Load danh sách sản phẩm nông hộ
  const loadFarmerProducts = useCallback(async () => {
    if (!currentFarmer?.id) return;
    setFarmerProductsLoading(true);
    try {
      const data = await getProducts({ farmer_id: currentFarmer.id, limit: 100 });
      if (Array.isArray(data)) {
        setFarmerProducts(data);
      } else {
        setFarmerProducts(currentFarmer.products || []);
      }
    } catch (err) {
      console.error('Lỗi tải sản phẩm nông hộ:', err);
      setFarmerProducts(currentFarmer.products || []);
    } finally {
      setFarmerProductsLoading(false);
    }
  }, [currentFarmer?.id, currentFarmer?.products]);

  // Load lịch sử rút tiền của nông hộ
  const loadWithdrawals = useCallback(async () => {
    if (!currentFarmer?.id) return;
    setWithdrawalsLoading(true);
    try {
      const data = await getFarmerWithdrawalsApi(currentFarmer.id);
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải lịch sử rút tiền:', err);
    } finally {
      setWithdrawalsLoading(false);
    }
  }, [currentFarmer?.id]);

  useEffect(() => {
    if (currentFarmer?.id) {
      loadOrders();
      loadWallet();
      loadWithdrawals();
      loadFarmerProducts();
    }
  }, [currentFarmer?.id, loadOrders, loadWallet, loadWithdrawals, loadFarmerProducts]);

  useEffect(() => {
    if (currentFarmer) {
      setProfileForm({
        farm_name: currentFarmer.farm_name || '',
        address: currentFarmer.address || '',
        latitude: currentFarmer.latitude ? String(currentFarmer.latitude) : '',
        longitude: currentFarmer.longitude ? String(currentFarmer.longitude) : '',
        specialty: currentFarmer.specialty || '',
        story: currentFarmer.story || '',
        ghn_province_id: currentFarmer.ghn_province_id ? String(currentFarmer.ghn_province_id) : '',
        ghn_district_id: currentFarmer.ghn_district_id ? String(currentFarmer.ghn_district_id) : '',
        ghn_ward_code: currentFarmer.ghn_ward_code ? String(currentFarmer.ghn_ward_code) : '',
        ghn_address: currentFarmer.ghn_address || '',
        ghn_shop_id: currentFarmer.ghn_shop_id ? String(currentFarmer.ghn_shop_id) : ''
      });
    }
  }, [currentFarmer]);

  // Load danh sách hội thoại của Nông Hộ (Shopee Multi-Vendor Chat)
  const loadFarmerChats = useCallback(async (isSilent = false) => {
    if (!currentFarmer?.id) return;
    try {
      const data = await getChatConversations({ farmer_id: currentFarmer.id, role: 'farmer' });
      setChatConversations(data);
      const unread = data.reduce((acc, cur) => acc + (cur.unread_count || 0), 0);
      setFarmerUnreadChatCount(unread);

      // Nếu có tin nhắn mới phát sinh từ khách hàng
      if (isSilent && unread > previousUnreadCountRef.current) {
        const newlyUnread = data.find(c => (c.unread_count || 0) > 0);
        if (newlyUnread) {
          const senderName = newlyUnread.customer?.name || (newlyUnread.type === 'farmer_admin' ? 'Ban Quản Trị Sàn' : 'Khách mua');
          toast.success(`💬 Có tin nhắn mới từ: ${senderName}`, {
            duration: 4500,
            icon: '🔔',
          });
        }
      }
      previousUnreadCountRef.current = unread;

      // Đồng bộ cuộc trò chuyện đang chọn
      setSelectedChatId((prevSelected) => {
        if (!prevSelected && data.length > 0) {
          const unreadConv = data.find(c => (c.unread_count || 0) > 0);
          return unreadConv ? unreadConv.id : data[0].id;
        }
        if (prevSelected && !data.some(c => c.id === prevSelected) && data.length > 0) {
          return data[0].id;
        }
        return prevSelected;
      });
    } catch (err) {
      console.error('Lỗi tải chat nông hộ:', err);
    }
  }, [currentFarmer?.id]);

  useEffect(() => {
    if (currentFarmer?.id) {
      loadFarmerChats(false);
    }
  }, [currentFarmer?.id, loadFarmerChats]);

  // Tự động làm mới tin nhắn khi ở tab chat (polling nhanh 2.5s)
  useEffect(() => {
    if (activeTab === 'chat' && currentFarmer?.id) {
      loadFarmerChats(false);
      const interval = setInterval(() => loadFarmerChats(true), 2500);
      return () => clearInterval(interval);
    }
  }, [activeTab, currentFarmer?.id, loadFarmerChats]);

  // Load tin nhắn chi tiết của hội thoại đang chọn
  const loadFarmerChatMessages = useCallback(async (convId: string) => {
    try {
      const res = await getChatMessages(convId, 'farmer');
      if (res) {
        setChatMessages(res.messages);
      }
    } catch (err) {
      console.error('Lỗi tải tin nhắn nông hộ:', err);
    }
  }, []);

  useEffect(() => {
    if (selectedChatId && activeTab === 'chat') {
      loadFarmerChatMessages(selectedChatId);
      const interval = setInterval(() => loadFarmerChatMessages(selectedChatId), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedChatId, activeTab, loadFarmerChatMessages]);

  // Tự động cuộn NỘI BỘ khung chat (KHÔNG cuộn toàn trang window ra footer)
  useEffect(() => {
    if (chatMessagesContainerRef.current) {
      const container = chatMessagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      // Chỉ cuộn xuống đáy nếu người dùng đang đứng ở sát đáy (để không làm giật màn hình khi họ cuộn lên đọc tin nhắn cũ)
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [chatMessages]);

  // Nông hộ gửi tin nhắn
  const handleSendFarmerMessage = async () => {
    const senderId = currentFarmer?.user_id || user?.id || currentFarmer?.id;
    if (!newChatMessage.trim() || !selectedChatId || !senderId || chatSending) return;
    setChatSending(true);
    try {
      const res = await sendChatMessage(selectedChatId, senderId, 'farmer', newChatMessage.trim());
      if (res.success && res.data) {
        setChatMessages(prev => [...prev, res.data!]);
        setNewChatMessage('');
        loadFarmerChats();
        setTimeout(() => {
          if (chatMessagesContainerRef.current) {
            chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
          }
        }, 50);
      } else {
        toast.error('Gửi tin nhắn thất bại!');
      }
    } catch {
      toast.error('Lỗi kết nối khi gửi tin nhắn');
    } finally {
      setChatSending(false);
    }
  };

  // Nông hộ chủ động mở chat với Admin Sàn (Shopee Vendor Support)
  const handleStartAdminSupportChat = async () => {
    if (!currentFarmer?.id) return;
    try {
      toast.loading('Đang kết nối Ban Quản Trị Sàn...');
      const res = await startFarmerAdminChat(
        currentFarmer.id,
        `Xin chào Ban Quản Trị GreenFood, gian hàng ${currentFarmer.farm_name} cần hỗ trợ vận hành sàn.`
      );
      toast.dismiss();
      if (res.success && res.data) {
        toast.success('Đã kết nối với Ban Quản Trị Sàn!');
        await loadFarmerChats();
        setSelectedChatId(res.data.id);
        setActiveTab('chat');
      }
    } catch {
      toast.dismiss();
      toast.error('Không thể kết nối Ban Quản Trị');
    }
  };

  // Cập nhật trạng thái đơn hàng (Đóng gói, giao hàng, v.v.)
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    if (!currentFarmer?.id) return;
    setUpdatingOrderId(orderId);
    try {
      const res = await updateFarmerOrderStatusApi(currentFarmer.id, orderId, nextStatus);
      if (res.success) {
        toast.success(`Đã cập nhật trạng thái đơn: ${nextStatus}`);
        await loadOrders();
        await loadWallet();
      } else {
        toast.error(res.message || 'Cập nhật trạng thái thất bại');
      }
    } catch {
      toast.error('Lỗi kết nối khi cập nhật đơn hàng');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Lưu thông tin ngân hàng nhận tiền
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarmer?.id) return;
    if (!bankForm.bank_name.trim() || !bankForm.bank_account_number.trim() || !bankForm.bank_account_name.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin tài khoản ngân hàng');
      return;
    }

    setIsSavingBank(true);
    try {
      const res = await updateFarmerBankApi(currentFarmer.id, bankForm);
      if (res.success) {
        toast.success(res.message || 'Đã lưu tài khoản ngân hàng!');
        await loadWallet();
      } else {
        toast.error(res.message || 'Lỗi lưu thông tin ngân hàng');
      }
    } catch {
      toast.error('Lỗi kết nối khi lưu tài khoản');
    } finally {
      setIsSavingBank(false);
    }
  };

  // Mở modal yêu cầu rút tiền về ngân hàng
  const handleOpenWithdrawModal = () => {
    if (!wallet || wallet.balance_available < 50000) {
      toast.error('Số dư khả dụng tối thiểu để tạo lệnh rút là 50.000đ');
      return;
    }
    if (!bankForm.bank_account_number.trim() || !bankForm.bank_name.trim()) {
      toast.error('Vui lòng lưu thông tin tài khoản ngân hàng trước khi gửi yêu cầu rút tiền');
      return;
    }
    setWithdrawAmount(String(Math.floor(wallet.balance_available)));
    setWithdrawNote('');
    setIsWithdrawModalOpen(true);
  };

  // Gửi form yêu cầu rút tiền đến Ban Quản Trị
  const handleSubmitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarmer?.id) return;
    const numAmount = parseFloat(withdrawAmount);
    if (isNaN(numAmount) || numAmount < 50000) {
      toast.error('Số tiền rút tối thiểu là 50.000đ');
      return;
    }
    if (wallet && numAmount > wallet.balance_available) {
      toast.error(`Số dư khả dụng không đủ (tối đa ${wallet.balance_available.toLocaleString('vi-VN')}đ)`);
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await requestFarmerWithdrawalApi(currentFarmer.id, {
        amount: numAmount,
        bank_name: bankForm.bank_name.trim(),
        bank_account_number: bankForm.bank_account_number.trim(),
        bank_account_name: bankForm.bank_account_name.trim(),
        farmer_note: withdrawNote.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message || 'Đã gửi yêu cầu rút tiền tới Ban Quản Trị thành công!');
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
        setWithdrawNote('');
        await Promise.all([loadWallet(), loadWithdrawals()]);
      } else {
        toast.error(res.message || 'Gửi yêu cầu rút tiền thất bại');
      }
    } catch {
      toast.error('Lỗi kết nối khi gửi yêu cầu rút tiền');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // Quản lý sản phẩm nông sản của nông hộ
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category_id: 1,
      price: '',
      unit: '1kg',
      stock: '100',
      badge: 'Chính vụ VietGAP',
      image_url: SAMPLE_PRODUCT_IMAGES[0].url,
      description: `Nông sản tươi sạch thu hoạch trực tiếp tại ${currentFarmer?.farm_name || 'vườn'}, không chất bảo quản, đạt chuẩn an toàn vệ sinh thực phẩm.`,
      is_seasonal: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    const variant = prod.variants?.[0];
    setProductForm({
      name: prod.name || '',
      category_id: prod.category_id || prod.category?.id || 1,
      price: String(variant?.price || prod.priceNum || prod.price || ''),
      unit: variant?.unit || prod.unit || '1kg',
      stock: String(variant?.stock_quantity ?? prod.stock ?? 100),
      badge: prod.badge || 'Chính vụ VietGAP',
      image_url: prod.image_url || prod.images?.[0] || '',
      description: prod.description || '',
      is_seasonal: Boolean(prod.is_seasonal ?? true),
    });
    setIsProductModalOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarmer?.id) return;
    if (!productForm.name.trim()) {
      toast.error('Vui lòng nhập tên nông sản');
      return;
    }
    const numPrice = parseFloat(productForm.price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error('Vui lòng nhập giá bán hợp lệ');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      if (editingProduct) {
        // Cập nhật sản phẩm
        const res = await updateProduct(editingProduct.id, {
          name: productForm.name.trim(),
          category_id: Number(productForm.category_id),
          price: numPrice,
          unit: productForm.unit.trim() || '1kg',
          stock: parseInt(productForm.stock) || 100,
          badge: productForm.badge.trim(),
          image_url: productForm.image_url.trim() || undefined,
          description: productForm.description.trim() || undefined,
          is_seasonal: productForm.is_seasonal,
        });

        if (res.success) {
          toast.success('Cập nhật nông sản thành công!');
          setIsProductModalOpen(false);
          await loadFarmerProducts();
        } else {
          toast.error(res.message || 'Cập nhật nông sản thất bại');
        }
      } else {
        // Tạo sản phẩm mới gắn liền với farmer_id
        const res = await createProduct({
          name: productForm.name.trim(),
          category_id: Number(productForm.category_id),
          farmer_id: currentFarmer.id,
          price: numPrice,
          unit: productForm.unit.trim() || '1kg',
          stock: parseInt(productForm.stock) || 100,
          badge: productForm.badge.trim(),
          image_url: productForm.image_url.trim() || SAMPLE_PRODUCT_IMAGES[0].url,
          description: productForm.description.trim() || undefined,
          is_seasonal: productForm.is_seasonal,
        });

        if (res.success) {
          toast.success(`Đã thêm nông sản "${productForm.name.trim()}" vào gian hàng thành công!`);
          setIsProductModalOpen(false);
          await loadFarmerProducts();
        } else {
          toast.error(res.message || 'Thêm nông sản thất bại');
        }
      }
    } catch {
      toast.error('Lỗi kết nối khi lưu nông sản');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string | number, productName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nông sản "${productName}" khỏi gian hàng?`)) {
      return;
    }
    setDeletingProductId(String(productId));
    try {
      const res = await deleteProduct(productId);
      if (res.success) {
        toast.success(`Đã xóa nông sản "${productName}"`);
        setFarmerProducts(prev => prev.filter(p => String(p.id) !== String(productId)));
      } else {
        toast.error(res.message || 'Xóa sản phẩm thất bại');
      }
    } catch {
      toast.error('Lỗi khi xóa sản phẩm');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleAutoGeocode = () => {
    if (!profileForm.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ trước khi lấy tọa độ!');
      return;
    }
    const geo = resolveCoordinatesFromAddress(profileForm.address);
    setProfileForm(prev => ({
      ...prev,
      latitude: String(geo.lat),
      longitude: String(geo.lng)
    }));
    toast.success(`Đã định vị tọa độ tại tỉnh ${geo.provinceName} (${geo.lat}, ${geo.lng})`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarmer?.id) return;
    if (!profileForm.farm_name.trim() || !profileForm.address.trim()) {
      toast.error('Vui lòng nhập tên nông trại và địa chỉ!');
      return;
    }

    setIsSavingProfile(true);
    try {
      let lat = profileForm.latitude ? parseFloat(profileForm.latitude) : undefined;
      let lng = profileForm.longitude ? parseFloat(profileForm.longitude) : undefined;

      if (!lat || !lng) {
        const geo = resolveCoordinatesFromAddress(profileForm.address);
        lat = geo.lat;
        lng = geo.lng;
      }

      const ghnProvince = profileForm.ghn_province_id ? parseInt(profileForm.ghn_province_id) : undefined;
      const ghnDistrict = profileForm.ghn_district_id ? parseInt(profileForm.ghn_district_id) : undefined;
      const ghnWard = profileForm.ghn_ward_code.trim() || undefined;
      const ghnAddress = profileForm.ghn_address.trim() || undefined;
      const ghnShopId = profileForm.ghn_shop_id ? parseInt(profileForm.ghn_shop_id) : undefined;

      const res = await updateFarmerProfileApi(currentFarmer.id, {
        farm_name: profileForm.farm_name.trim(),
        address: profileForm.address.trim(),
        latitude: lat,
        longitude: lng,
        specialty: profileForm.specialty.trim() || undefined,
        story: profileForm.story.trim() || undefined,
        ghn_province_id: ghnProvince,
        ghn_district_id: ghnDistrict,
        ghn_ward_code: ghnWard,
        ghn_address: ghnAddress,
        ghn_shop_id: ghnShopId,
        is_verified: false
      });

      if (res.success) {
        if (typeof window !== 'undefined') {
          const reqItem = {
            farmerId: currentFarmer.id,
            farmName: profileForm.farm_name.trim(),
            updatedAt: new Date().toISOString(),
            status: 'pending'
          };
          const existing = JSON.parse(localStorage.getItem('gf_admin_farmer_requests') || '[]');
          localStorage.setItem('gf_admin_farmer_requests', JSON.stringify([reqItem, ...existing]));
        }

        toast.success('Đã lưu cập nhật và gửi yêu cầu phê duyệt tới Ban Quản Trị!');
        setFarmers(prev => prev.map(f => f.id === currentFarmer.id ? { 
          ...f, 
          ...res.data, 
          is_verified: false,
          farm_name: profileForm.farm_name.trim(),
          address: profileForm.address.trim(),
          latitude: lat,
          longitude: lng,
          specialty: profileForm.specialty.trim(),
          story: profileForm.story.trim(),
          ghn_province_id: ghnProvince,
          ghn_district_id: ghnDistrict,
          ghn_ward_code: ghnWard,
          ghn_address: ghnAddress,
          ghn_shop_id: ghnShopId
        } : f));
      } else {
        toast.error(res.message || 'Cập nhật thất bại');
      }
    } catch {
      toast.error('Lỗi khi lưu thông tin gian hàng');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const products = currentFarmer?.products || [];
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Banner Header */}
      <div className="bg-emerald-900 text-white">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 flex items-center justify-center text-2xl shadow-inner border border-emerald-600">
                👨‍🌾
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">Kênh Người Bán Nông Hộ</h1>
                  <span className="bg-emerald-600 text-emerald-100 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    Sàn TMĐT GreenFood
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Nền tảng vận hành nông sản sạch trực tiếp từ nông trại đến người tiêu dùng.
                </p>
              </div>
            </div>

            {/* Vùng chọn gian hàng */}
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-emerald-950/70 p-2 rounded-xl border border-emerald-800">
                <span className="text-xs text-amber-300 font-bold whitespace-nowrap pl-2 flex items-center gap-1">
                  <ShieldCheck size={14} /> Chế độ Quản trị:
                </span>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  className="bg-emerald-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-700 focus:outline-none"
                >
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.farm_name} ({f.region?.name || 'VN'})
                    </option>
                  ))}
                </select>
                {currentFarmer?.id && (
                  <Link
                    href={`/farmers/${currentFarmer.id}`}
                    target="_blank"
                    className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors"
                    title="Xem gian hàng công khai"
                  >
                    <Eye size={16} />
                  </Link>
                )}
              </div>
            ) : (
              currentFarmer && (
                <div className="flex items-center gap-2 bg-emerald-950/70 px-3.5 py-2 rounded-xl border border-emerald-800">
                  <span className="text-xs text-emerald-300 font-medium whitespace-nowrap">Gian hàng của bạn:</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    🌱 {currentFarmer.farm_name}
                  </span>
                  <Link
                    href={`/farmers/${currentFarmer.id}`}
                    target="_blank"
                    className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors ml-1"
                    title="Xem gian hàng công khai của bạn"
                  >
                    <Eye size={15} />
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Navigation Submenu */}
          {currentFarmer && (
            <div className="flex items-center gap-2 mt-6 border-t border-emerald-800/80 pt-4 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'dashboard' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <TrendingUp size={14} /> Tổng quan kinh doanh
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'orders' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <Truck size={14} /> Quản lý Đơn hàng ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'wallet' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <Wallet size={14} /> Ví Doanh Thu & Đối Soát
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'products' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <Package size={14} /> Nông sản vụ mùa ({totalProducts})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'profile' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <Store size={14} /> Hồ sơ nhà vườn & GPS
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'chat' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <MessageCircle size={14} /> Tin nhắn Shopee Chat
                {farmerUnreadChatCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {farmerUnreadChatCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 lg:px-8 mt-6">
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <RefreshCw className="animate-spin inline-block mr-2" size={24} />
            Đang tải dữ liệu kênh người bán...
          </div>
        ) : !currentFarmer ? (
          <div className="bg-white rounded-3xl p-10 md:p-14 text-center max-w-xl mx-auto shadow-sm border border-gray-100 my-10">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🌱
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa có gian hàng nông hộ trên hệ thống</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Tài khoản ({user?.email || user?.name || 'hiện tại'}) chưa liên kết với gian hàng nông hộ nào. Vui lòng đăng ký mở gian hàng đối tác để bắt đầu kinh doanh nông sản sạch trên sàn GreenFood.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/farmers"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm"
              >
                <ArrowLeft size={16} /> Xem các gian hàng đối tác
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── TAB 1: DASHBOARD OVERVIEW ── */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 4 Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Số dư khả dụng trong ví</span>
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Wallet size={18} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {wallet ? `${wallet.balance_available.toLocaleString('vi-VN')}đ` : '0đ'}
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Có thể rút về tài khoản ngân hàng
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Doanh thu gộp đã giao</span>
                      <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                        <DollarSign size={18} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {wallet ? `${wallet.total_gross_revenue.toLocaleString('vi-VN')}đ` : '0đ'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Chiết khấu sàn: {wallet?.commission_rate || 8}%
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Đơn hàng phân bổ</span>
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <Truck size={18} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {orders.length} đơn
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {orders.filter(o => o.status === 'PENDING').length} đơn đang chờ xác nhận
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Đánh giá & Bảo chứng</span>
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <ShieldCheck size={18} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                      ⭐ {Number(currentFarmer?.rating || 5.0).toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentFarmer?.is_verified ? 'Nhà vườn xác thực VietGAP' : 'Đang chờ thẩm định'}
                    </p>
                  </div>
                </div>

                {/* Status Notice */}
                {currentFarmer?.is_verified ? (
                  <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-950 text-sm">
                          Gian hàng {currentFarmer?.farm_name} đã xác minh và hoạt động bình thường!
                        </h4>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Đơn hàng từ khách được tự động tách và gửi trực tiếp tới gian hàng. Vui lòng đóng gói theo quy chuẩn tươi sạch.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
                    >
                      <Truck size={14} /> Xử lý đơn hàng
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-950 text-sm">
                          Hồ sơ gian hàng {currentFarmer?.farm_name} đang chờ ban quản trị GreenFood xét duyệt!
                        </h4>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Đội ngũ kiểm định chất lượng sẽ liên hệ thẩm định tiêu chuẩn VietGAP/Hữu cơ trong 24h làm việc.
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold shrink-0">
                      Chờ duyệt ⏳
                    </span>
                  </div>
                )}

                {/* Banner Kênh Tin Nhắn Nông Hộ */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-emerald-700/50">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/20">
                      💬
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">Kênh Tin Nhắn Khách Hàng & Ban Quản Trị Sàn</h4>
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Kênh Người Bán
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100 mt-0.5">
                        Tư vấn trực tiếp cho khách mua nông sản, chốt đơn hàng và trao đổi chính sách/đối soát với Admin GreenFood.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="flex-1 md:flex-initial px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle size={14} /> Xem tại đây
                      {farmerUnreadChatCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                          {farmerUnreadChatCount}
                        </span>
                      )}
                    </button>
                    <Link
                      href="/farmer/chat"
                      target="_blank"
                      className="flex-1 md:flex-initial px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Mở Trang Chat Độc Lập</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: QUẢN LÝ ĐƠN HÀNG (SUB-ORDERS) ── */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Header & Filter Bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <Truck className="text-emerald-600" size={18} />
                        Kiện Hàng Phân Bổ Cho Nhà Vườn
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Theo dõi và xử lý các kiện hàng được khách hàng đặt mua từ nông trại của bạn.
                      </p>
                    </div>
                    <button
                      onClick={loadOrders}
                      disabled={ordersLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <RefreshCw size={13} className={ordersLoading ? 'animate-spin' : ''} />
                      Làm mới
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    {[
                      { key: 'all', label: 'Tất cả' },
                      { key: 'PENDING', label: 'Chờ xử lý' },
                      { key: 'CONFIRMED', label: 'Đã xác nhận' },
                      { key: 'PACKING', label: 'Đang đóng gói' },
                      { key: 'SHIPPING', label: 'Đang vận chuyển' },
                      { key: 'DELIVERED', label: 'Đã giao thành công' },
                      { key: 'CANCELLED', label: 'Đã hủy' },
                    ].map(st => (
                      <button
                        key={st.key}
                        onClick={() => setOrderFilterStatus(st.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          orderFilterStatus === st.key
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                {ordersLoading ? (
                  <div className="py-16 text-center text-gray-500">
                    <RefreshCw className="animate-spin inline-block mr-2" size={20} />
                    Đang tải danh sách đơn hàng...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                    <Truck size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-600">Không có đơn hàng nào</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {orderFilterStatus !== 'all' 
                        ? 'Không tìm thấy đơn hàng nào ở trạng thái này' 
                        : 'Khi có khách đặt mua nông sản của bạn, kiện hàng sẽ xuất hiện tại đây.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const isUpdating = updatingOrderId === order.id;

                      const statusBadge = {
                        PENDING: { label: 'Chờ xử lý', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
                        CONFIRMED: { label: 'Đã xác nhận', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
                        PACKING: { label: 'Đang đóng gói', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
                        SHIPPING: { label: 'Đang vận chuyển', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
                        DELIVERED: { label: 'Đã giao thành công', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        CANCELLED: { label: 'Đã hủy', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
                      }[order.status] || { label: order.status, bg: 'bg-gray-50 text-gray-700 border-gray-200' };

                      return (
                        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
                          {/* Order Header */}
                          <div className="bg-gray-50/80 px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-sm text-gray-900">
                                {order.sub_order_number}
                              </span>
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                                {statusBadge.label}
                              </span>
                              {order.master_tracking && (
                                <span className="text-[11px] text-gray-400">
                                  (Đơn gốc: #{order.master_tracking})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock size={13} />
                                {order.created_at}
                              </span>
                              <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                {order.payment_method} ({order.payment_status === 'paid' ? 'Đã TT' : 'Thu COD'})
                              </span>
                            </div>
                          </div>

                          {/* Order Body */}
                          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Cột 1: Thông tin khách hàng & Địa chỉ giao */}
                            <div className="space-y-2 text-xs">
                              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider text-gray-400">
                                Thông tin người nhận
                              </h4>
                              <p className="font-semibold text-gray-900 text-sm">
                                {order.customer_name || 'Khách hàng GreenFood'}
                              </p>
                              <p className="text-gray-600 flex items-center gap-1.5">
                                <Phone size={13} className="text-gray-400" />
                                {order.customer_phone || 'Chưa có SĐT'}
                              </p>
                              <p className="text-gray-600 flex items-start gap-1.5">
                                <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                                <span>{order.shipping_address || 'Địa chỉ giao hàng'}</span>
                              </p>
                            </div>

                            {/* Cột 2: Danh sách nông sản cần chuẩn bị */}
                            <div className="space-y-2 lg:col-span-1 border-t lg:border-t-0 lg:border-l lg:border-r border-gray-100 pt-4 lg:pt-0 lg:px-6">
                              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider text-gray-400">
                                Nông sản cần đóng gói ({order.items_count} món)
                              </h4>
                              <div className="divide-y divide-gray-100 space-y-2">
                                {order.items.map(it => (
                                  <div key={it.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm">
                                        🥬
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900">{it.product_name}</p>
                                        <p className="text-[11px] text-gray-500">
                                          Số lượng: <strong className="text-emerald-700">{it.quantity} {it.unit}</strong>
                                        </p>
                                      </div>
                                    </div>
                                    <span className="font-semibold text-gray-800">
                                      {it.subtotal.toLocaleString('vi-VN')}đ
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Cột 3: Dòng tiền & Nút Thao tác xử lý */}
                            <div className="space-y-4 border-t lg:border-t-0 border-gray-100 pt-4 lg:pt-0 flex flex-col justify-between">
                              <div className="space-y-1.5 text-xs bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                                <div className="flex justify-between text-gray-600">
                                  <span>Tiền hàng nông sản:</span>
                                  <span className="font-semibold">{order.sub_total.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-[11px]">
                                  <span>Phí sàn GreenFood:</span>
                                  <span>-{(order.platform_commission || 0).toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-emerald-800 border-t border-emerald-200/60 pt-1.5 mt-1">
                                  <span>Thực nhận về ví:</span>
                                  <span>{order.net_earnings.toLocaleString('vi-VN')}đ</span>
                                </div>
                              </div>

                              {/* Action Buttons theo State Machine */}
                              <div className="flex flex-wrap gap-2 justify-end">
                                {order.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                                    disabled={isUpdating}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Check size={14} /> Xác nhận đơn hàng
                                  </button>
                                )}

                                {order.status === 'CONFIRMED' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'PACKING')}
                                    disabled={isUpdating}
                                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Package size={14} /> Bắt đầu đóng gói
                                  </button>
                                )}

                                {order.status === 'PACKING' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPING')}
                                    disabled={isUpdating}
                                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Truck size={14} /> Đã bàn giao bưu tá GHN
                                  </button>
                                )}

                                {order.status === 'SHIPPING' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                                    disabled={isUpdating}
                                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <CheckCircle size={14} /> Xác nhận đã giao (Quyết toán)
                                  </button>
                                )}

                                {order.status === 'DELIVERED' && (
                                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-100/70 px-3 py-1.5 rounded-xl">
                                    <CheckCircle size={14} /> Tiền đã cộng vào ví
                                  </span>
                                )}

                                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                  <button
                                    onClick={() => {
                                      if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
                                        handleUpdateOrderStatus(order.id, 'CANCELLED');
                                      }
                                    }}
                                    disabled={isUpdating}
                                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    Hủy đơn
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: VÍ DOANH THU & ĐỐI SOÁT TÀI CHÍNH ── */}
            {activeTab === 'wallet' && (
              <div className="space-y-6 max-w-5xl">
                {/* 3 Wallet Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                        Số dư khả dụng
                      </span>
                      <Wallet size={20} className="text-emerald-400" />
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight">
                      {wallet ? `${wallet.balance_available.toLocaleString('vi-VN')}đ` : '0đ'}
                    </div>
                    <button
                      onClick={handleOpenWithdrawModal}
                      disabled={isSubmittingWithdraw || !wallet || wallet.balance_available < 50000}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowUpRight size={15} /> Rút tiền về ngân hàng
                    </button>
                    {wallet && wallet.balance_available > 0 && wallet.balance_available < 50000 && (
                      <p className="text-[11px] text-emerald-200 text-center">
                        Tối thiểu 50.000đ để rút về ngân hàng
                      </p>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Chờ quyết toán
                      </span>
                      <Clock size={18} className="text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {wallet ? `${wallet.pending_payout.toLocaleString('vi-VN')}đ` : '0đ'}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Từ các đơn đang đóng gói & đang giao qua đối tác GHN.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tổng doanh thu thực nhận
                      </span>
                      <DollarSign size={18} className="text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {wallet ? `${wallet.total_net_earnings.toLocaleString('vi-VN')}đ` : '0đ'}
                    </div>
                    <p className="text-xs text-gray-500">
                      Đã trừ phí sàn 8% ({(wallet?.total_commission_paid || 0).toLocaleString('vi-VN')}đ)
                    </p>
                  </div>
                </div>

                {/* Tài khoản ngân hàng liên kết */}
                <form onSubmit={handleSaveBank} className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">Tài Khoản Ngân Hàng Nhận Tiền</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Thiết lập tài khoản chính chủ của nông hộ để nhận thanh toán quyết toán tự động từ Sàn.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                        Tên Ngân Hàng *
                      </label>
                      <input
                        required
                        type="text"
                        value={bankForm.bank_name}
                        onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })}
                        placeholder="Ví dụ: Vietcombank, MBBank..."
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                        Số Tài Khoản (STK) *
                      </label>
                      <input
                        required
                        type="text"
                        value={bankForm.bank_account_number}
                        onChange={e => setBankForm({ ...bankForm, bank_account_number: e.target.value })}
                        placeholder="Ví dụ: 0123456789"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                        Tên Chủ Tài Khoản *
                      </label>
                      <input
                        required
                        type="text"
                        value={bankForm.bank_account_name}
                        onChange={e => setBankForm({ ...bankForm, bank_account_name: e.target.value.toUpperCase() })}
                        placeholder="NGUYEN VAN A"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 uppercase font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Tỷ lệ hoa hồng nền tảng: <strong>{wallet?.commission_rate || 8}%</strong>
                    </span>
                    <button
                      type="submit"
                      disabled={isSavingBank}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {isSavingBank ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                      Lưu tài khoản nhận tiền
                    </button>
                  </div>
                </form>

                {/* BẢNG LỊCH SỬ YÊU CẦU RÚT TIỀN */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 md:p-8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <History size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                          Lịch Sử Yêu Cầu Rút Tiền
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {withdrawals.length} lệnh
                          </span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Theo dõi trạng thái duyệt lệnh và tiến độ chuyển khoản giải ngân từ Ban Quản Trị Sàn.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleOpenWithdrawModal}
                      disabled={!wallet || wallet.balance_available < 50000}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} /> Tạo lệnh rút tiền mới
                    </button>
                  </div>

                  {withdrawalsLoading ? (
                    <div className="py-10 text-center text-gray-400 text-xs">
                      <RefreshCw size={18} className="animate-spin inline-block mr-2" />
                      Đang tải lịch sử rút tiền...
                    </div>
                  ) : withdrawals.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 space-y-2">
                      <Wallet size={36} className="mx-auto text-gray-300 stroke-[1.5]" />
                      <p className="text-sm font-semibold text-gray-600">Chưa có yêu cầu rút tiền nào</p>
                      <p className="text-xs text-gray-400">
                        Khi số dư khả dụng đạt từ 50.000đ, bạn có thể tạo lệnh rút tiền về tài khoản ngân hàng.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-500 font-semibold bg-gray-50/70">
                            <th className="py-3 px-3 rounded-l-xl">Mã Lệnh</th>
                            <th className="py-3 px-3">Thời Gian</th>
                            <th className="py-3 px-3">Số Tiền Rút</th>
                            <th className="py-3 px-3">Tài Khoản Nhận</th>
                            <th className="py-3 px-3">Trạng Thái</th>
                            <th className="py-3 px-3 rounded-r-xl">Ghi Chú Admin / Nông Hộ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {withdrawals.map((w) => (
                            <tr key={w.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="py-3.5 px-3 font-mono font-medium text-gray-700">
                                #{w.id.slice(0, 8)}
                              </td>
                              <td className="py-3.5 px-3 text-gray-500 whitespace-nowrap">
                                {new Date(w.created_at).toLocaleString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="py-3.5 px-3 font-bold text-emerald-700 text-sm whitespace-nowrap">
                                {w.amount.toLocaleString('vi-VN')}đ
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="font-semibold text-gray-800">{w.bank_name}</div>
                                <div className="text-[11px] text-gray-500 font-mono">{w.bank_account_number} • {w.bank_account_name}</div>
                              </td>
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                {w.status === 'PENDING' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock size={12} className="animate-pulse" /> Đang chờ duyệt
                                  </span>
                                )}
                                {(w.status === 'APPROVED' || w.status === 'COMPLETED') && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle size={12} /> Đã giải ngân
                                  </span>
                                )}
                                {w.status === 'REJECTED' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                    <X size={12} /> Bị từ chối (Đã hoàn tiền)
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-gray-600 max-w-xs truncate">
                                {w.admin_note ? (
                                  <span className="text-gray-800 font-medium">
                                    Admin: {w.admin_note}
                                  </span>
                                ) : w.farmer_note ? (
                                  <span className="text-gray-500 italic">
                                    &ldquo;{w.farmer_note}&rdquo;
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 4: PRODUCTS LIST ── */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      Nông Sản Vụ Mùa Của {currentFarmer?.farm_name}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {totalProducts} sản phẩm
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Đăng bán, chỉnh sửa giá và cập nhật sản lượng mùa vụ trực tiếp lên gian hàng sàn GreenFood.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={handleOpenAddProduct}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Plus size={16} /> Thêm nông sản mới
                    </button>
                    <Link
                      href={`/farmers/${currentFarmer?.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Eye size={15} /> Xem trên sàn
                    </Link>
                  </div>
                </div>

                {farmerProductsLoading ? (
                  <div className="py-16 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                    Đang tải danh sách nông sản...
                  </div>
                ) : products.length === 0 ? (
                  <div className="p-14 text-center text-gray-400 space-y-3">
                    <Package size={48} className="mx-auto text-gray-300 stroke-[1.2]" />
                    <p className="text-base font-bold text-gray-700">Chưa có nông sản nào được đăng bán</p>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      Gian hàng của bạn hiện chưa có sản phẩm. Hãy bấm nút &quot;Thêm nông sản mới&quot; phía trên để đăng bán sản vật tươi ngon của nông trại nhé!
                    </p>
                    <button
                      onClick={handleOpenAddProduct}
                      className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Plus size={15} /> Đăng nông sản đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((p: any) => {
                      const variant = p.variants?.[0];
                      const price = variant?.price ?? p.priceNum ?? p.price ?? 0;
                      const unit = variant?.unit ?? p.unit ?? '1kg';
                      const stock = variant?.stock_quantity ?? p.stock ?? 100;
                      const image = p.image_url || p.images?.[0] || 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=300';
                      const badge = p.badge || (p.is_seasonal ? 'Mùa vụ' : 'Đang mở bán');

                      return (
                        <div
                          key={p.id}
                          className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-3.5">
                            <img
                              src={image}
                              alt={p.name}
                              className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shrink-0 bg-gray-50"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                  {badge}
                                </span>
                                {p.category?.name && (
                                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {p.category.name}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-gray-900 text-sm mt-1 truncate group-hover:text-emerald-700 transition-colors">
                                {p.name}
                              </h4>
                              <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-base font-extrabold text-emerald-700">
                                  {Number(price).toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                  / {unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500">
                                <span>Kho: <strong className="text-gray-800">{stock}</strong></span>
                                <span>•</span>
                                <span>Đã bán: <strong className="text-gray-800">{p.sold_count || 0}</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                            <Link
                              href={`/farmers/${currentFarmer?.id}`}
                              target="_blank"
                              className="text-xs font-semibold text-gray-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                            >
                              <Eye size={13} /> Gian hàng
                            </Link>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 size={12} /> Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                disabled={deletingProductId === String(p.id)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {deletingProductId === String(p.id) ? (
                                  <RefreshCw size={12} className="animate-spin" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 5: PROFILE FORM ── */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-6 space-y-6 max-w-3xl">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Hồ Sơ Gian Hàng & Địa Chỉ Vị Trí Vườn</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cập nhật địa chỉ thực tế và vị trí GPS để khách hàng tìm thấy đúng nhà vườn của bạn trên Bản Đồ Nông Hộ GreenFood.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Tên Vườn / Nông Trại / Hợp Tác Xã *
                    </label>
                    <input
                      required
                      type="text"
                      value={profileForm.farm_name}
                      onChange={e => setProfileForm({ ...profileForm, farm_name: e.target.value })}
                      placeholder="Ví dụ: Nông Trại Hữu Cơ Ba Tri"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                        Địa Chỉ Khu Vườn / Cơ Sở Sản Xuất *
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGeocode}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors border border-emerald-200"
                      >
                        <MapPin size={13} />
                        Tự động lấy tọa độ từ địa chỉ
                      </button>
                    </div>
                    <input
                      required
                      type="text"
                      value={profileForm.address}
                      onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Ví dụ: Tân Cương, Thái Nguyên hoặc Xã Hoằng Hóa, Tỉnh Thanh Hóa..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Tọa độ GPS trên Bản Đồ */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600" />
                        Tọa Độ Bản Đồ Nông Hộ (GPS Coordinates)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Giúp khách hàng nhìn thấy đúng vị trí trên bản đồ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Vĩ độ (Latitude)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={profileForm.latitude}
                          onChange={e => setProfileForm({ ...profileForm, latitude: e.target.value })}
                          placeholder="Ví dụ: 19.8067"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Kinh độ (Longitude)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={profileForm.longitude}
                          onChange={e => setProfileForm({ ...profileForm, longitude: e.target.value })}
                          placeholder="Ví dụ: 105.7852"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vị Trí Kho Xuất Hàng GHN (Tính phí ship sàn Shopee) */}
                  <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/50 to-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          GHN
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                            <Truck size={14} className="text-orange-600" />
                            Vị Trí Kho Xuất Hàng Giao Hàng Nhanh (GHN)
                          </h4>
                          <p className="text-[11px] text-gray-600">
                            Căn cứ tính phí ship động từ kho của bạn đến người mua theo từng kiện (chuẩn Shopee)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Nút Demo nhanh 3 Nông hộ 3 Miền */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-600" />
                        Nạp Vị Trí Mẫu 3 Miền (Demo Sàn TMĐT):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {GHN_DEMO_PRESETS.map((p, idx) => {
                          const isSelected = 
                            profileForm.ghn_district_id === String(p.district_id) &&
                            profileForm.ghn_province_id === String(p.province_id);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleApplyGhnPreset(p)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected 
                                  ? 'border-orange-500 bg-orange-50/90 ring-2 ring-orange-500/20 shadow-xs' 
                                  : 'border-amber-200/90 bg-white hover:bg-amber-50/50 hover:border-orange-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  idx === 0 ? 'bg-blue-100 text-blue-700' :
                                  idx === 1 ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {p.region}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                                  #{p.shop_id}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-gray-900 line-clamp-1">{p.name}</span>
                              <span className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">Mã Huyện: {p.district_id} | Xã: {p.ward_code}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chi tiết thông tin cấu hình kho */}
                    <div className="space-y-3 pt-1 border-t border-amber-200/60">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Địa chỉ kho xuất hàng (GHN Address)
                          </label>
                          <input
                            type="text"
                            value={profileForm.ghn_address}
                            onChange={e => setProfileForm({ ...profileForm, ghn_address: e.target.value })}
                            placeholder="Ví dụ: Khu Phố 2, Thị trấn Chợ Lách, Huyện Chợ Lách, Bến Tre"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Mã Cửa Hàng GHN (Shop ID) *
                          </label>
                          <input
                            type="number"
                            value={profileForm.ghn_shop_id}
                            onChange={e => setProfileForm({ ...profileForm, ghn_shop_id: e.target.value })}
                            placeholder="Ví dụ: 217559"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-orange-700 font-mono font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Mã Tỉnh (Province ID) *
                          </label>
                          <input
                            type="number"
                            value={profileForm.ghn_province_id}
                            onChange={e => setProfileForm({ ...profileForm, ghn_province_id: e.target.value })}
                            placeholder="Ví dụ: 213"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Mã Quận/Huyện (District ID) *
                          </label>
                          <input
                            type="number"
                            value={profileForm.ghn_district_id}
                            onChange={e => setProfileForm({ ...profileForm, ghn_district_id: e.target.value })}
                            placeholder="Ví dụ: 3158"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Mã Phường/Xã (Ward Code)
                          </label>
                          <input
                            type="text"
                            value={profileForm.ghn_ward_code}
                            onChange={e => setProfileForm({ ...profileForm, ghn_ward_code: e.target.value })}
                            placeholder="Ví dụ: 560301"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Sản Phẩm Thế Mạnh / Đặc Sản
                    </label>
                    <input
                      type="text"
                      value={profileForm.specialty}
                      onChange={e => setProfileForm({ ...profileForm, specialty: e.target.value })}
                      placeholder="Ví dụ: Sầu riêng Ri6, Bưởi da xanh ruột hồng, Nông sản hữu cơ..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Câu Chuyện Canh Tác Sạch & Cam Kết Chất Lượng
                    </label>
                    <textarea
                      rows={4}
                      value={profileForm.story}
                      onChange={e => setProfileForm({ ...profileForm, story: e.target.value })}
                      placeholder="Mô tả truyền thống canh tác, tiêu chuẩn VietGAP, hữu cơ hoặc câu chuyện gắn bó cùng nông nghiệp sạch..."
                      className="w-full p-4 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 leading-relaxed focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <div className="text-xs text-slate-500">
                    Vùng hiển thị: <strong>{currentFarmer?.region?.name || 'Việt Nam'}</strong>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-emerald-700/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Đang gửi duyệt...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} />
                        <span>Lưu & Gửi phê duyệt</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    <strong>Quy trình kiểm duyệt:</strong> Mọi thay đổi về thông tin gian hàng và vị trí bản đồ sẽ được gửi tới Ban Quản Trị GreenFood phê duyệt trước khi kích hoạt chính thức.
                  </span>
                </div>
              </form>
            )}

            {/* ── TAB 6: TIN NHẮN SHOPEE CHAT (KHÁCH HÀNG & BAN QUẢN TRỊ SÀN) ── */}
            {activeTab === 'chat' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[720px]">
                {/* Cột trái: Danh sách hội thoại */}
                <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-gray-50/40">
                  <div className="p-3.5 border-b border-gray-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <MessageCircle size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">Shopee Chat Nông Hộ</h3>
                          <p className="text-[11px] text-gray-500">Trao đổi khách mua & Sàn</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href="/farmer/chat"
                          target="_blank"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Mở Kênh Chat Toàn Màn Hình"
                        >
                          <span>Mở Chat Độc Lập</span>
                          <ArrowUpRight size={12} />
                        </Link>
                        <button
                          onClick={() => loadFarmerChats()}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
                          title="Làm mới"
                        >
                          <RefreshCw size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Nút hành động nhanh: Nhắn tin cho Admin Sàn */}
                    <button
                      onClick={handleStartAdminSupportChat}
                      className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <HeadphonesIcon size={14} />
                      <span>Chat với Ban Quản Trị Sàn GreenFood</span>
                    </button>

                    {/* Lọc loại tin nhắn */}
                    <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg text-[11px] font-medium">
                      <button
                        onClick={() => {
                          setChatTabFilter('all');
                          if (chatConversations.length > 0 && !chatConversations.some(c => c.id === selectedChatId)) {
                            setSelectedChatId(chatConversations[0].id);
                          }
                        }}
                        className={`py-1 rounded-md transition-all text-center ${
                          chatTabFilter === 'all' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-gray-500'
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        onClick={() => {
                          setChatTabFilter('customer_farmer');
                          const matched = chatConversations.filter(c => c.type === 'customer_farmer');
                          if (matched.length > 0 && !matched.some(c => c.id === selectedChatId)) {
                            setSelectedChatId(matched[0].id);
                          }
                        }}
                        className={`py-1 rounded-md transition-all text-center flex items-center justify-center gap-0.5 ${
                          chatTabFilter === 'customer_farmer' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-gray-500'
                        }`}
                      >
                        <UserIcon size={11} /> Khách mua
                      </button>
                      <button
                        onClick={() => {
                          setChatTabFilter('farmer_admin');
                          const matched = chatConversations.filter(c => c.type === 'farmer_admin');
                          if (matched.length > 0 && !matched.some(c => c.id === selectedChatId)) {
                            setSelectedChatId(matched[0].id);
                          }
                        }}
                        className={`py-1 rounded-md transition-all text-center flex items-center justify-center gap-0.5 ${
                          chatTabFilter === 'farmer_admin' ? 'bg-white text-purple-700 font-bold shadow-2xs' : 'text-gray-500'
                        }`}
                      >
                        <ShieldCheck size={11} /> Sàn Admin
                      </button>
                    </div>
                  </div>

                  {/* Danh sách các cuộc chat */}
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {(() => {
                      const filteredList = chatConversations.filter(c => {
                        if (chatTabFilter === 'all') return true;
                        return c.type === chatTabFilter;
                      });

                      if (filteredList.length === 0) {
                        return (
                          <div className="p-8 text-center text-gray-400 text-xs">
                            <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                            Chưa có cuộc trò chuyện nào trong mục này.
                          </div>
                        );
                      }

                      return filteredList.map((conv) => {
                        const isAdminChat = conv.type === 'farmer_admin';
                        const title = isAdminChat
                          ? 'Ban Quản Trị Sàn GreenFood'
                          : (conv.customer?.name || 'Khách Mua Hàng');
                        const isSelected = selectedChatId === conv.id;

                        return (
                          <div
                            key={conv.id}
                            onClick={() => setSelectedChatId(conv.id)}
                            className={`p-3 cursor-pointer transition-all hover:bg-emerald-50/40 ${
                              isSelected ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isAdminChat
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {isAdminChat ? <ShieldCheck size={16} /> : cleanVietnameseMojibake(title).charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-bold text-gray-900 truncate">
                                      {cleanVietnameseMojibake(title)}
                                    </p>
                                    {isAdminChat && (
                                      <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.2 rounded font-semibold">
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                    {cleanVietnameseMojibake(conv.last_message?.message || conv.subject)}
                                  </p>
                                </div>
                              </div>

                              {conv.unread_count > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shrink-0">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
                              <span>{conv.type === 'farmer_admin' ? 'Hỗ trợ sàn' : 'Tư vấn sản phẩm'}</span>
                              <span>{conv.updated_at}</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Cột phải: Khung Chat */}
                <div className="flex-1 flex flex-col bg-white">
                  {(() => {
                    const currentConv = chatConversations.find(c => c.id === selectedChatId);

                    if (!currentConv) {
                      return (
                        <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50/30">
                          <div className="text-center max-w-sm px-4">
                            <div className="w-14 h-14 rounded-full bg-emerald-100/60 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                              <MessageCircle size={28} />
                            </div>
                            <p className="text-sm font-bold text-gray-700">Chọn cuộc trò chuyện</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                              Nông hộ có thể giải đáp cho người mua hoặc nhận hỗ trợ từ Ban Quản Trị Sàn để kinh doanh hiệu quả hơn.
                            </p>
                          </div>
                        </div>
                      );
                    }

                    const isAdminChat = currentConv.type === 'farmer_admin';
                    const convTitle = isAdminChat
                      ? 'Ban Quản Trị Sàn GreenFood'
                      : (currentConv.customer?.name || 'Khách Mua Hàng');
                    const convSub = isAdminChat
                      ? 'Hỗ trợ hồ sơ VietGAP, đối soát doanh thu & mở rộng gian hàng'
                      : (currentConv.customer?.phone || currentConv.customer?.email || 'Khách hàng quan tâm nông sản');

                    return (
                      <>
                        {/* Thông báo nếu có tin nhắn mới từ khách hàng khác */}
                        {(() => {
                          const otherUnread = chatConversations.filter(c => c.id !== selectedChatId && (c.unread_count || 0) > 0);
                          if (otherUnread.length === 0) return null;
                          return (
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3.5 py-2 text-xs flex items-center justify-between shadow-xs">
                              <span className="font-semibold flex items-center gap-1.5 truncate">
                                🔔 Có {otherUnread.length} cuộc trò chuyện khác có tin mới từ khách: <strong>{otherUnread[0].customer?.name || 'Khách mua'}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedChatId(otherUnread[0].id);
                                  if (otherUnread[0].type === 'customer_farmer') setChatTabFilter('customer_farmer');
                                  else if (otherUnread[0].type === 'farmer_admin') setChatTabFilter('farmer_admin');
                                }}
                                className="bg-white text-amber-900 font-bold px-2.5 py-1 rounded-md text-[11px] hover:bg-amber-100 transition-colors shrink-0 cursor-pointer shadow-xs ml-2"
                              >
                                Xem ngay ⚡
                              </button>
                            </div>
                          );
                        })()}

                        {/* Header phòng chat */}
                        <div className="p-3.5 border-b border-gray-200 bg-white flex items-center justify-between shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              isAdminChat
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isAdminChat ? <ShieldCheck size={20} /> : cleanVietnameseMojibake(convTitle).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-gray-900">
                                  {cleanVietnameseMojibake(convTitle)}
                                </h4>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  isAdminChat ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {isAdminChat ? 'Kênh Hỗ Trợ Sàn' : 'Khách Mua Hàng'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{convSub}</p>
                            </div>
                          </div>
                        </div>

                        {/* Thẻ sản phẩm nếu khách bấm hỏi từ sản phẩm cụ thể */}
                        {currentConv.product && (
                          <div className="p-2.5 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                                <ShoppingBag size={14} />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
                                  Ngữ cảnh sản phẩm khách hỏi:
                                </span>
                                <p className="font-bold text-gray-900 truncate">
                                  {currentConv.product.name}
                                </p>
                              </div>
                            </div>
                            {currentConv.product.slug && (
                              <Link
                                href={`/product/${currentConv.product.slug}`}
                                target="_blank"
                                className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-semibold shrink-0 transition-colors"
                              >
                                Xem nông sản
                              </Link>
                            )}
                          </div>
                        )}

                        {/* Nội dung danh sách tin nhắn */}
                        <div ref={chatMessagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                          {chatMessages.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-xs">
                              Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
                            </div>
                          ) : (
                            chatMessages.map((msg) => {
                              const isMe = msg.sender_role === 'farmer';
                              const isAdmin = msg.sender_role === 'admin';

                              return (
                                <div
                                  key={msg.id}
                                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                                    isMe
                                      ? 'bg-emerald-600 text-white rounded-br-2xs'
                                      : isAdmin
                                      ? 'bg-purple-100 text-purple-950 border border-purple-200 rounded-bl-2xs'
                                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-2xs'
                                  }`}>
                                    {!isMe && (
                                      <div className="flex items-center gap-1 font-bold text-[10px] mb-1 opacity-75">
                                        {isAdmin ? <ShieldCheck size={11} className="text-purple-600" /> : <UserIcon size={11} />}
                                        <span>{msg.sender_name || (isAdmin ? 'Ban Quản Trị Sàn' : 'Khách Mua')}</span>
                                      </div>
                                    )}

                                    <p className="whitespace-pre-wrap leading-relaxed break-words font-normal">
                                      {cleanVietnameseMojibake(msg.message)}
                                    </p>

                                    <div className={`text-[9px] mt-1 text-right ${
                                      isMe ? 'text-white/70' : 'text-gray-400'
                                    }`}>
                                      {formatChatTime(msg)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Mẫu tin nhắn phản hồi nhanh chuẩn Shopee */}
                        <div className="px-3 pt-2 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
                          <span className="text-gray-400 shrink-0 text-[10px]">Gợi ý nhanh:</span>
                          <button
                            type="button"
                            onClick={() => setNewChatMessage('Dạ chào bạn, nông sản bên nhà vườn vừa thu hái tươi mới 100% ạ!')}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-full shrink-0 transition-colors"
                          >
                            🌿 Nông sản tươi mới 100%
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewChatMessage('Shop đã tiếp nhận đơn và chuẩn bị giao cho đối tác GHN ngay ạ!')}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-full shrink-0 transition-colors"
                          >
                            📦 Đang chuẩn bị gửi GHN
                          </button>
                        </div>

                        {/* Ô nhập tin nhắn */}
                        <div className="p-3 border-t border-gray-200 bg-white">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendFarmerMessage();
                            }}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={newChatMessage}
                              onChange={(e) => setNewChatMessage(e.target.value)}
                              placeholder={
                                isAdminChat
                                  ? 'Nhập nội dung trao đổi với Ban Quản Trị Sàn...'
                                  : 'Nhập nội dung tư vấn khách hàng...'
                              }
                              className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all"
                              disabled={chatSending}
                            />
                            <button
                              type="submit"
                              disabled={chatSending || !newChatMessage.trim()}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1 shadow-2xs"
                            >
                              <Send size={14} />
                              <span>Gửi</span>
                            </button>
                          </form>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAL 1: FORM YÊU CẦU RÚT TIỀN VỀ NGÂN HÀNG ── */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative space-y-6">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Yêu Cầu Rút Tiền Về Ngân Hàng</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lệnh rút tiền sẽ được gửi trực tiếp đến Bộ phận Đối soát Sàn GreenFood để giải ngân.
                </p>
              </div>
            </div>

            {/* Thẻ số dư khả dụng */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-700 font-semibold block">Số dư khả dụng hiện tại:</span>
                <span className="text-2xl font-black text-emerald-900">
                  {wallet ? `${wallet.balance_available.toLocaleString('vi-VN')}đ` : '0đ'}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-200/80 text-emerald-900 rounded-lg">
                Tối thiểu 50.000đ
              </span>
            </div>

            <form onSubmit={handleSubmitWithdraw} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    Số Tiền Cần Rút (VNĐ) *
                  </label>
                  <span className="text-[11px] text-gray-400">Không tính phí rút tiền</span>
                </div>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min="50000"
                    max={wallet?.balance_available || 0}
                    step="1000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Nhập số tiền muốn rút..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-base font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-400">
                    VNĐ
                  </span>
                </div>

                {/* Nút chọn nhanh số tiền */}
                {wallet && wallet.balance_available > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount('50000')}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      50.000đ
                    </button>
                    {wallet.balance_available >= 200000 && (
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount('200000')}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        200.000đ
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(Math.floor(wallet.balance_available * 0.5)))}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      50% ({Math.floor(wallet.balance_available * 0.5).toLocaleString('vi-VN')}đ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(Math.floor(wallet.balance_available)))}
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      Tất cả 100%
                    </button>
                  </div>
                )}
              </div>

              {/* Thông tin tài khoản nhận tiền */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 uppercase">
                  <span>Tài Khoản Ngân Hàng Nhận Tiền</span>
                  <span className="text-[10px] text-emerald-700 font-normal">Chính chủ gian hàng</span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {bankForm.bank_name || 'Chưa thiết lập'}
                </div>
                <div className="text-xs text-gray-600 font-mono">
                  STK: {bankForm.bank_account_number || '---'}
                </div>
                <div className="text-xs text-gray-600 uppercase font-semibold">
                  Chủ TK: {bankForm.bank_account_name || '---'}
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Ghi Chú Cho Ban Quản Trị (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="Ví dụ: Rút tiền doanh thu tuần 2 tháng 10..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingWithdraw ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ArrowUpRight size={14} />
                  )}
                  Xác nhận gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: THÊM / CHỈNH SỬA NÔNG SẢN VỤ MÙA ── */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {editingProduct ? 'Chỉnh Sửa Nông Sản Vụ Mùa' : 'Đăng Bán Nông Sản Mới'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Gian hàng: <strong>{currentFarmer?.farm_name}</strong> • Sản phẩm liên kết trực tiếp với nhà vườn.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Tên Sản Phẩm Nông Sản *
                  </label>
                  <input
                    required
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Ví dụ: Bưởi da xanh Bến Tre ruột hồng"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Danh Mục Nông Sản *
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Huy Hiệu / Đặc Điểm Vụ Mùa
                  </label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="Ví dụ: Chính vụ VietGAP, OCOP 4 sao, Hữu cơ..."
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Giá Bán (VNĐ) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="Ví dụ: 85000"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Đơn Vị Tính *
                  </label>
                  <input
                    required
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="Ví dụ: 1kg, 500g, 1 quả, 1 bó..."
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Số Lượng Tồn Kho Sẵn Có
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_seasonal"
                    checked={productForm.is_seasonal}
                    onChange={(e) => setProductForm({ ...productForm, is_seasonal: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="is_seasonal" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Nông sản chính vụ / mùa thu hoạch ngắn ngày 🌾
                  </label>
                </div>
              </div>

              {/* Ảnh sản phẩm */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Đường Dẫn Ảnh Sản Phẩm (Image URL) *
                </label>
                <input
                  required
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />

                {/* Chọn nhanh ảnh mẫu nông sản */}
                <div className="mt-2.5">
                  <span className="text-[11px] text-gray-500 font-semibold block mb-1">
                    Gợi ý chọn nhanh ảnh mẫu tươi ngon chuẩn HD:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {SAMPLE_PRODUCT_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, image_url: img.url })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap border transition-all ${
                          productForm.image_url === img.url
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview ảnh */}
                {productForm.image_url && (
                  <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <img
                      src={productForm.image_url}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                    <div className="text-xs text-gray-500">
                      <strong className="text-gray-800 block">Xem trước ảnh đại diện nông sản</strong>
                      Ảnh sẽ hiển thị trên trang chủ và danh mục tìm kiếm của sàn.
                    </div>
                  </div>
                )}
              </div>

              {/* Mô tả sản phẩm */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Mô Tả Nông Sản & Quy Trình Trồng Trọt
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Mô tả giống cây trồng, kỹ thuật chăm bón hữu cơ, hương vị và chứng nhận..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingProduct ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  {editingProduct ? 'Lưu thay đổi' : 'Đăng bán nông sản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
