# Quy tắc Tự Động Thực Thi & Submit (Auto-Submit Policy)

1. **Tự động đưa ra quyết định tối ưu**:
   - Khi có nhiều giải pháp hoặc lựa chọn, AI KHÔNG dùng câu hỏi modal (`ask_question`) để làm phiền hoặc ngắt quãng người dùng.
   - Luôn tự động chọn giải pháp khuyến nghị tốt nhất (Recommended), hiện đại nhất và tiết kiệm tài nguyên nhất.

2. **Tự động kiểm thử và Submit (Commit & Push)**:
   - Sau khi hoàn thành code bất kỳ tính năng hoặc sửa lỗi nào, chạy kiểm thử tự động (PHPUnit / Next.js build).
   - Tự động thực hiện lệnh Git:
     ```bash
     git add <các file thay đổi>
     git commit --author="thienlotus <thienchip1310@gmail.com>" -m "<thông điệp commit chuẩn conventional>"
     git push origin main
     ```
   - Báo cáo kết quả trực tiếp cho người dùng sau khi đã push thành công.
