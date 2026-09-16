import assert from 'assert';
import { getProducts } from '../lib/api';

async function runTests() {
  console.log('========================================================================');
  console.log('🧪 KIỂM THỬ: LOGIC TÌM KIẾM SẢN PHẨM THÔNG MINH (CHẶT CHẼ THEO TÊN)');
  console.log('========================================================================\n');

  let passed = 0;

  // Test 1: Tìm kiếm từ khóa "cam" - TUYỆT ĐỐI CHỈ RA SẢN PHẨM VỀ CAM
  const camProducts = await getProducts({ search: 'cam' });
  assert(camProducts.length > 0, 'Tìm kiếm từ khóa "cam" phải trả về kết quả');
  const names = camProducts.map(p => p.name);
  console.log(`🔎 Kết quả tìm 'cam': [${names.join(', ')}]`);

  assert(
    camProducts.every(p => p.name.toLowerCase().includes('cam')),
    'Tất cả sản phẩm trả về khi tìm "cam" phải có tên chứa "cam" (không được lẫn Sầu riêng hoặc Dưa lưới)'
  );
  assert(!names.includes('Sầu Riêng Ri6 Hạt Lép'), 'TUYỆT ĐỐI KHÔNG ĐƯỢC LẪN "Sầu Riêng Ri6 Hạt Lép" khi tìm "cam"');
  assert(!names.includes('Dưa Lưới Mật Hữu Cơ'), 'TUYỆT ĐỐI KHÔNG ĐƯỢC LẪN "Dưa Lưới Mật Hữu Cơ" khi tìm "cam"');
  console.log('✅ [PASS] 1. Tìm "cam" thành công: Chỉ trả về sản phẩm Cam thật sự, không bị lẫn Sầu riêng (cam kết) hay Dưa lưới (ruột màu cam)');
  passed++;

  // Test 2: Tìm kiếm "sầu riêng"
  const durianProducts = await getProducts({ search: 'sầu riêng' });
  assert(durianProducts.length === 1 && durianProducts[0].name.includes('Sầu Riêng'), 'Tìm "sầu riêng" phải ra đúng Sầu Riêng Ri6');
  console.log('✅ [PASS] 2. Tìm "sầu riêng" (có dấu) trả về chính xác [Sầu Riêng Ri6 Hạt Lép]');
  passed++;

  // Test 3: Tìm kiếm không dấu "sau rieng"
  const unaccentedDurian = await getProducts({ search: 'sau rieng' });
  assert(unaccentedDurian.length === 1 && unaccentedDurian[0].name.includes('Sầu Riêng'), 'Tìm "sau rieng" không dấu phải ra đúng Sầu Riêng');
  console.log('✅ [PASS] 3. Tìm "sau rieng" (tiếng Việt không dấu) tự động nhận diện chính xác [Sầu Riêng Ri6 Hạt Lép]');
  passed++;

  // Test 4: Tìm kiếm theo địa danh / nhà vườn "đà lạt" và "da lat"
  const dalatAccented = await getProducts({ search: 'đà lạt' });
  const dalatUnaccented = await getProducts({ search: 'da lat' });
  assert(dalatAccented.length >= 2, 'Tìm "đà lạt" phải ra các sản phẩm xuất xứ Đà Lạt');
  assert(dalatUnaccented.length === dalatAccented.length, 'Tìm "da lat" không dấu phải ra cùng kết quả với "đà lạt" có dấu');
  console.log(`✅ [PASS] 4. Tìm kiếm địa danh / nhà vườn ("đà lạt" / "da lat") tìm thấy ${dalatAccented.length} sản phẩm: [${dalatAccented.map(p => p.name).join(', ')}]`);
  passed++;

  // Test 5: Tìm từ khóa không tồn tại
  const emptyProducts = await getProducts({ search: 'tukhongtontaixyz999' });
  assert(emptyProducts.length === 0, 'Từ khóa không tồn tại phải trả về mảng rỗng');
  console.log('✅ [PASS] 5. Từ khóa không tồn tại trả về rỗng chính xác (hiển thị empty state gợi ý)');
  passed++;

  console.log('\n========================================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passed}/5 TESTS PASSED (100%)`);
  console.log('========================================================================\n');
}

runTests().catch(err => {
  console.error('❌ Kiểm thử thất bại:', err);
  process.exit(1);
});
