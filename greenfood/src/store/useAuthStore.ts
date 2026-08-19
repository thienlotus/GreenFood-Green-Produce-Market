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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  registeredAccounts: RegisteredAccount[];
  login: (userData: User) => void;
  logout: () => void;
  authenticate: (identifier: string, password: string) => { success: boolean; message: string; user?: User };
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    farmName?: string;
  }) => { success: boolean; message: string; user?: User };
  resetPassword: (identifier: string, newPassword: string) => { success: boolean; message: string };
  updateProfile: (data: Partial<User>) => void;
  // Admin only role & user management functions
  updateUserRole: (userId: string, newRole: Role) => { success: boolean; message: string };
  toggleUserLock: (userId: string) => { success: boolean; message: string; newStatus: string };
  deleteUserAccount: (userId: string) => { success: boolean; message: string };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      registeredAccounts: INITIAL_DEMO_ACCOUNTS,

      login: (userData: User) => {
        set({ user: userData, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      authenticate: (identifier: string, password: string) => {
        const cleanIdent = identifier.trim().toLowerCase();
        const accounts = get().registeredAccounts;

        const found = accounts.find((acc) => {
          const matchEmail = acc.email.toLowerCase() === cleanIdent;
          const matchPhone = acc.phone?.replace(/\s+/g, '') === cleanIdent.replace(/\s+/g, '');
          const matchUsername =
            (cleanIdent === 'admin' && acc.role === 'admin') ||
            (cleanIdent === 'khachhang' && acc.email.includes('khachhang')) ||
            (cleanIdent === 'nongdan' && acc.email.includes('nongdan'));

          return matchEmail || matchPhone || matchUsername;
        });

        if (!found) {
          return { success: false, message: 'Tài khoản không tồn tại trên hệ thống!' };
        }

        if (found.status === 'Khóa') {
          return { success: false, message: 'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Quản trị viên.' };
        }

        if (found.passwordHash !== password) {
          return { success: false, message: 'Mật khẩu không chính xác! Vui lòng thử lại.' };
        }

        // Extract safe User without passwordHash
        const { passwordHash: _, ...safeUser } = found;
        set({ user: safeUser, isAuthenticated: true });
        return { success: true, message: 'Đăng nhập thành công!', user: safeUser };
      },

      register: (data) => {
        const cleanEmail = data.email.trim().toLowerCase();
        const cleanPhone = data.phone.trim().replace(/\s+/g, '');
        const accounts = get().registeredAccounts;

        const existingEmail = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
        if (existingEmail) {
          return { success: false, message: 'Email này đã được sử dụng bởi tài khoản khác!' };
        }

        if (cleanPhone) {
          const existingPhone = accounts.find(
            (a) => a.phone && a.phone.replace(/\s+/g, '') === cleanPhone
          );
          if (existingPhone) {
            return { success: false, message: 'Số điện thoại này đã được đăng ký trên hệ thống!' };
          }
        }

        // Theo yêu cầu: Tài khoản mới luôn mặc định là Nông hộ ('vendor'). Phân quyền chỉ do Admin thực hiện.
        const newUserAccount: RegisteredAccount = {
          id: `usr-${Date.now()}`,
          name: data.name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          role: 'vendor', // Mặc định luôn là Nông Hộ
          tier: 'BRONZE',
          loyaltyPoints: 50, // Quà tặng điểm thưởng
          farmName: data.farmName?.trim() || `Nhà Vườn ${data.name.trim()}`,
          address: '',
          status: 'Hoạt động',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
          createdAt: new Date().toISOString().split('T')[0],
          passwordHash: data.password,
        };

        const updatedAccounts = [...accounts, newUserAccount];
        const { passwordHash: _, ...safeUser } = newUserAccount;

        set({
          registeredAccounts: updatedAccounts,
          user: safeUser,
          isAuthenticated: true,
        });

        return { 
          success: true, 
          message: 'Đăng ký tài khoản Nông Hộ thành công! Tài khoản mặc định là Nông hộ. Liên hệ Quản trị viên nếu cần cấp lại vai trò.', 
          user: safeUser 
        };
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
      updateUserRole: (userId: string, newRole: Role) => {
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
          user: updatedCurrentUser 
        });

        const roleNames = {
          admin: 'Quản trị viên (Admin)',
          customer: 'Khách hàng',
          vendor: 'Nông hộ / Đối tác nhà vườn',
          guest: 'Khách vãng lai',
        };

        return { 
          success: true, 
          message: `Đã thay đổi quyền tài khoản ${updatedAccounts[targetIndex].name} sang "${roleNames[newRole]}".` 
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
          newStatus 
        };
      },

      deleteUserAccount: (userId: string) => {
        const accounts = get().registeredAccounts;
        const updatedAccounts = accounts.filter((a) => a.id !== userId);

        set({ registeredAccounts: updatedAccounts });
        return { success: true, message: 'Đã xóa tài khoản khỏi hệ thống!' };
      },
    }),
    {
      name: 'greenfood-auth-storage',
    }
  )
);
