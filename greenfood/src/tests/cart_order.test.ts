/**
 * TEST SUITE: KIỂM THỬ API GIỎ HÀNG & ĐẶT HÀNG (CART & ORDER) TRÊN GREENFOOD
 * Mô phỏng chính xác các bài thực hành Postman (GET, POST, PUT, DELETE, 4xx)
 */

const API_URL = 'http://127.0.0.1:8000/api';

async function runTests() {
  console.log('========================================================================');
  console.log('🛒 BẮT ĐẦU KIỂM THỬ API FORM GIỎ HÀNG & ĐẶT HÀNG GREENFOOD');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // Bài 1: GET - Lấy danh sách vùng giao hàng & chính sách phí ship giỏ hàng
    // -------------------------------------------------------------
    console.log('--- BÀI 1: TEST API LẤY DANH SÁCH VÙNG GIAO HÀNG & PHÍ SHIP (GET) ---');
    const res1 = await fetch(`${API_URL}/shipping-zones`);
    const data1 = await res1.json();
    assert(res1.status === 200, 'Bài 1: Status code là 200');
    assert(data1.success === true && Array.isArray(data1.data) && data1.data.length > 0, 'Bài 1: Trả về danh sách vùng giao hàng có dữ liệu');

    // -------------------------------------------------------------
    // Bài 2: POST - Đặt hàng từ Form Giỏ hàng (Checkout)
    // -------------------------------------------------------------
    console.log('\n--- BÀI 2: TEST API ĐẶT HÀNG TỪ GIỎ HÀNG (POST) ---');
    const orderPayload = {
      customer_name: 'Nguyễn Văn Kiểm Thử',
      customer_phone: '0988777999',
      customer_email: 'kiemthu@greenfood.vn',
      shipping_address: '123 Đường Số 1, Phường 4, Quận Gò Vấp, TP.HCM',
      shipping_zone_id: 'SZ001',
      payment_method: 'COD',
      note: 'Giao giờ hành chính, gọi trước khi đến',
      items: [
        {
          product_name: 'Sầu Riêng Ri6 Hạt Lép',
          unit: 'Hộp 500g',
          quantity: 2,
          price: 150000
        },
        {
          product_name: 'Bưởi Da Xanh Ruột Hồng',
          unit: 'Trái 1.2 - 1.5kg',
          quantity: 1,
          price: 65000
        }
      ]
    };

    const res2 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const data2 = await res2.json();

    assert(res2.status === 201, 'Bài 2: Status code là 201 (Created)');
    assert(data2.success === true, 'Bài 2: Đặt hàng thành công');
    assert(typeof data2.data?.tracking_number === 'string', `Bài 2: Tạo mã vận đơn theo dõi (${data2.data?.tracking_number})`);
    assert(data2.data?.total_amount === 365000, `Bài 2: Tổng tiền đơn hàng chính xác (${data2.data?.total_amount}đ)`);

    const trackingCode = data2.data?.tracking_number;
    const orderId = data2.data?.order_id;

    // -------------------------------------------------------------
    // Bài 3: GET - Kiểm tra chi tiết đơn hàng theo mã vận đơn
    // -------------------------------------------------------------
    console.log('\n--- BÀI 3: TEST API XEM CHI TIẾT ĐƠN HÀNG VỪA TẠO (GET) ---');
    const res3 = await fetch(`${API_URL}/orders/tracking/${trackingCode}`);
    const data3 = await res3.json();

    assert(res3.status === 200, 'Bài 3: Status code là 200');
    assert(data3.success === true && data3.data?.id === trackingCode, 'Bài 3: Mã vận đơn trùng khớp');
    assert(data3.data?.items?.length === 2, 'Bài 3: Đầy đủ 2 sản phẩm từ giỏ hàng');

    // -------------------------------------------------------------
    // Bài 4: PUT - Cập nhật trạng thái đơn hàng (CONFIRMED)
    // -------------------------------------------------------------
    console.log('\n--- BÀI 4: TEST API CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (PUT) ---');
    const res4 = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' })
    });
    const data4 = await res4.json();

    assert(res4.status === 200, 'Bài 4: Status code là 200');
    assert(data4.success === true, 'Bài 4: Cập nhật trạng thái thành công');
    assert(data4.data?.status === 'confirmed', 'Bài 4: Trạng thái mới là confirmed');

    // -------------------------------------------------------------
    // Bài 5: POST & DELETE - Thêm và Xóa vùng vận chuyển kiểm thử
    // -------------------------------------------------------------
    console.log('\n--- BÀI 5: TEST API THÊM & XÓA VÙNG PHÍ SHIP GIỎ HÀNG (DELETE) ---');
    // Tạo tạm 1 vùng ship để xóa
    const res5Create = await fetch(`${API_URL}/shipping-zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: 'Vùng Thử Nghiệm Xóa',
        provinces: 'Tỉnh Test',
        base_fee: 99000,
        estimated_days: '9 ngày'
      })
    });
    const data5Create = await res5Create.json();
    const tempZoneId = data5Create.data?.id;

    // Tiến hành DELETE
    const res5Delete = await fetch(`${API_URL}/shipping-zones/${tempZoneId}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    const data5Delete = await res5Delete.json();

    assert(res5Delete.status === 200, 'Bài 5: Status code là 200 khi xóa');
    assert(data5Delete.success === true, 'Bài 5: Đã xóa thành công vùng thử nghiệm');

    // -------------------------------------------------------------
    // Bài 6: KIỂM THỬ CÁC MÃ LỖI (4xx)
    // -------------------------------------------------------------
    console.log('\n--- BÀI 6: KIỂM THỬ CÁC TÌNH HUỐNG LỖI (4xx) ---');
    
    // 6.1: Lỗi 422 - Form giỏ hàng thiếu trường bắt buộc (thiếu items và phone)
    const resErr422 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Khách thiếu thông tin'
      })
    });
    const dataErr422 = await resErr422.json();
    assert(resErr422.status === 422, 'Lỗi 422: Báo lỗi Unprocessable Entity khi form giỏ hàng thiếu trường bắt buộc');
    assert(dataErr422.success === false && dataErr422.errors !== undefined, 'Lỗi 422: Trả về chi tiết các trường bị thiếu');

    // 6.2: Lỗi 404 - Tra cứu đơn hàng không tồn tại
    const resErr404 = await fetch(`${API_URL}/orders/tracking/GF999999999`);
    const dataErr404 = await resErr404.json();
    assert(resErr404.status === 404, 'Lỗi 404: Báo lỗi Not Found khi mã đơn không tồn tại');
    assert(dataErr404.success === false, 'Lỗi 404: Body thông báo không tìm thấy đơn hàng');

  } catch (err) {
    console.error('Lỗi ngoại lệ trong quá trình kiểm thử:', err);
  }

  console.log('\n========================================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log('========================================================================\n');
}

runTests();
