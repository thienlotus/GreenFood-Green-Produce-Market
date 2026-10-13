<?php

use Illuminate\Support\Facades\Route;

// Module Controllers (Modular Monolith Architecture)
use App\Modules\User\Controllers\UserController;
use App\Modules\Product\Controllers\ProductController;
use App\Modules\Product\Controllers\CategoryController;
use App\Modules\Product\Controllers\ReviewController;
use App\Modules\Cart\Controllers\CartController;
use App\Modules\Order\Controllers\OrderController;
use App\Modules\Payment\Controllers\PaymentController;
use App\Modules\Payment\Controllers\MomoController;
use App\Modules\Payment\Controllers\SepayController;
use App\Modules\Promotion\Controllers\PromotionController;
use App\Modules\Promotion\Controllers\ShippingZoneController;
use App\Modules\Farmer\Controllers\FarmerController;
use App\Modules\Dashboard\Controllers\DashboardController;
use App\Modules\Chat\Controllers\ChatController;
use App\Modules\B2B\Controllers\B2bController;
use App\Http\Controllers\Api\GHNController;
use App\Http\Controllers\Api\CardPaymentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\CareersController;
use App\Http\Controllers\Api\ContactInquiryController;
use App\Http\Controllers\Api\ComplaintController;

/*
|--------------------------------------------------------------------------
| Modular Monolith API Routes
|--------------------------------------------------------------------------
| Tuân thủ kiến trúc Modular Monolith (3-layer: Controller -> Service -> Repository)
| Hỗ trợ đầy đủ tiền tố /v1 và direct aliases cho Frontend Next.js.
*/

Route::prefix('v1')->group(function () {
    // 1. User & Auth Module
    Route::post('/auth/register', [UserController::class, 'register']);
    Route::post('/auth/login', [UserController::class, 'login']);
    Route::post('/auth/verify-email', [UserController::class, 'verifyEmail']);
    Route::post('/auth/resend-otp', [UserController::class, 'resendOtp']);
    Route::post('/register', [UserController::class, 'register']);
    Route::post('/login', [UserController::class, 'login']);
    Route::post('/verify-email', [UserController::class, 'verifyEmail']);
    Route::post('/resend-otp', [UserController::class, 'resendOtp']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::put('/users/{id}/profile', [UserController::class, 'updateProfile']);
    Route::post('/users/{id}/change-password', [UserController::class, 'changePassword']);
    Route::put('/users/{id}/change-password', [UserController::class, 'changePassword']);
    Route::put('/users/{id}/role', [UserController::class, 'updateRole']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // 2. Product & Category Module
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // 2.5 Product Reviews (Shopee Style with Video & Photos)
    Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);
    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);
    Route::post('/reviews/{id}/like', [ReviewController::class, 'toggleLike']);
    Route::post('/reviews/upload', [ReviewController::class, 'uploadMedia']);

    // 3. Cart Module
    Route::post('/cart/calculate', [CartController::class, 'calculate']);

    // 4. Order Module
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/my-orders', [OrderController::class, 'myOrders']);
    Route::get('/orders/tracking/{trackingNumber}', [OrderController::class, 'track']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/push-ghn', [OrderController::class, 'pushToGhn']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

    // 5. Payment Module & MoMo & SePay Gateways
    Route::get('/payment/methods', [PaymentController::class, 'methods']);
    Route::post('/payment/process', [PaymentController::class, 'process']);
    Route::post('/payment/momo/create', [MomoController::class, 'create']);
    Route::post('/payment/momo/callback', [MomoController::class, 'callback']);
    Route::get('/payment/momo/return', [MomoController::class, 'return']);
    Route::post('/payment/momo/check-status', [MomoController::class, 'checkStatus']);
    Route::post('/payment/sepay/create', [SepayController::class, 'create']);
    Route::post('/payment/sepay/webhook', [SepayController::class, 'webhook']);
    Route::post('/payment/sepay/check-status', [SepayController::class, 'checkStatus']);
    Route::post('/payment/card/process', [CardPaymentController::class, 'process']);

    // 6. Promotion & Shipping Zone Module
    Route::post('/promotions/check-voucher', [PromotionController::class, 'checkVoucher']);
    Route::get('/shipping-zones', [ShippingZoneController::class, 'index']);
    Route::post('/shipping-zones', [ShippingZoneController::class, 'store']);
    Route::put('/shipping-zones/{id}', [ShippingZoneController::class, 'update']);
    Route::delete('/shipping-zones/{id}', [ShippingZoneController::class, 'destroy']);

    // 6.5 Customer Notification Module (Shopee Style)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // 7. Farmer & GIS Module
    Route::get('/farmers', [FarmerController::class, 'index']);
    Route::post('/farmers/register', [FarmerController::class, 'register']);
    Route::get('/farmers/{id}', [FarmerController::class, 'show']);
    Route::put('/farmers/{id}', [FarmerController::class, 'update']);
    Route::get('/farmers/{id}/orders', [FarmerController::class, 'getOrders']);
    Route::put('/farmers/{id}/orders/{orderId}/status', [FarmerController::class, 'updateSubOrderStatus']);
    Route::get('/farmers/{id}/wallet', [FarmerController::class, 'getWallet']);
    Route::put('/farmers/{id}/bank', [FarmerController::class, 'updateBank']);
    Route::post('/farmers/{id}/withdraw', [FarmerController::class, 'requestWithdraw']);
    Route::get('/farmers/{id}/withdrawals', [FarmerController::class, 'getWithdrawals']);
    Route::get('/admin/withdrawals', [FarmerController::class, 'getAdminWithdrawals']);
    Route::post('/admin/withdrawals/{id}/approve', [FarmerController::class, 'approveWithdrawal']);
    Route::post('/admin/withdrawals/{id}/reject', [FarmerController::class, 'rejectWithdrawal']);
    Route::get('/admin/farmers', [FarmerController::class, 'adminIndex']);
    Route::put('/admin/farmers/{id}', [FarmerController::class, 'update']);
    Route::put('/admin/farmers/{id}/status', [FarmerController::class, 'updateStatus']);
    Route::delete('/admin/farmers/{id}', [FarmerController::class, 'destroy']);

    // 8. Logistics & GHN API Endpoints
    Route::get('/ghn/provinces', [GHNController::class, 'getProvinces']);
    Route::get('/ghn/districts/{provinceId}', [GHNController::class, 'getDistricts']);
    Route::get('/ghn/wards/{districtId}', [GHNController::class, 'getWards']);
    Route::post('/ghn/calculate-fee', [GHNController::class, 'getShippingFee']);

    // 9. Admin & Dashboard Endpoints
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::get('/admin/dashboard', [DashboardController::class, 'stats']);

    // 10. B2B Wholesale & Partner Inquiries Module
    Route::get('/b2b/inquiries', [B2bController::class, 'index']);
    Route::get('/b2b/inquiries/track', [B2bController::class, 'track']);
    Route::post('/b2b/inquiries', [B2bController::class, 'store']);
    Route::get('/b2b/inquiries/{id}', [B2bController::class, 'show']);
    Route::put('/b2b/inquiries/{id}/status', [B2bController::class, 'updateStatus']);
    Route::post('/b2b/inquiries/{id}/respond', [B2bController::class, 'respond']);
    Route::delete('/b2b/inquiries/{id}', [B2bController::class, 'destroy']);
    Route::get('/admin/b2b/inquiries', [B2bController::class, 'index']);
    Route::put('/admin/b2b/inquiries/{id}/status', [B2bController::class, 'updateStatus']);
    Route::post('/admin/b2b/inquiries/{id}/respond', [B2bController::class, 'respond']);

    // 11. Careers & Job Applications Module
    Route::post('/careers/apply', [CareersController::class, 'apply']);
    Route::get('/admin/careers', [CareersController::class, 'index']);
    Route::put('/admin/careers/{id}/status', [CareersController::class, 'updateStatus']);
    Route::delete('/admin/careers/{id}', [CareersController::class, 'destroy']);

    // 12. Contact & Customer Feedback Module
    Route::post('/contact', [ContactInquiryController::class, 'store']);
    Route::get('/admin/contact', [ContactInquiryController::class, 'index']);
    Route::put('/admin/contact/{id}/status', [ContactInquiryController::class, 'updateStatus']);
    Route::delete('/admin/contact/{id}', [ContactInquiryController::class, 'destroy']);

    // 13. Customer Complaints Resolution Module
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/admin/complaints', [ComplaintController::class, 'index']);
    Route::put('/admin/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
    Route::delete('/admin/complaints/{id}', [ComplaintController::class, 'destroy']);
});


// Direct aliases without v1 prefix for backward compatibility
Route::post('/auth/register', [UserController::class, 'register']);
Route::post('/auth/login', [UserController::class, 'login']);
Route::post('/auth/verify-email', [UserController::class, 'verifyEmail']);
Route::post('/auth/resend-otp', [UserController::class, 'resendOtp']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/verify-email', [UserController::class, 'verifyEmail']);
Route::post('/resend-otp', [UserController::class, 'resendOtp']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::put('/users/{id}/profile', [UserController::class, 'updateProfile']);
Route::post('/users/{id}/change-password', [UserController::class, 'changePassword']);
Route::put('/users/{id}/change-password', [UserController::class, 'changePassword']);
Route::put('/users/{id}/role', [UserController::class, 'updateRole']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);
Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);
Route::post('/reviews/{id}/like', [ReviewController::class, 'toggleLike']);
Route::post('/reviews/upload', [ReviewController::class, 'uploadMedia']);
Route::get('/storage/{path}', function ($path) {
    $searchPaths = [
        public_path('storage/' . $path),
        storage_path('app/public/' . $path),
        storage_path('app/' . $path),
        '/home/ajmylihnhosting/domains/greenfood.asia/public_html/storage/' . $path,
        '/home/ajmylihnhosting/domains/greenfood.asia/storage/' . $path,
        '/home/ajmylihnhosting/storage/app/public/' . $path,
        base_path('storage/app/public/' . $path),
    ];

    foreach ($searchPaths as $file) {
        if (file_exists($file) && is_file($file)) {
            $mime = mime_content_type($file) ?: 'application/octet-stream';
            return response()->file($file, [
                'Content-Type' => $mime,
                'Cache-Control' => 'public, max-age=31536000',
            ]);
        }
    }

    return response('File not found', 404);
})->where('path', '.*');

Route::post('/cart/calculate', [CartController::class, 'calculate']);

Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/my-orders', [OrderController::class, 'myOrders']);
Route::get('/orders/tracking/{trackingNumber}', [OrderController::class, 'track']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::put('/orders/{id}', [OrderController::class, 'updateStatus']);
Route::post('/orders/{id}/push-ghn', [OrderController::class, 'pushToGhn']);
Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

Route::get('/payment/methods', [PaymentController::class, 'methods']);
Route::post('/payment/process', [PaymentController::class, 'process']);
Route::post('/payment/momo/create', [MomoController::class, 'create']);
Route::post('/payment/momo/callback', [MomoController::class, 'callback']);
Route::get('/payment/momo/return', [MomoController::class, 'return']);
Route::post('/payment/momo/check-status', [MomoController::class, 'checkStatus']);
Route::post('/payment/momo/simulate', [MomoController::class, 'simulate']);
Route::post('/payment/sepay/create', [SepayController::class, 'create']);
Route::post('/payment/sepay/webhook', [SepayController::class, 'webhook']);
Route::post('/payment/sepay/check-status', [SepayController::class, 'checkStatus']);
Route::post('/payment/card/process', [CardPaymentController::class, 'process']);

Route::post('/promotions/check-voucher', [PromotionController::class, 'checkVoucher']);
Route::get('/shipping-zones', [ShippingZoneController::class, 'index']);
Route::post('/shipping-zones', [ShippingZoneController::class, 'store']);
Route::put('/shipping-zones/{id}', [ShippingZoneController::class, 'update']);
Route::delete('/shipping-zones/{id}', [ShippingZoneController::class, 'destroy']);

Route::get('/farmers', [FarmerController::class, 'index']);
Route::post('/farmers/register', [FarmerController::class, 'register']);
Route::get('/farmers/{id}', [FarmerController::class, 'show']);
Route::put('/farmers/{id}', [FarmerController::class, 'update']);
Route::get('/farmers/{id}/orders', [FarmerController::class, 'getOrders']);
Route::put('/farmers/{id}/orders/{orderId}/status', [FarmerController::class, 'updateSubOrderStatus']);
Route::get('/farmers/{id}/wallet', [FarmerController::class, 'getWallet']);
Route::put('/farmers/{id}/bank', [FarmerController::class, 'updateBank']);
Route::post('/farmers/{id}/withdraw', [FarmerController::class, 'requestWithdraw']);
Route::get('/farmers/{id}/withdrawals', [FarmerController::class, 'getWithdrawals']);
Route::get('/admin/withdrawals', [FarmerController::class, 'getAdminWithdrawals']);
Route::post('/admin/withdrawals/{id}/approve', [FarmerController::class, 'approveWithdrawal']);
Route::post('/admin/withdrawals/{id}/reject', [FarmerController::class, 'rejectWithdrawal']);
Route::get('/admin/farmers', [FarmerController::class, 'adminIndex']);
Route::put('/admin/farmers/{id}', [FarmerController::class, 'update']);
Route::put('/admin/farmers/{id}/status', [FarmerController::class, 'updateStatus']);
Route::delete('/admin/farmers/{id}', [FarmerController::class, 'destroy']);

Route::get('/ghn/provinces', [GHNController::class, 'getProvinces']);
Route::get('/ghn/districts/{provinceId}', [GHNController::class, 'getDistricts']);
Route::get('/ghn/wards/{districtId}', [GHNController::class, 'getWards']);
Route::post('/ghn/calculate-fee', [GHNController::class, 'getShippingFee']);

Route::get('/admin/orders', [OrderController::class, 'index']);
Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::get('/admin/dashboard', [DashboardController::class, 'stats']);

// 10. Chat Module (Live Chat Multi-Vendor Support - Shopee Logic)
Route::prefix('chat')->group(function () {
    Route::get('/conversations', [ChatController::class, 'index']);
    Route::post('/conversations', [ChatController::class, 'store']);
    Route::post('/customer/conversations/farmer', [ChatController::class, 'startCustomerFarmerChat']);
    Route::post('/farmer/conversations/customer', [ChatController::class, 'startFarmerCustomerChat']);
    Route::post('/farmer/conversations/admin', [ChatController::class, 'startFarmerAdminChat']);
    Route::get('/conversations/{id}', [ChatController::class, 'show']);
    Route::get('/conversations/{id}/customer', [ChatController::class, 'customerMessages']);
    Route::post('/conversations/{id}/messages', [ChatController::class, 'sendMessage']);
    Route::put('/conversations/{id}/assign', [ChatController::class, 'assign']);
    Route::put('/conversations/{id}/close', [ChatController::class, 'close']);
    Route::get('/unread-count', [ChatController::class, 'unreadCount']);
});

// 11. B2B Direct Aliases
Route::get('/b2b/inquiries', [B2bController::class, 'index']);
Route::get('/b2b/inquiries/track', [B2bController::class, 'track']);
Route::post('/b2b/inquiries', [B2bController::class, 'store']);
Route::get('/b2b/inquiries/{id}', [B2bController::class, 'show']);
Route::put('/b2b/inquiries/{id}/status', [B2bController::class, 'updateStatus']);
Route::post('/b2b/inquiries/{id}/respond', [B2bController::class, 'respond']);
Route::delete('/b2b/inquiries/{id}', [B2bController::class, 'destroy']);
Route::get('/admin/b2b/inquiries', [B2bController::class, 'index']);
Route::put('/admin/b2b/inquiries/{id}/status', [B2bController::class, 'updateStatus']);
Route::post('/admin/b2b/inquiries/{id}/respond', [B2bController::class, 'respond']);

// Direct alias for Notifications
Route::get('/notifications', [NotificationController::class, 'index']);
Route::post('/notifications', [NotificationController::class, 'store']);
Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

// Direct aliases for Careers, Contact, Complaints
Route::post('/careers/apply', [CareersController::class, 'apply']);
Route::get('/admin/careers', [CareersController::class, 'index']);
Route::put('/admin/careers/{id}/status', [CareersController::class, 'updateStatus']);
Route::delete('/admin/careers/{id}', [CareersController::class, 'destroy']);

Route::post('/contact', [ContactInquiryController::class, 'store']);
Route::get('/admin/contact', [ContactInquiryController::class, 'index']);
Route::put('/admin/contact/{id}/status', [ContactInquiryController::class, 'updateStatus']);
Route::delete('/admin/contact/{id}', [ContactInquiryController::class, 'destroy']);

Route::post('/complaints', [ComplaintController::class, 'store']);
Route::get('/admin/complaints', [ComplaintController::class, 'index']);
Route::put('/admin/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
Route::delete('/admin/complaints/{id}', [ComplaintController::class, 'destroy']);

