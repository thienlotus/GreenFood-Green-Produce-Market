"use client";

import { Search, Edit2, Trash2, User as UserIcon, Shield, Tractor, ShoppingBag, ShieldCheck, UserCheck, Lock, Unlock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore, Role, RegisteredAccount } from '@/store/useAuthStore';

export default function AdminUsersManagement() {
  const { registeredAccounts, updateUserRole, toggleUserLock, deleteUserAccount, user: currentAdmin } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Role Edit Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RegisteredAccount | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('vendor');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredUsers = registeredAccounts.filter((account) => {
    const matchSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.phone && account.phone.includes(searchTerm));

    const matchRole = roleFilter === 'all' || account.role === roleFilter;

    return matchSearch && matchRole;
  });

  const handleOpenRoleModal = (acc: RegisteredAccount) => {
    setSelectedUser(acc);
    setSelectedRole(acc.role);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const res = updateUserRole(selectedUser.id, selectedRole);
    if (res.success) {
      toast.success(res.message);
      setIsRoleModalOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  const handleToggleLock = (userId: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn thay đổi trạng thái hoạt động của tài khoản: ${name}?`)) {
      const res = toggleUserLock(userId);
      if (res.success) {
        toast.success(res.message);
      }
    }
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (userId === currentAdmin?.id) {
      toast.error('Bạn không thể tự xóa tài khoản Quản trị viên đang đăng nhập!');
      return;
    }
    if (confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản: ${name}?`)) {
      const res = deleteUserAccount(userId);
      if (res.success) {
        toast.success(res.message);
      }
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return { label: '👑 Quản Trị Viên', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'customer':
        return { label: '🛒 Khách Hàng', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'vendor':
        return { label: '🌾 Nông Hộ / Vườn', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Khách', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" />
              Quản lý Người dùng & Phân quyền
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Chỉ Quản trị viên mới có quyền xem danh sách và cấp quyền (Nông hộ ➔ Khách hàng / Admin) cho các tài khoản.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
            <span>Tổng cộng: {registeredAccounts.length} tài khoản</span>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500"
          />
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* ROLE FILTER */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium shrink-0">Lọc vai trò:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="vendor">🌾 Nông Hộ (Mặc định)</option>
            <option value="customer">🛒 Khách Hàng</option>
            <option value="admin">👑 Quản Trị Viên</option>
          </select>
        </div>
      </div>

      {/* USER TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-bold">Thành viên</th>
                <th className="p-4 font-bold">Số điện thoại</th>
                <th className="p-4 font-bold">Vai trò hiện tại</th>
                <th className="p-4 font-bold">Tên Nông Trại / Địa chỉ</th>
                <th className="p-4 font-bold">Trạng thái</th>
                <th className="p-4 font-bold text-right">Phân quyền & Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers.map((acc) => {
                const roleBadge = getRoleBadge(acc.role);
                const isLocked = acc.status === 'Khóa';

                return (
                  <tr key={acc.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Member Column */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {acc.avatar ? (
                          <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                            {acc.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            {acc.name}
                            {acc.id === currentAdmin?.id && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Bạn</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{acc.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Phone Column */}
                    <td className="p-4 text-xs font-medium text-gray-700">
                      {acc.phone || 'Chưa cập nhật'}
                    </td>

                    {/* Role Badge Column */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    </td>

                    {/* Farm Name or Address */}
                    <td className="p-4 text-xs text-gray-600 max-w-[200px] truncate">
                      {acc.role === 'vendor' ? (
                        <span className="font-semibold text-amber-800">{acc.farmName || 'Nhà vườn'}</span>
                      ) : (
                        acc.address || 'Chưa có địa chỉ'
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isLocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {acc.status || 'Hoạt động'}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Assign / Change Role Button */}
                        <button
                          onClick={() => handleOpenRoleModal(acc)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                          title="Cấp quyền / Đổi vai trò"
                        >
                          <Shield size={14} />
                          <span>Phân quyền</span>
                        </button>

                        {/* Lock / Unlock */}
                        <button
                          onClick={() => handleToggleLock(acc.id, acc.name)}
                          className={`p-2 rounded-xl border transition-colors ${
                            isLocked
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                          }`}
                          title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {isLocked ? <Unlock size={15} /> : <Lock size={15} />}
                        </button>

                        {/* Delete */}
                        {acc.id !== currentAdmin?.id && (
                          <button
                            onClick={() => handleDeleteUser(acc.id, acc.name)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                    Không tìm thấy tài khoản người dùng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL PHÂN QUYỀN (ROLE ASSIGNMENT MODAL) ================= */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={22} />
                <h3 className="font-bold text-base">Cấp Quyền & Đổi Vai Trò</h3>
              </div>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-5">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="font-bold text-sm text-gray-900">{selectedUser.name}</div>
                <div className="text-xs text-gray-500">{selectedUser.email}</div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">
                  Vai trò hiện tại: {getRoleBadge(selectedUser.role).label}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Chọn vai trò mới cần cấp cho tài khoản:
                </label>

                <div className="space-y-2">
                  {/* Option 1: Vendor */}
                  <label
                    onClick={() => setSelectedRole('vendor')}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedRole === 'vendor'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <input type="radio" name="role_choice" checked={selectedRole === 'vendor'} onChange={() => {}} className="hidden" />
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-700 font-bold text-lg">🌾</div>
                    <div>
                      <div className="font-bold text-xs">Nông Hộ / Nhà Vườn (Mặc định)</div>
                      <div className="text-[11px] text-gray-500">Đối tác cung ứng nông sản, mở gian hàng vườn</div>
                    </div>
                  </label>

                  {/* Option 2: Customer */}
                  <label
                    onClick={() => setSelectedRole('customer')}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedRole === 'customer'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <input type="radio" name="role_choice" checked={selectedRole === 'customer'} onChange={() => {}} className="hidden" />
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">🛒</div>
                    <div>
                      <div className="font-bold text-xs">Khách Hàng Tiêu Dùng</div>
                      <div className="text-[11px] text-gray-500">Mua sắm, đặt hàng nông sản, tích điểm VIP</div>
                    </div>
                  </label>

                  {/* Option 3: Admin */}
                  <label
                    onClick={() => setSelectedRole('admin')}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedRole === 'admin'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <input type="radio" name="role_choice" checked={selectedRole === 'admin'} onChange={() => {}} className="hidden" />
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-700 font-bold text-lg">👑</div>
                    <div>
                      <div className="font-bold text-xs">Quản Trị Viên (Admin)</div>
                      <div className="text-[11px] text-gray-500">Toàn quyền quản trị hệ thống, phân quyền và cài đặt</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <UserCheck size={16} />
                  <span>Lưu & Cấp Quyền</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
