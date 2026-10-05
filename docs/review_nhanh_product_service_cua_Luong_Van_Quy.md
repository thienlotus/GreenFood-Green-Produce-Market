# 📋 BÁO CÁO TOÀN DIỆN REVIEW MÃ NGUỒN NHÁNH PRODUCT-SERVICE
**Dự án:** GreenFood - Sàn Thương Mại Điện Tử Nông Sản Sạch  
**Thành viên phụ trách:** Lương Văn Quý ([@QUY-LUONG-VAN](https://github.com/QUY-LUONG-VAN))  
**Phân hệ:** Product, Category, Cart & Promotion Service  
**Nhánh Git:** `product-service`  
**Người đánh giá:** Senior Full-Stack Architect / Lê Thiều Hưng (QA/QC Lead)  
**Thời gian đánh giá:** 02/10/2026  

---

## 🎯 TỔNG QUAN ĐÁNH GIÁ (EXECUTIVE SUMMARY)

| Tiêu chí | Đánh giá | Điểm số | Ghi chú |
|---|:---:|:---:|---|
| **Tuân thủ kiến trúc** | Tốt | 8.5/10 | Đã tách đúng chuẩn 3 lớp: Controller -> Service -> Repository. |
| **Bảo mật (Security)** | Cần khắc phục gấp | 5.5/10 | **Nghiêm trọng:** Lỗ hổng Client Price Tampering trong giỏ hàng. |
| **Toàn vẹn dữ liệu** | Khá | 7.0/10 | Thiếu `DB::transaction()` khi tạo sản phẩm và biến thể. |
| **Hiệu năng & Truy vấn** | Khá | 8.0/10 | Đã có Eager loading `with()`, cần tối ưu Join khi sắp xếp giá. |
| **Sẵn sàng Sprint 2** | Sẵn sàng | 7.5/10 | Cấu trúc giỏ hàng đã định hình, cần hook MoMo Service vào checkout. |

---

## 🔍 CHI TIẾT ĐÁNH GIÁ TỪNG MODULE

### 1. Phân hệ Sản phẩm & Danh mục (`app/Modules/Product/`)

#### ✅ Ưu điểm:
1. **Tuân thủ mô hình 3 lớp:**
   - [`ProductController.php`](file:///d:/GreenFood-Green-Produce-Market/greenfood-laravel/app/Modules/Product/Controllers/ProductController.php): Thin controller rất gọn nhẹ (dưới 80 dòng), chỉ nhận request và trả về JSON.
   - [`ProductService.php`](file:///d:/GreenFood-Green-Produce-Market/greenfood-laravel/app/Modules/Product/Services/ProductService.php): Xử lý logic sinh slug (`Str::slug`), kiểm tra gán farmer mặc định, chuẩn hóa mảng dữ liệu trả về.
   - [`ProductRepository.php`](file:///d:/GreenFood-Green-Produce-Market/greenfood-laravel/app/Modules/Product/Repositories/ProductRepository.php): Phụ trách toàn bộ câu lệnh Eloquent query.
2. **Phòng chống N+1 Query:**
   - Trong `ProductRepository::getFiltered()`, Quý đã chủ động eager load:
     ```php
     Product::with(['category', 'farmer.region', 'variants']);
     ```
     Điều này giúp khi client duyệt danh sách 50 sản phẩm, chỉ tốn 3-4 query thay vì 150 query.

#### ⚠️ Nhược điểm & Rủi ro:
1. **Thiếu Database Transaction khi tạo sản phẩm (`ProductService::createProduct`):**
   - Hiện tại hàm tạo `Product` trước, sau đó tạo `ProductVariant`:
     ```php
     $product = $this->productRepository->create([...]);
     $variant = $this->productRepository->createVariant([...]);
     ```
   - **Rủi ro:** Nếu bước tạo biến thể (variant) bị lỗi hoặc database timeout, một sản phẩm "rác" không có giá và không có biến thể vẫn tồn tại trong bảng `products`.
   - **Giải pháp:** Bọc toàn bộ trong `DB::transaction()`.

2. **Xung đột câu lệnh JOIN khi Sắp xếp giá (`ProductRepository::getFiltered`):**
   - Khi lọc theo giá `price-asc` hoặc `price-desc`, đang dùng `join('product_variants', ...)`:
     ```php
     $query->join('product_variants', 'products.id', '=', 'product_variants.product_id')
           ->select('products.*')
           ->orderBy('product_variants.price', 'asc');
     ```
   - **Rủi ro:** Nếu 1 sản phẩm có nhiều hơn 1 biến thể (ví dụ: hộp 500g và túi 1kg), câu lệnh `join` sẽ làm nhân bản sản phẩm lên 2 lần trên trang danh sách sản phẩm.
   - **Giải pháp:** Sử dụng subquery hoặc `groupBy('products.id')`.

---

### 2. Phân hệ Giỏ hàng (`app/Modules/Cart/`)

#### 🚨 CẢNH BÁO NGUY CƠ BẢO MẬT CAO NHẤT (Client Price Tampering):
* Trong file [`app/Modules/Cart/Services/CartService.php`](file:///d:/GreenFood-Green-Produce-Market/greenfood-laravel/app/Modules/Cart/Services/CartService.php), dòng 20:
  ```php
  foreach ($items as $item) {
      $qty = (int)($item['quantity'] ?? 1);
      $price = (float)($item['price'] ?? 0); // ❌ LỖI NGHIÊM TRỌNG!
      $itemTotal = $price * $qty;
      $subtotal += $itemTotal;
  ```
* **Bản chất lỗ hổng:** Backend đang **tin tưởng tuyệt đối vào giá tiền `$item['price']` do Client gửi lên**. Kẻ xấu hoàn toàn có thể mở DevTools trên trình duyệt hoặc gửi request Postman sửa `price: 1` để mua giỏ hàng trị giá hàng triệu đồng chỉ với 1 VNĐ!
* **Khắc phục chuẩn Senior Developer:**
  Backend **tuyệt đối không nhận giá từ client**. Client chỉ được gửi `variant_id` và `quantity`. Server phải truy vấn bảng `product_variants` để lấy giá niêm yết chuẩn:
  ```php
  // Code khuyến nghị thay thế:
  $variant = ProductVariant::find($item['variant_id']);
  if (!$variant) continue;
  $realPrice = (float) $variant->price;
  $itemTotal = $realPrice * $qty;
  ```

---

### 3. Phân hệ Mã Giảm Giá (`Promotion`) & Tích hợp MoMo (Sprint 2)

#### ✅ Hiện trạng:
* Đã có endpoint `POST /api/v1/promotions/check-voucher` kiểm tra mã (`GREEN10`, `FREESHIP`).
* Đã tính phí ship theo khu vực `shipping_zones` và hỗ trợ miễn phí vận chuyển nếu đạt `free_ship_minimum`.

#### 📋 Danh sách việc cần làm cho Quý để hoàn thiện Sprint 2 (MoMo API):
1. **Tạo `MomoService.php` (`app/Services/MomoService.php`):**
   - Viết hàm `createPayment($orderId, $amount, $orderInfo)` gửi request lên MoMo Sandbox.
   - Viết hàm `verifyCallback($payload)` kiểm tra chữ ký `signature` dùng `hash_hmac('sha256', ...)`.
2. **Gắn kết với Giỏ hàng:**
   - Khi khách hàng nhấn "Thanh toán qua MoMo", gọi `CartService::calculateCart()` lấy tổng tiền chuẩn -> Gọi `MomoService::createPayment()` nhận `payUrl` để chuyển hướng người dùng sang App MoMo.

---

## 🛠️ DANH SÁCH ĐỀ XUẤT CẦN SỬA NGAY (ACTION ITEMS CHO BẠN QUÝ)

1. [ ] **Fix bảo mật giỏ hàng:** Không lấy giá từ client trong `CartService.php`, bắt buộc query từ database theo `variant_id`.
2. [ ] **Thêm DB Transaction:** Bọc `DB::transaction()` trong `ProductService::createProduct()`.
3. [ ] **Form Request Validation:** Tạo `StoreProductRequest` và `CalculateCartRequest` thay vì validate thủ công trong Controller.
4. [ ] **Tích hợp MoMo API (Sprint 2):** Cấu hình `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY` vào `.env.example`.

---
*Báo cáo được khởi tạo tự động từ hệ thống phân tích mã nguồn Antigravity IDE cho nhóm GreenFood.*
