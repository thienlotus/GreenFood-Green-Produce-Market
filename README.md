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

| STT | Thành viên | Vai trò | Phân hệ / Service | Nhánh Git | Nhiệm vụ đã làm & Công việc phụ trách chi tiết |
|:---:|---|---|---|---|---|
| 1 | **Lê Vũ Thiên**<br>([@thienlotus](https://github.com/thienlotus)) | **Team Leader & System Architect** *(Trách nhiệm nhiều nhất)* | **Admin & Core Management Service** | [`admin-service`](https://github.com/thienlotus/GreenFood-Green-Produce-Market/tree/admin-service)<br>[`main`](https://github.com/thienlotus/GreenFood-Green-Produce-Market/tree/main) | **Đã làm:**<br>- Trang Quản trị Admin: Quản lý kho nông sản & biến thể giá, Quản lý đơn hàng (danh sách, chi tiết, cập nhật trạng thái đơn), Thống kê doanh thu thời gian thực.<br>**Công việc bổ sung (Leader):**<br>- Thiết kế kiến trúc tổng thể Modular Monolith / Microservices (Controller-Service-Repository).<br>- Thiết lập API Gateway, hệ thống Routing tập trung cho 65 endpoints.<br>- Cấu hình quy trình CI/CD tự động trên GitHub Actions (`.github/workflows/ci.yml`) đảm bảo check status `✓ 2/2`.<br>- Phân quyền quản trị viên Admin RBAC, xử lý Database Transactions đảm bảo an toàn giao dịch.<br>- Điều phối Sprint Jira, quản lý mã nguồn, review và duyệt các Pull Request vào `main`. |
| 2 | **Thiều Hưng Lê**<br>([@0912lethieuhung-hub](https://github.com/0912lethieuhung-hub)) | **Developer & QA/QC Lead** | **Auth & User Service** | [`auth-service`](https://github.com/thienlotus/GreenFood-Green-Produce-Market/tree/auth-service) | **Đã làm:**<br>- Chức năng Đăng ký, Đăng nhập, Quản lý hồ sơ tài khoản (Khách lẻ & Khách sỉ).<br>**Công việc bổ sung:**<br>- Xây dựng bảo mật xác thực Session/Token, mã hóa mật khẩu an toàn (`Hash::make`), kiểm soát lỗi đăng nhập.<br>- Phân quyền người dùng (Customer, B2B, Farmer, Admin).<br>- Chủ trì mảng QA/QC: Soạn thảo bộ test cases kiểm thử Đăng ký (`Test_Cases_GreenFood_Register.xlsx`).<br>- Quản lý Bug Lifecycle trên Jira Software Cloud (`GREEN-2`, `GREEN-3`), theo dõi và nghiệm thu đóng/mở lỗi. |
| 3 | **Lương Văn Quý**<br>([@QUY-LUONG-VAN](https://github.com/QUY-LUONG-VAN)) | **Backend & Frontend Developer** | **Product & Catalog Service** | [`product-service`](https://github.com/thienlotus/GreenFood-Green-Produce-Market/tree/product-service) | **Đã làm:**<br>- Giao diện Trang chủ, Phân hệ Danh mục (Đặc sản vùng miền, Trái cây, Rau củ, Nấm...), Giỏ hàng và Mã giảm giá.<br>**Công việc bổ sung:**<br>- Xây dựng Backend Module Product & Category: Logic tìm kiếm, lọc sản phẩm đa tiêu chí (danh mục, mức giá, bán chạy, vùng miền).<br>- Xử lý nghiệp vụ Giỏ hàng: Kiểm tra tồn kho biến thể, đồng bộ giỏ hàng LocalStorage với Backend API.<br>- Xây dựng hệ thống Voucher & Khuyến mãi: Kiểm tra điều kiện áp dụng mã (`GREEN10`, `FREESHIP`), tính toán mức chiết khấu tối đa.<br>- Xây dựng bộ test cases kiểm thử Quản lý sản phẩm (`Test_Case_Quan_Ly_San_Pham.xlsx`). |
| 4 | **Nguyễn Đại Dương**<br>([@OceanDDz](https://github.com/OceanDDz)) | **Backend & Frontend Developer** | **Delivery & Logistics Service** | [`delivery-service`](https://github.com/thienlotus/GreenFood-Green-Produce-Market/tree/delivery-service) | **Đã làm:**<br>- Tích hợp bản đồ số GIS vùng trồng, Tính cước phí ship theo khu vực, Tích hợp thanh toán, Theo dõi hành trình giao hàng.<br>**Công việc bổ sung:**<br>- Xây dựng Module Logistics & GIS: Tự động định tuyến cước phí theo địa chỉ người nhận (`shipping_zones`), áp dụng quy tắc miễn phí vận chuyển (`free_ship_minimum`).<br>- Xây dựng Module Thanh toán đa phương thức: COD, Chuyển khoản nhanh VietQR 24/7, Ví điện tử MoMo, Cổng VNPAY; xác thực giao dịch thanh toán.<br>- Phát triển giao diện Live Tracking 4 bước với tọa độ GPS shipper mô phỏng trực quan.<br>- Xây dựng bộ test cases kiểm thử Nông hộ và Giao hàng (`Test_Cases_GreenFood_Duong.xlsx`). |

---

## Cấu trúc nhánh Git chuẩn (1 Nhánh chính + 4 Nhánh theo thành viên)

```
* main                     -> origin/main (Nhánh chính ổn định - Team Leader)
├── admin-service          -> origin/admin-service (Lê Vũ Thiên - Team Leader)
├── auth-service           -> origin/auth-service (Thiều Hưng Lê)
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

## Danh mục API Endpoints chính

### 1. Auth & User Service (Phụ trách: Thiều Hưng Lê)
- `POST /api/v1/auth/register` — Đăng ký tài khoản khách hàng mới.
- `POST /api/v1/auth/login` — Đăng nhập hệ thống, phát hành token.
- `GET /api/v1/users` — Lấy danh sách người dùng (Admin).
- `GET /api/v1/users/{id}` — Xem thông tin chi tiết người dùng.
- `PUT /api/v1/users/{id}` — Cập nhật hồ sơ tài khoản.

### 2. Product & Catalog Service (Phụ trách: Lương Văn Quý)
- `GET /api/v1/categories` — Danh sách danh mục rau củ, quả ngọt, nấm tươi.
- `GET /api/v1/categories/{slug}` — Xem chi tiết danh mục theo slug.
- `GET /api/v1/products` — Danh sách sản phẩm (hỗ trợ search, filter vùng, sort giá/bán chạy).
- `GET /api/v1/products/{slug}` — Xem chi tiết sản phẩm.
- `POST /api/v1/cart/calculate` — Tính toán giỏ hàng và áp dụng mã voucher chiết khấu.
- `POST /api/v1/promotions/check-voucher` — Kiểm tra tính hợp lệ và chiết khấu mã khuyến mãi.

### 3. Delivery & Logistics Service (Phụ trách: Nguyễn Đại Dương)
- `GET /api/v1/farmers` — Danh sách nông hộ đối tác và tọa độ bản đồ GIS.
- `GET /api/v1/farmers/{id}` — Chi tiết thông tin nông hộ, chứng nhận VietGAP.
- `GET /api/v1/shipping-zones` — Danh sách biểu phí giao hàng theo khu vực.
- `GET /api/v1/orders/tracking/{trackingNumber}` — Tra cứu tiến độ đơn hàng với shipper GPS thời gian thực.
- `GET /api/v1/payment/methods` — Danh sách phương thức thanh toán (COD, VietQR, MoMo, VNPay).
- `POST /api/v1/payment/process` — Xử lý và xác nhận giao dịch thanh toán đơn hàng.

### 4. Admin & Core Management Service (Phụ trách: Lê Vũ Thiên - Leader)
- `GET /api/v1/admin/dashboard` — Số liệu thống kê doanh thu, đơn hàng, người dùng tổng quan.
- `GET /api/v1/admin/orders` — Quản lý danh sách đơn hàng toàn hệ thống.
- `GET /api/v1/admin/orders/{id}` — Xem chi tiết đơn hàng quản trị.
- `PUT /api/v1/admin/orders/{id}/status` — Cập nhật trạng thái đơn (`PENDING` -> `CONFIRMED` -> `SHIPPING` -> `DELIVERED`).
- `POST /api/v1/products` — Thêm sản phẩm mới vào kho nông sản.
- `PUT /api/v1/products/{id}` — Cập nhật tồn kho và giá sản phẩm.
- `DELETE /api/v1/products/{id}` — Xóa sản phẩm khỏi hệ thống.

---

## Tài liệu dự án & Kiểm thử

- **Sơ đồ thiết kế UML (ERD, Class, Sequence, Activity, State):** [docs/diagrams/](docs/diagrams/)
- **Postman API Test Collection:** [GreenFood_Postman_Test_Collection.json](greenfood-laravel/GreenFood_Postman_Test_Collection.json)

---

## Đội ngũ phát triển

- **Lê Vũ Thiên** — Team Leader & System Architect ([@thienlotus](https://github.com/thienlotus))
- **Thiều Hưng Lê** — Developer & QA/QC Lead ([@0912lethieuhung-hub](https://github.com/0912lethieuhung-hub))
- **Lương Văn Quý** — Backend & Frontend Developer ([@QUY-LUONG-VAN](https://github.com/QUY-LUONG-VAN))
- **Nguyễn Đại Dương** — Backend & Frontend Developer ([@OceanDDz](https://github.com/OceanDDz))
