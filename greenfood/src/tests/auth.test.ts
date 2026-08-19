import { useAuthStore, INITIAL_DEMO_ACCOUNTS } from '../store/useAuthStore';

console.log('========================================================================');
console.log('🧪 KIỂM THỬ: PHÂN QUYỀN ADMIN & MẶC ĐỊNH TÀI KHOẢN MỚI LÀ KHÁCH HÀNG');
console.log('========================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
  }
}

const store = useAuthStore.getState();

// 1. Initial State
assert(store.user === null, '1. Khởi tạo: Chưa có tài khoản đăng nhập');
assert(store.isAuthenticated === false, '2. Khởi tạo: isAuthenticated = false');

// 2. Admin Login & Authorization Check
const adminLogin = store.authenticate('admin@greenfood.vn', '123456');
assert(adminLogin.success === true && adminLogin.user?.role === 'admin', '3. Đăng nhập Admin thành công với quyền Quản trị viên');

// 3. Test New User Registration - Must ALWAYS default to role: 'customer' (Khách Hàng)
const newReg1 = store.register({
  name: 'Nguyễn Thị Khách',
  email: 'nguyenthikhach@gmail.com',
  phone: '0934111222',
  password: 'Password123!',
});
assert(newReg1.success === true, '4. Đăng ký tài khoản mới thành công');
assert(newReg1.user?.role === 'customer', '5. QUY TẮC BẮT BUỘC: Tài khoản mới đăng ký LUÔN MẶC ĐỊNH là Khách Hàng (customer)');
assert(newReg1.user?.loyaltyPoints === 50, '6. Điểm thưởng chào mừng (+50 điểm) được cộng chính xác');

// 4. Test New User Registration 2 - Also defaults to role: 'customer'
const newReg2 = store.register({
  name: 'Trần Thị Thu',
  email: 'tranthithu@gmail.com',
  phone: '0934333444',
  password: 'Password123!',
});
assert(newReg2.success === true, '7. Đăng ký tài khoản thứ 2 thành công');
assert(newReg2.user?.role === 'customer', '8. Tài khoản thứ 2 cũng mặc định là Khách Hàng (customer)');

// 5. Test Admin Role Management: Admin changes role of new user to 'vendor' (Nông Hộ)
const targetUserId = newReg1.user!.id;
const updateToVendorRes = store.updateUserRole(targetUserId, 'vendor');
assert(updateToVendorRes.success === true, '9. Admin thực hiện phân quyền đổi vai trò thành công');

const updatedAccVendor = useAuthStore.getState().registeredAccounts.find(a => a.id === targetUserId);
assert(updatedAccVendor?.role === 'vendor', '10. Vai trò tài khoản đã được Admin cấp quyền nâng lên "Nông Hộ (vendor)"');

// 6. Test Admin Role Management: Admin changes role of user to 'admin' (Quản trị viên)
const updateToAdminRes = store.updateUserRole(targetUserId, 'admin');
assert(updateToAdminRes.success === true, '11. Admin phân quyền cấp thêm vai trò "Quản trị viên (admin)" thành công');

const updatedAccAdmin = useAuthStore.getState().registeredAccounts.find(a => a.id === targetUserId);
assert(updatedAccAdmin?.role === 'admin', '12. Tài khoản đã nhận đầy đủ quyền Admin từ hệ thống');

// 7. Test Admin Lock/Unlock account
const lockRes = store.toggleUserLock(targetUserId);
assert(lockRes.success === true && lockRes.newStatus === 'Khóa', '13. Admin khóa tài khoản thành công');

store.logout();
const lockedLoginAttempt = store.authenticate('nguyenthikhach@gmail.com', 'Password123!');
assert(lockedLoginAttempt.success === false, '14. Tài khoản bị khóa không thể đăng nhập');

const unlockRes = store.toggleUserLock(targetUserId);
assert(unlockRes.success === true && unlockRes.newStatus === 'Hoạt động', '15. Admin mở khóa tài khoản thành công');

const unlockedLoginAttempt = store.authenticate('nguyenthikhach@gmail.com', 'Password123!');
assert(unlockedLoginAttempt.success === true, '16. Tài khoản sau khi mở khóa đăng nhập bình thường');

// 8. Test Duplicate Prevention
const dupEmail = store.register({
  name: 'Trùng Email',
  email: 'nguyenthikhach@gmail.com',
  phone: '0939999999',
  password: 'Password123!',
});
assert(dupEmail.success === false, '17. Chặn đăng ký trùng email đã có trên hệ thống');

const dupPhone = store.register({
  name: 'Trùng SĐT',
  email: 'newemail999@gmail.com',
  phone: '0934111222',
  password: 'Password123!',
});
assert(dupPhone.success === false, '18. Chặn đăng ký trùng số điện thoại đã có trên hệ thống');

console.log('\n========================================================================');
console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('========================================================================\n');
