"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Award,
  ShieldCheck,
  Tractor,
  LogOut,
  ShoppingBag,
  Sparkles,
  Save,
  CheckCircle2,
  Calendar,
  Gift,
  Truck,
  Percent,
  Copy,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  RefreshCw,
  Check,
  AlertCircle,
  ChevronRight,
  Tag
} from 'lucide-react';
import { useAuthStore, AVAILABLE_VOUCHERS, SavedAddress, VoucherItem } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';

type ProfileTab = 'overview' | 'orders' | 'addresses' | 'vouchers' | 'security';

interface OrderItemDetail {
  id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  unit: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface UserOrder {
  id: string;
  order_uuid: string;
  tracking_number: string;
  customer: string;
  phone: string;
  email?: string;
  address: string;
  shipping_zone?: string;
  shipping_fee: number;
  date: string;
  total: string;
  total_raw: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  raw_status: string;
  payment_method: string;
  items: number;
  item_details?: OrderItemDetail[];
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    updateProfileApi,
    changePasswordApi,
    savedAddresses,
    addSavedAddress,
    removeSavedAddress,
    setDefaultAddress,
    userVouchers,
    redeemVoucher,
    logout,
  } = useAuthStore();
  const { addItem, setIsOpen: openCartDrawer } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Edit Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('');
  const [farmName, setFarmName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // New Address Form State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState<'Nhà riêng' | 'Văn phòng' | 'Khác'>('Nhà riêng');
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrDetail, setNewAddrDetail] = useState('');
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Partner Modal State
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerFarmName, setPartnerFarmName] = useState('');
  const [partnerProduceType, setPartnerProduceType] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAvatar(user.avatar || '');
      setFarmName(user.farmName || '');
      setNewAddrName(user.name || '');
      setNewAddrPhone(user.phone || '');
    }
  }, [mounted, isAuthenticated, user, router]);

  // Fetch user orders whenever tab is 'orders' or phone changes
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const queryParam = user.phone ? `?customer_phone=${encodeURIComponent(user.phone)}` : '';
        const res = await fetch(`http://127.0.0.1:8000/api/orders${queryParam}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setOrders(json.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải lịch sử đơn hàng:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (activeTab === 'orders' || activeTab === 'overview') {
      fetchOrders();
    }
  }, [activeTab, user]);

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-gray-50/50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Đang tải hồ sơ tài khoản GreenFood...</p>
        </div>
      </div>
    );
  }

  // Tier info calculation
  const getTierInfo = (tier?: string) => {
    switch (tier) {
      case 'DIAMOND':
        return {
          name: 'Hạng Kim Cương',
          color: 'from-sky-700 via-blue-800 to-indigo-950',
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
          discount: '15%',
          nextTier: 'Đạt cấp tối đa',
          pointsToNext: 0,
          progress: 100,
        };
      case 'GOLD':
        return {
          name: 'Hạng Vàng',
          color: 'from-amber-600 via-yellow-700 to-orange-900',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          discount: '10%',
          nextTier: 'Kim Cương',
          pointsToNext: Math.max(0, 3000 - (user.loyaltyPoints || 0)),
          progress: Math.min(100, Math.round(((user.loyaltyPoints || 0) / 3000) * 100)),
        };
      case 'SILVER':
        return {
          name: 'Hạng Bạc',
          color: 'from-slate-600 via-zinc-700 to-gray-900',
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
          discount: '5%',
          nextTier: 'Vàng',
          pointsToNext: Math.max(0, 1000 - (user.loyaltyPoints || 0)),
          progress: Math.min(100, Math.round(((user.loyaltyPoints || 0) / 1000) * 100)),
        };
      default:
        return {
          name: 'Hạng Đồng',
          color: 'from-emerald-700 via-teal-800 to-emerald-950',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          discount: '2%',
          nextTier: 'Bạc',
          pointsToNext: Math.max(0, 300 - (user.loyaltyPoints || 0)),
          progress: Math.min(100, Math.round(((user.loyaltyPoints || 0) / 300) * 100)),
        };
    }
  };

  const tierInfo = getTierInfo(user.tier);

  // Generate random avatar
  const handleRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    setAvatar(newAvatar);
    toast.success('Đã chọn avatar mới! Hãy bấm "Lưu thay đổi" để cập nhật.');
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone && !/^(0|\+?84)[35789][0-9]{8}$/.test(cleanPhone)) {
      toast.error('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số (03, 05, 07, 08, 09).');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateProfileApi({
        name: name.trim(),
        phone: cleanPhone,
        address: address.trim(),
        avatar: avatar || undefined,
        farmName: user.role === 'vendor' ? farmName.trim() : undefined,
      });

      if (res.success) {
        toast.success(res.message);
        setIsEditing(false);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Có lỗi xảy ra khi lưu thông tin!');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp!');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changePasswordApi(oldPassword, newPassword);
      if (res.success) {
        toast.success(res.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Lỗi khi đổi mật khẩu!');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Handle Add Address
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = newAddrPhone.trim().replace(/\D/g, '');
    if (!newAddrName.trim()) {
      toast.error('Vui lòng nhập tên người nhận!');
      return;
    }
    if (!cleanPhone || !/^(0|\+?84)[35789][0-9]{8}$/.test(cleanPhone)) {
      toast.error('Số điện thoại nhận hàng không hợp lệ (10 số)!');
      return;
    }
    if (!newAddrDetail.trim()) {
      toast.error('Vui lòng nhập địa chỉ cụ thể!');
      return;
    }

    addSavedAddress({
      label: newAddrLabel,
      recipientName: newAddrName.trim(),
      recipientPhone: cleanPhone,
      addressDetail: newAddrDetail.trim(),
      isDefault: newAddrIsDefault,
    });

    toast.success('Đã lưu địa chỉ mới vào sổ địa chỉ!');
    setShowAddAddressModal(false);
    setNewAddrDetail('');
    setNewAddrIsDefault(false);
  };

  // Handle Redeem Voucher
  const handleRedeem = (voucherDef: typeof AVAILABLE_VOUCHERS[0]) => {
    const res = redeemVoucher(voucherDef);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // Copy voucher code
  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      toast.success(`Đã sao chép mã ${code}! Dán tại trang thanh toán.`);
    }
  };

  // Handle Re-order: adds products to cart
  const handleReorder = (order: UserOrder) => {
    if (!order.item_details || order.item_details.length === 0) {
      toast.error('Không tìm thấy danh sách sản phẩm của đơn hàng này.');
      return;
    }

    order.item_details.forEach((item) => {
      addItem({
        id: item.product_id,
        name: item.product_name,
        slug: item.product_name.toLowerCase().replace(/\s+/g, '-'),
        variantId: item.variant_id || item.product_id,
        unit: item.unit || 'Kg',
        price: item.price,
        quantity: item.quantity,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80',
      });
    });

    toast.success(`Đã thêm ${order.item_details.length} món từ đơn ${order.tracking_number} vào giỏ hàng!`);
    openCartDrawer(true);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Đã giao thành công</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Truck size={13} className="text-blue-600" />
            <span>Đang vận chuyển</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle size={13} className="text-rose-600" />
            <span>Đã hủy đơn</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock size={13} className="text-amber-600" />
            <span>Chờ tiếp nhận</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER BREADCRUMB & ROLE ACTIONS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={avatar || user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="h-20 w-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md bg-emerald-50"
              />
              <button
                type="button"
                onClick={handleRandomAvatar}
                title="Đổi ảnh đại diện ngẫu nhiên"
                className="absolute -bottom-1 -right-1 bg-white border border-gray-200 text-gray-600 p-1.5 rounded-full shadow hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${tierInfo.badgeBg}`}>
                  {tierInfo.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {user.role === 'admin' ? 'Quản trị viên' : user.role === 'vendor' ? 'Nông hộ / Nhà vườn' : 'Khách hàng'}
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-gray-400" />
                  <span>{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-gray-400" />
                    <span>{user.phone}</span>
                  </span>
                )}
                <span className="text-gray-400">Tham gia: {user.createdAt || '2026'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck size={16} />
                <span>Bảng Quản Trị</span>
              </Link>
            )}

            {user.role === 'vendor' && (
              <Link
                href="/partners"
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Tractor size={16} />
                <span>Gian Hàng Nông Hộ</span>
              </Link>
            )}

            {user.role === 'customer' && (
              <button
                type="button"
                onClick={() => setShowPartnerModal(true)}
                className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Tractor size={16} />
                <span>Đăng ký Nông hộ</span>
              </button>
            )}

            <button
              onClick={() => {
                logout();
                toast.success('Đã đăng xuất tài khoản!');
                router.push('/');
              }}
              className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
            }`}
          >
            <Sparkles size={16} />
            <span>Tổng quan & VIP</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag size={16} />
            <span>Đơn hàng của tôi ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
            }`}
          >
            <MapPin size={16} />
            <span>Sổ địa chỉ ({savedAddresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vouchers'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
            }`}
          >
            <Gift size={16} />
            <span>Điểm & Voucher ({userVouchers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
            }`}
          >
            <Lock size={16} />
            <span>Bảo mật tài khoản</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & VIP */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 2-Column: VIP Card & Personal Info Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* VIP MEMBERSHIP CARD */}
              <div className={`lg:col-span-5 bg-gradient-to-br ${tierInfo.color} text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between`}>
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="font-pacifico text-2xl text-emerald-200 tracking-wider">GreenFood VIP</div>
                    <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/30">
                      {tierInfo.name}
                    </span>
                  </div>

                  <div className="my-6">
                    <div className="text-xs text-emerald-200 uppercase tracking-widest font-semibold">Điểm Tích Lũy Khả Dụng</div>
                    <div className="text-4xl sm:text-5xl font-extrabold text-white mt-1 flex items-baseline gap-2">
                      <span>{(user.loyaltyPoints || 0).toLocaleString()}</span>
                      <span className="text-sm font-semibold text-amber-300">Điểm</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-emerald-200 font-medium">
                      <span>Tiến trình nâng hạng ({tierInfo.nextTier})</span>
                      <span>{tierInfo.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/25 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500" style={{ width: `${tierInfo.progress}%` }}></div>
                    </div>
                    {tierInfo.pointsToNext > 0 ? (
                      <p className="text-[11px] text-emerald-200/90 pt-1">
                        Tích lũy thêm <strong>{tierInfo.pointsToNext.toLocaleString()} điểm</strong> nữa để thăng hạng <strong>{tierInfo.nextTier}</strong>.
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-300 font-bold pt-1">
                        🌟 Bạn đang sở hữu hạng thành viên cao quý nhất của GreenFood!
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/20 space-y-2.5 text-xs text-emerald-100">
                  <div className="flex items-center gap-2">
                    <Percent size={15} className="text-amber-300 shrink-0" />
                    <span>Giảm trực tiếp <strong>{tierInfo.discount}</strong> trên tất cả đơn hàng nông sản</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-amber-300 shrink-0" />
                    <span>Miễn phí vận chuyển tận bếp cho hóa đơn từ 200k</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift size={15} className="text-amber-300 shrink-0" />
                    <span>Tặng giỏ quà nông sản hữu cơ độc quyền vào tháng sinh nhật</span>
                  </div>
                </div>
              </div>

              {/* PERSONAL INFO CARD */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Thông Tin Hồ Sơ Khách Hàng</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Quản lý thông tin hồ sơ và địa chỉ giao hàng của bạn.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isEditing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Họ và tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="Nhập họ và tên đầy đủ"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-gray-800 px-4 py-2.5 bg-gray-50 rounded-xl">
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Email tài khoản
                      </label>
                      <div className="text-sm font-semibold text-gray-700 px-4 py-2.5 bg-gray-100/70 rounded-xl flex items-center justify-between">
                        <span>{user.email}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Đã xác minh</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Số điện thoại di động
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="0912345678"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-gray-800 px-4 py-2.5 bg-gray-50 rounded-xl">
                          {user.phone || 'Chưa cập nhật SĐT'}
                        </div>
                      )}
                    </div>
                  </div>

                  {user.role === 'vendor' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Tên Hợp Tác Xã / Nông Trại
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                          placeholder="Ví dụ: HTX Nông Sản Hữu Cơ Đà Lạt"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-gray-800 px-4 py-2.5 bg-gray-50 rounded-xl">
                          {user.farmName || 'Chưa thiết lập tên nông trại'}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Địa chỉ nhận hàng mặc định
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-gray-800 px-4 py-2.5 bg-gray-50 rounded-xl">
                        {user.address || 'Chưa thiết lập địa chỉ giao hàng mặc định'}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="pt-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isSavingProfile ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        <span>{isSavingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>

            </div>

            {/* QUICK STATS ROW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">{orders.length}</div>
                  <div className="text-xs text-gray-500">Đơn hàng đã đặt</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Award size={22} />
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">{(user.loyaltyPoints || 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Điểm thưởng tích lũy</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                  <Gift size={22} />
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">{userVouchers.length}</div>
                  <div className="text-xs text-gray-500">Voucher khả dụng</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">{savedAddresses.length}</div>
                  <div className="text-xs text-gray-500">Địa chỉ lưu sẵn</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Lịch Sử Đơn Hàng Của Bạn</h2>
                <p className="text-xs text-gray-500 mt-0.5">Theo dõi quá trình vận chuyển từ nhà vườn nông sản đến tận căn bếp của bạn.</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'pending', label: 'Chờ xử lý' },
                  { key: 'processing', label: 'Đang giao' },
                  { key: 'completed', label: 'Đã giao' },
                  { key: 'cancelled', label: 'Đã hủy' },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setOrderStatusFilter(st.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === st.key
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingOrders ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-gray-500">Đang tải danh sách đơn hàng...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag size={30} />
                </div>
                <h3 className="text-base font-bold text-gray-800">Chưa có đơn hàng nào phù hợp</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Bạn chưa có đơn hàng nào ở trạng thái này. Hãy khám phá chợ nông sản sạch GreenFood để đặt hàng tươi ngon mỗi ngày!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <span>Khám phá chợ nông sản</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.order_uuid || order.id}
                    className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all bg-white hover:shadow-md space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                          {order.tracking_number || order.id}
                        </span>
                        <span className="text-gray-400 flex items-center gap-1">
                          <Calendar size={13} />
                          <span>{order.date}</span>
                        </span>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    {/* Order items preview */}
                    {order.item_details && order.item_details.length > 0 ? (
                      <div className="space-y-2 py-1">
                        {order.item_details.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-gray-700">
                            <span className="font-medium text-gray-800">
                              {it.quantity}x {it.product_name} ({it.unit})
                            </span>
                            <span className="font-semibold text-gray-900">{it.subtotal.toLocaleString()}đ</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">
                        Số lượng mặt hàng nông sản: <strong>{order.items} sản phẩm</strong>
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                      <div className="text-gray-500">
                        <span>Địa chỉ: <strong>{order.address}</strong></span>
                        <span className="ml-3 text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                          {order.payment_method}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 justify-end">
                        <div className="text-right">
                          <span className="text-[11px] text-gray-400 block">Tổng thanh toán:</span>
                          <span className="text-base font-extrabold text-emerald-700">{order.total}</span>
                        </div>

                        <Link
                          href={`/tracking?order=${order.tracking_number || order.id.replace('#', '')}`}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Truck size={14} />
                          <span>Theo dõi</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw size={14} />
                          <span>Mua lại</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED ADDRESS BOOK */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sổ Địa Chỉ Giao Hàng</h2>
                <p className="text-xs text-gray-500 mt-0.5">Lưu trước nhiều địa chỉ nhận hàng để thanh toán nhanh chóng hơn.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddAddressModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                <span>Thêm địa chỉ mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                    addr.isDefault
                      ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-800">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Check size={12} />
                          <span>Mặc định</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                        >
                          Đặt mặc định
                        </button>
                      )}
                      {savedAddresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSavedAddress(addr.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Xóa địa chỉ"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span>{addr.recipientName}</span>
                      <span className="text-gray-400 font-normal">|</span>
                      <span className="text-gray-600 font-normal">{addr.recipientPhone}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {addr.addressDetail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Add Address */}
            {showAddAddressModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Thêm Địa Chỉ Giao Hàng Mới</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddAddressModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddAddress} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Loại địa chỉ</label>
                      <div className="flex items-center gap-2">
                        {(['Nhà riêng', 'Văn phòng', 'Khác'] as const).map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setNewAddrLabel(l)}
                            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                              newAddrLabel === l
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Tên người nhận</label>
                      <input
                        type="text"
                        required
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="0912345678"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Địa chỉ chi tiết</label>
                      <textarea
                        rows={3}
                        required
                        value={newAddrDetail}
                        onChange={(e) => setNewAddrDetail(e.target.value)}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="defaultAddrCheck"
                        checked={newAddrIsDefault}
                        onChange={(e) => setNewAddrIsDefault(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="defaultAddrCheck" className="text-gray-700 font-medium cursor-pointer">
                        Đặt làm địa chỉ nhận hàng mặc định
                      </label>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddressModal(false)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                      >
                        Thêm địa chỉ
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LOYALTY VOUCHERS & REWARDS */}
        {activeTab === 'vouchers' && (
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-200 font-bold">Số dư điểm thưởng GreenFood</span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1 flex items-baseline gap-2">
                  <span>{(user.loyaltyPoints || 0).toLocaleString()}</span>
                  <span className="text-sm font-semibold text-amber-300">Điểm</span>
                </div>
                <p className="text-xs text-emerald-100/80 mt-1">
                  Mỗi 10.000đ chi tiêu nông sản = +1 điểm thưởng. Đổi ngay các voucher ưu đãi hấp dẫn bên dưới!
                </p>
              </div>

              <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs space-y-1">
                <div className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>Cơ chế quy đổi:</span>
                </div>
                <p className="text-emerald-100">100 điểm = Voucher 20.000đ</p>
                <p className="text-emerald-100">250 điểm = Voucher 50.000đ</p>
              </div>
            </div>

            {/* Redeem Vouchers List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Gift size={18} className="text-emerald-600" />
                <span>Đổi Điểm Lấy Voucher Ưu Đãi</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_VOUCHERS.map((v) => {
                  const canRedeem = (user.loyaltyPoints || 0) >= v.pointsCost;
                  return (
                    <div
                      key={v.id}
                      className="p-5 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all bg-gradient-to-r from-gray-50/50 to-white flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            {v.code}
                          </span>
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            {v.pointsCost} Điểm
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mt-2">{v.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{v.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-[11px] text-gray-400">Đơn tối thiểu: {v.minOrder.toLocaleString()}đ</span>
                        <button
                          type="button"
                          disabled={!canRedeem}
                          onClick={() => handleRedeem(v)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            canRedeem
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {canRedeem ? 'Đổi voucher' : 'Chưa đủ điểm'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Vouchers Wallet */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Tag size={18} className="text-emerald-600" />
                <span>Kho Voucher Của Tôi ({userVouchers.length})</span>
              </h3>

              {userVouchers.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">Bạn chưa có voucher nào. Hãy dùng điểm thưởng để đổi ngay!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userVouchers.map((v) => (
                    <div
                      key={v.id}
                      className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300">
                              {v.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(v.code)}
                              className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-md border border-gray-200"
                              title="Sao chép mã"
                            >
                              <Copy size={13} />
                              <span>Chép</span>
                            </button>
                          </div>
                          <h4 className="font-bold text-gray-900 text-xs mt-2">{v.title}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">{v.description}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-emerald-100 text-[11px] text-gray-500 flex items-center justify-between">
                        <span>HSD: {v.expiryDate}</span>
                        <span className="text-emerald-700 font-semibold">Chưa sử dụng</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & DATABASE MANAGEMENT */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Change Password Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Lock size={18} className="text-emerald-600" />
                  <span>Đổi Mật Khẩu Bảo Mật</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mật khẩu được mã hóa an toàn bằng tiêu chuẩn mã hóa hiện đại.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPass ? 'text' : 'password'}
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Mật khẩu mới (ít nhất 6 ký tự)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Nhập lại mật khẩu mới
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isChangingPass ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    <span>{isChangingPass ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu Mới'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Database & Security Specs */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4 text-xs">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Tiêu Chuẩn Bảo Mật GreenFood</span>
              </h3>

              <div className="space-y-3 text-gray-600 pt-2">
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-1">Mã hóa mật khẩu chuẩn Bcrypt</span>
                  Mật khẩu người dùng không được lưu thô mà luôn được băm với thuật toán Bcrypt của Laravel trước khi ghi vào bảng users.
                </div>

                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="font-bold text-blue-900 block mb-1">Kiểm soát bảo mật tập trung</span>
                  Dữ liệu tài khoản của bạn được mã hóa an toàn và bảo vệ tuyệt đối trên hệ thống máy chủ của GreenFood.
                </div>

                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-900 block mb-1">Bảo vệ đơn hàng & Tracking</span>
                  Chỉ có người đặt hàng và Quản trị viên mới có quyền xem thông tin chi tiết của đơn hàng thông qua số điện thoại đã xác thực.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL REGISTER PARTNER VENDOR */}
        {showPartnerModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Tractor size={20} className="text-emerald-600" />
                  <h3 className="text-base font-bold text-gray-900">Đăng Ký Trở Thành Nông Hộ</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Gia nhập mạng lưới cung ứng nông sản sạch GreenFood để kết nối trực tiếp đến hàng triệu người tiêu dùng.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('Yêu cầu mở gian hàng Nông hộ đã được gửi tới Ban Quản Trị GreenFood! Chúng tôi sẽ liên hệ trong 24h.');
                  setShowPartnerModal(false);
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tên Hợp Tác Xã / Nông Trại</label>
                  <input
                    type="text"
                    required
                    value={partnerFarmName}
                    onChange={(e) => setPartnerFarmName(e.target.value)}
                    placeholder="Ví dụ: HTX Nông Sản Hữu Cơ Đà Lạt"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nông sản chủ lực</label>
                  <input
                    type="text"
                    required
                    value={partnerProduceType}
                    onChange={(e) => setPartnerProduceType(e.target.value)}
                    placeholder="Ví dụ: Rau củ quả thủy canh, Trái cây sấy, Cà phê..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    disabled
                    value={user.phone || ''}
                    className="w-full px-3.5 py-2.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPartnerModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                  >
                    Gửi hồ sơ đăng ký
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
