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

Dự án được xây dựng theo kiến trúc **Modular Monolith** chuẩn hóa theo hướng dẫn của giảng viên **Trương Mạnh Đạt**, tổ chức theo hướng chuyển dịch **Microservices**:
- **Backend Application:** Đóng gói thành các module chức năng độc lập (`app/Modules/`), sẵn sàng phân tách thành các microservice riêng biệt khi mở rộng quy mô.
- **Mô hình 3 lớp (3-Layer Pattern):** Mỗi service/module tuân thủ nghiêm ngặt:
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
 │  │      Auth Service     │  │    Product Service    │  │     Cart Service     │  │
 │  │ ───────────────────── │  │ ───────────────────── │  │ ──────────────────── │  │
 │  │ UserController        │  │ ProductController     │  │ CartController       │  │
 │  │ UserService           │  │ ProductService        │  │ CartService          │  │
 │  │ UserRepository        │  │ ProductRepository     │  │ CartRepository       │  │
 │  └───────────────────────┘  └───────────────────────┘  └──────────────────────┘  │
 │                                                                                  │
 │  ┌───────────────────────┐  ┌───────────────────────┐  ┌──────────────────────┐  │
 │  │     Order Service     │  │    Payment Service    │  │  Promotion Service   │  │
 │  │ ───────────────────── │  │ ───────────────────── │  │ ──────────────────── │  │
 │  │ OrderController       │  │ PaymentController     │  │ PromotionController  │  │
 │  │ OrderService          │  │ PaymentService        │  │ PromotionService     │  │
 │  │ OrderRepository       │  │ PaymentRepository     │  │ PromotionRepository  │  │
 │  └───────────────────────┘  └───────────────────────┘  └──────────────────────┘  │
 └─────────────────────────────────────────┬────────────────────────────────────────┘
                                           │
                                  [ Database Shared ]
                         (SQLite / MySQL Database per Service)
```

---

## Phân vùng Service & Phân công thành viên

Dự án chia nhánh Git theo từng Service/Module chuyên trách tương ứng với từng thành viên đảm nhiệm:

| STT | Service / Phân hệ | Git Branch | Endpoint Tiền tố | Bảng dữ liệu chính | Thành viên phụ trách | Vai trò |
|:---:|---|---|---|---|---|---|
| 1 | **Auth & User Service** | `auth-service` | `/api/v1/auth`, `/api/v1/users` | `users`, `sessions` | **Lê Vũ Thiên** ([@thienlotus](https://github.com/thienlotus)) | Team Leader & Architecture |
| 2 | **Product & Category Service** | `product-service` | `/api/v1/products`, `/api/v1/categories` | `products`, `product_variants`, `categories` | **Lương Văn Quý** ([@QUY-LUONG-VAN](https://github.com/QUY-LUONG-VAN)) | Backend Developer |
| 3 | **Order & Tracking Service** | `order-service` | `/api/v1/orders` | `orders`, `order_items` | **Thiều Hưng Lê** ([@0912lethieuhung-hub](https://github.com/0912lethieuhung-hub)) | Tester & QA / Dev |
| 4 | **Cart & Calculation Service** | `cart-service` | `/api/v1/cart` | In-memory session / Cart rules | **Nguyễn Đại Dương** ([@OceanDDz](https://github.com/OceanDDz)) | Fullstack Developer |
| 5 | **Payment Service** | `payment-service` | `/api/v1/payment` | `orders.payment_method`, `orders.status` | **Nguyễn Đại Dương** ([@OceanDDz](https://github.com/OceanDDz)) | Fullstack Developer |
| 6 | **Promotion & Shipping Service** | `promotion-service` | `/api/v1/promotions`, `/api/v1/shipping-zones` | `shipping_zones` | **Lê Vũ Thiên** ([@thienlotus](https://github.com/thienlotus)) | Team Leader & Architecture |
| 7 | **Farmer & GIS Map Service** | `farmer-service` | `/api/v1/farmers` | `farmers`, `regions` | **Lương Văn Quý** ([@QUY-LUONG-VAN](https://github.com/QUY-LUONG-VAN)) | Backend Developer |

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
| **CI/CD** | GitHub Actions (Build, Lint, Route & Config Validation) | `ci.yml` (`✓ 2/2`) |

---

## Cấu trúc thư mục dự án

```
GreenFood-Green-Produce-Market/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI pipeline (Status: 2/2)
├── greenfood/                        # Ứng dụng Frontend (Next.js 14)
│   ├── src/
│   │   ├── app/                      # App router: /products, /cart, /checkout, /tracking...
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
├── Bao_Cao_De_Tai_Website_TMDT_GreenFood.docx
├── Test_Cases_GreenFood_Duong.xlsx
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

## Danh mục API Endpoints chính

### 1. Auth & User Service
- `POST /api/v1/auth/register` — Đăng ký tài khoản khách hàng mới.
- `POST /api/v1/auth/login` — Đăng nhập hệ thống, phát hành token.
- `GET /api/v1/users` — Lấy danh sách người dùng (Admin).
- `GET /api/v1/users/{id}` — Xem thông tin chi tiết người dùng.
- `PUT /api/v1/users/{id}` — Cập nhật hồ sơ tài khoản.

### 2. Product & Category Service
- `GET /api/v1/categories` — Danh sách danh mục rau củ, quả ngọt, nấm tươi.
- `GET /api/v1/categories/{slug}` — Xem chi tiết danh mục theo slug.
- `GET /api/v1/products` — Danh sách sản phẩm (hỗ trợ search, filter vùng, sort giá/bán chạy).
- `GET /api/v1/products/{slug}` — Xem chi tiết sản phẩm.
- `POST /api/v1/products` — Thêm sản phẩm mới (Admin/Farmer).
- `PUT /api/v1/products/{id}` — Cập nhật thông tin/giá sản phẩm.
- `DELETE /api/v1/products/{id}` — Xóa sản phẩm.

### 3. Cart & Calculation Service
- `POST /api/v1/cart/calculate` — Tính toán giỏ hàng, cước phí ship theo vùng và ngưỡng freeship.

### 4. Order & Tracking Service
- `POST /api/v1/orders` — Tạo đơn hàng mới, sinh mã vận đơn `GF...`.
- `GET /api/v1/orders` — Danh sách đơn hàng toàn hệ thống.
- `GET /api/v1/orders/my-orders?phone={phone}` — Danh sách đơn của khách hàng theo số điện thoại.
- `GET /api/v1/orders/tracking/{trackingNumber}` — Tra cứu tiến độ đơn hàng thời gian thực.
- `PUT /api/v1/orders/{id}/status` — Cập nhật trạng thái đơn (`PENDING` -> `CONFIRMED` -> `SHIPPING` -> `DELIVERED`).

### 5. Payment Service
- `GET /api/v1/payment/methods` — Danh sách phương thức thanh toán hỗ trợ (COD, BANK_TRANSFER, MOMO, VNPAY).
- `POST /api/v1/payment/process` — Xử lý và xác nhận giao dịch thanh toán đơn hàng.

### 6. Promotion & Shipping Service
- `POST /api/v1/promotions/check-voucher` — Kiểm tra tính hợp lệ và giá trị chiết khấu của voucher.
- `GET /api/v1/shipping-zones` — Danh sách biểu phí giao hàng theo khu vực.
- `POST /api/v1/shipping-zones` — Thêm cấu hình khu vực giao hàng mới.

---

## Kiểm thử & Quản lý chất lượng

- **Postman API Test Collection:** [GreenFood_Postman_Test_Collection.json](greenfood-laravel/GreenFood_Postman_Test_Collection.json)
- **Tài liệu kiểm thử chi tiết:** [Test_Cases_GreenFood_Duong.xlsx](Test_Cases_GreenFood_Duong.xlsx) (100% PASS)
- **Báo cáo Jira & Bug Lifecycle:** [BAO_CAO_THUC_HANH_LOG_VA_QUAN_LY_BUG_JIRA.docx](greenfood-laravel/BAO_CAO_THUC_HANH_LOG_VA_QUAN_LY_BUG_JIRA.docx)

---

## Đội ngũ phát triển

- **Lê Vũ Thiên** — Team Leader, System Architect ([@thienlotus](https://github.com/thienlotus))
- **Thiều Hưng Lê** — Tester / QA Engineer ([@0912lethieuhung-hub](https://github.com/0912lethieuhung-hub))
- **Lương Văn Quý** — Backend Developer ([@QUY-LUONG-VAN](https://github.com/QUY-LUONG-VAN))
- **Nguyễn Đại Dương** — Fullstack Developer & QA Retest ([@OceanDDz](https://github.com/OceanDDz))
