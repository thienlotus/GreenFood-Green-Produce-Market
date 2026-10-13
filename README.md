# GreenFood - Sàn Thương Mại Điện Tử Nông Sản Sạch

[![CI Status](https://github.com/thienlotus/GreenFood-Green-Produce-Market/actions/workflows/ci.yml/badge.svg)](https://github.com/thienlotus/GreenFood-Green-Produce-Market/actions)
[![Architecture](https://img.shields.io/badge/Architecture-Modular%20Monolith%20%2F%20Microservices-blue.svg)](#kiến-trúc-hệ-thống)
[![Backend](https://img.shields.io/badge/Backend-Laravel%2011%20%7C%20PHP%208.3-red.svg)](https://laravel.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20%7C%20React%2018-black.svg)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20MySQL-orange.svg)](#cơ-sở-dữ-liệu)
[![Jira](https://img.shields.io/badge/Jira-GREEN--Project-blue.svg)](https://greenfood.atlassian.net)

Dự án phát triển nền tảng thương mại điện tử chuyên biệt cho nông sản sạch, thực phẩm chuẩn VietGAP/GlobalGAP nhằm kết nối trực tiếp các Hợp tác xã/Nông hộ với người tiêu dùng. Hệ thống tích hợp bản đồ số GIS vùng trồng, định tuyến phí vận chuyển đa vùng miền (Shipping Zones) và quy trình quản lý đơn hàng khép kín với Live Tracking thời gian thực.

---

## Kiến trúc hệ thống

Dự án được xây dựng theo kiến trúc **Modular Monolith** chuẩn hóa theo hướng dẫn của giảng viên **Trương Mạnh Đạt**, tổ chức sẵn sàng phân rã thành các **Microservices**:
- **Backend Application:** Đóng gói thành các module chức năng độc lập (`app/Modules/`), mỗi service sở hữu controller, logic nghiệp vụ và repository riêng.
- **Mô hình 3 lớp (3-Layer Pattern):**
  $$\text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Repository} \longrightarrow \text{Database}$$

```
                                 [ Client Applications ]
                       (Next.js Web / Mobile SPA / Admin Portal)
                                           │
                                   HTTP / RESTful API
                                           │
 ┌─────────────────────────────────────────▼────────────────────────────────────────┐
 │                      Backend Monolith / API Gateway                              │
 │                                                                                  │
 │  ┌───────────────────────┐  ┌───────────────────────┐  ┌──────────────────────┐  │
 │  │      Auth Service     │  │    Product Service    │  │   Delivery Service   │  │
 │  │ ───────────────────── │  │ ───────────────────── │  │ ──────────────────── │  │
 │  │ UserController        │  │ ProductController     │  │ ShippingZoneControl. │  │
 │  │ UserService           │  │ CategoryController    │  │ FarmerGISController  │  │
 │  │ UserRepository        │  │ CartPromotionControl. │  │ PaymentController    │  │
 │  └───────────────────────┘  └───────────────────────┘  └──────────────────────┘  │
 │                                                                                  │
 │  ┌────────────────────────────────────────────────────────────────────────────┐  │
 │  │                     Admin Service & System Gateway                         │  │
 │  │ ────────────────────────────────────────────────────────────────────────── │  │
 │  │ OrderManagementController  │ WarehouseController │ DashboardAnalyticsCont. │  │
 │  │ OrderService & Repository  │ CI/CD DevOps Engine │ System Security & Audit │  │
 │  └────────────────────────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────┬────────────────────────────────────────┘
                                           │
                                  [ Database Shared ]
                         (SQLite / MySQL Database per Service)
```

---

## Phân công công việc & Phân chia nhánh Git (1 Nhánh / 1 Thành viên)

Dự án bao gồm **4 thành viên** phụ trách **4 nhánh chức năng chuyên biệt**, đảm bảo công việc phân bổ đồng đều, hợp lý theo đúng chuyên môn, trong đó **Team Leader** đảm nhận khối lượng công việc nhiều nhất:

| STT | Thành viên | Vai trò | Phân hệ / Service | Nhánh Git | Nhiệm vụ đã hoàn thiện & Công việc phụ trách chi tiết |
|:---:|---|---|---|---|---|
| 1 | **Lê Vũ Thiên**<br>([@thienlotus](https://github.com/thienlotus)) | **Team Leader & System Architect** *(Trách nhiệm nhiều nhất)* | **Admin & Core Management Service** | [`admin-service`](https://github.com/thienlotus/GreenFood-Green-Produce-Market/tree/admin-service)<br>[`main`](https://github.com/thienlotus/GreenFood-Green-Produce-Market/tree/main) | **Đã hoàn thiện:**<br>- **Kiến trúc Multi-Vendor Marketplace:** Phân rã đơn hàng tổng thành các `sub-orders` độc lập theo từng nhà vườn/nông hộ, điều phối luồng doanh thu ví nông hộ, tự động khớp đơn.<br>- **Hệ thống Live Chat đa kênh Shopee-style:** Chat trực tiếp giữa Khách hàng ⟷ Nhà vườn nông hộ ⟷ Quản trị viên sàn; tích hợp trợ lý AI thông minh tự động tư vấn 24/7; đồng bộ chuẩn múi giờ `Asia/Ho_Chi_Minh`.<br>- **Cổng B2B Wholesale Portal & Quản trị:** Quản lý quy trình đặt hàng nông sản số lượng lớn, tra cứu báo giá trực tuyến, gửi email xác nhận và phản hồi khách hàng tự động.<br>- **Admin Portal & API Gateway:** Trang quản trị phân tích số liệu thời gian thực, quản lý kho nông sản & biến thể giá, kiểm soát trạng thái đơn hàng (`PENDING` ➔ `CONFIRMED` ➔ `SHIPPING` ➔ `DELIVERED`).<br>- **Hạ tầng CI/CD:** Cấu hình GitHub Actions tự động kiểm thử cú pháp, migration, PHPUnit test suite, ESLint & TypeScript build (`✓ 5/5`).|
| 2 | **Lê Thiều Hưng**<br>([@0912lethieuhung-hub](https://github.com/0912lethieuhung-hub)) | **Developer & QA/QC Lead** | **Auth & User Service** | [`auth-service`](https://github.com/thienlotus/GreenFood-Green-Produce-Market/tree/auth-service) | **Đã hoàn thiện:**<br>- **Xác thực Email OTP khi đăng ký:** Gửi mã xác minh 6 số qua Gmail SMTP, bộ đếm ngược 10 phút, giới hạn resend 3 lần/15 phút, tự động kích hoạt tài khoản ngay sau khi xác thực thành công.<br>- **Bộ công cụ Địa chỉ hành chính Việt Nam đa cấp:** Tuyển chọn chuẩn hóa 63 Tỉnh/Thành - Quận/Huyện - Phường/Xã có cascading dropdown tự động binding mã GHN.<br>- **Bảo mật Sổ địa chỉ & Phân quyền RBAC:** Cách ly dữ liệu địa chỉ nghiêm ngặt theo `userId` (Zero Data Leakage), tự động dọn dẹp bộ nhớ đệm khi đăng xuất, cơ chế phân quyền tài khoản (Customer, B2B Wholesaler, Vendor/Farmer, Admin).<br>- **Hệ thống Email tự động:** Tự động gửi email chào mừng thành viên mới kèm mã voucher ưu đãi độc quyền.<br>- **Bộ kiểm thử QA/QC:** Xây dựng Feature Tests Laravel (`EmailVerificationTest.php`) và bộ test cases đăng ký (`Test_Cases_GreenFood_Register.xlsx`) đạt 100% tỉ lệ pass.|
| 3 | **Lương Văn Quý**<br>([@QUY-LUONG-VAN](https://github.com/QUY-LUONG-VAN)) | **Backend & Frontend Developer** | **Product & Catalog Service** | [`product-service`](https://github.com/thienlotus/GreenFood-Green-Produce-Market/tree/product-service) | **Đã hoàn thiện:**<br>- **GreenReels & Video Reviews Shopee/TikTok:** Tính năng xem video đánh giá thực tế sản phẩm từ reviewer Việt Nam, modal nhà hát phóng to media, gửi bài đánh giá có chấm điểm sao, bình luận và tải lên ảnh/video.<br>- **Catalog & Phân hệ Danh mục sản phẩm:** Giao diện mua sắm rau củ quả, nấm tươi, đặc sản vùng miền với bộ lọc tìm kiếm đa tiêu chí (danh mục, khoảng giá, mùa vụ, độ tươi ngon).<br>- **Giỏ hàng & Khuyến mãi thông minh:** Kiểm tra tồn kho biến thể, đồng bộ giỏ hàng an toàn, áp dụng voucher chiết khấu tự động (`GREEN10`, `FREESHIP`).<br>- **Trung tâm Thông báo Shopee-style:** Dropdown thông báo đa phân loại (Cập nhật đơn hàng, Khuyến mãi hot, Tin tức hệ thống) với cơ chế đánh dấu đã đọc thời gian thực.<br>- **Postman Collection & QA:** Bộ kiểm thử API Product & Notification (`Postman_Collection_Luong_Van_Quy_Product_Service.json`).|
| 4 | **Nguyễn Đại Dương**<br>([@OceanDDz](https://github.com/OceanDDz)) | **Backend & Frontend Developer** | **Delivery & Logistics Service** | [`delivery-service`](https://github.com/thienlotus/GreenFood-Green-Produce-Market/tree/delivery-service) | **Đã hoàn thiện:**<br>- **Tích hợp Giao Hàng Nhanh (GHN API) 3 miền:** Đồng bộ 3 kho nông hộ đại diện (Bắc - Trung - Nam), tính toán phí giao hàng theo khoảng cách thực tế giữa từng kho nhà vườn và người nhận.<br>- **Hệ thống Thanh toán đa cổng:** Tích hợp cổng thanh toán tự động SePay VietQR quét mã chuyển khoản 24/7 (khớp giao dịch tức thì không cần can thiệp thủ công), Cổng thanh toán thẻ ATM nội địa Napas / OnePay, Cổng ví điện tử MoMo, Cổng VNPAY và phương thức COD.<br>- **Bản đồ số GIS & Live Tracking GPS:** Bản đồ trực quan các vùng trồng đạt chuẩn VietGAP/GlobalGAP, theo dõi hành trình giao nhận 4 bước với tọa độ GPS shipper mô phỏng thời gian thực.<br>- **Postman Collection & Environment:** Trọn bộ Postman Collection kiểm thử Delivery & Logistics kèm môi trường Local & Production (`Postman_Delivery_Logistics_NguyenVanDaiDuong.json`).|

---

## 📋 Tổng kết Tiến độ Phát triển (Sprint 1, Sprint 2 & Sprint 3)

| STT | Phân hệ / Tính năng chính | Thành viên phụ trách | Nhánh Git | Trạng thái |
|:---:|---|---|---|:---:|
| 1 | **Xác thực Email OTP khi Đăng ký & Bảo mật Sổ địa chỉ** | **Lê Thiều Hưng** | `auth-service` | 🟢 Hoàn thành 100% |
| 2 | **Tích hợp Giao Hàng Nhanh (GHN API) 3 miền & Kho nông hộ** | **Nguyễn Đại Dương** | `delivery-service` | 🟢 Hoàn thành 100% |
| 3 | **Cổng thanh toán tự động SePay VietQR, Thẻ ATM Napas, MoMo & VNPay** | **Nguyễn Đại Dương** / **Lương Văn Quý** | `delivery-service` / `product-service` | 🟢 Hoàn thành 100% |
| 4 | **GreenReels Video Review sản phẩm Shopee/TikTok & Thông báo** | **Lương Văn Quý** | `product-service` | 🟢 Hoàn thành 100% |
| 5 | **Sàn Multi-Vendor nông hộ, Tách Sub-orders & Ví nhà vườn** | **Lê Vũ Thiên** *(Leader)* | `admin-service` / `main` | 🟢 Hoàn thành 100% |
| 6 | **Live Chat 3 bên (Khách - Nông hộ - Admin) & Gemini AI Assistant** | **Lê Vũ Thiên** *(Leader)* | `admin-service` / `main` | 🟢 Hoàn thành 100% |
| 7 | **Hệ thống đặt sỉ B2B Wholesale Portal & Email tự động** | **Lê Vũ Thiên** *(Leader)* | `admin-service` / `main` | 🟢 Hoàn thành 100% |
| 8 | **Bản đồ số GIS vùng trồng & Live Tracking lộ trình shipper** | **Nguyễn Đại Dương** | `delivery-service` | 🟢 Hoàn thành 100% |

> 📄 **Tài liệu chi tiết phân công & kiến trúc:** Xem các tài liệu chuyên sâu trong thư mục [`docs/`](docs/)

---

## Cấu trúc nhánh Git chuẩn (1 Nhánh chính + 4 Nhánh theo thành viên)

```
* main                     -> origin/main (Nhánh chính ổn định - Team Leader)
├── admin-service          -> origin/admin-service (Lê Vũ Thiên - Team Leader)
├── auth-service           -> origin/auth-service (Lê Thiều Hưng)
├── product-service        -> origin/product-service (Lương Văn Quý)
└── delivery-service       -> origin/delivery-service (Nguyễn Đại Dương)
```

---

## Công nghệ sử dụng

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| **Backend Framework** | Laravel Framework (Modular Monolith) | 11.x / PHP 8.3 |
| **Frontend Framework** | Next.js (React Framework, SSR/SSG, Tailwind CSS) | 14.x / React 18 |
| **Cơ sở dữ liệu** | SQLite (Dev) / MySQL 8.0 (Production) | 3.x / 8.0 |
| **Kiến trúc tầng dữ liệu** | Eloquent ORM + Repository Pattern | Chuẩn PSR-4 |
| **Quản lý quy trình & Lỗi** | Jira Software Cloud (Agile Scrum, Bug Lifecycle) | Cloud (`GREEN`) |
| **Kiểm thử API** | Postman Test Collection + PowerShell Test Scripts | v2.1 |
| **CI/CD** | GitHub Actions (Syntax, Migration, PHPUnit, ESLint + TypeScript, Build) | `ci.yml` (`✓ 5/5`) |

---

## Cấu trúc thư mục dự án

```
GreenFood-Green-Produce-Market/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI pipeline (Status: 2/2)
├── greenfood/                        # Ứng dụng Frontend (Next.js 14)
│   ├── src/
│   │   ├── app/                      # App router: /products, /cart, /checkout, /tracking, /admin...
│   │   ├── components/               # UI components, header, footer, cart drawer...
│   │   ├── lib/api.ts                # Client API SDK giao tiếp Backend
│   │   └── store/                    # State management (Zustand/React Context)
│   ├── package.json
│   └── tailwind.config.ts
├── greenfood-laravel/                # Ứng dụng Backend (Laravel Modular Monolith)
│   ├── app/
│   │   ├── Modules/                  # Các module tách biệt theo chức năng
│   │   │   ├── User/                 # UserController, UserService, UserRepository
│   │   │   ├── Product/              # ProductController, ProductService, ProductRepository
│   │   │   ├── Cart/                 # CartController, CartService, CartRepository
│   │   │   ├── Order/                # OrderController, OrderService, OrderRepository
│   │   │   ├── Payment/              # PaymentController, PaymentService, PaymentRepository
│   │   │   ├── Promotion/            # PromotionController, ShippingZoneController...
│   │   │   ├── Farmer/               # FarmerController, FarmerService, FarmerRepository
│   │   │   └── Dashboard/            # DashboardController, DashboardService
│   │   ├── Models/                   # Eloquent Models
│   │   └── Http/Controllers/Api/     # Legacy Adapters (bảo đảm 100% tương thích ngược)
│   ├── routes/
│   │   └── api.php                   # Định tuyến 65 endpoints cho các module
│   ├── database/
│   │   └── migrations/               # Database migrations
│   └── composer.json
├── docs/                             # Sơ đồ thiết kế hệ thống UML
└── README.md
```

---

## Hướng dẫn cài đặt & Chạy dự án

### 1. Yêu cầu môi trường
- PHP >= 8.2 (đã cấu hình extensions: `pdo_sqlite`, `mbstring`, `openssl`)
- Composer >= 2.6
- Node.js >= 18.x & npm >= 9.x
- Git

### 2. Khởi động Backend (Laravel)
```bash
cd greenfood-laravel

# Cài đặt thư viện
composer install

# Cấu hình môi trường
cp .env.example .env
php artisan key:generate

# Chạy migration dữ liệu mẫu
php artisan migrate --seed

# Khởi chạy server API (Cổng 8000)
php artisan serve --port=8000
```
API Backend sẽ sẵn sàng tại: `http://127.0.0.1:8000/api`

### 3. Khởi động Frontend (Next.js)
```bash
cd greenfood

# Cài đặt dependencies
npm install --legacy-peer-deps

# Khởi chạy dev server
npm run dev
```
Truy cập giao diện người dùng tại: `http://localhost:3000`

---

## Danh mục API Endpoints đầy đủ (11 Modules)

### 1. Auth & User Service (Phụ trách: Lê Thiều Hưng)
- `POST /api/v1/auth/register` — Đăng ký tài khoản khách hàng mới.
- `POST /api/v1/auth/verify-email` — Xác thực mã OTP 6 số kích hoạt tài khoản.
- `POST /api/v1/auth/resend-otp` — Gửi lại mã OTP qua email (giới hạn 3 lần/15 phút).
- `POST /api/v1/auth/login` — Đăng nhập hệ thống, phát hành access token.
- `GET /api/v1/users` — Lấy danh sách người dùng phân trang (Admin).
- `GET /api/v1/users/{id}` — Xem thông tin chi tiết người dùng.
- `PUT /api/v1/users/{id}/profile` — Cập nhật hồ sơ tài khoản và địa chỉ nhận hàng.
- `POST /api/v1/users/{id}/change-password` — Đổi mật khẩu an toàn.
- `PUT /api/v1/users/{id}/role` — Cập nhật quyền hạn tài khoản (`customer`, `farmer`, `b2b`, `admin`).

### 2. Product & Catalog Service (Phụ trách: Lương Văn Quý)
- `GET /api/v1/categories` — Danh sách danh mục rau củ, quả ngọt, nấm tươi.
- `GET /api/v1/categories/{slug}` — Xem chi tiết danh mục theo slug.
- `GET /api/v1/products` — Danh sách sản phẩm (hỗ trợ search, filter vùng miền, lọc giá/bán chạy).
- `GET /api/v1/products/{slug}` — Xem chi tiết sản phẩm và các biến thể đóng gói.
- `POST /api/v1/cart/calculate` — Tính toán giỏ hàng, tồn kho và áp dụng mã voucher chiết khấu.
- `POST /api/v1/promotions/check-voucher` — Kiểm tra tính hợp lệ và chiết khấu mã khuyến mãi (`GREEN10`, `FREESHIP`).

### 3. Product Reviews & GreenReels (Phụ trách: Lương Văn Quý)
- `GET /api/v1/products/{id}/reviews` — Danh sách đánh giá của sản phẩm kèm hình ảnh/video.
- `POST /api/v1/products/{id}/reviews` — Gửi bài đánh giá mới (số sao, nhận xét, đính kèm media).
- `POST /api/v1/reviews/{id}/like` — Thả like / hủy like bài đánh giá của người mua khác.
- `POST /api/v1/reviews/upload` — Upload hình ảnh hoặc video ngắn review sản phẩm.

### 4. Customer Notifications (Phụ trách: Lương Văn Quý)
- `GET /api/v1/notifications` — Danh sách thông báo khách hàng (Đơn hàng, Khuyến mãi, Hệ thống).
- `POST /api/v1/notifications` — Tạo thông báo mới cho người dùng.
- `PUT /api/v1/notifications/mark-all-read` — Đánh dấu tất cả thông báo là đã đọc.
- `PUT /api/v1/notifications/{id}/read` — Đánh dấu 1 thông báo cụ thể là đã đọc.

### 5. Delivery & Logistics Service (Phụ trách: Nguyễn Đại Dương)
- `GET /api/v1/shipping-zones` — Danh sách biểu phí giao hàng theo khu vực địa lý.
- `POST /api/v1/shipping-zones` — Thêm mới khu vực vận chuyển (Admin).
- `PUT /api/v1/shipping-zones/{id}` — Cập nhật bảng phí và thời gian giao hàng.
- `GET /api/v1/orders/tracking/{trackingNumber}` — Tra cứu tiến độ đơn hàng và tọa độ GPS shipper thời gian thực.
- `GET /api/v1/ghn/provinces` — Danh sách 63 Tỉnh/Thành phố chuẩn Giao Hàng Nhanh.
- `GET /api/v1/ghn/districts/{provinceId}` — Danh sách Quận/Huyện theo Tỉnh/Thành GHN.
- `GET /api/v1/ghn/wards/{districtId}` — Danh sách Phường/Xã theo Quận/Huyện GHN.
- `POST /api/v1/ghn/calculate-fee` — Tính cước phí ship real-time theo từng kho nông hộ GHN.

### 6. Payment Gateways đa kênh (Phụ trách: Nguyễn Đại Dương & Lương Văn Quý)
- `GET /api/v1/payment/methods` — Danh sách phương thức thanh toán khả dụng.
- `POST /api/v1/payment/process` — Xử lý giao dịch COD và khởi tạo thanh toán.
- `POST /api/v1/payment/sepay/create` — Tạo mã VietQR SePay thanh toán tự động khớp lệnh 24/7.
- `POST /api/v1/payment/sepay/webhook` — Webhook nhận thông báo ngân hàng và cập nhật đơn hàng tức thì.
- `POST /api/v1/payment/sepay/check-status` — Polling kiểm tra trạng thái thanh toán VietQR.
- `POST /api/v1/payment/card/process` — Cổng thanh toán thẻ ATM nội địa Napas / OnePay sandbox.
- `POST /api/v1/payment/momo/create` — Khởi tạo giao dịch cổng thanh toán Ví MoMo.
- `POST /api/v1/payment/momo/callback` — Webhook IPN xử lý kết quả thanh toán MoMo.

### 7. Multi-Vendor Farmer & GIS Service (Phụ trách: Lê Vũ Thiên - Leader)
- `GET /api/v1/farmers` — Danh sách nông hộ đối tác và tọa độ bản đồ số GIS.
- `POST /api/v1/farmers/register` — Form đăng ký đối tác nông hộ VietGAP/GlobalGAP mới.
- `GET /api/v1/farmers/{id}` — Chi tiết thông tin nhà vườn, kho hàng, sản phẩm và chứng nhận.
- `PUT /api/v1/farmers/{id}` — Cập nhật hồ sơ nhà vườn và tọa độ bản đồ GIS.
- `GET /api/v1/farmers/{id}/orders` — Danh sách các đơn con (`sub-orders`) riêng của nhà vườn.
- `PUT /api/v1/farmers/{id}/orders/{orderId}/status` — Cập nhật tiến độ đóng gói đơn hàng nhà vườn.
- `GET /api/v1/farmers/{id}/wallet` — Số dư ví doanh thu nông hộ và lịch sử biến động.
- `PUT /api/v1/farmers/{id}/bank` — Cập nhật số tài khoản ngân hàng nhận tiền rút.
- `GET /api/v1/admin/farmers` — Quản trị danh sách nông hộ và duyệt đơn đăng ký đối tác.
- `PUT /api/v1/admin/farmers/{id}/status` — Phê duyệt (`APPROVED`) hoặc từ chối nông hộ.

### 8. Live Chat & AI Assistant (Phụ trách: Lê Vũ Thiên - Leader)
- `GET /api/v1/chat/conversations` — Danh sách các cuộc trò chuyện của người dùng/nông hộ/admin.
- `POST /api/v1/chat/customer/conversations/farmer` — Khách hàng mở chat trực tiếp với một gian hàng nông hộ.
- `POST /api/v1/chat/farmer/conversations/admin` — Nông hộ chat trực tiếp với ban quản trị sàn.
- `GET /api/v1/chat/conversations/{id}` — Chi tiết hội thoại và tin nhắn.
- `GET /api/v1/chat/conversations/{id}/customer` — Tin nhắn hội thoại theo phía khách hàng.
- `POST /api/v1/chat/conversations/{id}/messages` — Gửi tin nhắn mới (kích hoạt Gemini AI Auto-reply 24/7).
- `GET /api/v1/chat/unread-count` — Số lượng tin nhắn chưa đọc.

### 9. B2B Wholesale Portal (Phụ trách: Lê Vũ Thiên - Leader)
- `GET /api/v1/b2b/inquiries` — Danh sách yêu cầu báo giá sỉ B2B toàn hệ thống.
- `POST /api/v1/b2b/inquiries` — Gửi yêu cầu mua sỉ số lượng lớn (gửi email xác nhận tự động).
- `GET /api/v1/b2b/inquiries/track` — Tra cứu tiến độ báo giá trực tuyến bằng mã Inquiry Code.
- `GET /api/v1/b2b/inquiries/{id}` — Xem chi tiết yêu cầu báo giá sỉ.
- `PUT /api/v1/b2b/inquiries/{id}/status` — Quản trị viên cập nhật trạng thái báo giá (`PENDING`, `QUOTED`, `COMPLETED`).
- `POST /api/v1/b2b/inquiries/{id}/respond` — Admin phản hồi bảng báo giá chi tiết và gửi email tự động tới khách sỉ.

### 10. Order & Sub-Orders Service (Phụ trách: Lê Vũ Thiên - Leader)
- `POST /api/v1/orders` — Tạo đơn hàng mới (tự động phân tách sub-orders theo nhà vườn).
- `GET /api/v1/orders/my-orders` — Danh sách lịch sử đơn hàng của tài khoản đang đăng nhập.
- `GET /api/v1/orders/{id}` — Chi tiết đơn hàng tổng và các đơn con của từng nông hộ.
- `POST /api/v1/orders/{id}/push-ghn` — Đẩy đơn hàng sang hệ thống Giao Hàng Nhanh tạo vận đơn.

### 11. Admin & Core Management Service (Phụ trách: Lê Vũ Thiên - Leader)
- `GET /api/v1/admin/dashboard` — Số liệu thống kê doanh thu, tỷ lệ hoàn đơn, biểu đồ tăng trưởng thời gian thực.
- `GET /api/v1/admin/orders` — Quản lý danh sách đơn hàng toàn sàn.
- `PUT /api/v1/admin/orders/{id}/status` — Cập nhật trạng thái đơn hàng.
- `POST /api/v1/products` — Thêm sản phẩm mới vào kho sàn.
- `PUT /api/v1/products/{id}` — Cập nhật tồn kho, giá và thông tin sản phẩm.
- `DELETE /api/v1/products/{id}` — Xóa sản phẩm khỏi hệ thống.

---

## Tài liệu dự án & Bộ công cụ Kiểm thử API (Postman Collections)

- **Sơ đồ thiết kế UML (ERD, Class, Sequence, Activity, State):** [`docs/diagrams/`](docs/diagrams/)
- **Postman API Test Collection tổng thể:** [`greenfood-laravel/GreenFood_Postman_Test_Collection.json`](greenfood-laravel/GreenFood_Postman_Test_Collection.json)
- **Postman Collection - Delivery & Logistics Service (Nguyễn Đại Dương):** [`greenfood-laravel/Postman_Delivery_Logistics_NguyenVanDaiDuong.json`](greenfood-laravel/Postman_Delivery_Logistics_NguyenVanDaiDuong.json)
- **Postman Environment - Local & Production (Nguyễn Đại Dương):** [`greenfood-laravel/Postman_Environment_GreenFood.json`](greenfood-laravel/Postman_Environment_GreenFood.json)
- **Postman Collection - Product & Catalog Service (Lương Văn Quý):** [`greenfood-laravel/Postman_Collection_Luong_Van_Quy_Product_Service.json`](greenfood-laravel/Postman_Collection_Luong_Van_Quy_Product_Service.json)
- **Kết quả kiểm thử Product Service (Lương Văn Quý):** [`greenfood-laravel/test_results_luong_van_quy.json`](greenfood-laravel/test_results_luong_van_quy.json)

---

## Đội ngũ phát triển

- **Lê Vũ Thiên** — Team Leader & System Architect ([@thienlotus](https://github.com/thienlotus))
- **Lê Thiều Hưng** — Developer & QA/QC Lead ([@0912lethieuhung-hub](https://github.com/0912lethieuhung-hub))
- **Lương Văn Quý** — Backend & Frontend Developer ([@QUY-LUONG-VAN](https://github.com/QUY-LUONG-VAN))
- **Nguyễn Đại Dương** — Backend & Frontend Developer ([@OceanDDz](https://github.com/OceanDDz))
