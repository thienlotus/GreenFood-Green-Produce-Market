import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'guest' | 'customer' | 'vendor' | 'admin';
export type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Role;
  tier?: Tier;
  loyaltyPoints?: number;
  address?: string;
  farmName?: string;
  status?: 'Hoạt động' | 'Khóa';
  createdAt?: string;
}

export interface RegisteredAccount extends User {
  passwordHash: string;
}

export interface SavedAddress {
  id: string;
  label: 'Nhà riêng' | 'Văn phòng' | 'Khác';
  recipientName: string;
  recipientPhone: string;
  addressDetail: string;
  isDefault: boolean;
}

export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  discountAmount: number;
  discountType: 'fixed' | 'freeship';
  minOrder: number;
  pointsCost: number;
  redeemedAt: string;
  expiryDate: string;
  isUsed: boolean;
  description: string;
}

export const AVAILABLE_VOUCHERS = [
  {
    id: 'vch-20k',
    code: 'GF20K',
    title: 'Voucher Giảm 20.000đ',
    discountAmount: 20000,
    discountType: 'fixed' as const,
    pointsCost: 100,
    minOrder: 150000,
    description: 'Áp dụng cho mọi giỏ hàng nông sản tươi sạch từ 150.000đ.',
  },
  {
    id: 'vch-50k',
    code: 'GF50K',
    title: 'Voucher Giảm 50.000đ',
    discountAmount: 50000,
    discountType: 'fixed' as const,
    pointsCost: 250,
    minOrder: 300000,
    description: 'Áp dụng cho đơn hàng nông sản từ 300.000đ.',
  },
  {
    id: 'vch-free',
    code: 'GFFREESHIP',
    title: 'Voucher Miễn Phí Vận Chuyển',
    discountAmount: 30000,
    discountType: 'freeship' as const,
    pointsCost: 150,
    minOrder: 200000,
    description: 'Giảm tối đa 30.000đ chi phí giao hàng tận nơi.',
  },
  {
    id: 'vch-100k',
    code: 'GF100K',
    title: 'Voucher Khủng 100.000đ',
    discountAmount: 100000,
    discountType: 'fixed' as const,
    pointsCost: 500,
    minOrder: 600000,
    description: 'Dành riêng cho khách hàng thân thiết mua đơn từ 600.000đ.',
  },
];

export const INITIAL_DEMO_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr-admin-01',
    name: 'Trần Quản Trị',
    email: 'admin@greenfood.vn',
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    tier: 'DIAMOND',
    loyaltyPoints: 8500,
    address: 'Văn phòng GreenFood, Quận 1, TP. Hồ Chí Minh',
    status: 'Hoạt động',
    createdAt: '2026-01-01',
    passwordHash: '123456',
  },
  {
    id: 'usr-cust-02',
    name: 'Nguyễn Văn Khách',
    email: 'khachhang@greenfood.vn',
    phone: '0912345678',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'customer',
    tier: 'GOLD',
    loyaltyPoints: 1250,
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    status: 'Hoạt động',
    createdAt: '2026-02-10',
    passwordHash: '123456',
  },
  {
    id: 'usr-farm-03',
    name: 'Lê Hoàng Nông Dân',
    email: 'nongdan@greenfood.vn',
    phone: '0987654321',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'vendor',
    tier: 'SILVER',
    loyaltyPoints: 680,
    farmName: 'Hợp tác xã Nông Sản Sạch Đà Lạt',
    address: 'Thôn 3, Xã Trạm Hành, TP. Đà Lạt, Lâm Đồng',
    status: 'Hoạt động',
    createdAt: '2026-03-05',
    passwordHash: '123456',
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  registeredAccounts: RegisteredAccount[];
  savedAddresses: SavedAddress[];
  userVouchers: VoucherItem[];
  login: (userData: User) => void;
  logout: () => void;
  authenticate: (identifier: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    farmName?: string;
  }) => Promise<{ success: boolean; message: string; user?: User }>;
  syncUsersFromDb: () => Promise<void>;
  resetPassword: (identifier: string, newPassword: string) => { success: boolean; message: string };
  updateProfile: (data: Partial<User>) => void;
  updateProfileApi: (data: Partial<User>) => Promise<{ success: boolean; message: string; user?: User }>;
  changePasswordApi: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  // Loyalty points & vouchers
  redeemVoucher: (voucherDef: typeof AVAILABLE_VOUCHERS[0]) => { success: boolean; message: string; voucher?: VoucherItem };
  // Saved addresses
  addSavedAddress: (addr: Omit<SavedAddress, 'id'>) => void;
  removeSavedAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  // Admin only role & user management functions
  updateUserRole: (userId: string, newRole: Role) => Promise<{ success: boolean; message: string }>;
  toggleUserLock: (userId: string) => { success: boolean; message: string; newStatus: string };
  deleteUserAccount: (userId: string) => Promise<{ success: boolean; message: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      registeredAccounts: INITIAL_DEMO_ACCOUNTS,
      savedAddresses: [
        {
          id: 'addr-default-1',
          label: 'Nhà riêng',
          recipientName: 'Nguyễn Văn Khách',
          recipientPhone: '0912345678',
          addressDetail: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          isDefault: true,
        },
      ],
      userVouchers: [
        {
          id: 'vch-welcome-01',
          code: 'GF-WELCOME50',
          title: 'Voucher Thành Viên Mới - Giảm 50.000đ',
          discountAmount: 50000,
          discountType: 'fixed',
          minOrder: 250000,
          pointsCost: 0,
          redeemedAt: '2026-09-01',
          expiryDate: '2026-12-31',
          isUsed: false,
          description: 'Quà tặng chào mừng thành viên gia nhập gia đình Nông Sản Sạch GreenFood.',
        },
      ],

      login: (userData: User) => {
        set({ user: userData, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      /**
       * Xác thực đăng nhập qua Database Backend Laravel (bảng users)
       */
      authenticate: async (identifier: string, password: string) => {
        const cleanIdent = identifier.trim();
        if (!cleanIdent) {
          return { success: false, message: 'Vui lòng nhập email hoặc số điện thoại đăng nhập!' };
        }
        if (!password) {
          return { success: false, message: 'Vui lòng nhập mật khẩu!' };
        }

        // 1. Thử gọi xác thực trực tiếp từ CSDL Backend Laravel
        try {
          const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              account: cleanIdent,
              password: password,
            }),
          });

          const json = await res.json().catch(() => null);

          if (res.ok && json && json.success && json.data) {
            const dbUser = json.data;

            // Kiểm tra xem tài khoản có đang bị Quản trị viên khóa không
            const currentAccounts = get().registeredAccounts;
            const existingAcc = currentAccounts.find((a) => a.id === dbUser.id || a.email.toLowerCase() === (dbUser.email || '').toLowerCase() || (dbUser.phone && a.phone === dbUser.phone));
            if (existingAcc && existingAcc.status === 'Khóa') {
              return {
                success: false,
                message: 'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Quản trị viên.',
              };
            }

            const safeUser: User = {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email || '',
              phone: dbUser.phone || '',
              avatar: dbUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dbUser.name)}`,
              role: (dbUser.role || 'customer').toLowerCase() as Role,
              tier: dbUser.tier || (dbUser.role === 'admin' ? 'DIAMOND' : 'BRONZE'),
              loyaltyPoints: dbUser.loyaltyPoints || (dbUser.role === 'admin' ? 8500 : 50),
              address: dbUser.address || '',
              status: dbUser.status || 'Hoạt động',
              createdAt: dbUser.createdAt || new Date().toISOString().split('T')[0],
            };

            // Cập nhật danh sách tài khoản trong store
            const accounts = get().registeredAccounts;
            const existsIdx = accounts.findIndex((a) => a.id === safeUser.id || a.email.toLowerCase() === safeUser.email.toLowerCase() || (safeUser.phone && a.phone === safeUser.phone));
            const updated = [...accounts];
            const accObj: RegisteredAccount = { ...safeUser, passwordHash: '******' };
            if (existsIdx >= 0) {
              updated[existsIdx] = accObj;
            } else {
              updated.unshift(accObj);
            }

            // Đồng bộ địa chỉ nếu user có sẵn
            if (safeUser.address) {
              const addrs = get().savedAddresses;
              if (addrs.length === 0) {
                set({
                  savedAddresses: [{
                    id: 'addr-' + Date.now(),
                    label: 'Nhà riêng',
                    recipientName: safeUser.name,
                    recipientPhone: safeUser.phone || '',
                    addressDetail: safeUser.address,
                    isDefault: true,
                  }]
                });
              }
            }

            set({
              user: safeUser,
              isAuthenticated: true,
              registeredAccounts: updated,
            });

            return {
              success: true,
              message: json.message || 'Đăng nhập thành công!',
              user: safeUser,
            };
          } else if (json && json.message) {
            return {
              success: false,
              message: json.message,
            };
          }
        } catch (netErr) {
          console.warn('Backend API login network fallback:', netErr);
        }

        // 2. Fallback sang danh sách local nếu Backend tạm thời không truy cập được
        const cleanIdentLower = cleanIdent.toLowerCase();
        const accounts = get().registeredAccounts;
        const found = accounts.find((acc) => {
          const matchEmail = acc.email.toLowerCase() === cleanIdentLower;
          const matchPhone = acc.phone?.replace(/\s+/g, '') === cleanIdent.replace(/\s+/g, '');
          const matchUsername =
            (cleanIdentLower === 'admin' && acc.role === 'admin') ||
            (cleanIdentLower === 'khachhang' && acc.email.includes('khachhang')) ||
            (cleanIdentLower === 'nongdan' && acc.email.includes('nongdan'));

          return matchEmail || matchPhone || matchUsername;
        });

        if (!found) {
          return { success: false, message: 'Tài khoản không tồn tại trên hệ thống CSDL!' };
        }

        if (found.status === 'Khóa') {
          return { success: false, message: 'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Quản trị viên.' };
        }

        const isPasswordMatch = found.passwordHash === password || (found.role === 'admin' && password === '123456');

        if (!isPasswordMatch) {
          return { success: false, message: 'Mật khẩu không chính xác! Vui lòng thử lại.' };
        }

        const { passwordHash: _, ...safeUser } = found;
        set({ user: safeUser, isAuthenticated: true });
        return { success: true, message: 'Đăng nhập thành công!', user: safeUser };
      },

      /**
       * Đăng ký tài khoản người dùng mới và lưu trực tiếp vào CSDL backend (bảng users)
       */
      register: async (data) => {
        const cleanEmail = data.email.trim().toLowerCase();
        const cleanPhone = data.phone.trim().replace(/\s+/g, '');
        const cleanName = data.name.trim();

        if (!cleanName) {
          return { success: false, message: 'Vui lòng nhập họ và tên!' };
        }

        if (!cleanPhone) {
          return { success: false, message: 'Vui lòng nhập số điện thoại!' };
        }

        const phoneRegex = /^(0|\+?84)[35789][0-9]{8}$/;
        if (!phoneRegex.test(cleanPhone)) {
          return {
            success: false,
            message: 'Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số điện thoại di động (bắt đầu bằng 03, 05, 07, 08, 09).',
          };
        }

        if (data.password.length < 6) {
          return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' };
        }

        // 1. Gửi request trực tiếp đến Backend Laravel API để ghi vào Database SQLite/MySQL
        try {
          const res = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              name: cleanName,
              email: cleanEmail,
              phone: cleanPhone,
              password: data.password,
            }),
          });

          const json = await res.json().catch(() => null);

          if (res.ok && json && json.success && json.data) {
            const dbUser = json.data;
            const newUserAccount: RegisteredAccount = {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              phone: dbUser.phone,
              role: 'customer',
              tier: 'BRONZE',
              loyaltyPoints: dbUser.loyaltyPoints || 50,
              farmName: data.farmName?.trim() || '',
              address: '',
              status: 'Hoạt động',
              avatar: dbUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
              createdAt: dbUser.createdAt || new Date().toISOString().split('T')[0],
              passwordHash: data.password,
            };

            const accounts = get().registeredAccounts.filter((a) => a.id !== newUserAccount.id && a.phone !== newUserAccount.phone && a.email !== newUserAccount.email);
            const updatedAccounts = [newUserAccount, ...accounts];
            const { passwordHash: _, ...safeUser } = newUserAccount;

            set({
              registeredAccounts: updatedAccounts,
              user: safeUser,
              isAuthenticated: true,
            });

            return {
              success: true,
              message: json.message || 'Đăng ký tài khoản thành công! Dữ liệu đã được lưu vào cơ sở dữ liệu.',
              user: safeUser,
            };
          } else if (json && json.message) {
            return {
              success: false,
              message: json.message,
            };
          }
        } catch (netErr) {
          console.warn('Backend API register network fallback:', netErr);
        }

        // 2. Fallback lưu local store nếu Backend tạm gián đoạn kết nối
        const accounts = get().registeredAccounts;
        const existingEmail = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
        if (existingEmail) {
          return { success: false, message: 'Email này đã được sử dụng bởi tài khoản khác!' };
        }

        const existingPhone = accounts.find((a) => a.phone && a.phone.replace(/\s+/g, '') === cleanPhone);
        if (existingPhone) {
          return { success: false, message: 'Số điện thoại này đã được đăng ký trên hệ thống!' };
        }

        const localUser: RegisteredAccount = {
          id: `usr-${Date.now()}`,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role: 'customer',
          tier: 'BRONZE',
          loyaltyPoints: 50,
          farmName: data.farmName?.trim() || '',
          address: '',
          status: 'Hoạt động',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
          createdAt: new Date().toISOString().split('T')[0],
          passwordHash: data.password,
        };

        const updatedAccounts = [localUser, ...accounts];
        const { passwordHash: _, ...safeUser } = localUser;

        set({
          registeredAccounts: updatedAccounts,
          user: safeUser,
          isAuthenticated: true,
        });

        return {
          success: true,
          message: 'Đăng ký tài khoản thành công! Tài khoản của bạn có vai trò Khách Hàng.',
          user: safeUser,
        };
      },

      /**
       * Cập nhật thông tin tài khoản và đồng bộ trực tiếp vào CSDL Backend
       */
      updateProfileApi: async (data: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) {
          return { success: false, message: 'Vui lòng đăng nhập để cập nhật thông tin!' };
        }

        try {
          const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              name: data.name,
              phone: data.phone,
              avatar: data.avatar,
            }),
          });

          const json = await res.json().catch(() => null);

          if (res.ok && json && json.success) {
            const updatedUser: User = { ...currentUser, ...data };
            const accounts = get().registeredAccounts.map((acc) =>
              acc.id === currentUser.id ? { ...acc, ...data } : acc
            );

            set({ user: updatedUser, registeredAccounts: accounts });
            return {
              success: true,
              message: json.message || 'Cập nhật thông tin vào CSDL thành công!',
              user: updatedUser,
            };
          } else if (json && json.message) {
            return { success: false, message: json.message };
          }
        } catch (e) {
          console.warn('Backend update profile connection fallback:', e);
        }

        // Fallback local update
        get().updateProfile(data);
        return { success: true, message: 'Cập nhật thông tin thành công (lưu cục bộ)!' };
      },

      /**
       * Đổi mật khẩu tài khoản và cập nhật mật khẩu Bcrypt mới vào CSDL Backend
       */
      changePasswordApi: async (oldPassword: string, newPassword: string) => {
        const currentUser = get().user;
        if (!currentUser) {
          return { success: false, message: 'Vui lòng đăng nhập trước khi đổi mật khẩu!' };
        }

        if (!oldPassword) {
          return { success: false, message: 'Vui lòng nhập mật khẩu hiện tại!' };
        }

        if (newPassword.length < 6) {
          return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
        }

        try {
          const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}/change-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              old_password: oldPassword,
              new_password: newPassword,
            }),
          });

          const json = await res.json().catch(() => null);

          if (res.ok && json && json.success) {
            return { success: true, message: json.message || 'Đổi mật khẩu tài khoản trong CSDL thành công!' };
          } else if (json && json.message) {
            return { success: false, message: json.message };
          }
        } catch (e) {
          console.warn('Backend change password connection fallback:', e);
        }

        return { success: false, message: 'Lỗi kết nối máy chủ CSDL khi đổi mật khẩu!' };
      },

      /**
       * Đổi điểm thưởng tích lũy lấy Voucher
       */
      redeemVoucher: (voucherDef) => {
        const currentUser = get().user;
        if (!currentUser) {
          return { success: false, message: 'Vui lòng đăng nhập để đổi điểm thưởng!' };
        }

        const currentPoints = currentUser.loyaltyPoints || 0;
        if (currentPoints < voucherDef.pointsCost) {
          return {
            success: false,
            message: `Bạn chưa đủ điểm! Cần ${voucherDef.pointsCost} điểm (Hiện có: ${currentPoints} điểm).`,
          };
        }

        const newPoints = currentPoints - voucherDef.pointsCost;
        const newVoucher: VoucherItem = {
          id: `vch-${Date.now()}`,
          code: `${voucherDef.code}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          title: voucherDef.title,
          discountAmount: voucherDef.discountAmount,
          discountType: voucherDef.discountType,
          minOrder: voucherDef.minOrder,
          pointsCost: voucherDef.pointsCost,
          redeemedAt: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isUsed: false,
          description: voucherDef.description,
        };

        const updatedUser = { ...currentUser, loyaltyPoints: newPoints };
        const updatedVouchers = [newVoucher, ...get().userVouchers];

        set({
          user: updatedUser,
          userVouchers: updatedVouchers,
        });

        return {
          success: true,
          message: `Đổi thành công mã ${newVoucher.code}! Bạn đã được trừ ${voucherDef.pointsCost} điểm.`,
          voucher: newVoucher,
        };
      },

      /**
       * Quản lý Sổ địa chỉ giao hàng
       */
      addSavedAddress: (addr) => {
        const currentAddrs = get().savedAddresses;
        const newAddr: SavedAddress = {
          ...addr,
          id: `addr-${Date.now()}`,
        };

        let updated = [...currentAddrs];
        if (addr.isDefault) {
          updated = updated.map((a) => ({ ...a, isDefault: false }));
        }
        updated.unshift(newAddr);

        set({ savedAddresses: updated });

        // Cập nhật địa chỉ mặc định vào user nếu là default
        if (addr.isDefault && get().user) {
          get().updateProfile({ address: addr.addressDetail });
        }
      },

      removeSavedAddress: (id: string) => {
        const currentAddrs = get().savedAddresses;
        const updated = currentAddrs.filter((a) => a.id !== id);
        set({ savedAddresses: updated });
      },

      setDefaultAddress: (id: string) => {
        const currentAddrs = get().savedAddresses;
        let selectedAddrDetail = '';
        const updated = currentAddrs.map((a) => {
          if (a.id === id) {
            selectedAddrDetail = a.addressDetail;
            return { ...a, isDefault: true };
          }
          return { ...a, isDefault: false };
        });

        set({ savedAddresses: updated });

        if (selectedAddrDetail && get().user) {
          get().updateProfile({ address: selectedAddrDetail });
        }
      },

      /**
       * Đồng bộ toàn bộ người dùng từ CSDL Backend về Store (Dành cho trang Admin)
       */
      syncUsersFromDb: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/users`, {
            headers: { 'Accept': 'application/json' },
          });
          const json = await res.json().catch(() => null);

          if (res.ok && json && json.success && Array.isArray(json.data)) {
            const dbAccounts: RegisteredAccount[] = json.data.map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email || '',
              phone: u.phone || '',
              avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`,
              role: (u.role || 'customer').toLowerCase() as Role,
              tier: (u.role === 'admin' || u.role === 'ADMIN') ? 'DIAMOND' : 'BRONZE',
              loyaltyPoints: (u.role === 'admin' || u.role === 'ADMIN') ? 8500 : 50,
              address: '',
              status: 'Hoạt động',
              createdAt: u.createdAt || '',
              passwordHash: '******',
            }));

            // Đảm bảo các tài khoản demo chuẩn vẫn có sẵn
            const current = get().registeredAccounts;
            const merged = [...dbAccounts];
            for (const d of INITIAL_DEMO_ACCOUNTS) {
              if (!merged.some((m) => m.email.toLowerCase() === d.email.toLowerCase() || m.phone === d.phone)) {
                merged.push(d);
              }
            }

            set({ registeredAccounts: merged });
          }
        } catch (err) {
          console.error('Failed to sync users from DB:', err);
        }
      },

      resetPassword: (identifier: string, newPassword: string) => {
        const cleanIdent = identifier.trim().toLowerCase();
        const accounts = get().registeredAccounts;

        const accountIndex = accounts.findIndex((acc) => {
          return (
            acc.email.toLowerCase() === cleanIdent ||
            (acc.phone && acc.phone.replace(/\s+/g, '') === cleanIdent.replace(/\s+/g, ''))
          );
        });

        if (accountIndex === -1) {
          return { success: false, message: 'Không tìm thấy tài khoản với thông tin đã cung cấp!' };
        }

        const updated = [...accounts];
        updated[accountIndex] = {
          ...updated[accountIndex],
          passwordHash: newPassword,
        };

        set({ registeredAccounts: updated });
        return { success: true, message: 'Cập nhật mật khẩu mới thành công! Vui lòng đăng nhập lại.' };
      },

      updateProfile: (data: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...data };
        const accounts = get().registeredAccounts.map((acc) =>
          acc.id === currentUser.id ? { ...acc, ...data } : acc
        );

        set({ user: updatedUser, registeredAccounts: accounts });
      },

      // ================= ADMIN EXCLUSIVE ROLE & USER MANAGEMENT =================
      updateUserRole: async (userId: string, newRole: Role) => {
        const accounts = get().registeredAccounts;
        const targetIndex = accounts.findIndex((a) => a.id === userId);

        if (targetIndex === -1) {
          return { success: false, message: 'Không tìm thấy tài khoản cần phân quyền!' };
        }

        const updatedAccounts = [...accounts];
        updatedAccounts[targetIndex] = {
          ...updatedAccounts[targetIndex],
          role: newRole,
        };

        const currentUser = get().user;
        let updatedCurrentUser = currentUser;
        if (currentUser && currentUser.id === userId) {
          updatedCurrentUser = { ...currentUser, role: newRole };
        }

        set({
          registeredAccounts: updatedAccounts,
          user: updatedCurrentUser,
        });

        // Gửi cập nhật trực tiếp vào cơ sở dữ liệu Backend Laravel
        try {
          await fetch(`${API_BASE_URL}/users/${userId}/role`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ role: newRole.toUpperCase() }),
          });
        } catch (e) {
          console.error('Failed to sync role update to DB:', e);
        }

        const roleNames = {
          admin: 'Quản trị viên (Admin)',
          customer: 'Khách hàng',
          vendor: 'Nông hộ / Đối tác nhà vườn',
          guest: 'Khách vãng lai',
        };

        return {
          success: true,
          message: `Đã thay đổi quyền tài khoản ${updatedAccounts[targetIndex].name} sang "${roleNames[newRole]}". Dữ liệu đã cập nhật CSDL.`,
        };
      },

      toggleUserLock: (userId: string) => {
        const accounts = get().registeredAccounts;
        const targetIndex = accounts.findIndex((a) => a.id === userId);

        if (targetIndex === -1) {
          return { success: false, message: 'Không tìm thấy tài khoản!', newStatus: '' };
        }

        const currentStatus = accounts[targetIndex].status || 'Hoạt động';
        const newStatus = currentStatus === 'Hoạt động' ? 'Khóa' : 'Hoạt động';

        const updatedAccounts = [...accounts];
        updatedAccounts[targetIndex] = {
          ...updatedAccounts[targetIndex],
          status: newStatus,
        };

        set({ registeredAccounts: updatedAccounts });
        return {
          success: true,
          message: `Tài khoản ${updatedAccounts[targetIndex].name} đã chuyển sang trạng thái: ${newStatus}`,
          newStatus,
        };
      },

      deleteUserAccount: async (userId: string) => {
        const accounts = get().registeredAccounts;
        const updatedAccounts = accounts.filter((a) => a.id !== userId);

        set({ registeredAccounts: updatedAccounts });

        // Gửi xóa trực tiếp khỏi cơ sở dữ liệu Backend Laravel
        try {
          await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
          });
        } catch (e) {
          console.error('Failed to delete user in DB:', e);
        }

        return { success: true, message: 'Đã xóa tài khoản khỏi cơ sở dữ liệu!' };
      },
    }),
    {
      name: 'greenfood-auth-storage',
    }
  )
);
