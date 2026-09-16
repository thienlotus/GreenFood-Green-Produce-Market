import { useAuthStore } from '../store/useAuthStore';

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

async function runTests() {
  const store = useAuthStore.getState();

  const runId = Math.floor(Math.random() * 900000 + 100000).toString();
  const email1 = `khach_${runId}@gmail.com`;
  const phone1 = `0934${runId.slice(0, 6)}`;
  const email2 = `thu_${runId}@gmail.com`;
  const phone2 = `0935${runId.slice(0, 6)}`;

  // 1. Initial State
  assert(store.user === null, '1. Khởi tạo: Chưa có tài khoản đăng nhập');
  assert(store.isAuthenticated === false, '2. Khởi tạo: isAuthenticated = false');

  // 2. Admin Login & Authorization Check
  const adminLogin = await store.authenticate('admin@greenfood.vn', '123456');
  assert(adminLogin.success === true && adminLogin.user?.role === 'admin', '3. Đăng nhập Admin thành công với quyền Quản trị viên');

  // 3. Test New User Registration - Must ALWAYS default to role: 'customer' (Khách Hàng)
  const newReg1 = await store.register({
    name: 'Nguyễn Thị Khách',
    email: email1,
    phone: phone1,
    password: 'Password123!',
  });
  assert(newReg1.success === true, '4. Đăng ký tài khoản mới thành công');
  assert(newReg1.user?.role === 'customer', '5. QUY TẮC BẮT BUỘC: Tài khoản mới đăng ký LUÔN MẶC ĐỊNH là Khách Hàng (customer)');
  assert(newReg1.user?.loyaltyPoints === 50, '6. Điểm thưởng chào mừng (+50 điểm) được cộng chính xác');

  // 4. Test New User Registration 2 - Also defaults to role: 'customer'
  const newReg2 = await store.register({
    name: 'Trần Thị Thu',
    email: email2,
    phone: phone2,
    password: 'Password123!',
  });
  assert(newReg2.success === true, '7. Đăng ký tài khoản thứ 2 thành công');
  assert(newReg2.user?.role === 'customer', '8. Tài khoản thứ 2 cũng mặc định là Khách Hàng (customer)');

  // 5. Test Admin Role Management: Admin changes role of new user to 'vendor' (Nông Hộ)
  const targetUserId = newReg1.user!.id;
  const updateToVendorRes = await store.updateUserRole(targetUserId, 'vendor');
  assert(updateToVendorRes.success === true, '9. Admin thực hiện phân quyền đổi vai trò thành công');

  const updatedAccVendor = useAuthStore.getState().registeredAccounts.find(a => a.id === targetUserId);
  assert(updatedAccVendor?.role === 'vendor', '10. Vai trò tài khoản đã được Admin cấp quyền nâng lên "Nông Hộ (vendor)"');

  // 6. Test Admin Role Management: Admin changes role of user to 'admin' (Quản trị viên)
  const updateToAdminRes = await store.updateUserRole(targetUserId, 'admin');
  assert(updateToAdminRes.success === true, '11. Admin phân quyền cấp thêm vai trò "Quản trị viên (admin)" thành công');

  const updatedAccAdmin = useAuthStore.getState().registeredAccounts.find(a => a.id === targetUserId);
  assert(updatedAccAdmin?.role === 'admin', '12. Tài khoản đã nhận đầy đủ quyền Admin từ hệ thống');

  // 7. Test Admin Lock/Unlock account
  const lockRes = store.toggleUserLock(targetUserId);
  assert(lockRes.success === true && lockRes.newStatus === 'Khóa', '13. Admin khóa tài khoản thành công');

  store.logout();
  const lockedLoginAttempt = await store.authenticate(email1, 'Password123!');
  assert(lockedLoginAttempt.success === false, '14. Tài khoản bị khóa không thể đăng nhập');

  const unlockRes = store.toggleUserLock(targetUserId);
  assert(unlockRes.success === true && unlockRes.newStatus === 'Hoạt động', '15. Admin mở khóa tài khoản thành công');

  const unlockedLoginAttempt = await store.authenticate(email1, 'Password123!');
  assert(unlockedLoginAttempt.success === true, '16. Tài khoản sau khi mở khóa đăng nhập bình thường');

  // 8. Test Duplicate Prevention
  const dupEmail = await store.register({
    name: 'Trùng Email',
    email: email1,
    phone: `0939${runId.slice(0, 6)}`,
    password: 'Password123!',
  });
  assert(dupEmail.success === false, '17. Chặn đăng ký trùng email đã có trên hệ thống');

  const dupPhone = await store.register({
    name: 'Trùng SĐT',
    email: `newemail_${runId}@gmail.com`,
    phone: phone1,
    password: 'Password123!',
  });
  assert(dupPhone.success === false, '18. Chặn đăng ký trùng số điện thoại đã có trên hệ thống');

  // 9. Test Phone Format Validation
  const letterPhone = await store.register({
    name: 'SĐT Chứa Chữ',
    email: `letter_${runId}@gmail.com`,
    phone: '0934abc123',
    password: 'Password123!',
  });
  assert(letterPhone.success === false, '19. Chặn đăng ký khi số điện thoại chứa chữ cái (0934abc123)');

  const shortPhone = await store.register({
    name: 'SĐT Quá Ngắn',
    email: `short_${runId}@gmail.com`,
    phone: '093412',
    password: 'Password123!',
  });
  assert(shortPhone.success === false, '20. Chặn đăng ký khi số điện thoại không đủ 10 số (093412)');

  const invalidPrefixPhone = await store.register({
    name: 'SĐT Đầu Số Không Hợp Lệ',
    email: `invalid_${runId}@gmail.com`,
    phone: '0123456789',
    password: 'Password123!',
  });
  assert(invalidPrefixPhone.success === false, '21. Chặn đăng ký khi đầu số điện thoại không thuộc mạng di động VN (0123456789)');

  const emptyPhone = await store.register({
    name: 'SĐT Rỗng',
    email: `empty_${runId}@gmail.com`,
    phone: '',
    password: 'Password123!',
  });
  assert(emptyPhone.success === false, '22. Chặn đăng ký khi bỏ trống số điện thoại');

  // 10. TỰ ĐỘNG DỌN DẸP DỮ LIỆU KIỂM THỬ (CLEANUP / TEARDOWN)
  // Xóa ngay lập tức các tài khoản thử nghiệm khỏi CSDL và Store để không tích tụ rác CSDL
  if (newReg1.user?.id) {
    await store.deleteUserAccount(newReg1.user.id);
  }
  if (newReg2.user?.id) {
    await store.deleteUserAccount(newReg2.user.id);
  }
  console.log('🧹 [CLEANUP] Đã tự động dọn dẹp và xóa sạch các tài khoản kiểm thử khỏi CSDL!');

  console.log('\n========================================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('========================================================================\n');
}

runTests().catch(console.error);

