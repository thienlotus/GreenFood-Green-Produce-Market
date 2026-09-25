<?php

use Illuminate\Support\Facades\Route;

// Module Controllers (Modular Monolith Architecture)
use App\Modules\User\Controllers\UserController;
use App\Modules\Product\Controllers\ProductController;
use App\Modules\Product\Controllers\CategoryController;
use App\Modules\Cart\Controllers\CartController;
use App\Modules\Order\Controllers\OrderController;
use App\Modules\Payment\Controllers\PaymentController;
use App\Modules\Promotion\Controllers\PromotionController;
use App\Modules\Promotion\Controllers\ShippingZoneController;
use App\Modules\Farmer\Controllers\FarmerController;
use App\Modules\Dashboard\Controllers\DashboardController;

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
    Route::post('/register', [UserController::class, 'register']);
    Route::post('/login', [UserController::class, 'login']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);

    // 2. Product & Category Module
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // 3. Cart Module
    Route::post('/cart/calculate', [CartController::class, 'calculate']);

    // 4. Order Module
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/my-orders', [OrderController::class, 'myOrders']);
    Route::get('/orders/tracking/{trackingNumber}', [OrderController::class, 'track']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

    // 5. Payment Module
    Route::get('/payment/methods', [PaymentController::class, 'methods']);
    Route::post('/payment/process', [PaymentController::class, 'process']);

    // 6. Promotion & Shipping Zone Module
    Route::post('/promotions/check-voucher', [PromotionController::class, 'checkVoucher']);
    Route::get('/shipping-zones', [ShippingZoneController::class, 'index']);
    Route::post('/shipping-zones', [ShippingZoneController::class, 'store']);
    Route::put('/shipping-zones/{id}', [ShippingZoneController::class, 'update']);
    Route::delete('/shipping-zones/{id}', [ShippingZoneController::class, 'destroy']);

    // 7. Farmer & GIS Module
    Route::get('/farmers', [FarmerController::class, 'index']);
    Route::get('/farmers/{id}', [FarmerController::class, 'show']);

    // 8. Admin & Dashboard Endpoints
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::get('/admin/dashboard', [DashboardController::class, 'stats']);
});

// Direct aliases without v1 prefix for backward compatibility
Route::post('/auth/register', [UserController::class, 'register']);
Route::post('/auth/login', [UserController::class, 'login']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

Route::post('/cart/calculate', [CartController::class, 'calculate']);

Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/my-orders', [OrderController::class, 'myOrders']);
Route::get('/orders/tracking/{trackingNumber}', [OrderController::class, 'track']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::put('/orders/{id}', [OrderController::class, 'updateStatus']);
Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

Route::get('/payment/methods', [PaymentController::class, 'methods']);
Route::post('/payment/process', [PaymentController::class, 'process']);

Route::post('/promotions/check-voucher', [PromotionController::class, 'checkVoucher']);
Route::get('/shipping-zones', [ShippingZoneController::class, 'index']);
Route::post('/shipping-zones', [ShippingZoneController::class, 'store']);
Route::put('/shipping-zones/{id}', [ShippingZoneController::class, 'update']);
Route::delete('/shipping-zones/{id}', [ShippingZoneController::class, 'destroy']);

Route::get('/farmers', [FarmerController::class, 'index']);
Route::get('/farmers/{id}', [FarmerController::class, 'show']);

Route::get('/admin/orders', [OrderController::class, 'index']);
Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::get('/admin/dashboard', [DashboardController::class, 'stats']);
