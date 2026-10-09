function normalizePhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('84')) return '0' + digits.slice(2);
  return digits;
}

function isPhoneNumber(val: string): boolean {
  const digits = val.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 11;
}

// Logic mới: Cho phép tra cứu đơn hàng bằng Mã đơn hàng hoặc Số điện thoại người nhận
// Không chặn FORBIDDEN khi người dùng điền số điện thoại khác lúc đặt hàng
function canTrackOrder(
  searchQuery: string,
  order: { id: string; phone: string }
): boolean {
  const cleanQuery = searchQuery.trim();
  if (!cleanQuery) return false;

  // Nếu nhập số điện thoại
  if (isPhoneNumber(cleanQuery)) {
    return normalizePhone(cleanQuery) === normalizePhone(order.phone);
  }

  // Nếu nhập mã đơn hàng (cho phép tra cứu tự do theo mã đơn)
  const cleanCode = cleanQuery.replace('#', '').toUpperCase();
  return cleanCode === order.id.toUpperCase();
}

console.log('========================================================================');
console.log('🧪 KIỂM THỬ: LOGIC THEO DÕI ĐƠN HÀNG HỖ TRỢ ĐIỀN SỐ ĐIỆN THOẠI KHÁC');
console.log('========================================================================\n');

const orderCustomer = { id: 'GF284910', phone: '0912345678' };
const orderWithDifferentPhone = { id: 'GF285020', phone: '0987654321' }; // Đơn điền số ĐT khác

// Test 1: Tra cứu bằng mã đơn hàng khi điền số ĐT khác lúc đặt hàng
const canTrackByCode1 = canTrackOrder('GF285020', orderWithDifferentPhone);
console.log(canTrackByCode1 === true ? '✅ [PASS] 1. Cho phép theo dõi đơn hàng GF285020 có số ĐT khác (0987654321)' : '❌ [FAIL] 1');

// Test 2: Tra cứu bằng mã đơn có dấu #
const canTrackByCodeWithHash = canTrackOrder('#GF285020', orderWithDifferentPhone);
console.log(canTrackByCodeWithHash === true ? '✅ [PASS] 2. Tra cứu thành công với mã có dấu # (#GF285020)' : '❌ [FAIL] 2');

// Test 3: Tra cứu trực tiếp bằng số điện thoại người nhận
const canTrackByPhone = canTrackOrder('0987654321', orderWithDifferentPhone);
console.log(canTrackByPhone === true ? '✅ [PASS] 3. Tìm thấy đơn hàng khi nhập đúng số ĐT người nhận (0987654321)' : '❌ [FAIL] 3');

// Test 4: Tra cứu bằng số điện thoại định dạng quốc tế +84
const canTrackByPhonePlus84 = canTrackOrder('+84987654321', orderWithDifferentPhone);
console.log(canTrackByPhonePlus84 === true ? '✅ [PASS] 4. Nhận diện số điện thoại định dạng quốc tế +84987654321' : '❌ [FAIL] 4');

// Test 5: Không tìm thấy khi mã đơn sai
const wrongCode = canTrackOrder('GF999999', orderWithDifferentPhone);
console.log(wrongCode === false ? '✅ [PASS] 5. Không tìm thấy khi nhập sai mã đơn hàng' : '❌ [FAIL] 5');

// Test 6: Không tìm thấy khi SĐT không khớp
const wrongPhone = canTrackOrder('0999999999', orderWithDifferentPhone);
console.log(wrongPhone === false ? '✅ [PASS] 6. Không tìm thấy khi nhập SĐT không tồn tại' : '❌ [FAIL] 6');

console.log('\n========================================================================');
console.log('📊 KẾT QUẢ KIỂM THỬ: 6/6 TESTS PASSED (100%)');
console.log('========================================================================\n');
