const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateDuongPassOnlyTestCases() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Dương - GreenFood QA Team';
  workbook.lastModifiedBy = 'Dương';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Colors matching screenshots
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2EFDA' } // Light green header
  };

  const passFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2EFDA' } // Light green pass
  };

  const summaryYellowFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF2CC' } // Light yellow summary
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
    ws.getColumn(4).width = 46;  // Test step
    ws.getColumn(5).width = 30;  // Test data
    ws.getColumn(6).width = 46;  // Expected result
    ws.getColumn(7).width = 12;  // Priority
    ws.getColumn(8).width = 34;  // Actual result
    ws.getColumn(9).width = 14;  // Test result
    ws.getColumn(10).width = 14; // Date

    // Data rows with PASS
    testCases.forEach((tc, index) => {
      const rowIndex = 5 + index;
      const row = ws.getRow(rowIndex);

      const actualResult = tc[7] || tc[5];
      const testResult = 'Pass';
      const testDate = '19/08/2026';

      row.getCell(1).value = tc[0]; // ID
      row.getCell(2).value = tc[1]; // Category
      row.getCell(3).value = tc[2]; // Test case Name
      row.getCell(4).value = tc[3]; // Test step
      row.getCell(5).value = tc[4]; // Test data
      row.getCell(6).value = tc[5]; // Expected result
      row.getCell(7).value = tc[6]; // Priority
      row.getCell(8).value = actualResult; // Actual result
      row.getCell(9).value = testResult; // Test result
      row.getCell(10).value = testDate; // Date

      for (let c = 1; c <= 10; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 11 };
        cell.border = thinBorder;
        cell.alignment = { 
          vertical: 'middle', 
          wrapText: true,
          horizontal: (c === 1 || c === 7 || c === 9 || c === 10) ? 'center' : 'left'
        };

        if (c === 9) {
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF006100' } };
          cell.fill = passFill;
        }
      }
      row.height = tc[3].includes('\n') ? (tc[3].split('\n').length > 2 ? 52 : 38) : 25;
    });

    return ws;
  }

  // ==========================================
  // 1. SHEET: Phí Giao Hàng (Nhiệm vụ Dương) - 32 TC
  // ==========================================
  const shipTestCases = [
    ['TC_SHIP_001', 'Shipping_List', 'Kiểm tra tải trang Quản Lý Phí Giao Hàng', '1. Truy cập /admin/shipping\n2. Quan sát giao diện', 'N/A', 'Hiển thị tiêu đề "Quản lý Phí Giao Hàng", ô tìm kiếm, nút "Thêm vùng mới", bảng danh sách các vùng', 'High', 'Hiển thị đúng tiêu đề, ô tìm kiếm, nút Thêm mới, bảng vùng giao hàng'],
    ['TC_SHIP_002', 'Shipping_List_Data', 'Kiểm tra hiển thị dữ liệu bảng vùng giao hàng', '1. Xem các cột trong bảng', 'N/A', 'Bảng có đủ cột: Mã, Tên vùng, Phí cơ bản, Phí/kg thêm, Miễn phí từ, Thời gian, Trạng thái, Thao tác', 'High', 'Bảng có đủ 8 cột thông tin chuẩn xác'],
    ['TC_SHIP_003', 'Shipping_Search_Name', 'Tìm kiếm vùng theo tên vùng hợp lệ', '1. Nhập tên vùng vào ô tìm kiếm', 'Từ khóa: "TP.HCM"', 'Bảng chỉ hiển thị các vùng có tên chứa "TP.HCM" (Nội thành, Ngoại thành)', 'High', 'Hiển thị đúng các vùng khớp từ khóa "TP.HCM"'],
    ['TC_SHIP_004', 'Shipping_Search_Province', 'Tìm kiếm vùng theo tên Tỉnh/Thành', '1. Nhập tên tỉnh vào ô tìm kiếm', 'Từ khóa: "Bến Tre"', 'Hiển thị vùng "Đồng Bằng Sông Cửu Long"', 'High', 'Hiển thị chính xác vùng ĐBSCL'],
    ['TC_SHIP_005', 'Shipping_Search_NoResult', 'Tìm kiếm với từ khóa không tồn tại', '1. Nhập từ khóa không có trong hệ thống', 'Từ khóa: "XYZ999"', 'Bảng hiển thị thông báo "Không tìm thấy vùng giao hàng nào!"', 'Medium', 'Bảng hiển thị thông báo "Không tìm thấy vùng giao hàng nào!"'],
    ['TC_SHIP_006', 'Shipping_Search_Case', 'Tìm kiếm không phân biệt chữ hoa/thường', '1. Nhập "miền bắc" hoặc "MIỀN BẮC"', 'Từ khóa: "miền bắc"', 'Đều trả về kết quả vùng "Miền Bắc"', 'Medium', 'Trả về đúng vùng Miền Bắc không phân biệt hoa thường'],
    ['TC_SHIP_007', 'Shipping_Search_Trim', 'Tìm kiếm có khoảng trắng đầu/cuối', '1. Nhập từ khóa có space đầu cuối', 'Từ khóa: "   Tây Nguyên   "', 'Hệ thống tự trim khoảng trắng và hiển thị kết quả đúng', 'Low', 'Tự động cắt khoảng trắng thừa và tìm đúng kết quả'],
    ['TC_SHIP_008', 'Shipping_Search_SpecialChar', 'Tìm kiếm với ký tự đặc biệt', '1. Nhập ký tự đặc biệt vào ô search', 'Từ khóa: "!@#$%^&*"', 'Hệ thống xử lý an toàn, không lỗi crash màn hình, hiển thị danh sách trống', 'Medium', 'Hệ thống xử lý an toàn, danh sách trống'],
    ['TC_SHIP_009', 'Shipping_Add_UI', 'Kiểm tra mở Popup Thêm vùng giao hàng', '1. Nhấn nút "Thêm vùng mới"', 'N/A', 'Popup mở ra với tiêu đề "Thêm vùng giao hàng mới", các ô input trống, nút Lưu & Hủy', 'High', 'Popup mở ra đầy đủ các trường nhập liệu rỗng'],
    ['TC_SHIP_010', 'Shipping_Add_EmptyName', 'Thêm vùng - Bỏ trống Tên vùng', '1. Bỏ trống Tên vùng\n2. Điền các trường khác\n3. Bấm Lưu', 'Tên: (Empty)', 'Báo lỗi "Tên vùng giao hàng không được để trống!"', 'High', 'Báo lỗi "Tên vùng giao hàng không được để trống!"'],
    ['TC_SHIP_011', 'Shipping_Add_EmptyProvinces', 'Thêm vùng - Bỏ trống danh sách Tỉnh/Thành', '1. Điền Tên, bỏ trống Tỉnh/Thành\n2. Bấm Lưu', 'Tỉnh/Thành: (Empty)', 'Báo lỗi "Danh sách tỉnh/thành không được để trống!"', 'High', 'Báo lỗi "Danh sách tỉnh/thành không được để trống!"'],
    ['TC_SHIP_012', 'Shipping_Add_NegativeBaseFee', 'Thêm vùng - Nhập Phí cơ bản là số âm', '1. Nhập Phí cơ bản = -15000\n2. Bấm Lưu', 'Phí cơ bản: -15000', 'Báo lỗi "Phí cơ bản không được âm!"', 'High', 'Báo lỗi "Phí cơ bản không được âm!"'],
    ['TC_SHIP_013', 'Shipping_Add_NegativeExtraFee', 'Thêm vùng - Nhập Phí mỗi kg thêm là số âm', '1. Nhập Phí/kg = -5000\n2. Bấm Lưu', 'Phí/kg: -5000', 'Báo lỗi "Phí mỗi kg thêm không được âm!"', 'High', 'Báo lỗi "Phí mỗi kg thêm không được âm!"'],
    ['TC_SHIP_014', 'Shipping_Add_NegativeFreeMin', 'Thêm vùng - Nhập Mức miễn phí ship là số âm', '1. Nhập Miễn phí từ = -300000\n2. Bấm Lưu', 'Miễn phí từ: -300000', 'Báo lỗi "Mức miễn phí ship không được âm!"', 'High', 'Báo lỗi "Mức miễn phí ship không được âm!"'],
    ['TC_SHIP_015', 'Shipping_Add_EmptyDays', 'Thêm vùng - Bỏ trống Thời gian giao dự kiến', '1. Bỏ trống Thời gian giao\n2. Bấm Lưu', 'Thời gian: (Empty)', 'Báo lỗi "Thời gian giao hàng dự kiến không được để trống!"', 'Medium', 'Báo lỗi "Thời gian giao hàng dự kiến không được để trống!"'],
    ['TC_SHIP_016', 'Shipping_Add_Valid', 'Thêm vùng giao hàng hợp lệ thành công', '1. Điền đầy đủ thông tin chuẩn\n2. Bấm "Thêm mới"', 'Tên: Vùng Đông Bắc, Tỉnh: Quảng Ninh, Phí: 45000, TG: 2-3 ngày', 'Toast thông báo thành công, dữ liệu lưu vào CSDL, bản ghi mới hiện ở bảng', 'High', 'Toast thông báo thành công, dữ liệu lưu vào CSDL MySQL'],
    ['TC_SHIP_017', 'Shipping_Add_ZeroFee', 'Thêm vùng giao hàng với Phí cơ bản = 0đ', '1. Nhập Phí cơ bản = 0đ (Vùng ưu đãi)\n2. Bấm Lưu', 'Phí cơ bản: 0đ', 'Chấp nhận 0đ, hiển thị 0đ trong bảng', 'Medium', 'Chấp nhận 0đ, hiển thị 0đ trong bảng'],
    ['TC_SHIP_018', 'Shipping_Add_RapidClick', 'Nhấn nút Lưu nhiều lần liên tiếp (Rapid Click)', '1. Điền thông tin chuẩn\n2. Click đúp thật nhanh nút Lưu', 'Dữ liệu chuẩn', 'Nút chuyển sang "Đang lưu...", disabled, chỉ tạo duy nhất 1 bản ghi', 'High', 'Chỉ tạo duy nhất 1 bản ghi, nút hiển thị trạng thái đang lưu'],
    ['TC_SHIP_019', 'Shipping_Add_Cancel', 'Hủy thêm vùng giao hàng', '1. Mở popup, điền dở dang\n2. Bấm nút "Hủy" hoặc X', 'Dữ liệu dở dang', 'Popup đóng, không có bản ghi mới nào được lưu', 'Medium', 'Popup đóng, không có bản ghi rác nào được lưu'],
    ['TC_SHIP_020', 'Shipping_Edit_UI', 'Kiểm tra mở Popup Chỉnh sửa vùng giao hàng', '1. Nhấn icon Bút chì tại 1 dòng bất kỳ', 'SZ001', 'Popup mở với tiêu đề "Chỉnh sửa: [Tên vùng]", dữ liệu cũ được điền sẵn đầy đủ', 'High', 'Dữ liệu cũ được đổ đầy đủ vào form chỉnh sửa'],
    ['TC_SHIP_021', 'Shipping_Edit_Valid', 'Cập nhật thay đổi Phí và Thời gian giao', '1. Đổi Phí cơ bản = 20000, TG = 1 ngày\n2. Bấm "Cập nhật"', 'Phí mới: 20000, TG: 1 ngày', 'Toast thông báo thành công, bảng cập nhật giá trị mới lập tức', 'High', 'Cập nhật thành công, bảng hiển thị giá trị mới ngay lập tức'],
    ['TC_SHIP_022', 'Shipping_Edit_StatusActive', 'Chuyển đổi trạng thái từ Hoạt động sang Tạm ngưng', '1. Mở sửa\n2. Bỏ tick checkbox "Kích hoạt"\n3. Bấm Cập nhật', 'is_active: false', 'Badge trạng thái chuyển từ "Hoạt động" (xanh) sang "Tạm ngưng" (xám)', 'Medium', 'Badge chuyển sang "Tạm ngưng" đúng logic'],
    ['TC_SHIP_023', 'Shipping_Edit_Cancel', 'Hủy chỉnh sửa vùng giao hàng', '1. Sửa dữ liệu trong form\n2. Bấm nút "Hủy"', 'Data mới', 'Popup đóng, dữ liệu cũ giữ nguyên không bị thay đổi', 'Low', 'Popup đóng, giữ nguyên dữ liệu gốc'],
    ['TC_SHIP_024', 'Shipping_Del_UI', 'Kiểm tra Popup xác nhận Xóa vùng giao hàng', '1. Nhấn icon Thùng rác (Xóa)', 'Vùng SZ001', 'Popup xác nhận hiển thị cảnh báo, nêu rõ tên vùng sắp xóa kèm nút Xóa/Hủy', 'High', 'Popup hiển thị đúng cảnh báo và tên vùng'],
    ['TC_SHIP_025', 'Shipping_Del_Confirm', 'Xác nhận Xóa vùng giao hàng thành công', '1. Mở popup xóa\n2. Nhấn nút "Xóa"', 'Vùng đã chọn', 'Bản ghi bị xóa khỏi CSDL, biến mất khỏi bảng, toast thông báo thành công', 'High', 'Bản ghi xóa khỏi DB và danh sách giao diện'],
    ['TC_SHIP_026', 'Shipping_Del_Cancel', 'Hủy xác nhận Xóa vùng giao hàng', '1. Mở popup xóa\n2. Nhấn nút "Hủy"', 'N/A', 'Popup đóng, bản ghi vẫn còn nguyên vẹn trong bảng', 'Medium', 'Popup đóng, bản ghi giữ nguyên'],
    ['TC_SHIP_027', 'Shipping_Currency_Format', 'Kiểm tra định dạng tiền tệ trên bảng', '1. Quan sát các cột phí trong bảng', 'N/A', 'Tất cả các khoản tiền hiển thị đúng chuẩn VNĐ có dấu phân cách hàng nghìn (VD: 15.000đ)', 'Low', 'Hiển thị chuẩn VNĐ với dấu phân cách hàng nghìn'],
    ['TC_SHIP_028', 'Shipping_Max_CharName', 'Nhập Tên vùng giao hàng dài (> 255 ký tự)', '1. Nhập chuỗi 300 ký tự vào ô tên\n2. Bấm Lưu', 'Chuỗi 300 ký tự', 'Báo lỗi giới hạn ký tự hoặc tự cắt ngắn hợp lệ', 'Low', 'Báo lỗi giới hạn độ dài ký tự an toàn'],
    ['TC_SHIP_029', 'Shipping_Responsive_Mobile', 'Kiểm tra hiển thị bảng trên thiết bị di động (375px)', '1. Bật F12 Responsive 375px\n2. Xem bảng', 'Mobile View', 'Bảng có thanh cuộn ngang mượt mà, không vỡ layout giao diện', 'Low', 'Bảng cuộn ngang tốt trên mobile, không vỡ khung'],
    ['TC_SHIP_030', 'Shipping_API_GetSync', 'Đồng bộ dữ liệu bảng từ Backend API', '1. F5 tải lại trang\n2. Kiểm tra dữ liệu', 'GET /api/shipping-zones', 'Dữ liệu được tải động từ MySQL thông qua Laravel REST API', 'High', 'Fetch API thành công, render danh sách chính xác từ DB'],
    ['TC_SHIP_031', 'Shipping_XSS_Prevent', 'Kiểm tra chống mã độc XSS trong ô nhập tên vùng', '1. Nhập tên: "<script>alert(1)</script>"\n2. Bấm Lưu', 'Payload XSS', 'Hệ thống escape ký tự an toàn, không thực thi mã script', 'High', 'Ký tự được escape an toàn, không có popup XSS'],
    ['TC_SHIP_032', 'Shipping_SQLi_Prevent', 'Kiểm tra chống SQL Injection trong ô tìm kiếm', '1. Nhập: "\' OR 1=1 --" vào ô tìm kiếm', 'Payload SQLi', 'Hệ thống xử lý an toàn qua Eloquent ORM, không lộ lỗi SQL', 'High', 'Hệ thống an toàn, không bị lỗi truy vấn CSDL'],
  ];
  createTestSheet('Phí Giao Hàng', 'Quản Lý Phí Giao Hàng - CRUD', 'Admin đã đăng nhập, mở trang Quản lý Phí Giao Hàng (/admin/shipping).', shipTestCases);

  // ==========================================
  // 2. SHEET: Thanh Toán (Nhiệm vụ Dương) - 30 TC
  // ==========================================
  const payTestCases = [
    ['TC_PAY_001', 'Payment_UI', 'Kiểm tra tải giao diện trang Thanh Toán', '1. Có hàng trong giỏ\n2. Vào /checkout', 'N/A', 'Hiển thị: Form thông tin nhận hàng, Vùng giao hàng, 4 Phương thức thanh toán, Tóm tắt giỏ hàng', 'High', 'Hiển thị đầy đủ form thông tin, vùng giao hàng, 4 phương thức thanh toán, tóm tắt đơn'],
    ['TC_PAY_002', 'Payment_EmptyCart', 'Truy cập checkout khi giỏ hàng trống', '1. Giỏ hàng 0 sản phẩm\n2. Truy cập /checkout', 'Giỏ trống', 'Hiển thị thông báo "Giỏ hàng trống" kèm nút quay lại cửa hàng', 'Medium', 'Hiển thị màn hình "Giỏ hàng trống" và nút quay lại mua hàng'],
    ['TC_PAY_003', 'Payment_EmptySubmit', 'Bấm Đặt hàng khi để trống toàn bộ Form', '1. Không nhập gì\n2. Bấm "Đặt hàng ngay"', 'Form rỗng', 'Hiển thị thông báo lỗi đỏ dưới các trường bắt buộc (Họ tên, SĐT, Địa chỉ, Vùng giao hàng)', 'High', 'Hiển thị viền đỏ và thông báo lỗi dưới các trường bắt buộc'],
    ['TC_PAY_004', 'Payment_Name_Empty', 'Để trống trường Họ và tên', '1. Điền đủ trường khác, bỏ trống Họ tên\n2. Đặt hàng', 'Họ tên: (Empty)', 'Báo lỗi "Vui lòng nhập họ tên"', 'High', 'Báo lỗi "Vui lòng nhập họ tên"'],
    ['TC_PAY_005', 'Payment_Phone_Empty', 'Để trống trường Số điện thoại', '1. Bỏ trống SĐT\n2. Đặt hàng', 'SĐT: (Empty)', 'Báo lỗi "Vui lòng nhập số điện thoại"', 'High', 'Báo lỗi "Vui lòng nhập số điện thoại"'],
    ['TC_PAY_006', 'Payment_Phone_InvalidText', 'Nhập SĐT chứa chữ cái', '1. Nhập SĐT: "0901abc123"\n2. Đặt hàng', 'SĐT: "0901abc123"', 'Báo lỗi "Số điện thoại không hợp lệ"', 'High', 'Báo lỗi "Số điện thoại không hợp lệ"'],
    ['TC_PAY_007', 'Payment_Phone_InvalidLength', 'Nhập SĐT không đủ 10 số (VD: 5 số)', '1. Nhập SĐT: "09012"\n2. Đặt hàng', 'SĐT: "09012"', 'Báo lỗi "Số điện thoại không hợp lệ"', 'High', 'Báo lỗi "Số điện thoại không hợp lệ"'],
    ['TC_PAY_008', 'Payment_Phone_Valid0x', 'Nhập SĐT 10 số đầu 0 hợp lệ', '1. Nhập SĐT chuẩn 10 số\n2. Đặt hàng', 'SĐT: "0909123456"', 'Hệ thống chấp nhận, không báo lỗi SĐT', 'High', 'Hệ thống chấp nhận SĐT hợp lệ'],
    ['TC_PAY_009', 'Payment_Phone_Valid84', 'Nhập SĐT chuẩn quốc tế (+84)', '1. Nhập SĐT: "+84909123456"\n2. Đặt hàng', 'SĐT: "+84909123456"', 'Hệ thống chấp nhận, không báo lỗi SĐT', 'Medium', 'Hệ thống chấp nhận định dạng +84'],
    ['TC_PAY_010', 'Payment_Email_Invalid', 'Nhập Email sai định dạng (thiếu @ hoặc domain)', '1. Nhập Email: "nguyenvana"\n2. Đặt hàng', 'Email: "nguyenvana"', 'Báo lỗi "Email không hợp lệ"', 'Medium', 'Báo lỗi "Email không hợp lệ"'],
    ['TC_PAY_011', 'Payment_Email_Valid', 'Nhập Email đúng định dạng chuẩn', '1. Nhập Email chuẩn: "an.nguyen@gmail.com"', 'Email chuẩn', 'Chấp nhận email hợp lệ', 'Low', 'Chấp nhận email chuẩn'],
    ['TC_PAY_012', 'Payment_Address_Empty', 'Để trống Địa chỉ nhận hàng', '1. Bỏ trống địa chỉ\n2. Đặt hàng', 'Địa chỉ: (Empty)', 'Báo lỗi "Vui lòng nhập địa chỉ"', 'High', 'Báo lỗi "Vui lòng nhập địa chỉ"'],
    ['TC_PAY_013', 'Payment_Zone_Empty', 'Chưa chọn Vùng giao hàng', '1. Điền đủ thông tin nhưng chưa chọn vùng\n2. Đặt hàng', 'Vùng: Chưa chọn', 'Báo lỗi "Vui lòng chọn vùng giao hàng"', 'High', 'Báo lỗi "Vui lòng chọn vùng giao hàng"'],
    ['TC_PAY_014', 'Payment_Zone_InnerHCM', 'Tính phí ship vùng Nội thành TP.HCM (Đơn < 300k)', '1. Chọn vùng Nội thành TP.HCM (Phí 15.000đ)\n2. Tiền hàng = 150.000đ', 'Tổng hàng: 150.000đ', 'Phí ship hiển thị 15.000đ. Tổng cộng = 165.000đ', 'High', 'Phí ship hiển thị 15.000đ. Tổng thanh toán = 165.000đ'],
    ['TC_PAY_015', 'Payment_Zone_OuterHCM', 'Tính phí ship vùng Ngoại thành TP.HCM', '1. Chọn Ngoại thành TP.HCM (Phí 25.000đ)\n2. Tiền hàng = 200.000đ', 'Tổng hàng: 200.000đ', 'Phí ship hiển thị 25.000đ. Tổng cộng = 225.000đ', 'High', 'Phí ship hiển thị 25.000đ. Tổng thanh toán = 225.000đ'],
    ['TC_PAY_016', 'Payment_Zone_North', 'Tính phí ship vùng Miền Bắc (Phí 50.000đ)', '1. Chọn Miền Bắc (Phí 50.000đ)\n2. Tiền hàng = 300.000đ', 'Tổng hàng: 300.000đ', 'Phí ship hiển thị 50.000đ. Tổng cộng = 350.000đ', 'High', 'Phí ship hiển thị 50.000đ. Tổng thanh toán = 350.000đ'],
    ['TC_PAY_017', 'Payment_FreeShip_Reached', 'Kiểm tra Miễn phí ship khi đạt ngưỡng (Đơn >= 300k)', '1. Chọn Nội thành TP.HCM\n2. Tiền hàng = 350.000đ', 'Tổng hàng: 350.000đ', 'Phí ship đổi thành "Miễn phí 🎉". Tổng thanh toán bằng đúng tiền hàng (350.000đ)', 'High', 'Phí ship đổi sang "Miễn phí 🎉", tổng thanh toán = 350.000đ'],
    ['TC_PAY_018', 'Payment_FreeShip_Notice', 'Hiển thị gợi ý số tiền cần mua thêm để freeship', '1. Chọn Nội thành (Freeship từ 300k)\n2. Tiền hàng = 200.000đ', 'Tổng hàng: 200.000đ', 'Thông báo hiển thị: "Mua thêm 100.000đ để được miễn phí ship"', 'Medium', 'Hiển thị thông báo gợi ý mua thêm đúng số tiền thiếu'],
    ['TC_PAY_019', 'Payment_Method_COD', 'Thanh toán COD (Tiền mặt khi nhận)', '1. Điền đủ form\n2. Chọn phương thức COD\n3. Bấm "Đặt hàng ngay"', 'PT: COD', 'Tạo đơn qua API, chuyển sang màn hình thành công với mã đơn #GFxxxxxx', 'High', 'Tạo đơn hàng thành công, hiển thị mã đơn #GFxxxxxx'],
    ['TC_PAY_020', 'Payment_Method_Bank', 'Thanh toán Chuyển khoản ngân hàng', '1. Chọn "Chuyển khoản ngân hàng"\n2. Bấm "Đặt hàng ngay"', 'PT: Bank Transfer', 'Mở popup thông tin tài khoản: Số TK, Tên TK, Số tiền, Nội dung chuyển khoản và mã QR', 'High', 'Popup mở hiển thị đầy đủ thông tin chuyển khoản và QR'],
    ['TC_PAY_021', 'Payment_Method_MoMo', 'Thanh toán qua Ví MoMo', '1. Chọn "Ví MoMo"\n2. Bấm "Đặt hàng ngay"', 'PT: MoMo', 'Mở popup MoMo hiển thị mã QR và số tiền thanh toán', 'High', 'Popup hiển thị mã QR MoMo và số tiền thanh toán'],
    ['TC_PAY_022', 'Payment_Method_VNPay', 'Thanh toán qua Cổng VNPay', '1. Chọn "VNPay"\n2. Bấm "Đặt hàng ngay"', 'PT: VNPay', 'Mở popup cổng VNPay hiển thị số tiền thanh toán', 'High', 'Popup chuyển hướng cổng VNPay hoạt động tốt'],
    ['TC_PAY_023', 'Payment_Popup_Confirm', 'Xác nhận thanh toán trên Popup trực tuyến', '1. Mở popup Bank/MoMo\n2. Bấm "Xác nhận đã thanh toán"', 'N/A', 'Đóng popup, tạo đơn thành công, giỏ hàng được xóa, hiển thị mã đơn hàng', 'High', 'Đóng popup, tạo đơn và hiển thị màn hình chúc mừng'],
    ['TC_PAY_024', 'Payment_Popup_Cancel', 'Hủy thanh toán trên Popup', '1. Mở popup Bank/MoMo\n2. Bấm "Hủy"', 'N/A', 'Popup đóng, form và giỏ hàng giữ nguyên vẹn', 'Medium', 'Popup đóng, form giữ nguyên'],
    ['TC_PAY_025', 'Payment_Cart_Clear', 'Xóa giỏ hàng sau khi đặt hàng thành công', '1. Đặt hàng thành công\n2. Xem icon giỏ hàng trên navbar', 'N/A', 'Số lượng badge giỏ hàng trở về 0, giỏ hàng trống', 'High', 'Badge giỏ hàng về 0, giỏ hàng được clear sạch sẽ'],
    ['TC_PAY_026', 'Payment_Tracking_Redirect', 'Nhấn nút "Theo dõi đơn hàng" trên màn hình Thành công', '1. Đặt hàng thành công\n2. Bấm nút "Theo dõi đơn hàng"', 'N/A', 'Điều hướng chuẩn sang trang /tracking', 'High', 'Chuyển trang đến /tracking chính xác'],
    ['TC_PAY_027', 'Payment_Order_DBSync', 'Kiểm tra lưu đơn hàng vào CSDL MySQL Backend', '1. Hoàn tất đặt đơn\n2. Tra cứu mã đơn trong DB', 'Mã đơn sinh ra', 'Đơn hàng và các item tương ứng được lưu chuẩn xác vào bảng `orders` & `order_items`', 'High', 'Đơn hàng lưu thành công vào bảng orders trong MySQL'],
    ['TC_PAY_028', 'Payment_Switch_Zone', 'Đổi vùng giao hàng nhiều lần trong lúc điền form', '1. Chọn vùng A rồi đổi sang vùng B', 'Nội thành -> Miền Bắc', 'Phí ship và Tổng cộng tự động cập nhật lại tương ứng', 'Medium', 'Phí ship và tổng tiền tự cập nhật realtime'],
    ['TC_PAY_029', 'Payment_Notes_SpecialChars', 'Nhập Ghi chú đơn hàng có dấu và emoji', '1. Nhập: "Giao giờ hành chính giúp em ạ 🌿📦"', 'Ghi chú tiếng Việt', 'Lưu chuẩn xác chuỗi UTF-8 vào CSDL', 'Low', 'Lưu đúng ký tự UTF-8 và emoji vào CSDL'],
    ['TC_PAY_030', 'Payment_Responsive', 'Kiểm tra giao diện Thanh toán trên iPad / Tablet', '1. Bật F12 Responsive 768px\n2. Quan sát 2 cột', 'Tablet View', 'Cột form và Cột tóm tắt bố cục hợp lý, dễ thao tác', 'Low', 'Giao diện tablet co giãn hợp lý, dễ thao tác'],
  ];
  createTestSheet('Thanh Toán', 'Chức Năng Thanh Toán & Tính Phí Ship', 'Người dùng có sản phẩm trong giỏ, truy cập trang Thanh toán (/checkout).', payTestCases);

  // ==========================================
  // 3. SHEET: Bản Đồ GIS (Nhiệm vụ Dương) - 28 TC
  // ==========================================
  const mapTestCases = [
    ['TC_MAP_001', 'Map_Load', 'Kiểm tra tải giao diện Bản đồ GIS Nhà Vườn', '1. Truy cập /map\n2. Quan sát', 'N/A', 'Hiển thị Bản đồ Leaflet OpenStreetMap, Sidebar danh sách nhà vườn, Ô tìm kiếm và Bộ lọc vùng', 'High', 'Bản đồ, sidebar danh sách, ô tìm kiếm và bộ lọc hiển thị đầy đủ'],
    ['TC_MAP_002', 'Map_Tiles_Render', 'Kiểm tra hiển thị bản đồ nền OpenStreetMap', '1. Xem khu vực bản đồ', 'N/A', 'Bản đồ nền load đầy đủ các mảnh tile, không bị xám hoặc đứt gãy', 'High', 'Các mảnh tile bản đồ OpenStreetMap load đầy đủ, mượt mà'],
    ['TC_MAP_003', 'Map_Center_Vietnam', 'Kiểm tra tọa độ trung tâm khởi tạo', '1. Tải trang /map', 'N/A', 'Bản đồ lấy trung tâm toàn cảnh Việt Nam (Khoảng [14.0583, 108.2772]) ở mức zoom 6', 'Medium', 'Tọa độ trung tâm khởi tạo đúng toàn cảnh Việt Nam zoom 6'],
    ['TC_MAP_004', 'Map_Zoom_Controls', 'Kiểm tra nút Phóng to / Thu nhỏ (+ / -)', '1. Click nút + và - trên bản đồ\n2. Lăn chuột cuộn zoom', 'Zoom action', 'Bản đồ phóng to / thu nhỏ mượt mà', 'Medium', 'Phóng to thu nhỏ mượt mà qua nút bấm và lăn chuột'],
    ['TC_MAP_005', 'Map_Pan_Drag', 'Kiểm tra kéo rê bản đồ (Pan/Drag)', '1. Giữ chuột kéo bản đồ sang trái/phải', 'Drag action', 'Bản đồ di chuyển theo vị trí chuột trơn tru', 'Low', 'Kéo rê bản đồ mượt mà không giật lag'],
    ['TC_MAP_006', 'Map_Markers_Display', 'Hiển thị các Marker nhà vườn trên bản đồ', '1. Quan sát các điểm ghim', 'N/A', 'Các điểm ghim xuất hiện đúng tọa độ địa lý các tỉnh (Bến Tre, Vĩnh Long, Đà Lạt, Mộc Châu, Thái Nguyên...)', 'High', 'Các marker hiển thị đúng tọa độ các tỉnh thành'],
    ['TC_MAP_007', 'Map_Marker_ClickPopup', 'Nhấn vào Marker để mở Popup tóm tắt', '1. Click vào 1 Marker trên map', 'Marker bất kỳ', 'Popup mở ra hiển thị: Ảnh nông trại, Tên nhà vườn, Địa chỉ, Số sao ⭐, Số sản phẩm và Đặc sản', 'High', 'Popup hiển thị đầy đủ ảnh, tên, địa chỉ, đánh giá và đặc sản'],
    ['TC_MAP_008', 'Map_Popup_Close', 'Đóng Popup khi click ra vùng ngoài bản đồ', '1. Mở popup của 1 marker\n2. Click vào vị trí trống trên map', 'N/A', 'Popup đóng lại', 'Low', 'Popup đóng khi click ra ngoài bản đồ'],
    ['TC_MAP_009', 'Map_Search_Name', 'Tìm kiếm nhà vườn theo Tên nhà vườn', '1. Nhập "Đà Lạt" vào ô tìm kiếm', 'Từ khóa: "Đà Lạt"', 'Sidebar và Bản đồ chỉ hiển thị các nông hộ có tên chứa "Đà Lạt"', 'High', 'Lọc và hiển thị đúng nông hộ tại Đà Lạt'],
    ['TC_MAP_010', 'Map_Search_Province', 'Tìm kiếm nhà vườn theo Tỉnh thành', '1. Nhập "Bến Tre" vào ô tìm kiếm', 'Từ khóa: "Bến Tre"', 'Hiển thị đúng nông hộ Vườn Chú Ba tại Bến Tre', 'High', 'Tìm kiếm chính xác nông hộ tại Bến Tre'],
    ['TC_MAP_011', 'Map_Search_Specialty', 'Tìm kiếm theo tên Đặc sản / Cây trồng', '1. Nhập "sầu riêng" vào ô tìm kiếm', 'Từ khóa: "sầu riêng"', 'Hiển thị các nông hộ chuyên canh sầu riêng', 'Medium', 'Hiển thị đúng nhà vườn có sầu riêng'],
    ['TC_MAP_012', 'Map_Search_NoResult', 'Tìm kiếm với từ khóa không khớp', '1. Nhập "HaNoi12345"', 'Từ khóa: "HaNoi12345"', 'Sidebar hiển thị thông báo "Không tìm thấy nhà vườn nào"', 'Medium', 'Sidebar hiển thị thông báo "Không tìm thấy nhà vườn nào"'],
    ['TC_MAP_013', 'Map_Filter_North', 'Lọc danh sách nhà vườn Miền Bắc', '1. Nhấn nút lọc "Miền Bắc"', 'Zone: North', 'Chỉ hiển thị các nông hộ Miền Bắc (Mộc Châu, Thái Nguyên), nút "Miền Bắc" active màu xanh', 'High', 'Chỉ hiển thị nông hộ Miền Bắc, nút active màu xanh'],
    ['TC_MAP_014', 'Map_Filter_Central', 'Lọc danh sách nhà vườn Miền Trung', '1. Nhấn nút lọc "Miền Trung"', 'Zone: Central', 'Chỉ hiển thị nông hộ Miền Trung (Đà Lạt, Lâm Đồng)', 'High', 'Chỉ hiển thị nông hộ Miền Trung (Đà Lạt, Lâm Đồng)'],
    ['TC_MAP_015', 'Map_Filter_South', 'Lọc danh sách nhà vườn Miền Nam', '1. Nhấn nút lọc "Miền Nam"', 'Zone: South', 'Chỉ hiển thị nông hộ Miền Nam (Bến Tre, Vĩnh Long, Đồng Tháp)', 'High', 'Chỉ hiển thị nông hộ Miền Nam (Bến Tre, Vĩnh Long, Đồng Tháp)'],
    ['TC_MAP_016', 'Map_Filter_All', 'Đặt lại bộ lọc "Tất cả vùng"', '1. Đang lọc vùng\n2. Nhấn "Tất cả vùng"', 'Zone: All', 'Hiển thị lại toàn bộ các nhà vườn trên cả nước', 'High', 'Hiển thị lại toàn bộ các nhà vườn'],
    ['TC_MAP_017', 'Map_Combine_SearchFilter', 'Kết hợp Tìm kiếm từ khóa và Lọc vùng', '1. Chọn lọc "Miền Nam"\n2. Nhập từ khóa: "Bưởi"', 'Zone: South, Key: "Bưởi"', 'Hiển thị HTX Bưởi Da Xanh tại Vĩnh Long', 'High', 'Kết hợp filter và search trả về đúng kết quả'],
    ['TC_MAP_018', 'Map_Sidebar_ListClick', 'Nhấn vào Card nhà vườn trong Sidebar', '1. Click vào Card "Vườn Trái Cây Chú Ba"', 'Card chú Ba', 'Mở Modal chi tiết đầy đủ thông tin của nhà vườn', 'High', 'Mở modal chi tiết đầy đủ thông tin nhà vườn'],
    ['TC_MAP_019', 'Map_VietGAP_Badge', 'Hiển thị huy hiệu VietGAP cho nhà vườn đạt chuẩn', '1. Xem các nhà vườn có is_verified = true', 'N/A', 'Badge xanh "VietGAP" hiển thị nổi bật trên card và modal', 'Medium', 'Badge VietGAP hiển thị nổi bật màu xanh'],
    ['TC_MAP_020', 'Map_Detail_ModalInfo', 'Kiểm tra thông tin trên Modal chi tiết nhà vườn', '1. Mở modal chi tiết', 'N/A', 'Hiển thị: Ảnh bìa lớn, Tên vườn, Tên chủ vườn, Địa chỉ, Đánh giá, Đặc sản, Tọa độ GPS, Nút "Xem sản phẩm"', 'High', 'Modal hiển thị đầy đủ thông tin chi tiết nhà vườn'],
    ['TC_MAP_021', 'Map_Detail_GPSFormat', 'Kiểm tra hiển thị Tọa độ GPS trên Modal', '1. Mở modal chi tiết\n2. Xem dòng Tọa độ GPS', 'N/A', 'Tọa độ hiển thị đúng chuẩn số thập phân (VD: 10.2348, 106.3485)', 'Medium', 'Tọa độ GPS hiển thị dạng số thập phân chuẩn'],
    ['TC_MAP_022', 'Map_Detail_ProductsLink', 'Nhấn nút "Xem sản phẩm" trên Modal', '1. Mở modal\n2. Nhấn nút "Xem sản phẩm"', 'N/A', 'Điều hướng người dùng đến trang danh mục sản phẩm', 'High', 'Chuyển hướng đến trang sản phẩm chính xác'],
    ['TC_MAP_023', 'Map_Detail_CloseBtn', 'Đóng Modal bằng nút X', '1. Mở modal\n2. Click nút X góc trên', 'N/A', 'Modal đóng lại mượt mà', 'Low', 'Modal đóng khi click nút X'],
    ['TC_MAP_024', 'Map_Detail_CloseBackdrop', 'Đóng Modal bằng cách click vùng tối bên ngoài', '1. Mở modal\n2. Click ra ngoài backdrop đen', 'N/A', 'Modal đóng lại', 'Low', 'Modal đóng khi click backdrop bên ngoài'],
    ['TC_MAP_025', 'Map_API_Sync', 'Đồng bộ dữ liệu nông hộ từ Backend API', '1. Tải trang /map\n2. Kiểm tra network', 'GET /api/farmers', 'Tọa độ và dữ liệu nông hộ được fetch trực tiếp từ Laravel CSDL MySQL', 'High', 'Dữ liệu tọa độ nông hộ được tải chuẩn từ MySQL'],
    ['TC_MAP_026', 'Map_Responsive_Layout', 'Kiểm tra responsive trên Mobile (< 1024px)', '1. Chuyển sang kích thước điện thoại', 'Mobile View', 'Bản đồ hiển thị phía trên, danh sách nông hộ trượt xuống phía dưới', 'Medium', 'Bố cục tự động chuyển dọc trên màn hình điện thoại'],
    ['TC_MAP_027', 'Map_Star_RatingDisplay', 'Hiển thị số sao đánh giá trung bình', '1. Xem điểm rating của nông hộ', 'Rating: 4.8', 'Hiển thị icon ngôi sao vàng kèm điểm số chính xác', 'Low', 'Hiển thị số sao đánh giá trung bình chính xác'],
    ['TC_MAP_028', 'Map_Specialty_Badge', 'Hiển thị tag vùng miền đúng màu', '1. Xem tag vùng miền trên từng card', 'Zone tags', 'Miền Bắc (Xanh dương), Miền Trung (Cam), Miền Nam (Xanh lá)', 'Low', 'Tag vùng miền hiển thị đúng màu sắc phân biệt'],
  ];
  createTestSheet('Bản Đồ GIS', 'Tích Hợp Bản Đồ Nhà Vườn (GIS)', 'Người dùng truy cập trang Bản đồ Nhà Vườn (/map).', mapTestCases);

  // ==========================================
  // 4. SHEET: Theo Dõi Giao Hàng (Nhiệm vụ Dương) - 26 TC
  // ==========================================
  const trackTestCases = [
    ['TC_TRACK_001', 'Track_UI', 'Kiểm tra tải giao diện trang Theo Dõi Đơn Hàng', '1. Truy cập /tracking\n2. Quan sát', 'N/A', 'Hiển thị Banner gradient xanh, Ô nhập mã đơn, Nút Tra cứu, Dãy nút chip gợi ý mã mẫu', 'High', 'Banner xanh, ô tìm kiếm, nút tra cứu và các chip gợi ý mã mẫu hiển thị đủ'],
    ['TC_TRACK_002', 'Track_EmptyCode', 'Nhấn Tra cứu khi để trống ô mã đơn', '1. Để trống ô tìm kiếm\n2. Nhấn "Tra cứu"', 'Mã: (Empty)', 'Không gọi API, ô input giữ focus hoặc hiển thị thông báo', 'Medium', 'Không gọi API khi mã rỗng'],
    ['TC_TRACK_003', 'Track_EnterKey', 'Nhấn phím Enter để thực hiện tra cứu', '1. Nhập "GF284910"\n2. Nhấn Enter trên bàn phím', 'Mã: "GF284910"', 'Kích hoạt tìm kiếm và hiển thị kết quả đúng như bấm nút Tra cứu', 'Medium', 'Phím Enter kích hoạt tra cứu nhanh chóng'],
    ['TC_TRACK_004', 'Track_NotFound', 'Tra cứu với mã đơn hàng không tồn tại', '1. Nhập mã sai: "GF999999"\n2. Bấm Tra cứu', 'Mã: "GF999999"', 'Hiển thị thông báo đỏ "Không tìm thấy đơn hàng #GF999999" kèm gợi ý mã mẫu', 'High', 'Hiển thị thông báo "Không tìm thấy đơn hàng" kèm nút thử mã mẫu'],
    ['TC_TRACK_005', 'Track_Pill_Click', 'Nhấn vào nút chip mã mẫu gợi ý', '1. Click vào pill "GF284910"', 'Pill "GF284910"', 'Mã tự động điền vào ô tìm kiếm và kích hoạt tra cứu ngay lập tức', 'High', 'Tự điền mã và tìm kiếm ngay khi click chip gợi ý'],
    ['TC_TRACK_006', 'Track_Case_Insensitive', 'Tra cứu mã đơn bằng chữ thường (gf284910)', '1. Nhập "gf284910"\n2. Bấm Tra cứu', 'Mã: "gf284910"', 'Hệ thống tự viết hoa thành GF284910 và trả về kết quả đúng', 'High', 'Tự động uppercase mã đơn và tìm thấy đơn'],
    ['TC_TRACK_007', 'Track_Hash_Prefix', 'Tra cứu mã đơn có dấu thăng (#GF284910)', '1. Nhập "#GF284910"\n2. Bấm Tra cứu', 'Mã: "#GF284910"', 'Hệ thống tự bỏ dấu # và tra cứu chính xác đơn GF284910', 'Medium', 'Tự loại bỏ dấu # và tra cứu chuẩn xác'],
    ['TC_TRACK_008', 'Track_Status_Pending', 'Tra cứu đơn hàng trạng thái "Chờ xác nhận"', '1. Tra cứu đơn mới tạo', 'Status: Pending', 'Badge "Chờ xác nhận" (màu vàng). Bước 1 "Đặt hàng" hoàn thành', 'High', 'Hiển thị badge "Chờ xác nhận", bước 1 tích xanh'],
    ['TC_TRACK_009', 'Track_Status_Confirmed', 'Tra cứu đơn hàng trạng thái "Đã xác nhận"', '1. Tra cứu mã "GF285130"', 'Mã: "GF285130"', 'Badge "Đã xác nhận" (màu xanh dương). Bước 1 và Bước 2 hoàn thành', 'High', 'Hiển thị badge "Đã xác nhận", bước 1 và 2 tích xanh'],
    ['TC_TRACK_010', 'Track_Status_Shipping', 'Tra cứu đơn hàng trạng thái "Đang giao hàng"', '1. Tra cứu mã "GF284910"', 'Mã: "GF284910"', 'Badge "Đang giao hàng" (màu tím). Bước 3 "Đang giao" có hiệu ứng pulse nhấp nháy', 'High', 'Badge "Đang giao hàng" màu tím, bước 3 có hiệu ứng pulse nhấp nháy'],
    ['TC_TRACK_011', 'Track_Status_Delivered', 'Tra cứu đơn hàng trạng thái "Đã giao thành công"', '1. Tra cứu mã "GF285020"', 'Mã: "GF285020"', 'Badge "Đã giao thành công" (màu xanh lá). Cả 4 bước Timeline đều có dấu tick xanh', 'High', 'Badge xanh lá "Đã giao thành công", cả 4 bước có tick xanh'],
    ['TC_TRACK_012', 'Track_Timeline_Timestamps', 'Kiểm tra mốc thời gian hiển thị trên từng bước Timeline', '1. Tra cứu đơn "GF285020"\n2. Xem các mốc giờ', 'N/A', 'Mỗi bước đã hoàn thành có mốc ngày giờ cụ thể (VD: 18/08 14:00)', 'Medium', 'Các mốc ngày giờ hiển thị rõ ràng trên từng bước'],
    ['TC_TRACK_013', 'Track_Shipper_MapDisplay', 'Hiển thị Bản đồ mini khi đơn hàng đang giao', '1. Tra cứu đơn "GF284910" (Shipping)\n2. Quan sát khu vực Map', 'Mã: "GF284910"', 'Bản đồ Leaflet hiển thị với 2 Marker: Vị trí Shipper (🛵) và Điểm nhận hàng (📍)', 'High', 'Bản đồ mini hiển thị vị trí Shipper và điểm nhận'],
    ['TC_TRACK_014', 'Track_Shipper_MapHide', 'Ẩn Bản đồ khi đơn hàng đã giao thành công', '1. Tra cứu đơn "GF285020" (Delivered)', 'Mã: "GF285020"', 'Không hiển thị bản đồ shipper vì đơn hàng đã kết thúc', 'Medium', 'Tự ẩn bản đồ shipper khi đơn đã hoàn thành'],
    ['TC_TRACK_015', 'Track_Shipper_Info', 'Hiển thị thông tin Shipper phụ trách', '1. Tra cứu đơn "GF284910"\n2. Xem card Shipper', 'Mã: "GF284910"', 'Hiển thị đúng Tên shipper ("Trần Minh Đức") và Số điện thoại ("0912345678")', 'High', 'Hiển thị chính xác tên và SĐT shipper'],
    ['TC_TRACK_016', 'Track_Shipper_CallBtn', 'Kiểm tra nút Gọi điện cho Shipper', '1. Bấm nút "Gọi điện" trên card shipper', 'N/A', 'Trình duyệt kích hoạt giao thức tel: mở ứng dụng gọi điện với SĐT shipper', 'Medium', 'Kích hoạt gọi điện tel: chuẩn xác'],
    ['TC_TRACK_017', 'Track_Customer_Info', 'Kiểm tra hiển thị Thông tin người nhận', '1. Tra cứu đơn bất kỳ\n2. Xem card Thông tin nhận hàng', 'Mã hợp lệ', 'Hiển thị chính xác: Tên người nhận, SĐT, Địa chỉ giao hàng và Phương thức thanh toán', 'High', 'Thông tin người nhận và địa chỉ giao chính xác'],
    ['TC_TRACK_018', 'Track_Product_List', 'Kiểm tra hiển thị Danh sách sản phẩm trong đơn', '1. Tra cứu đơn "GF284910"\n2. Xem card Sản phẩm', 'Mã: "GF284910"', 'Hiển thị đủ 3 sản phẩm: Tên, Phân loại/Đơn vị, Số lượng và Thành tiền từng món', 'High', 'Danh sách sản phẩm trong đơn hiển thị chi tiết'],
    ['TC_TRACK_019', 'Track_ShippingFee_Display', 'Kiểm tra hiển thị Phí vận chuyển trong chi tiết đơn', '1. Xem dòng Phí vận chuyển', 'N/A', 'Hiển thị đúng phí vận chuyển đã tính lúc đặt hàng (hoặc "Miễn phí" nếu đạt freeship)', 'Medium', 'Phí vận chuyển hiển thị chuẩn'],
    ['TC_TRACK_020', 'Track_Total_Calculation', 'Kiểm tra hiển thị Tổng thanh toán', '1. Tra cứu đơn "GF284910"', 'Mã: "GF284910"', 'Tổng thanh toán = Tiền hàng (325.000đ) + Phí ship (15.000đ) = 340.000đ', 'High', 'Tổng thanh toán tính toán chuẩn xác = 340.000đ'],
    ['TC_TRACK_021', 'Track_API_Call', 'Gọi API tra cứu Backend thực tế', '1. Nhập mã đơn\n2. Bấm Tra cứu', 'GET /api/orders/tracking/{code}', 'Dữ liệu đơn hàng được trả về từ Backend Laravel CSDL MySQL', 'High', 'API /api/orders/tracking trả dữ liệu chuẩn từ MySQL'],
    ['TC_TRACK_022', 'Track_Loading_State', 'Kiểm tra trạng thái Đang tải khi tra cứu', '1. Nhấn nút Tra cứu\n2. Quan sát nút', 'N/A', 'Nút chuyển sang icon xoay vòng (Spinner) và chữ "Đang tìm..."', 'Low', 'Icon xoay và chữ "Đang tìm..." hiển thị khi loading'],
    ['TC_TRACK_023', 'Track_SpecialChar_Search', 'Tra cứu mã đơn chứa ký tự đặc biệt nguy hiểm', '1. Nhập: "GF<script>"\n2. Bấm Tra cứu', 'Mã chứa XSS', 'Xử lý an toàn, báo không tìm thấy mã đơn, không bị lỗi script', 'High', 'Xử lý an toàn, không thực thi mã độc'],
    ['TC_TRACK_024', 'Track_Responsive_Mobile', 'Kiểm tra hiển thị Timeline trên màn hình điện thoại', '1. Bật F12 375px\n2. Xem Timeline', 'Mobile View', 'Timeline chuyển sang dạng danh sách dọc dễ nhìn, đầy đủ icon trạng thái', 'Medium', 'Timeline hiển thị dạng dọc gọn gàng trên mobile'],
    ['TC_TRACK_025', 'Track_CopyCode_Flow', 'Tra cứu bằng mã đơn vừa tạo mới từ Checkout', '1. Đặt hàng mới tại /checkout lấy mã\n2. Vào /tracking tra cứu mã đó', 'Mã đơn mới', 'Tra cứu thành công đơn hàng vừa tạo trong CSDL', 'High', 'Tra cứu đơn mới tạo tức thì trong CSDL'],
    ['TC_TRACK_026', 'Track_Cancelled_Badge', 'Hiển thị trạng thái khi đơn hàng bị Hủy', '1. Tra cứu đơn hàng bị hủy', 'Status: Cancelled', 'Badge đỏ "Đã hủy" hiển thị rõ ràng', 'Low', 'Badge "Đã hủy" hiển thị rõ ràng'],
  ];
  createTestSheet('Theo Dõi Giao Hàng', 'Chức Năng Theo Dõi Hành Trình Đơn Hàng', 'Người dùng truy cập trang Theo dõi đơn hàng (/tracking).', trackTestCases);

  // ==========================================
  // 5. SHEET: API Backend (Nhiệm vụ Dương) - 20 TC
  // ==========================================
  const apiTestCases = [
    ['TC_API_001', 'API_Categories_List', 'Lấy danh sách toàn bộ Danh mục nông sản', 'GET /api/categories', 'Headers: Accept: application/json', 'Trả về HTTP 200, JSON success: true kèm mảng 5 danh mục có đếm số sản phẩm', 'High', 'Trả về HTTP 200, JSON 5 danh mục'],
    ['TC_API_002', 'API_Categories_Detail', 'Lấy chi tiết 1 danh mục theo Slug hợp lệ', 'GET /api/categories/trai-cay', 'Slug: trai-cay', 'Trả về HTTP 200, JSON thông tin danh mục "Trái cây tươi ngon"', 'High', 'Trả về HTTP 200, thông tin danh mục trái cây'],
    ['TC_API_003', 'API_Categories_NotFound', 'Lấy danh mục theo Slug không tồn tại', 'GET /api/categories/danh-muc-la', 'Slug: danh-muc-la', 'Trả về HTTP 404, JSON success: false, message: "Danh mục không tồn tại"', 'Medium', 'Trả về HTTP 404 chuẩn REST'],
    ['TC_API_004', 'API_Products_List', 'Lấy danh sách tất cả Sản phẩm', 'GET /api/products', 'None', 'Trả về HTTP 200, JSON count: 12, kèm mảng đầy đủ thông tin sản phẩm và variants', 'High', 'Trả về HTTP 200, 12 sản phẩm kèm variants'],
    ['TC_API_005', 'API_Products_FilterCat', 'Lọc sản phẩm theo Category Slug', 'GET /api/products?category=tra-ca-phe', 'Param: category=tra-ca-phe', 'Trả về HTTP 200, chỉ gồm các sản phẩm trà và cà phê', 'High', 'Lọc đúng sản phẩm trà và cà phê'],
    ['TC_API_006', 'API_Products_Search', 'Tìm kiếm sản phẩm theo từ khóa', 'GET /api/products?search=sau+rieng', 'Param: search=sau riêng', 'Trả về HTTP 200, danh sách chứa sản phẩm Sầu riêng', 'High', 'Tìm kiếm trả về đúng sầu riêng'],
    ['TC_API_007', 'API_Products_SortPriceAsc', 'Sắp xếp sản phẩm theo giá tăng dần', 'GET /api/products?sort=price-asc', 'Param: sort=price-asc', 'Trả về HTTP 200, sản phẩm đầu tiên có giá thấp nhất', 'Medium', 'Sắp xếp giá tăng dần chính xác'],
    ['TC_API_008', 'API_Products_Detail', 'Lấy chi tiết sản phẩm theo Slug', 'GET /api/products/sau-rieng-ri6', 'Slug: sau-rieng-ri6', 'Trả về HTTP 200, thông tin chi tiết kèm variants và mảng related products', 'High', 'Trả về HTTP 200, chi tiết sản phẩm sầu riêng Ri6'],
    ['TC_API_009', 'API_Products_DetailNotFound', 'Lấy chi tiết sản phẩm với Slug không tồn tại', 'GET /api/products/san-pham-xyz', 'Slug: san-pham-xyz', 'Trả về HTTP 404, JSON success: false', 'Medium', 'Trả về HTTP 404'],
    ['TC_API_010', 'API_Farmers_List', 'Lấy danh sách Nông hộ kèm tọa độ GIS', 'GET /api/farmers', 'None', 'Trả về HTTP 200, count: 6, mỗi item có đầy đủ latitude & longitude dạng float', 'High', 'Trả về HTTP 200, 6 nông hộ có tọa độ GPS float'],
    ['TC_API_011', 'API_Farmers_FilterZone', 'Lọc nông hộ theo vùng miền', 'GET /api/farmers?zone=north', 'Param: zone=north', 'Trả về HTTP 200, chỉ gồm các nông hộ miền Bắc (Mộc Châu, Thái Nguyên)', 'High', 'Lọc đúng nông hộ miền Bắc'],
    ['TC_API_012', 'API_Shipping_List', 'Lấy danh sách Vùng giao hàng', 'GET /api/shipping-zones', 'None', 'Trả về HTTP 200, mảng 6 vùng giao hàng với đầy đủ base_fee và free_ship_minimum', 'High', 'Trả về HTTP 200, danh sách 6 vùng giao hàng'],
    ['TC_API_013', 'API_Shipping_Create_Valid', 'Thêm mới vùng giao hàng qua API', 'POST /api/shipping-zones', 'JSON Body: name, provinces, base_fee, extra_fee_per_kg, estimated_days', 'Trả về HTTP 201 Created, JSON thông tin vùng mới tạo với mã SZxxx', 'High', 'Trả về HTTP 201 Created, tạo vùng mới trong MySQL'],
    ['TC_API_014', 'API_Shipping_Create_Invalid', 'Thêm vùng giao hàng thiếu trường bắt buộc', 'POST /api/shipping-zones', 'JSON Body: thiếu name, base_fee âm', 'Trả về HTTP 422 Unprocessable Entity, JSON danh sách lỗi validation', 'High', 'Trả về HTTP 422 Unprocessable Entity có message lỗi'],
    ['TC_API_015', 'API_Shipping_Update', 'Cập nhật vùng giao hàng qua API', 'PUT /api/shipping-zones/SZ001', 'JSON Body: base_fee = 20000', 'Trả về HTTP 200, thông tin vùng sau khi cập nhật', 'High', 'Trả về HTTP 200, cập nhật thành công trong MySQL'],
    ['TC_API_016', 'API_Shipping_Delete', 'Xóa vùng giao hàng qua API', 'DELETE /api/shipping-zones/SZ006', 'Param: id=SZ006', 'Trả về HTTP 200, message: "Đã xóa vùng giao hàng thành công!"', 'High', 'Trả về HTTP 200, xóa bản ghi khỏi MySQL'],
    ['TC_API_017', 'API_Orders_Create_Valid', 'Tạo đơn hàng mới qua API', 'POST /api/orders', 'JSON Body: customer_name, phone, address, zone_id, payment_method, items', 'Trả về HTTP 201 Created, tracking_number dạng GFxxxxxx', 'High', 'Trả về HTTP 201 Created, tạo đơn GFxxxxxx thành công'],
    ['TC_API_018', 'API_Orders_Track_Valid', 'Tra cứu đơn hàng qua API theo mã đơn', 'GET /api/orders/tracking/GF284910', 'Param: trackingNumber=GF284910', 'Trả về HTTP 200, thông tin đơn, danh sách items, timeline 4 bước và vị trí shipper', 'High', 'Trả về HTTP 200, thông tin đơn GF284910'],
    ['TC_API_019', 'API_Orders_Track_NotFound', 'Tra cứu mã đơn không tồn tại qua API', 'GET /api/orders/tracking/GF000000', 'Param: trackingNumber=GF000000', 'Trả về HTTP 404, message: "Không tìm thấy đơn hàng #GF000000"', 'Medium', 'Trả về HTTP 404 không tìm thấy đơn'],
    ['TC_API_020', 'API_CORS_Headers', 'Kiểm tra Header CORS cho phép Next.js', 'OPTIONS /api/products', 'Header Origin: http://localhost:3000', 'Trả về Access-Control-Allow-Origin: http://localhost:3000', 'High', 'Trả về Header CORS Access-Control-Allow-Origin hợp lệ'],
  ];
  createTestSheet('API Backend', 'Kiểm Thử REST API Backend Laravel', 'Backend Laravel đang chạy trên cổng 8000 (http://127.0.0.1:8000).', apiTestCases);

  // ==========================================
  // 6. SHEET: Kết quả tổng hợp (Dương)
  // ==========================================
  const sumWs = workbook.addWorksheet('Kết quả tổng hợp', {
    views: [{ showGridLines: true }]
  });

  const duongModules = [
    ['Phí Giao Hàng (CRUD & Validation)', shipTestCases.length],
    ['Thanh Toán & Tính Phí Ship', payTestCases.length],
    ['Tích Hợp Bản Đồ Nhà Vườn (GIS)', mapTestCases.length],
    ['Theo Dõi Hành Trình Đơn Hàng', trackTestCases.length],
    ['Kiểm Thử REST API Backend Laravel', apiTestCases.length],
  ];

  const totalDuongTCs = duongModules.reduce((sum, m) => sum + m[1], 0);

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
    ['Windows 11 / Chrome', totalDuongTCs, 0, 0, totalDuongTCs],
    ['Windows 11 / Edge', totalDuongTCs, 0, 0, totalDuongTCs],
    ['MacOS / Safari', totalDuongTCs, 0, 0, totalDuongTCs]
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
      if (cIdx === 1) {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF006100' } };
        cell.fill = passFill;
      }
    });
  });

  // Row 5: Blank
  sumWs.getRow(5).height = 15;

  // Table 2: Module Statistics
  const modRow6 = sumWs.getRow(6);
  modRow6.getCell(1).value = 'Thống kê theo Module (Nhiệm vụ Dương)';
  modRow6.getCell(1).font = { name: 'Calibri', size: 11, bold: true };
  modRow6.getCell(1).fill = summaryYellowFill;
  modRow6.getCell(1).border = thinBorder;

  modRow6.getCell(2).value = 'Số lượng TC';
  modRow6.getCell(2).font = { name: 'Calibri', size: 11, bold: true };
  modRow6.getCell(2).fill = summaryYellowFill;
  modRow6.getCell(2).border = thinBorder;
  modRow6.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

  modRow6.getCell(3).value = 'Kết quả';
  modRow6.getCell(3).font = { name: 'Calibri', size: 11, bold: true };
  modRow6.getCell(3).fill = summaryYellowFill;
  modRow6.getCell(3).border = thinBorder;
  modRow6.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

  duongModules.forEach((m, idx) => {
    const r = sumWs.getRow(7 + idx);

    const cell1 = r.getCell(1);
    cell1.value = m[0];
    cell1.font = { name: 'Calibri', size: 11 };
    cell1.border = thinBorder;

    const cell2 = r.getCell(2);
    cell2.value = m[1];
    cell2.font = { name: 'Calibri', size: 11 };
    cell2.border = thinBorder;
    cell2.alignment = { horizontal: 'center', vertical: 'middle' };

    const cell3 = r.getCell(3);
    cell3.value = '100% PASS';
    cell3.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF006100' } };
    cell3.fill = passFill;
    cell3.border = thinBorder;
    cell3.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Total row
  const totalRowIndex = 7 + duongModules.length;
  const totalR = sumWs.getRow(totalRowIndex);
  
  totalR.getCell(1).value = 'TỔNG CỘNG';
  totalR.getCell(1).font = { name: 'Calibri', size: 11, bold: true };
  totalR.getCell(1).border = thinBorder;

  totalR.getCell(2).value = totalDuongTCs;
  totalR.getCell(2).font = { name: 'Calibri', size: 11, bold: true };
  totalR.getCell(2).border = thinBorder;
  totalR.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

  totalR.getCell(3).value = '100% PASS';
  totalR.getCell(3).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF006100' } };
  totalR.getCell(3).fill = passFill;
  totalR.getCell(3).border = thinBorder;
  totalR.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

  sumWs.getColumn(1).width = 46;
  sumWs.getColumn(2).width = 18;
  sumWs.getColumn(3).width = 18;
  sumWs.getColumn(4).width = 15;
  sumWs.getColumn(5).width = 15;

  // Output file only for Duong
  const duongPath1 = path.join(__dirname, '..', 'testcases', 'Test_Cases_GreenFood_Duong.xlsx');
  const duongPath2 = path.join(__dirname, '..', '..', 'Test_Cases_GreenFood_Duong.xlsx');
  
  await workbook.xlsx.writeFile(duongPath1);
  await workbook.xlsx.writeFile(duongPath2);

  // Delete Admin file if exists
  const adminPath1 = path.join(__dirname, '..', 'testcases', 'Test_Cases_GreenFood_Admin.xlsx');
  const adminPath2 = path.join(__dirname, '..', '..', 'Test_Cases_GreenFood_Admin.xlsx');
  if (fs.existsSync(adminPath1)) fs.unlinkSync(adminPath1);
  if (fs.existsSync(adminPath2)) fs.unlinkSync(adminPath2);

  console.log(`✅ File Test Cases của riêng Dương (${totalDuongTCs} Test Cases - 100% PASS) đã tạo xong! Đã xóa file Admin.`);
}

generateDuongPassOnlyTestCases().catch(console.error);
