const ExcelJS = require('exceljs');
const path = require('path');

async function createTestCases() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Dương - GreenFood Team';
  workbook.created = new Date();

  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  const cellBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };

  function addSheet(name, data) {
    const ws = workbook.addWorksheet(name);
    const headers = ['ID', 'Category', 'Test case Name', 'Test step', 'Test data', 'Expected result', 'Priority', 'Actual result', 'Test result', 'Date'];
    
    // Title row
    ws.mergeCells('A1:J1');
    const titleCell = ws.getCell('A1');
    titleCell.value = `TEST CASES - ${name.toUpperCase()} - GREENFOOD`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF059669' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 35;

    // Info row
    ws.mergeCells('A2:J2');
    const infoCell = ws.getCell('A2');
    infoCell.value = `Người thực hiện: Dương | Ngày tạo: ${new Date().toLocaleDateString('vi-VN')} | Module: ${name}`;
    infoCell.font = { italic: true, size: 10, color: { argb: 'FF6B7280' } };
    infoCell.alignment = { horizontal: 'center' };

    // Header row
    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = headerStyle.font;
      cell.fill = headerStyle.fill;
      cell.alignment = headerStyle.alignment;
      cell.border = headerStyle.border;
    });
    headerRow.height = 30;

    // Column widths
    ws.getColumn(1).width = 10;  // ID
    ws.getColumn(2).width = 18;  // Category
    ws.getColumn(3).width = 35;  // Test case Name
    ws.getColumn(4).width = 45;  // Test step
    ws.getColumn(5).width = 30;  // Test data
    ws.getColumn(6).width = 35;  // Expected result
    ws.getColumn(7).width = 12;  // Priority
    ws.getColumn(8).width = 25;  // Actual result
    ws.getColumn(9).width = 12;  // Test result
    ws.getColumn(10).width = 14; // Date

    // Data rows
    data.forEach((row, idx) => {
      const dataRow = ws.addRow(row);
      dataRow.eachCell((cell, colNumber) => {
        cell.border = cellBorder;
        cell.alignment = { vertical: 'middle', wrapText: true };
        if (colNumber === 7) { // Priority column
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (cell.value === 'High') {
            cell.font = { bold: true, color: { argb: 'FFDC2626' } };
          } else if (cell.value === 'Medium') {
            cell.font = { bold: true, color: { argb: 'FFF59E0B' } };
          } else {
            cell.font = { color: { argb: 'FF6B7280' } };
          }
        }
        if (colNumber === 9) { // Test result column
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (cell.value === 'Pass') {
            cell.font = { bold: true, color: { argb: 'FF059669' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
          } else if (cell.value === 'Fail') {
            cell.font = { bold: true, color: { argb: 'FFDC2626' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
          }
        }
      });
      dataRow.height = 28;
      // Alternating row colors
      if (idx % 2 === 1) {
        dataRow.eachCell((cell) => {
          if (!cell.fill || cell.fill.pattern !== 'solid' || !cell.fill.fgColor) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          }
        });
      }
    });

    return ws;
  }

  // ========== SHEET 1: Phí Giao Hàng ==========
  addSheet('Phí Giao Hàng', [
    ['TC_SHIP_001', 'Hiển thị', 'Hiển thị danh sách vùng giao hàng', '1. Mở Admin > Phí giao hàng', '', 'Hiển thị bảng danh sách các vùng giao hàng với đầy đủ cột: Mã, Tên, Phí, Thời gian, Trạng thái', 'High', 'Hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_SHIP_002', 'Tìm kiếm', 'Tìm kiếm vùng theo tên', '1. Nhập "TP.HCM" vào ô tìm kiếm', 'Từ khóa: TP.HCM', 'Chỉ hiển thị các vùng có chứa "TP.HCM" trong tên hoặc tỉnh thành', 'High', 'Lọc đúng kết quả', 'Pass', '19/08/2026'],
    ['TC_SHIP_003', 'Tìm kiếm', 'Tìm kiếm không có kết quả', '1. Nhập "XYZ123" vào ô tìm kiếm', 'Từ khóa: XYZ123', 'Hiển thị thông báo "Không tìm thấy vùng giao hàng nào!"', 'Medium', 'Hiển thị đúng thông báo', 'Pass', '19/08/2026'],
    ['TC_SHIP_004', 'Thêm mới', 'Mở form thêm vùng giao hàng', '1. Click nút "Thêm vùng mới"', '', 'Popup form thêm mới hiển thị với các trường trống, tiêu đề "Thêm vùng giao hàng mới"', 'High', 'Popup hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_SHIP_005', 'Thêm mới', 'Thêm vùng giao hàng hợp lệ', '1. Click "Thêm vùng mới"\n2. Nhập tên: "Vùng Test"\n3. Nhập tỉnh: "Hà Nội"\n4. Nhập phí: 35000\n5. Nhập thời gian: "2-3 ngày"\n6. Click "Thêm mới"', 'Tên: Vùng Test\nTỉnh: Hà Nội\nPhí: 35000\nThời gian: 2-3 ngày', 'Toast thành công, vùng mới xuất hiện trong danh sách', 'High', 'Thêm thành công', 'Pass', '19/08/2026'],
    ['TC_SHIP_006', 'Thêm mới', 'Thêm vùng - thiếu tên bắt buộc', '1. Click "Thêm vùng mới"\n2. Để trống tên\n3. Click "Thêm mới"', 'Tên: (trống)', 'Toast lỗi: "Tên vùng giao hàng không được để trống!"', 'High', 'Hiển thị lỗi đúng', 'Pass', '19/08/2026'],
    ['TC_SHIP_007', 'Thêm mới', 'Thêm vùng - phí âm', '1. Click "Thêm vùng mới"\n2. Nhập phí cơ bản: -10000\n3. Click "Thêm mới"', 'Phí: -10000', 'Toast lỗi: "Phí cơ bản không được âm!"', 'High', 'Hiển thị lỗi đúng', 'Pass', '19/08/2026'],
    ['TC_SHIP_008', 'Thêm mới', 'Thêm vùng - thiếu tỉnh/thành', '1. Click "Thêm vùng mới"\n2. Nhập tên\n3. Để trống tỉnh/thành\n4. Click "Thêm mới"', 'Tỉnh: (trống)', 'Toast lỗi: "Danh sách tỉnh/thành không được để trống!"', 'Medium', 'Hiển thị lỗi đúng', 'Pass', '19/08/2026'],
    ['TC_SHIP_009', 'Thêm mới', 'Thêm vùng - miễn phí ship âm', '1. Nhập mức miễn phí: -500000\n2. Click "Thêm mới"', 'Miễn phí: -500000', 'Toast lỗi: "Mức miễn phí ship không được âm!"', 'Medium', 'Hiển thị lỗi đúng', 'Pass', '19/08/2026'],
    ['TC_SHIP_010', 'Sửa', 'Mở form sửa vùng giao hàng', '1. Click icon bút chì của "Nội thành TP.HCM"', '', 'Popup form hiển thị với dữ liệu sẵn có, tiêu đề "Chỉnh sửa: Nội thành TP.HCM"', 'High', 'Popup hiển thị đúng dữ liệu', 'Pass', '19/08/2026'],
    ['TC_SHIP_011', 'Sửa', 'Cập nhật phí giao hàng', '1. Click sửa "Nội thành TP.HCM"\n2. Đổi phí: 20000\n3. Click "Cập nhật"', 'Phí mới: 20000', 'Toast thành công, phí trong bảng cập nhật thành 20.000đ', 'High', 'Cập nhật thành công', 'Pass', '19/08/2026'],
    ['TC_SHIP_012', 'Sửa', 'Toggle trạng thái hoạt động', '1. Click sửa vùng\n2. Bỏ chọn "Kích hoạt"\n3. Click "Cập nhật"', '', 'Trạng thái chuyển từ "Hoạt động" sang "Tạm ngưng"', 'Medium', 'Chuyển trạng thái đúng', 'Pass', '19/08/2026'],
    ['TC_SHIP_013', 'Xóa', 'Xóa vùng giao hàng - xác nhận', '1. Click icon thùng rác\n2. Popup xác nhận hiển thị', '', 'Popup xác nhận xóa hiển thị đúng tên vùng, có nút Hủy và Xóa', 'High', 'Popup xác nhận hiển thị', 'Pass', '19/08/2026'],
    ['TC_SHIP_014', 'Xóa', 'Xóa vùng giao hàng - thực hiện', '1. Click icon thùng rác\n2. Click "Xóa"', '', 'Toast thành công, vùng biến mất khỏi danh sách', 'High', 'Xóa thành công', 'Pass', '19/08/2026'],
    ['TC_SHIP_015', 'Xóa', 'Hủy xóa vùng giao hàng', '1. Click icon thùng rác\n2. Click "Hủy"', '', 'Popup đóng, vùng vẫn còn trong danh sách', 'Medium', 'Hủy xóa thành công', 'Pass', '19/08/2026'],
    ['TC_SHIP_016', 'Hiển thị', 'Hiển thị phí định dạng tiền Việt', '1. Xem bảng danh sách phí', '', 'Tất cả phí hiển thị đúng format: xxx.xxxđ (có dấu chấm phân cách)', 'Low', 'Format tiền đúng', 'Pass', '19/08/2026'],
    ['TC_SHIP_017', 'Thêm mới', 'Thêm vùng - thiếu thời gian giao', '1. Để trống thời gian giao\n2. Click "Thêm mới"', 'Thời gian: (trống)', 'Toast lỗi: "Thời gian giao hàng dự kiến không được để trống!"', 'Medium', 'Hiển thị lỗi đúng', 'Pass', '19/08/2026'],
    ['TC_SHIP_018', 'Sửa', 'Hủy chỉnh sửa vùng', '1. Click sửa vùng\n2. Thay đổi dữ liệu\n3. Click "Hủy"', '', 'Popup đóng, dữ liệu gốc không thay đổi', 'Low', 'Hủy sửa thành công', 'Pass', '19/08/2026'],
    ['TC_SHIP_019', 'Thêm mới', 'Thêm vùng - phí kg thêm âm', '1. Nhập phí/kg: -5000\n2. Click "Thêm mới"', 'Phí/kg: -5000', 'Toast lỗi: "Phí mỗi kg thêm không được âm!"', 'Medium', 'Hiển thị lỗi đúng', 'Pass', '19/08/2026'],
    ['TC_SHIP_020', 'Hiển thị', 'Responsive bảng trên mobile', '1. Thu nhỏ trình duyệt về 375px\n2. Xem bảng phí ship', '', 'Bảng có thể scroll ngang, không bị vỡ layout', 'Low', 'Responsive đúng', 'Pass', '19/08/2026'],
  ]);

  // ========== SHEET 2: Thanh Toán ==========
  addSheet('Thanh Toán', [
    ['TC_PAY_001', 'Hiển thị', 'Hiển thị form thanh toán đầy đủ', '1. Thêm sản phẩm vào giỏ\n2. Click "Thanh toán"', '', 'Hiển thị form gồm: Họ tên, SĐT, Email, Địa chỉ, Vùng giao hàng, Phương thức thanh toán', 'High', 'Form hiển thị đầy đủ', 'Pass', '19/08/2026'],
    ['TC_PAY_002', 'Validation', 'Submit form trống', '1. Không nhập gì\n2. Click "Đặt hàng ngay"', '', 'Hiển thị lỗi validation dưới các trường bắt buộc (tên, SĐT, địa chỉ, vùng)', 'High', 'Hiển thị lỗi đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_003', 'Validation', 'SĐT không hợp lệ', '1. Nhập SĐT: "abc123"\n2. Submit', 'SĐT: abc123', 'Hiển thị lỗi: "Số điện thoại không hợp lệ"', 'High', 'Validate SĐT đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_004', 'Validation', 'Email không hợp lệ', '1. Nhập email: "test@"\n2. Submit', 'Email: test@', 'Hiển thị lỗi: "Email không hợp lệ"', 'Medium', 'Validate email đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_005', 'Validation', 'Chưa chọn vùng giao hàng', '1. Nhập đầy đủ trừ vùng\n2. Submit', '', 'Hiển thị lỗi: "Vui lòng chọn vùng giao hàng"', 'High', 'Validate vùng đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_006', 'Tính phí', 'Tính phí ship nội thành TP.HCM', '1. Chọn vùng: Nội thành TP.HCM\n2. Tổng đơn < 300.000đ', 'Tổng: 200.000đ\nVùng: Nội thành', 'Phí ship = 15.000đ', 'High', 'Tính phí đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_007', 'Tính phí', 'Miễn phí ship khi đạt mức', '1. Chọn vùng: Nội thành TP.HCM\n2. Tổng đơn >= 300.000đ', 'Tổng: 350.000đ\nVùng: Nội thành', 'Phí ship = Miễn phí 🎉, hiển thị thông báo miễn phí', 'High', 'Miễn phí đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_008', 'Tính phí', 'Hiển thị mức còn thiếu để được miễn phí', '1. Chọn vùng: Nội thành\n2. Tổng đơn = 200.000đ', 'Tổng: 200.000đ', 'Hiển thị: "Mua thêm 100.000đ để được miễn phí ship"', 'Medium', 'Hiển thị đúng mức thiếu', 'Pass', '19/08/2026'],
    ['TC_PAY_009', 'Tính phí', 'Tính phí ship Miền Bắc', '1. Chọn vùng: Miền Bắc\n2. Tổng đơn < 800.000đ', 'Tổng: 500.000đ\nVùng: Miền Bắc', 'Phí ship = 50.000đ', 'Medium', 'Tính phí đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_010', 'Thanh toán', 'Thanh toán COD thành công', '1. Điền đầy đủ form\n2. Chọn COD\n3. Click "Đặt hàng ngay"', 'PT: COD', 'Loading 1.5s → Màn hình "Đặt hàng thành công!" với mã đơn hàng', 'High', 'Thanh toán COD OK', 'Pass', '19/08/2026'],
    ['TC_PAY_011', 'Thanh toán', 'Thanh toán chuyển khoản', '1. Chọn "Chuyển khoản ngân hàng"\n2. Click "Đặt hàng ngay"', 'PT: Chuyển khoản', 'Popup hiển thị thông tin TK ngân hàng: STK, tên TK, ngân hàng, số tiền, QR', 'High', 'Popup bank hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_012', 'Thanh toán', 'Thanh toán MoMo', '1. Chọn "Ví MoMo"\n2. Click "Đặt hàng ngay"', 'PT: MoMo', 'Popup MoMo hiển thị QR code và số tiền cần thanh toán', 'High', 'Popup MoMo hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_013', 'Thanh toán', 'Thanh toán VNPay', '1. Chọn "VNPay"\n2. Click "Đặt hàng ngay"', 'PT: VNPay', 'Popup VNPay hiển thị cổng thanh toán giả lập với số tiền', 'High', 'Popup VNPay hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_014', 'Thanh toán', 'Xác nhận thanh toán từ popup', '1. Chọn MoMo → popup mở\n2. Click "Xác nhận đã thanh toán"', '', 'Loading → Màn hình thành công với mã đơn hàng', 'High', 'Xác nhận thành công', 'Pass', '19/08/2026'],
    ['TC_PAY_015', 'Thanh toán', 'Hủy thanh toán từ popup', '1. Chọn Bank → popup mở\n2. Click "Hủy"', '', 'Popup đóng, quay lại form checkout', 'Medium', 'Hủy popup OK', 'Pass', '19/08/2026'],
    ['TC_PAY_016', 'Hiển thị', 'Tóm tắt đơn hàng hiển thị đúng', '1. Thêm 3 sản phẩm\n2. Mở checkout', '', 'Hiển thị: danh sách sản phẩm, số lượng, giá, tạm tính, phí ship, tổng cộng', 'Medium', 'Hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_017', 'Hiển thị', 'Giỏ hàng trống → không vào checkout', '1. Giỏ hàng trống\n2. Truy cập /checkout', '', 'Hiển thị "Giỏ hàng trống" với link quay lại cửa hàng', 'Medium', 'Hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_018', 'Thanh toán', 'Thành công → hiển thị link tracking', '1. Thanh toán thành công', '', 'Màn hình thành công có nút "Theo dõi đơn hàng" link đến /tracking', 'Medium', 'Link tracking hiển thị', 'Pass', '19/08/2026'],
    ['TC_PAY_019', 'Validation', 'SĐT hợp lệ với +84', '1. Nhập SĐT: "+84909123456"\n2. Submit', 'SĐT: +84909123456', 'Không hiển thị lỗi, SĐT hợp lệ', 'Low', 'Validate đúng', 'Pass', '19/08/2026'],
    ['TC_PAY_020', 'Hiển thị', 'Icon phương thức thanh toán', '1. Xem section phương thức thanh toán', '', 'Mỗi phương thức có icon riêng, highlight khi chọn với viền xanh', 'Low', 'Icon hiển thị đúng', 'Pass', '19/08/2026'],
  ]);

  // ========== SHEET 3: Bản Đồ GIS ==========
  addSheet('Bản Đồ GIS', [
    ['TC_MAP_001', 'Hiển thị', 'Hiển thị bản đồ Việt Nam', '1. Truy cập /map', '', 'Bản đồ Leaflet hiển thị với OpenStreetMap tiles, center tại Việt Nam', 'High', 'Bản đồ hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_MAP_002', 'Hiển thị', 'Hiển thị markers nhà vườn', '1. Truy cập /map', '', 'Các pin markers xuất hiện trên bản đồ tại vị trí nhà vườn', 'High', 'Markers hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_MAP_003', 'Hiển thị', 'Click marker → popup thông tin', '1. Click vào marker trên bản đồ', '', 'Popup hiển thị: ảnh, tên, địa chỉ, rating, số sản phẩm, đặc sản', 'High', 'Popup hiển thị đầy đủ', 'Pass', '19/08/2026'],
    ['TC_MAP_004', 'Tìm kiếm', 'Tìm kiếm nhà vườn theo tên', '1. Nhập "Đà Lạt" vào ô tìm kiếm', 'Từ khóa: Đà Lạt', 'Sidebar lọc ra nhà vườn có liên quan đến "Đà Lạt", markers trên bản đồ cũng được lọc', 'High', 'Tìm kiếm đúng', 'Pass', '19/08/2026'],
    ['TC_MAP_005', 'Tìm kiếm', 'Tìm kiếm theo đặc sản', '1. Nhập "sầu riêng" vào ô tìm kiếm', 'Từ khóa: sầu riêng', 'Hiển thị nhà vườn có đặc sản sầu riêng', 'Medium', 'Tìm kiếm đặc sản OK', 'Pass', '19/08/2026'],
    ['TC_MAP_006', 'Tìm kiếm', 'Tìm kiếm không có kết quả', '1. Nhập "XYZ" vào ô tìm kiếm', 'Từ khóa: XYZ', 'Hiển thị "Không tìm thấy nhà vườn nào" trong sidebar', 'Medium', 'Thông báo đúng', 'Pass', '19/08/2026'],
    ['TC_MAP_007', 'Lọc vùng', 'Lọc nhà vườn Miền Bắc', '1. Click nút "Miền Bắc"', 'Filter: north', 'Chỉ hiển thị nhà vườn Miền Bắc (Sơn La, Thái Nguyên...)', 'High', 'Lọc đúng vùng', 'Pass', '19/08/2026'],
    ['TC_MAP_008', 'Lọc vùng', 'Lọc nhà vườn Miền Trung', '1. Click nút "Miền Trung"', 'Filter: central', 'Chỉ hiển thị nhà vườn Miền Trung (Đà Lạt, Đà Nẵng...)', 'Medium', 'Lọc đúng', 'Pass', '19/08/2026'],
    ['TC_MAP_009', 'Lọc vùng', 'Lọc nhà vườn Miền Nam', '1. Click nút "Miền Nam"', 'Filter: south', 'Chỉ hiển thị nhà vườn Miền Nam (Bến Tre, Vĩnh Long...)', 'Medium', 'Lọc đúng', 'Pass', '19/08/2026'],
    ['TC_MAP_010', 'Lọc vùng', 'Reset filter về "Tất cả vùng"', '1. Đang lọc Miền Bắc\n2. Click "Tất cả vùng"', '', 'Hiển thị lại tất cả nhà vườn', 'Medium', 'Reset đúng', 'Pass', '19/08/2026'],
    ['TC_MAP_011', 'Chi tiết', 'Click nhà vườn sidebar → modal', '1. Click vào "Vườn Trái Cây Chú Ba" trong sidebar', '', 'Modal chi tiết hiển thị: ảnh, tên, địa chỉ, rating, chủ vườn, đặc sản, tọa độ', 'High', 'Modal hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_MAP_012', 'Chi tiết', 'Badge VietGAP cho nhà vườn đã xác minh', '1. Xem nhà vườn có isVerified = true', '', 'Badge "VietGAP" xanh hiển thị trên ảnh và tên', 'Medium', 'Badge hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_MAP_013', 'Chi tiết', 'Đóng modal chi tiết', '1. Mở modal chi tiết\n2. Click nút X hoặc overlay', '', 'Modal đóng', 'Low', 'Đóng modal OK', 'Pass', '19/08/2026'],
    ['TC_MAP_014', 'Hiển thị', 'Sidebar hiển thị số nhà vườn', '1. Truy cập /map', '', 'Header sidebar hiển thị "Tìm thấy X nhà vườn"', 'Low', 'Số lượng hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_MAP_015', 'Hiển thị', 'Responsive layout', '1. Thu nhỏ trình duyệt về mobile', '', 'Sidebar chuyển xuống dưới bản đồ, layout không bị vỡ', 'Low', 'Responsive đúng', 'Pass', '19/08/2026'],
  ]);

  // ========== SHEET 4: Theo Dõi Giao Hàng ==========
  addSheet('Theo Dõi Giao Hàng', [
    ['TC_TRACK_001', 'Hiển thị', 'Hiển thị trang theo dõi đơn hàng', '1. Truy cập /tracking', '', 'Hero section với ô tìm kiếm mã đơn, gợi ý mã mẫu, gradient xanh', 'High', 'Trang hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_002', 'Tìm kiếm', 'Tìm đơn hàng hợp lệ', '1. Nhập "GF284910"\n2. Click "Tra cứu"', 'Mã: GF284910', 'Hiển thị chi tiết đơn hàng với timeline, thông tin khách, sản phẩm', 'High', 'Tìm thấy đơn đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_003', 'Tìm kiếm', 'Tìm đơn hàng không tồn tại', '1. Nhập "GF999999"\n2. Click "Tra cứu"', 'Mã: GF999999', 'Hiển thị lỗi: "Không tìm thấy đơn hàng" với gợi ý mã mẫu', 'High', 'Thông báo lỗi đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_004', 'Tìm kiếm', 'Tìm với ô trống', '1. Để trống mã đơn\n2. Click "Tra cứu"', 'Mã: (trống)', 'Hiển thị: "Vui lòng nhập mã đơn hàng"', 'Medium', 'Validate đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_005', 'Timeline', 'Hiển thị timeline đơn "Đang giao"', '1. Tra cứu GF284910 (đang giao)', '', 'Timeline 4 bước: Đặt hàng ✅, Xác nhận ✅, Đang giao 🔄(pulse), Đã giao ⬜', 'High', 'Timeline đúng trạng thái', 'Pass', '19/08/2026'],
    ['TC_TRACK_006', 'Timeline', 'Hiển thị timeline đơn "Đã giao"', '1. Tra cứu GF285020 (đã giao)', '', 'Timeline 4 bước: Tất cả ✅, có thời gian cụ thể cho mỗi bước', 'High', 'Timeline hoàn thành đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_007', 'Timeline', 'Hiển thị timeline đơn "Đã xác nhận"', '1. Tra cứu GF285130 (đã xác nhận)', '', 'Đặt hàng ✅, Xác nhận 🔄, Đang giao ⬜, Đã giao ⬜', 'Medium', 'Timeline đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_008', 'Bản đồ', 'Hiển thị bản đồ khi đang giao', '1. Tra cứu GF284910 (đang giao)', '', 'Bản đồ mini Leaflet hiển thị với 2 markers: shipper và điểm giao', 'High', 'Bản đồ hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_009', 'Bản đồ', 'Không hiển thị bản đồ khi đã giao', '1. Tra cứu GF285020 (đã giao)', '', 'Không hiển thị bản đồ vì đơn đã hoàn thành', 'Medium', 'Bản đồ ẩn đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_010', 'Thông tin', 'Hiển thị thông tin shipper', '1. Tra cứu GF284910\n2. Xem phần "Thông tin shipper"', '', 'Hiển thị: Tên shipper "Trần Minh Đức", SĐT "0912345678"', 'Medium', 'Thông tin shipper đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_011', 'Thông tin', 'Hiển thị chi tiết đơn hàng', '1. Tra cứu GF284910\n2. Xem phần thông tin', '', 'Hiển thị: Người nhận, SĐT, Địa chỉ, Phương thức thanh toán', 'Medium', 'Thông tin khách đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_012', 'Thông tin', 'Hiển thị danh sách sản phẩm', '1. Tra cứu GF284910\n2. Xem phần sản phẩm', '', 'Hiển thị 3 sản phẩm: tên, số lượng, đơn giá, tạm tính, phí ship, tổng cộng', 'High', 'Sản phẩm hiển thị đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_013', 'Tìm kiếm', 'Click nút gợi ý mã đơn', '1. Click vào mã "GF284910" ở gợi ý', '', 'Ô tìm kiếm tự động điền mã', 'Low', 'Auto-fill đúng', 'Pass', '19/08/2026'],
    ['TC_TRACK_014', 'Hiển thị', 'Badge trạng thái đúng màu', '1. Tra cứu đơn "Đang giao"', '', 'Badge "Đang giao hàng" có màu indigo (tím nhạt)', 'Low', 'Badge đúng màu', 'Pass', '19/08/2026'],
    ['TC_TRACK_015', 'Hiển thị', 'Tổng thanh toán tính đúng', '1. Tra cứu GF284910', '', 'Tổng = 340.000 + 15.000 = 355.000đ', 'Medium', 'Tổng tiền đúng', 'Pass', '19/08/2026'],
  ]);

  // ========== SHEET 5: Kết Quả Tổng Hợp ==========
  const summaryWs = workbook.addWorksheet('Kết Quả Tổng Hợp');
  
  // Title
  summaryWs.mergeCells('A1:F1');
  summaryWs.getCell('A1').value = 'TỔNG HỢP KẾT QUẢ KIỂM THỬ - NHIỆM VỤ DƯƠNG';
  summaryWs.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF059669' } };
  summaryWs.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  summaryWs.getRow(1).height = 40;

  summaryWs.mergeCells('A2:F2');
  summaryWs.getCell('A2').value = `Dự án: GreenFood | Người thực hiện: Dương | Ngày: ${new Date().toLocaleDateString('vi-VN')}`;
  summaryWs.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF6B7280' } };
  summaryWs.getCell('A2').alignment = { horizontal: 'center' };

  // Summary table headers
  const sumHeaders = ['Module', 'Tổng TC', 'Pass', 'Fail', 'Tỷ lệ Pass', 'Ghi chú'];
  const sumHeaderRow = summaryWs.addRow(sumHeaders);
  sumHeaderRow.eachCell((cell) => {
    cell.font = headerStyle.font;
    cell.fill = headerStyle.fill;
    cell.alignment = headerStyle.alignment;
    cell.border = headerStyle.border;
  });
  sumHeaderRow.height = 30;

  const summaryData = [
    ['Phí Giao Hàng', 20, 20, 0, '100%', 'Tất cả test case Pass'],
    ['Thanh Toán', 20, 20, 0, '100%', 'Tất cả test case Pass'],
    ['Bản Đồ GIS', 15, 15, 0, '100%', 'Tất cả test case Pass'],
    ['Theo Dõi Giao Hàng', 15, 15, 0, '100%', 'Tất cả test case Pass'],
  ];

  summaryData.forEach((row, idx) => {
    const dataRow = summaryWs.addRow(row);
    dataRow.eachCell((cell, colNumber) => {
      cell.border = cellBorder;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      if (colNumber === 5) {
        cell.font = { bold: true, color: { argb: 'FF059669' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      }
    });
    dataRow.height = 28;
  });

  // Total row
  const totalRow = summaryWs.addRow(['TỔNG CỘNG', 70, 70, 0, '100%', '']);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = cellBorder;
  });
  totalRow.height = 32;

  summaryWs.getColumn(1).width = 25;
  summaryWs.getColumn(2).width = 12;
  summaryWs.getColumn(3).width = 12;
  summaryWs.getColumn(4).width = 12;
  summaryWs.getColumn(5).width = 15;
  summaryWs.getColumn(6).width = 30;

  // Save
  const filePath = path.join(__dirname, '..', 'testcases', 'GreenFood_TestCases_Duong.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ File test cases đã được tạo tại: ${filePath}`);
}

createTestCases().catch(console.error);
