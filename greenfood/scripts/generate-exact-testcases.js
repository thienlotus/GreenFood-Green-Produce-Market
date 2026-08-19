const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateExactTestCases() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Dương - GreenFood';
  workbook.lastModifiedBy = 'Dương';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Colors matching the screenshots
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2EFDA' } // Light green header background
  };

  const summaryYellowFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF2CC' } // Light yellow summary background
  };

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  function createTestSheet(sheetName, featureName, precondition, testCases) {
    const ws = workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }]
    });

    // Row 1: Tên chức năng
    ws.getCell('A1').value = 'Tên chức năng';
    ws.getCell('A1').font = { name: 'Calibri', size: 11, bold: true };
    ws.getCell('B1').value = featureName;
    ws.getCell('B1').font = { name: 'Calibri', size: 11, bold: true };

    // Row 2: Precondition
    ws.getCell('A2').value = 'Precondition';
    ws.getCell('A2').font = { name: 'Calibri', size: 11 };
    ws.getCell('B2').value = precondition;
    ws.getCell('B2').font = { name: 'Calibri', size: 11 };

    // Row 3: Blank
    ws.getRow(3).height = 15;

    // Row 4: Table Headers
    const headers = ['ID', 'Category', 'Test case Name', 'Test step', 'Test data', 'Expected result', 'Priority', 'Actual result', 'Test result', 'Date'];
    const headerRow = ws.getRow(4);
    headerRow.height = 28;

    headers.forEach((h, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = h;
      cell.font = { name: 'Calibri', size: 11, bold: true };
      cell.fill = headerFill;
      cell.border = thinBorder;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    // Column widths
    ws.getColumn(1).width = 16;  // ID
    ws.getColumn(2).width = 22;  // Category
    ws.getColumn(3).width = 38;  // Test case Name
    ws.getColumn(4).width = 45;  // Test step
    ws.getColumn(5).width = 28;  // Test data
    ws.getColumn(6).width = 45;  // Expected result
    ws.getColumn(7).width = 12;  // Priority
    ws.getColumn(8).width = 24;  // Actual result (Blank for manual entry)
    ws.getColumn(9).width = 14;  // Test result (Blank for manual entry)
    ws.getColumn(10).width = 14; // Date (Blank for manual entry)

    // Data rows
    testCases.forEach((tc, index) => {
      const rowIndex = 5 + index;
      const row = ws.getRow(rowIndex);

      row.getCell(1).value = tc[0]; // ID
      row.getCell(2).value = tc[1]; // Category
      row.getCell(3).value = tc[2]; // Test case Name
      row.getCell(4).value = tc[3]; // Test step
      row.getCell(5).value = tc[4]; // Test data
      row.getCell(6).value = tc[5]; // Expected result
      row.getCell(7).value = tc[6]; // Priority
      row.getCell(8).value = tc[7] || ''; // Actual result
      row.getCell(9).value = tc[8] || ''; // Test result
      row.getCell(10).value = tc[9] || ''; // Date

      for (let c = 1; c <= 10; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 11 };
        cell.border = thinBorder;
        cell.alignment = { 
          vertical: 'middle', 
          wrapText: true,
          horizontal: (c === 1 || c === 7 || c === 9 || c === 10) ? 'center' : 'left'
        };
      }
      row.height = tc[3].includes('\n') ? 42 : 24;
    });

    return ws;
  }

  // ==========================================
  // 1. SHEET: Phí Giao Hàng (CRUD)
  // ==========================================
  const shipTestCases = [
    [
      'TC_SHIP_001', 'Shipping_List', 'Kiểm tra giao diện trang Quản Lý Phí Giao Hàng',
      '1. Truy cập trang Phí Giao Hàng\n2. Quan sát bảng', 'N/A',
      'Hiển thị tiêu đề, ô tìm kiếm, nút "Thêm vùng mới", bảng danh sách các vùng giao hàng', 'High'
    ],
    [
      'TC_SHIP_002', 'Shipping_Search', 'Tìm kiếm vùng giao hàng với từ khóa hợp lệ',
      '1. Nhập tên vùng hoặc tỉnh thành\n2. Quan sát kết quả', 'Từ khóa: "TP.HCM"',
      'Danh sách chỉ hiển thị các vùng có chứa từ khóa', 'High'
    ],
    [
      'TC_SHIP_003', 'Shipping_Search', 'Tìm kiếm không có kết quả',
      '1. Nhập từ khóa không tồn tại', 'Từ khóa: "XYZ999"',
      'Bảng hiển thị trạng thái "Không tìm thấy vùng giao hàng nào!"', 'Medium'
    ],
    [
      'TC_SHIP_004', 'Shipping_Search', 'Tìm kiếm với khoảng trắng đầu/cuối',
      '1. Nhập từ khóa có khoảng trắng\n2. Quan sát', 'Từ khóa: "   Miền Bắc   "',
      'Hệ thống tự trim() và hiển thị kết quả đúng', 'Low'
    ],
    [
      'TC_SHIP_005', 'Shipping_Search', 'Tìm kiếm với ký tự đặc biệt',
      '1. Nhập ký tự đặc biệt vào ô tìm kiếm', 'Từ khóa: "!@#$%"',
      'Không lỗi hệ thống, trả về danh sách trống hoặc kết quả phù hợp', 'Medium'
    ],
    [
      'TC_SHIP_006', 'Shipping_Add_UI', 'Kiểm tra giao diện popup Thêm vùng giao hàng',
      '1. Nhấn nút "Thêm vùng mới"', 'N/A',
      'Popup hiển thị các trường: Tên vùng, Tỉnh/thành, Phí cơ bản, Phí/kg thêm, Miễn phí từ, Thời gian giao, Kích hoạt; có nút Lưu và Hủy', 'High'
    ],
    [
      'TC_SHIP_007', 'Shipping_Add_Name', 'Để trống Tên vùng giao hàng',
      '1. Để trống Tên vùng\n2. Điền đủ các trường khác\n3. Bấm Lưu', 'Tên: (Empty)',
      'Báo lỗi "Tên vùng giao hàng không được để trống!"', 'High'
    ],
    [
      'TC_SHIP_008', 'Shipping_Add_Provinces', 'Để trống danh sách Tỉnh/Thành phố',
      '1. Nhập tên vùng\n2. Để trống Tỉnh/Thành\n3. Bấm Lưu', 'Tỉnh/Thành: (Empty)',
      'Báo lỗi "Danh sách tỉnh/thành không được để trống!"', 'High'
    ],
    [
      'TC_SHIP_009', 'Shipping_Add_Fee', 'Nhập Phí cơ bản là số âm',
      '1. Nhập Phí cơ bản: -20000\n2. Bấm Lưu', 'Phí cơ bản: -20000',
      'Hệ thống chặn, báo lỗi "Phí cơ bản không được âm!"', 'High'
    ],
    [
      'TC_SHIP_010', 'Shipping_Add_ExtraFee', 'Nhập Phí mỗi kg thêm là số âm',
      '1. Nhập Phí mỗi kg thêm: -5000\n2. Bấm Lưu', 'Phí/kg thêm: -5000',
      'Hệ thống chặn, báo lỗi "Phí mỗi kg thêm không được âm!"', 'High'
    ],
    [
      'TC_SHIP_011', 'Shipping_Add_FreeMin', 'Nhập Mức miễn phí ship là số âm',
      '1. Nhập Mức miễn phí: -300000\n2. Bấm Lưu', 'Miễn phí từ: -300000',
      'Hệ thống chặn, báo lỗi "Mức miễn phí ship không được âm!"', 'High'
    ],
    [
      'TC_SHIP_012', 'Shipping_Add_Time', 'Để trống Thời gian giao hàng dự kiến',
      '1. Để trống trường thời gian giao\n2. Bấm Lưu', 'Thời gian: (Empty)',
      'Báo lỗi "Thời gian giao hàng dự kiến không được để trống!"', 'Medium'
    ],
    [
      'TC_SHIP_013', 'Shipping_Add_Valid', 'Thêm vùng giao hàng thành công',
      '1. Điền đầy đủ thông tin chuẩn\n2. Nhấn Lưu', 'Tên: Vùng Đông Bắc, Tỉnh: Quảng Ninh, Phí: 45000, TG: 2-3 ngày',
      'Lưu thành công, thông báo toast xanh, popup đóng, bản ghi mới hiện trên danh sách', 'High'
    ],
    [
      'TC_SHIP_014', 'Shipping_Add_MultiClick', 'Nhấn Lưu nhiều lần liên tiếp (Rapid click)',
      '1. Điền đủ thông tin\n2. Nhấn đúp thật nhanh nút Lưu', 'Dữ liệu hợp lệ',
      'Chỉ tạo ra 1 bản ghi duy nhất, nút lưu hiển thị "Đang lưu..." và disabled', 'High'
    ],
    [
      'TC_SHIP_015', 'Shipping_Add_Cancel', 'Nhấn nút Hủy / icon Đóng popup',
      '1. Mở popup, nhập dữ liệu dở dang\n2. Nhấn Hủy hoặc X', 'Data nhập dở dang',
      'Popup đóng, không lưu dữ liệu mới vào bảng', 'Medium'
    ],
    [
      'TC_SHIP_016', 'Shipping_Edit_UI', 'Kiểm tra popup Chỉnh Sửa',
      '1. Chọn vùng giao hàng bất kỳ\n2. Nhấn icon Bút chì (Sửa)', 'N/A',
      'Dữ liệu hiện tại của vùng được đổ đầy đủ vào các ô input', 'High'
    ],
    [
      'TC_SHIP_017', 'Shipping_Edit_Valid', 'Cập nhật phí giao hàng thành công',
      '1. Sửa Phí cơ bản và Thời gian giao\n2. Nhấn Cập nhật', 'Phí mới: 25000đ, TG: 1-2 ngày',
      'Cập nhật thành công, toast thông báo, bảng cập nhật giá trị mới', 'High'
    ],
    [
      'TC_SHIP_018', 'Shipping_Edit_Status', 'Chuyển đổi trạng thái Hoạt động / Tạm ngưng',
      '1. Bỏ tick "Kích hoạt"\n2. Nhấn Cập nhật', 'Kích hoạt: false',
      'Trạng thái chuyển sang badge xám "Tạm ngưng"', 'Medium'
    ],
    [
      'TC_SHIP_019', 'Shipping_Del_UI', 'Kiểm tra popup Xóa vùng giao hàng',
      '1. Nhấn icon Thùng rác (Xóa)\n2. Quan sát', 'N/A',
      'Hiển thị cảnh báo xác nhận xóa đúng tên vùng cần xóa', 'High'
    ],
    [
      'TC_SHIP_020', 'Shipping_Del_Confirm', 'Xác nhận Xóa vùng giao hàng',
      '1. Nhấn Xóa\n2. Nhấn nút "Xóa" trên modal xác nhận', 'Vùng đã chọn',
      'Bản ghi biến mất khỏi danh sách, báo thành công', 'High'
    ],
    [
      'TC_SHIP_021', 'Shipping_Del_Cancel', 'Hủy xóa vùng giao hàng',
      '1. Nhấn Xóa\n2. Nhấn nút "Hủy"', 'N/A',
      'Đóng popup xác nhận, bản ghi vẫn còn nguyên vẹn trong danh sách', 'Medium'
    ]
  ];
  createTestSheet('Phí Giao Hàng', 'Quản Lý Phí Giao Hàng - CRUD', 'Admin đã đăng nhập, mở trang Quản lý Phí Giao Hàng (/admin/shipping).', shipTestCases);

  // ==========================================
  // 2. SHEET: Thanh Toán
  // ==========================================
  const payTestCases = [
    [
      'TC_PAY_001', 'Payment_UI', 'Kiểm tra giao diện trang Thanh Toán',
      '1. Thêm sản phẩm vào giỏ\n2. Vào trang /checkout', 'N/A',
      'Hiển thị Form thông tin người nhận, chọn vùng giao hàng, 4 phương thức thanh toán, tóm tắt đơn hàng', 'High'
    ],
    [
      'TC_PAY_002', 'Payment_EmptyCart', 'Truy cập checkout khi giỏ hàng trống',
      '1. Xóa hết giỏ hàng\n2. Vào /checkout', 'Giỏ hàng trống',
      'Hiển thị thông báo "Giỏ hàng trống" kèm nút "Quay lại cửa hàng"', 'Medium'
    ],
    [
      'TC_PAY_003', 'Payment_EmptySubmit', 'Nhấn Đặt hàng khi để trống toàn bộ thông tin',
      '1. Để trống form\n2. Bấm "Đặt hàng ngay"', 'Form trống',
      'Hiển thị thông báo lỗi dưới các trường bắt buộc (Họ tên, SĐT, Địa chỉ, Vùng giao hàng)', 'High'
    ],
    [
      'TC_PAY_004', 'Payment_Phone_Invalid', 'Nhập Số điện thoại không đúng định dạng',
      '1. Nhập SĐT chứa chữ cái hoặc không đủ 10 số\n2. Bấm Đặt hàng', 'SĐT: "09012abc" hoặc "123"',
      'Báo lỗi "Số điện thoại không hợp lệ"', 'High'
    ],
    [
      'TC_PAY_005', 'Payment_Phone_Valid', 'Nhập SĐT hợp lệ (đầu 0 hoặc +84)',
      '1. Nhập SĐT 10 số chuẩn\n2. Bấm Đặt hàng', 'SĐT: "0901234567" hoặc "+84901234567"',
      'Chấp nhận số điện thoại hợp lệ, không báo lỗi SĐT', 'High'
    ],
    [
      'TC_PAY_006', 'Payment_Email_Invalid', 'Nhập Email sai định dạng',
      '1. Nhập email không có @ hoặc thiếu domain', 'Email: "nguyenvana@"',
      'Báo lỗi "Email không hợp lệ"', 'Medium'
    ],
    [
      'TC_PAY_007', 'Payment_Zone_Calc', 'Chọn Vùng giao hàng và kiểm tra tính phí ship',
      '1. Chọn vùng "Nội thành TP.HCM" (Phí 15.000đ, miễn phí từ 300.000đ)\n2. Kiểm tra phí ship', 'Đơn hàng: 150.000đ',
      'Phí ship hiển thị 15.000đ, tổng tiền = Tạm tính + 15.000đ', 'High'
    ],
    [
      'TC_PAY_008', 'Payment_FreeShip', 'Kiểm tra Miễn phí vận chuyển khi đạt điều kiện',
      '1. Chọn vùng "Nội thành TP.HCM"\n2. Tổng tiền đơn >= 300.000đ', 'Đơn hàng: 350.000đ',
      'Phí ship hiển thị "Miễn phí 🎉", tổng tiền bằng đúng tiền hàng', 'High'
    ],
    [
      'TC_PAY_009', 'Payment_Method_COD', 'Thanh toán bằng phương thức COD (Tiền mặt)',
      '1. Điền đủ form hợp lệ\n2. Chọn phương thức "COD"\n3. Bấm "Đặt hàng ngay"', 'Phương thức: COD',
      'Xử lý 1.5s, chuyển đến màn hình "Đặt hàng thành công!" kèm Mã đơn hàng', 'High'
    ],
    [
      'TC_PAY_010', 'Payment_Method_Bank', 'Thanh toán Chuyển khoản Ngân hàng',
      '1. Điền đủ form\n2. Chọn "Chuyển khoản ngân hàng"\n3. Bấm "Đặt hàng ngay"', 'Phương thức: Bank Transfer',
      'Hiển thị popup thông tin tài khoản: Tên ngân hàng, Số TK, Chủ TK, Số tiền, Nội dung chuyển khoản và mã QR', 'High'
    ],
    [
      'TC_PAY_011', 'Payment_Method_MoMo', 'Thanh toán qua Ví MoMo',
      '1. Chọn "Ví MoMo"\n2. Bấm "Đặt hàng ngay"', 'Phương thức: MoMo',
      'Hiển thị popup MoMo với mã QR thanh toán và số tiền cần chuyển', 'High'
    ],
    [
      'TC_PAY_012', 'Payment_Method_VNPay', 'Thanh toán qua Cổng VNPay',
      '1. Chọn "VNPay"\n2. Bấm "Đặt hàng ngay"', 'Phương thức: VNPay',
      'Hiển thị popup cổng thanh toán VNPay', 'High'
    ],
    [
      'TC_PAY_013', 'Payment_Popup_Confirm', 'Xác nhận thanh toán trên Popup Bank/MoMo/VNPay',
      '1. Mở popup thanh toán\n2. Bấm "Xác nhận đã thanh toán"', 'N/A',
      'Đóng popup, chuyển sang màn hình "Đặt hàng thành công!", xóa giỏ hàng', 'High'
    ],
    [
      'TC_PAY_014', 'Payment_Popup_Cancel', 'Hủy popup thanh toán trực tuyến',
      '1. Mở popup Bank/MoMo\n2. Bấm "Hủy"', 'N/A',
      'Đóng popup, giữ nguyên dữ liệu form và giỏ hàng', 'Medium'
    ],
    [
      'TC_PAY_015', 'Payment_Success_Link', 'Kiểm tra liên kết Theo dõi đơn trên màn hình Thành công',
      '1. Đặt hàng thành công\n2. Nhấn nút "Theo dõi đơn hàng"', 'N/A',
      'Điều hướng đúng sang trang /tracking để kiểm tra lộ trình', 'High'
    ]
  ];
  createTestSheet('Thanh Toán', 'Chức Năng Thanh Toán & Tính Phí Ship', 'Người dùng có sản phẩm trong giỏ, truy cập trang Thanh toán (/checkout).', payTestCases);

  // ==========================================
  // 3. SHEET: Bản Đồ GIS
  // ==========================================
  const mapTestCases = [
    [
      'TC_MAP_001', 'Map_UI', 'Kiểm tra tải giao diện Bản đồ Nhà Vườn',
      '1. Truy cập trang /map\n2. Quan sát', 'N/A',
      'Hiển thị bản đồ Leaflet OpenStreetMap toàn cảnh Việt Nam, danh sách nông hộ bên trái, ô tìm kiếm và các nút lọc vùng', 'High'
    ],
    [
      'TC_MAP_002', 'Map_Markers', 'Hiển thị các ghim vị trí (Markers) nhà vườn trên bản đồ',
      '1. Mở trang /map\n2. Quan sát các điểm ghim', 'N/A',
      'Các điểm ghim xuất hiện đúng tọa độ địa lý các tỉnh (Bến Tre, Vĩnh Long, Đà Lạt, Đồng Tháp, Mộc Châu, Thái Nguyên...)', 'High'
    ],
    [
      'TC_MAP_003', 'Map_Marker_Popup', 'Nhấn vào Marker trên bản đồ để xem tóm tắt',
      '1. Click vào 1 marker bất kỳ trên bản đồ', 'Marker nhà vườn',
      'Popup mở ra hiển thị: Ảnh nông trại, Tên nhà vườn, Địa chỉ, Đánh giá sao, Số sản phẩm và Đặc sản', 'High'
    ],
    [
      'TC_MAP_004', 'Map_Search_Name', 'Tìm kiếm nhà vườn theo Tên hoặc Địa chỉ',
      '1. Nhập "Đà Lạt" vào ô tìm kiếm\n2. Quan sát danh sách và map', 'Từ khóa: "Đà Lạt"',
      'Danh sách lọc ra các nhà vườn tại Đà Lạt, hiển thị số lượng kết quả tìm thấy', 'High'
    ],
    [
      'TC_MAP_005', 'Map_Search_Specialty', 'Tìm kiếm theo tên Đặc sản / Cây trồng',
      '1. Nhập "sầu riêng" vào ô tìm kiếm', 'Từ khóa: "sầu riêng"',
      'Hiển thị các nông hộ chuyên canh Sầu riêng (như Vườn Chú Ba - Bến Tre)', 'Medium'
    ],
    [
      'TC_MAP_006', 'Map_Search_Empty', 'Tìm kiếm với từ khóa không khớp',
      '1. Nhập từ khóa không tồn tại', 'Từ khóa: "HaNoi12345"',
      'Hiển thị thông báo "Không tìm thấy nhà vườn nào"', 'Medium'
    ],
    [
      'TC_MAP_007', 'Map_Filter_North', 'Lọc danh sách nhà vườn Miền Bắc',
      '1. Nhấn nút lọc "Miền Bắc"', 'Filter: North',
      'Chỉ hiển thị các nông hộ Miền Bắc (Trang Trại Mộc Châu, HTX Chè Thái Nguyên)', 'High'
    ],
    [
      'TC_MAP_008', 'Map_Filter_Central', 'Lọc danh sách nhà vườn Miền Trung',
      '1. Nhấn nút lọc "Miền Trung"', 'Filter: Central',
      'Chỉ hiển thị các nông hộ Miền Trung (Nông Trại Xanh Đà Lạt, Rau Hữu Cơ Đà Nẵng)', 'High'
    ],
    [
      'TC_MAP_009', 'Map_Filter_South', 'Lọc danh sách nhà vườn Miền Nam',
      '1. Nhấn nút lọc "Miền Nam"', 'Filter: South',
      'Chỉ hiển thị các nông hộ Miền Nam (Bến Tre, Vĩnh Long, Đồng Tháp)', 'High'
    ],
    [
      'TC_MAP_010', 'Map_Filter_All', 'Đặt lại bộ lọc "Tất cả vùng"',
      '1. Đang lọc vùng\n2. Nhấn "Tất cả vùng"', 'Filter: All',
      'Hiển thị lại toàn bộ các nhà vườn trên toàn quốc', 'Medium'
    ],
    [
      'TC_MAP_011', 'Map_Farm_Detail', 'Nhấn vào Card nhà vườn để mở Modal chi tiết',
      '1. Nhấn vào 1 nhà vườn trong danh sách', 'Vườn Trái Cây Chú Ba',
      'Modal chi tiết hiển thị: Banner lớn, Tên vườn, Chủ vườn, Địa chỉ, Đánh giá, Huy hiệu VietGAP, Đặc sản, Tọa độ GPS, Nút "Xem sản phẩm"', 'High'
    ],
    [
      'TC_MAP_012', 'Map_Detail_Close', 'Đóng Modal chi tiết nhà vườn',
      '1. Mở modal chi tiết\n2. Nhấn nút X hoặc click ra ngoài', 'N/A',
      'Modal đóng mượt mà, trở lại giao diện bản đồ', 'Low'
    ]
  ];
  createTestSheet('Bản Đồ GIS', 'Tích Hợp Bản Đồ Nhà Vườn (GIS)', 'Người dùng truy cập trang Bản đồ Nhà Vườn (/map).', mapTestCases);

  // ==========================================
  // 4. SHEET: Theo Dõi Giao Hàng
  // ==========================================
  const trackTestCases = [
    [
      'TC_TRACK_001', 'Track_UI', 'Kiểm tra giao diện trang Theo Dõi Đơn Hàng',
      '1. Truy cập /tracking\n2. Quan sát', 'N/A',
      'Hiển thị Banner Hero xanh, ô nhập mã đơn hàng, nút Tra cứu và các mã đơn mẫu gợi ý', 'High'
    ],
    [
      'TC_TRACK_002', 'Track_Empty', 'Nhấn Tra cứu khi để trống ô mã đơn',
      '1. Để trống ô tìm kiếm\n2. Nhấn "Tra cứu"', 'Mã đơn: (Empty)',
      'Báo lỗi "Vui lòng nhập mã đơn hàng"', 'Medium'
    ],
    [
      'TC_TRACK_003', 'Track_NotFound', 'Tra cứu mã đơn hàng không tồn tại',
      '1. Nhập mã đơn sai\n2. Nhấn "Tra cứu"', 'Mã: "GF999999"',
      'Báo lỗi không tìm thấy đơn hàng, kèm gợi ý các mã mẫu có sẵn', 'High'
    ],
    [
      'TC_TRACK_004', 'Track_Shipping_Order', 'Tra cứu đơn hàng đang trong trạng thái "Đang giao"',
      '1. Nhập mã đơn đang giao\n2. Nhấn "Tra cứu"', 'Mã: "GF284910"',
      'Hiển thị Timeline: Bước 1 (Đặt hàng - Xong), Bước 2 (Xác nhận - Xong), Bước 3 (Đang giao - Hoạt ảnh pulse xanh), Bước 4 (Chờ giao)', 'High'
    ],
    [
      'TC_TRACK_005', 'Track_Shipping_Map', 'Hiển thị Bản đồ vị trí Shipper khi đang giao',
      '1. Tra cứu đơn "GF284910" (đang giao)\n2. Quan sát khu vực bản đồ', 'Mã: "GF284910"',
      'Hiển thị Bản đồ mini tương tác có 2 điểm: Vị trí Shipper (icon xe máy) và Điểm giao hàng của khách', 'High'
    ],
    [
      'TC_TRACK_006', 'Track_Shipper_Info', 'Hiển thị thông tin Shipper phụ trách đơn',
      '1. Tra cứu đơn "GF284910"\n2. Xem mục Thông tin shipper', 'Mã: "GF284910"',
      'Hiển thị đúng Tên shipper ("Trần Minh Đức") và Số điện thoại liên hệ ("0912345678")', 'Medium'
    ],
    [
      'TC_TRACK_007', 'Track_Delivered_Order', 'Tra cứu đơn hàng đã giao thành công',
      '1. Nhập mã đơn hoàn thành\n2. Nhấn "Tra cứu"', 'Mã: "GF285020"',
      'Badge trạng thái "Đã giao thành công", cả 4 bước Timeline đều hiển thị dấu tick xanh kèm thời gian cụ thể', 'High'
    ],
    [
      'TC_TRACK_008', 'Track_Confirmed_Order', 'Tra cứu đơn hàng vừa xác nhận',
      '1. Nhập mã đơn mới xác nhận', 'Mã: "GF285130"',
      'Bước "Xác nhận" đang xử lý, bước "Đang giao" và "Đã giao" hiển thị chờ', 'Medium'
    ],
    [
      'TC_TRACK_009', 'Track_Order_Detail', 'Hiển thị chi tiết sản phẩm và tổng tiền đơn hàng',
      '1. Tra cứu đơn bất kỳ\n2. Quan sát danh sách sản phẩm', 'Mã đơn hợp lệ',
      'Hiển thị đầy đủ: Tên sản phẩm, đơn vị, số lượng, đơn giá, tạm tính, phí giao hàng và tổng thanh toán chính xác', 'High'
    ],
    [
      'TC_TRACK_010', 'Track_Quick_Pill', 'Nhấn vào nút chip mã đơn gợi ý',
      '1. Click vào mã "GF284910" ở hàng gợi ý', 'Click pill "GF284910"',
      'Mã tự động điền vào ô tìm kiếm nhanh chóng', 'Low'
    ]
  ];
  createTestSheet('Theo Dõi Giao Hàng', 'Chức Năng Theo Dõi Hành Trình Đơn Hàng', 'Người dùng truy cập trang Theo dõi đơn hàng (/tracking).', trackTestCases);

  // ==========================================
  // 5. SHEET: Kết quả tổng hợp (Matching image 3)
  // ==========================================
  const sumWs = workbook.addWorksheet('Kết quả tổng hợp', {
    views: [{ showGridLines: true }]
  });

  // Table 1: Browser Matrix
  const envHeaders = ['', 'Pass', 'Fail', 'NA', 'Tổng'];
  const envRow1 = sumWs.getRow(1);
  envHeaders.forEach((h, idx) => {
    const cell = envRow1.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 11, bold: true };
    cell.fill = headerFill;
    cell.border = thinBorder;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const envData = [
    ['Windows 11 / Chrome', 0, 0, 0, 58],
    ['Windows 11 / Edge', 0, 0, 0, 58],
    ['MacOS / Safari', 0, 0, 0, 58]
  ];

  envData.forEach((row, rIdx) => {
    const r = sumWs.getRow(2 + rIdx);
    row.forEach((val, cIdx) => {
      const cell = r.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 11 };
      cell.border = thinBorder;
      cell.alignment = { 
        vertical: 'middle', 
        horizontal: cIdx === 0 ? 'left' : 'center' 
      };
    });
  });

  // Row 5: Blank
  sumWs.getRow(5).height = 15;

  // Table 2: Module Statistics
  const modRow6 = sumWs.getRow(6);
  modRow6.getCell(1).value = 'Thống kê theo Module';
  modRow6.getCell(1).font = { name: 'Calibri', size: 11, bold: true };
  modRow6.getCell(1).fill = summaryYellowFill;
  modRow6.getCell(1).border = thinBorder;

  modRow6.getCell(2).value = 'Số lượng TC';
  modRow6.getCell(2).font = { name: 'Calibri', size: 11, bold: true };
  modRow6.getCell(2).fill = summaryYellowFill;
  modRow6.getCell(2).border = thinBorder;
  modRow6.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

  const moduleStats = [
    ['Phí Giao Hàng (CRUD)', shipTestCases.length],
    ['Thanh Toán & Tính Phí Ship', payTestCases.length],
    ['Tích Hợp Bản Đồ Nhà Vườn (GIS)', mapTestCases.length],
    ['Theo Dõi Hành Trình Giao Hàng', trackTestCases.length],
    ['TỔNG CỘNG', shipTestCases.length + payTestCases.length + mapTestCases.length + trackTestCases.length]
  ];

  moduleStats.forEach((m, idx) => {
    const r = sumWs.getRow(7 + idx);
    const isTotal = idx === moduleStats.length - 1;

    const cell1 = r.getCell(1);
    cell1.value = m[0];
    cell1.font = { name: 'Calibri', size: 11, bold: isTotal };
    cell1.border = thinBorder;

    const cell2 = r.getCell(2);
    cell2.value = m[1];
    cell2.font = { name: 'Calibri', size: 11, bold: isTotal };
    cell2.border = thinBorder;
    cell2.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  sumWs.getColumn(1).width = 35;
  sumWs.getColumn(2).width = 18;
  sumWs.getColumn(3).width = 15;
  sumWs.getColumn(4).width = 15;
  sumWs.getColumn(5).width = 15;

  // Save files
  const outputPath = path.join(__dirname, '..', 'testcases', 'Test_Cases_GreenFood_Duong.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ File test cases đã xuất thành công tại: ${outputPath}`);
}

generateExactTestCases().catch(console.error);
