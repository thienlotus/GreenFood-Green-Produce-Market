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
  Percent
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [farmName, setFarmName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
      setFarmName(user.farmName || '');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      farmName: user.role === 'vendor' ? farmName.trim() : undefined,
    });
    setIsEditing(false);
    toast.success('Cập nhật thông tin tài khoản thành công!');
  };

  const getTierInfo = (tier?: string) => {
    switch (tier) {
      case 'DIAMOND':
        return { name: 'Thành Viên Kim Cương', color: 'from-cyan-600 to-blue-700', discount: '15%', progress: 100 };
      case 'GOLD':
        return { name: 'Thành Viên Hạng Vàng', color: 'from-amber-500 to-yellow-600', discount: '10%', progress: 75 };
      case 'SILVER':
        return { name: 'Thành Viên Hạng Bạc', color: 'from-slate-500 to-gray-700', discount: '5%', progress: 40 };
      default:
        return { name: 'Thành Viên Hạng Đồng', color: 'from-emerald-600 to-teal-700', discount: '2%', progress: 15 };
    }
  };

  const tierInfo = getTierInfo(user.tier);

  return (
    <div className="min-h-screen bg-gray-50/70 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* TOP HEADER / BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Tài Khoản & Điểm Thưởng GreenFood
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Quản lý thông tin cá nhân, ưu đãi thành viên và đơn hàng của bạn.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck size={16} />
                <span>Trang Quản Trị</span>
              </Link>
            )}
            <button
              onClick={() => {
                logout();
                toast.success('Đã đăng xuất tài khoản!');
                router.push('/');
              }}
              className="px-4 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* 2-COLUMN OVERVIEW & MEMBERSHIP CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* VIP MEMBERSHIP CARD */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 font-pacifico text-2xl text-emerald-200">
                  <span>GreenFood VIP</span>
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/30">
                  {tierInfo.name}
                </span>
              </div>

              <div className="my-6">
                <div className="text-xs text-emerald-200 uppercase tracking-widest font-semibold">Điểm Tích Lũy Khả Dụng</div>
                <div className="text-4xl font-extrabold text-white mt-1 flex items-baseline gap-2">
                  <span>{user.loyaltyPoints?.toLocaleString() || 0}</span>
                  <span className="text-sm font-semibold text-amber-300">Điểm</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-emerald-200 font-medium">
                  <span>Tiến trình nâng hạng</span>
                  <span>{tierInfo.progress}%</span>
                </div>
                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full" style={{ width: `${tierInfo.progress}%` }}></div>
                </div>
              </div>
            </div>

            {/* Member Benefits */}
            <div className="mt-8 pt-6 border-t border-emerald-600/60 space-y-2.5 text-xs text-emerald-100">
              <div className="flex items-center gap-2">
                <Percent size={14} className="text-amber-300 shrink-0" />
                <span>Giảm trực tiếp <strong>{tierInfo.discount}</strong> trên mọi đơn hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-amber-300 shrink-0" />
                <span>Miễn phí vận chuyển cho đơn từ 299k</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift size={14} className="text-amber-300 shrink-0" />
                <span>Nhận hộp quà rau củ sinh nhật độc quyền</span>
              </div>
            </div>
          </div>

          {/* USER PROFILE INFO CARD */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md" />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {user.role === 'admin' ? 'Quản trị viên' : user.role === 'vendor' ? 'Nông hộ / Đối tác' : 'Khách hàng'}
                    </span>
                    <span className="text-xs text-gray-400">Tham gia: {user.createdAt || '2026'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
              </button>
            </div>

            {/* FORM OR DETAILS */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Họ và tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="text-sm font-semibold text-gray-800 px-4 py-2.5 bg-gray-50 rounded-xl">
                    {user.name}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Email
                  </label>
                  <div className="text-sm font-semibold text-gray-800 px-4 py-2.5 bg-gray-50 rounded-xl">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <div className="text-sm font-semibold text-gray-800 px-4 py-2.5 bg-gray-50 rounded-xl">
                      {user.phone || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>
              </div>

              {user.role === 'vendor' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Tên Nông Trại / Hợp Tác Xã
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="Hợp tác xã Nông sản sạch..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <div className="text-sm font-semibold text-gray-800 px-4 py-2.5 bg-gray-50 rounded-xl">
                      {user.farmName || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Địa chỉ nhận hàng mặc định
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="text-sm font-semibold text-gray-800 px-4 py-2.5 bg-gray-50 rounded-xl">
                    {user.address || 'Chưa thiết lập địa chỉ giao hàng'}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Save size={16} />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
