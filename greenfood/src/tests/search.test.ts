import assert from 'assert';
import { getProducts } from '../lib/api';

async function runTests() {
  console.log('========================================================================');
  console.log('🧪 KIỂM THỬ: TÍNH NĂNG TÌM KIẾM SẢN PHẨM & FALLBACK FILTER');
  console.log('========================================================================\n');

  let passed = 0;

  // Test 1: Tìm kiếm từ khóa "cam"
  const camProducts = await getProducts({ search: 'cam' });
  assert(camProducts.length > 0, 'Tìm kiếm từ khóa "cam" phải trả về ít nhất 1 sản phẩm');
  const hasCam = camProducts.some(p => p.name.toLowerCase().includes('cam') || p.farmer?.name.toLowerCase().includes('cam') || p.farmer?.region?.toLowerCase().includes('cam'));
  assert(hasCam, 'Kết quả phải chứa sản phẩm liên quan đến cam');
  console.log(`✅ [PASS] 1. Tìm kiếm "cam" thành công, tìm thấy ${camProducts.length} sản phẩm: [${camProducts.map(p => p.name).join(', ')}]`);
  passed++;

  // Test 2: Tìm kiếm từ khóa "sầu riêng"
  const durianProducts = await getProducts({ search: 'sầu riêng' });
  assert(durianProducts.length > 0, 'Tìm kiếm từ khóa "sầu riêng" phải trả về kết quả');
  assert(durianProducts.some(p => p.name.toLowerCase().includes('sầu riêng')), 'Phải có sản phẩm Sầu riêng');
  console.log(`✅ [PASS] 2. Tìm kiếm "sầu riêng" thành công, tìm thấy ${durianProducts.length} sản phẩm: [${durianProducts.map(p => p.name).join(', ')}]`);
  passed++;

  // Test 3: Tìm kiếm từ khóa không tồn tại
  const emptyProducts = await getProducts({ search: 'xyznonexistentword999' });
  assert(emptyProducts.length === 0, 'Từ khóa không tồn tại phải trả về mảng rỗng');
  console.log('✅ [PASS] 3. Tìm kiếm từ khóa vô nghĩa trả về danh sách rỗng chính xác (không crash, không fallback nhầm)');
  passed++;

  // Test 4: Tìm kiếm không phân biệt chữ hoa chữ thường ("CAM", "Cam", "cam")
  const upperCam = await getProducts({ search: 'CAM' });
  assert(upperCam.length === camProducts.length, 'Tìm kiếm không phân biệt hoa/thường');
  console.log('✅ [PASS] 4. Tìm kiếm không phân biệt chữ hoa/thường ("CAM" == "cam")');
  passed++;

  console.log('\n========================================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passed}/4 TESTS PASSED (100%)`);
  console.log('========================================================================\n');
}

runTests().catch(err => {
  console.error('❌ Kiểm thử thất bại:', err);
  process.exit(1);
});
