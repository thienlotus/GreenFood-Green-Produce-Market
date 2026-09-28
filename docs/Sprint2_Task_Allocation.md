# 📋 Phân Công Công Việc Sprint 2 — GreenFood

> **Ngày lập:** 28/09/2026  
> **Tổng số tính năng mới:** 4  
> **Số thành viên:** 4  
> **Người lập:** Lê Vũ Thiên (Team Leader)

---

## Tổng quan phân công

| STT | Tính năng | Thành viên phụ trách | Nhánh Git | Ưu tiên |
|:---:|---|---|---|:---:|
| 1 | Xác thực Email OTP khi Đăng ký | **Lê Thiều Hưng** | `auth-service` | 🔴 Cao |
| 2 | Tích hợp Giao Hàng Nhanh (GHN API) | **Nguyễn Đại Dương** | `delivery-service` | 🔴 Cao |
| 3 | Tích hợp Thanh Toán MoMo API | **Lương Văn Quý** | `product-service` | 🟡 Trung bình |
| 4 | Live Chat + Quản trị Admin nâng cao | **Lê Vũ Thiên** | `admin-service` / `main` | 🔴 Cao |

---

## 1️⃣ Xác Thực Email OTP Khi Đăng Ký

> **Phụ trách:** Lê Thiều Hưng ([@0912lethieuhung-hub](https://github.com/0912lethieuhung-hub))  
> **Nhánh:** `auth-service`  
> **Vai trò:** Developer & QA/QC Lead

### Lý do phân công
Hưng đang phụ trách toàn bộ module Auth & User Service (Đăng ký, Đăng nhập, Profile). Việc bổ sung xác thực email là mở rộng tự nhiên của luồng đăng ký hiện tại mà Hưng đã xây dựng.

### Yêu cầu chi tiết

#### Backend (Laravel)
- [ ] Cấu hình SMTP Gmail trong `.env` (`MAIL_MAILER=smtp`, `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587`, `MAIL_USERNAME`, `MAIL_PASSWORD`)
- [ ] Tạo bảng `email_verifications` (migration):
  ```
  id, user_id, email, otp_code (6 chữ số), expires_at, verified_at, created_at
  ```
- [ ] Tạo `App\Mail\VerificationCodeMail` (Mailable class) với template HTML đẹp mắt mang thương hiệu GreenFood
- [ ] Cập nhật `UserService::register()`:
  - Sau khi tạo user, sinh mã OTP 6 chữ số ngẫu nhiên
  - Lưu vào bảng `email_verifications` với `expires_at = now() + 10 phút`
  - Gửi email chứa mã OTP qua `Mail::to($user->email)->send(new VerificationCodeMail($otp))`
  - Đánh dấu user `email_verified = false` ban đầu
- [ ] Tạo API endpoint `POST /api/verify-email` nhận `{ email, otp_code }`:
  - Kiểm tra mã OTP khớp và chưa hết hạn
  - Cập nhật `email_verified = true` cho user
  - Trả về `{ success: true, message: "Xác thực email thành công!" }`
- [ ] Tạo API endpoint `POST /api/resend-otp` để gửi lại mã OTP mới (giới hạn 3 lần / 15 phút)
- [ ] Thêm cột `email_verified` (boolean, default false) vào bảng `users`

#### Frontend (Next.js)
- [ ] Sau khi đăng ký thành công, chuyển đến trang/modal nhập mã OTP
- [ ] Giao diện nhập 6 ô số OTP (mỗi ô 1 chữ số, auto-focus sang ô tiếp theo)
- [ ] Hiển thị đếm ngược 10 phút (thời gian hết hạn OTP)
- [ ] Nút "Gửi lại mã" (disabled trong 60 giây đầu, hiển thị số lần còn lại)
- [ ] Thông báo thành công khi xác thực xong → tự động đăng nhập

#### Test Cases
- [ ] Viết test cases cho luồng xác thực email (bổ sung vào file test cases đăng ký)
- [ ] Kiểm thử: OTP đúng, OTP sai, OTP hết hạn, gửi lại OTP, giới hạn gửi lại

---

## 2️⃣ Tích Hợp Giao Hàng Nhanh (GHN API)

> **Phụ trách:** Nguyễn Đại Dương ([@OceanDDz](https://github.com/OceanDDz))  
> **Nhánh:** `delivery-service`  
> **Vai trò:** Backend & Frontend Developer

### Lý do phân công
Dương đang phụ trách module Delivery & Logistics Service, đã xây dựng tính cước phí ship theo khu vực và live tracking. Tích hợp GHN API là nâng cấp trực tiếp trên nền tảng logistics mà Dương đã phát triển.

### Yêu cầu chi tiết

#### Đăng ký tài khoản GHN
- [ ] Đăng ký tài khoản tại [https://dev.ghn.vn](https://dev.ghn.vn)
- [ ] Lấy `Token` và `ShopId` từ trang Settings
- [ ] Lưu vào `.env`: `GHN_TOKEN`, `GHN_SHOP_ID`, `GHN_API_URL=https://dev-online-gateway.ghn.vn`

#### Backend (Laravel)
- [ ] Tạo `App\Services\GhnService` (HTTP Client wrapper cho GHN API v2):
  - `getProvinces()` → `GET /shiip/public-api/master-data/province`
  - `getDistricts($provinceId)` → `GET /shiip/public-api/master-data/district`
  - `getWards($districtId)` → `GET /shiip/public-api/master-data/ward`
  - `calculateFee($payload)` → `POST /shiip/public-api/v2/shipping-order/fee`
  - `getExpectedDeliveryTime($payload)` → `POST /shiip/public-api/v2/shipping-order/leadtime`
  - `createOrder($payload)` → `POST /shiip/public-api/v2/shipping-order/create`
  - `trackOrder($orderCode)` → `POST /shiip/public-api/v2/shipping-order/detail`
  - `cancelOrder($orderCodes)` → `POST /shiip/public-api/v2/switch-status/cancel`
- [ ] Tạo `GhnController` với các endpoint API tương ứng
- [ ] Đăng ký route trong `routes/api.php`:
  ```php
  Route::prefix('ghn')->group(function () {
      Route::get('/provinces', ...);
      Route::get('/districts/{provinceId}', ...);
      Route::get('/wards/{districtId}', ...);
      Route::post('/calculate-fee', ...);
      Route::post('/expected-time', ...);
      Route::post('/create-order', ...);
      Route::get('/track/{orderCode}', ...);
      Route::post('/cancel', ...);
  });
  ```

#### Frontend (Next.js)
- [ ] Trang Checkout: Thay thế bảng cước phí tĩnh bằng dropdown địa chỉ GHN (Tỉnh → Quận → Phường)
- [ ] Hiển thị cước phí ship real-time từ GHN khi chọn xong địa chỉ
- [ ] Hiển thị thời gian giao hàng dự kiến (ví dụ: "Dự kiến giao: 2-3 ngày")
- [ ] Trang Tracking: Tích hợp trạng thái đơn hàng từ GHN API (thay vì mock data)
- [ ] Hiển thị các dịch vụ giao hàng: Nhanh / Tiêu chuẩn / Tiết kiệm

#### Test Cases
- [ ] Viết test cases cho tính cước phí, tạo đơn GHN, theo dõi đơn
- [ ] Kiểm thử: Địa chỉ hợp lệ, địa chỉ không hỗ trợ, API timeout, fallback cước phí tĩnh

---

## 3️⃣ Tích Hợp Thanh Toán MoMo API

> **Phụ trách:** Lương Văn Quý ([@QUY-LUONG-VAN](https://github.com/QUY-LUONG-VAN))  
> **Nhánh:** `product-service`  
> **Vai trò:** Backend & Frontend Developer

### Lý do phân công
Quý đang phụ trách module Product & Catalog, bao gồm luồng Giỏ hàng → Checkout → Áp dụng mã giảm giá. Tích hợp thanh toán MoMo là bước tiếp nối tự nhiên trong luồng thanh toán mà Quý đang quản lý.

### Yêu cầu chi tiết

#### Đăng ký tài khoản MoMo Partner
- [ ] Đăng ký tài khoản tại [https://business.momo.vn](https://business.momo.vn) (hoặc dùng Sandbox/Test mode)
- [ ] Lấy `Partner Code`, `Access Key`, `Secret Key` từ trang Developer Settings
- [ ] Lưu vào `.env`: `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_API_URL=https://test-payment.momo.vn` (sandbox)

#### Backend (Laravel)
- [ ] Tạo `App\Services\MomoService`:
  - `createPayment($orderId, $amount, $orderInfo)` → Tạo link thanh toán MoMo
  - `verifyCallback($payload)` → Xác thực chữ ký (signature) callback từ MoMo
  - `checkTransactionStatus($orderId)` → Kiểm tra trạng thái giao dịch
  - Sinh chữ ký HMAC-SHA256 theo chuẩn MoMo
- [ ] Tạo `MomoController`:
  - `POST /api/payment/momo/create` → Tạo giao dịch thanh toán, trả về `payUrl`
  - `POST /api/payment/momo/callback` → Webhook nhận kết quả thanh toán từ MoMo (IPN)
  - `GET /api/payment/momo/return` → Redirect URL sau khi user thanh toán xong
  - `POST /api/payment/momo/check-status` → Kiểm tra trạng thái
- [ ] Tạo bảng `payment_transactions` (migration):
  ```
  id, order_id, payment_method, transaction_id, amount, status (pending/success/failed), 
  momo_request_id, momo_trans_id, response_data (JSON), created_at, updated_at
  ```
- [ ] Khi nhận callback thành công → Cập nhật `orders.payment_status = 'paid'`

#### Frontend (Next.js)
- [ ] Trang Checkout: Thêm phương thức thanh toán "Ví MoMo" với logo MoMo chính thức
- [ ] Khi chọn MoMo → Gọi API tạo giao dịch → Redirect đến trang thanh toán MoMo
- [ ] Trang Return: Hiển thị kết quả thanh toán (thành công/thất bại) với animation
- [ ] Hiển thị QR Code MoMo cho phương thức quét mã (tùy chọn)
- [ ] Xử lý các trường hợp: Thanh toán thành công, thất bại, hủy, timeout

#### Test Cases
- [ ] Viết test cases cho luồng thanh toán MoMo
- [ ] Kiểm thử: Tạo giao dịch, callback IPN, verify signature, trạng thái giao dịch

---

## 4️⃣ Live Chat + Quản Trị Admin Nâng Cao

> **Phụ trách:** Lê Vũ Thiên ([@thienlotus](https://github.com/thienlotus))  
> **Nhánh:** `admin-service` / `main`  
> **Vai trò:** Team Leader & System Architect

### Phần A: Live Chat Hỗ Trợ Khách Hàng

#### Backend (Laravel)
- [ ] Tạo bảng `chat_conversations` (migration):
  ```
  id (UUID), customer_id, admin_id (nullable), subject, status (open/assigned/resolved/closed), 
  created_at, updated_at
  ```
- [ ] Tạo bảng `chat_messages` (migration):
  ```
  id (UUID), conversation_id, sender_id, sender_role (customer/admin), message, 
  message_type (text/image/system), is_read, created_at
  ```
- [ ] Tạo Module `App\Modules\Chat`:
  - `ChatController`: CRUD conversations, send/receive messages
  - `ChatService`: Business logic (tạo cuộc hội thoại, gán admin, đóng/mở)
  - `ChatRepository`: Database queries
- [ ] API Endpoints:
  ```
  POST   /api/chat/conversations          → Tạo cuộc hội thoại mới
  GET    /api/chat/conversations           → Danh sách cuộc hội thoại (phân trang)
  GET    /api/chat/conversations/{id}      → Chi tiết + lịch sử tin nhắn
  POST   /api/chat/conversations/{id}/messages → Gửi tin nhắn
  PUT    /api/chat/conversations/{id}/assign   → Admin nhận xử lý
  PUT    /api/chat/conversations/{id}/close    → Đóng cuộc hội thoại
  GET    /api/chat/unread-count            → Số tin nhắn chưa đọc
  ```
- [ ] Polling mechanism: Frontend gọi API mỗi 5 giây để check tin nhắn mới (hoặc dùng Server-Sent Events nếu kịp)

#### Frontend — Phía Khách Hàng
- [ ] Widget chat nổi (floating button) ở góc phải dưới màn hình trên mọi trang
- [ ] Click mở chatbox: Hiển thị lịch sử tin nhắn, ô nhập tin nhắn, nút gửi
- [ ] Hiển thị trạng thái: "Đang chờ hỗ trợ..." / "Nhân viên Nguyễn A đang hỗ trợ bạn"
- [ ] Badge đỏ hiển thị số tin nhắn chưa đọc
- [ ] Hỗ trợ gửi ảnh (upload base64 hoặc URL)

#### Frontend — Phía Admin (`/admin/chat`)
- [ ] Trang quản lý toàn bộ cuộc hội thoại
- [ ] Sidebar: Danh sách cuộc hội thoại (mở/đã gán/đã đóng)
- [ ] Main area: Khung chat với khách hàng đang chọn
- [ ] Nút "Nhận xử lý" để admin tự gán vào cuộc hội thoại
- [ ] Nút "Đóng cuộc hội thoại" khi đã giải quyết xong
- [ ] Hiển thị thông tin khách hàng (tên, email, đơn hàng gần nhất)

### Phần B: Quản Trị Đơn Hàng Admin Nâng Cao

#### Backend (Laravel)
- [ ] Cập nhật `OrderController` / `OrderService`:
  - API lọc đơn hàng theo trạng thái: `GET /api/admin/orders?status=pending|processing|shipping|delivered|cancelled`
  - API chuyển trạng thái: `PUT /api/admin/orders/{id}/status` với body `{ status: "..." }`
  - **Logic nghiệp vụ trạng thái:**
    - `pending` (Chờ xử lý) → Cho phép: Xác nhận (`processing`) hoặc Hủy (`cancelled`)
    - `processing` (Đang xử lý) → Cho phép: Chuyển giao hàng (`shipping`) hoặc Hủy (`cancelled`)
    - `shipping` (Đang giao) → **KHÔNG cho phép Hủy** ❌ → Chỉ cho phép: Đã giao (`delivered`)
    - `delivered` (Đã giao) → Trạng thái cuối cùng (final state)
    - `cancelled` (Đã hủy) → Trạng thái cuối cùng (final state)
  - Trả về lỗi `400 Bad Request` nếu vi phạm logic trạng thái (ví dụ: hủy đơn đang giao)

#### Frontend — Trang Admin (`/admin/orders`)
- [ ] **Bộ lọc trạng thái (Filter Bar):**
  - Các tab/button: Tất cả | Chờ xử lý | Đang xử lý | Đang giao | Đã giao | Đã hủy
  - Hiển thị số lượng đơn trên mỗi tab (badge count)
  - Lọc theo khoảng thời gian (date range picker)
  - Tìm kiếm theo mã đơn, tên khách hàng, số điện thoại
- [ ] **Bảng danh sách đơn hàng:**
  - Các cột: Mã đơn | Khách hàng | Tổng tiền | Trạng thái (badge màu) | Ngày đặt | Thao tác
  - Trạng thái badge màu: Vàng (chờ) | Xanh dương (đang xử lý) | Cam (đang giao) | Xanh lá (đã giao) | Đỏ (đã hủy)
- [ ] **Thao tác trên từng đơn hàng:**
  - Nút "Xác nhận" (khi đơn ở trạng thái Chờ xử lý)
  - Nút "Giao hàng" (khi đơn ở trạng thái Đang xử lý)
  - Nút "Hoàn thành" (khi đơn ở trạng thái Đang giao)
  - Nút "Hủy đơn" (chỉ hiện khi đơn ở trạng thái Chờ xử lý hoặc Đang xử lý, **ẩn khi Đang giao**)
  - Modal xác nhận khi hủy đơn: "Bạn có chắc chắn muốn hủy đơn hàng #GF-xxx?"
- [ ] **Dashboard chỉ số tổng quan (`/admin`):**
  - Card: Tổng đơn hàng | Đơn chờ xử lý | Đơn đang giao | Doanh thu hôm nay
  - Biểu đồ: Doanh thu 7 ngày gần nhất (bar chart)
  - Danh sách: Top 5 sản phẩm bán chạy
  - Phân bổ trạng thái đơn hàng (pie/donut chart)

---

## 📊 Bảng Tổng Hợp So Sánh Khối Lượng

| Thành viên | Tính năng | Backend | Frontend | Test | Độ phức tạp |
|---|---|:---:|:---:|:---:|:---:|
| **Lê Thiều Hưng** | Email OTP | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | Trung bình |
| **Nguyễn Đại Dương** | GHN API | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Cao |
| **Lương Văn Quý** | MoMo API | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Cao |
| **Lê Vũ Thiên** | Live Chat + Admin | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Rất cao |

> [!IMPORTANT]
> **Team Leader (Thiên)** nhận phần công việc có khối lượng lớn nhất (Live Chat toàn bộ + Admin nâng cao), phù hợp với vai trò dẫn dắt và đảm bảo sự công bằng trong nhóm.

---

## 🔄 Quy Trình Làm Việc

1. Mỗi thành viên **chỉ làm việc trên nhánh riêng** của mình
2. Khi hoàn thành, tạo **Pull Request** vào `main` và tag `@thienlotus` để review
3. Team Leader sẽ review code, resolve conflict (nếu có), và merge vào `main`
4. Deadline dự kiến: **05/10/2026** (1 tuần)

---

## 📞 Liên Hệ & Hỗ Trợ

- **Team Leader:** Lê Vũ Thiên — [thienchip1310@gmail.com](mailto:thienchip1310@gmail.com) | [Facebook](https://www.facebook.com/vuthienisme)
- **Repository:** [GreenFood-Green-Produce-Market](https://github.com/thienlotus/GreenFood-Green-Produce-Market)
- **Quản lý Sprint:** Jira Software Cloud — Dự án `GREEN`
