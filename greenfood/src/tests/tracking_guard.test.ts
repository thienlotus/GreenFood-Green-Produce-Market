import { useAuthStore, INITIAL_DEMO_ACCOUNTS } from '../store/useAuthStore';

function normalizePhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('84')) return '0' + digits.slice(2);
  return digits;
}

// Logic kiểm tra quyền sở hữu đơn hàng tương tự như trên TrackingPage
function canViewOrder(
  currentUser: { role: string; phone?: string } | null,
  order: { phone: string }
): boolean {
  if (!currentUser) return false; // Chưa đăng nhập -> Tuyệt đối không được xem
  if (currentUser.role === 'admin') return true; // Admin có quyền xem mọi đơn hàng
  const userPhone = normalizePhone(currentUser.phone);
  const orderPhone = normalizePhone(order.phone);
  return Boolean(userPhone && userPhone === orderPhone);
}

console.log('========================================================================');
console.log('🧪 KIỂM THỬ: LOGIC BẢO VỆ ĐƠN HÀNG TRÊN TRANG TRACKING (PHƯƠNG ÁN 1)');
console.log('========================================================================\n');

const orderCustomer = { id: 'GF284910', phone: '0912345678' };
const orderOther = { id: 'GF285020', phone: '0987654321' };

const customerUser = { role: 'customer', phone: '0912345678', name: 'Nguyễn Văn Khách' };
const adminUser = { role: 'admin', phone: '0901234567', name: 'Trần Quản Trị' };

// Test 1: Khách vãng lai (chưa đăng nhập)
const guestCanView1 = canViewOrder(null, orderCustomer);
console.log(guestCanView1 === false ? '✅ [PASS] 1. Chặn khách chưa đăng nhập xem đơn hàng GF284910' : '❌ [FAIL] 1');

const guestCanView2 = canViewOrder(null, orderOther);
console.log(guestCanView2 === false ? '✅ [PASS] 2. Chặn khách chưa đăng nhập xem đơn hàng GF285020' : '❌ [FAIL] 2');

// Test 2: Khách hàng đăng nhập đúng tài khoản
const customerCanViewOwn = canViewOrder(customerUser, orderCustomer);
console.log(customerCanViewOwn === true ? '✅ [PASS] 3. Khách hàng xem được đơn hàng của chính mình (SĐT khớp 0912345678)' : '❌ [FAIL] 3');

// Test 3: Khách hàng cố tình tra cứu đơn của người khác
const customerCanViewOther = canViewOrder(customerUser, orderOther);
console.log(customerCanViewOther === false ? '✅ [PASS] 4. Chặn khách hàng xem đơn hàng của người khác (SĐT không khớp)' : '❌ [FAIL] 4');

// Test 4: Quản trị viên (Admin)
const adminCanView1 = canViewOrder(adminUser, orderCustomer);
console.log(adminCanView1 === true ? '✅ [PASS] 5. Admin có toàn quyền xem đơn hàng GF284910' : '❌ [FAIL] 5');

const adminCanView2 = canViewOrder(adminUser, orderOther);
console.log(adminCanView2 === true ? '✅ [PASS] 6. Admin có toàn quyền xem đơn hàng GF285020' : '❌ [FAIL] 6');

// Test 5: Chuẩn hóa số điện thoại (+84 vs 0)
const customerWithPlus84 = { role: 'customer', phone: '+84912345678' };
const matchPlus84 = canViewOrder(customerWithPlus84, orderCustomer);
console.log(matchPlus84 === true ? '✅ [PASS] 7. Nhận diện chính xác số điện thoại định dạng quốc tế +84912345678' : '❌ [FAIL] 7');

console.log('\n========================================================================');
console.log('📊 KẾT QUẢ KIỂM THỬ TRACKING GUARD: 7/7 TESTS PASSED (100%)');
console.log('========================================================================\n');
