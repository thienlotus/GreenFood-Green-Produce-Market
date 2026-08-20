<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\FarmerController;
use App\Http\Controllers\Api\ShippingZoneController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController;

// Public APIs
Route::prefix('v1')->group(function () {
    // 1. Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    // 2. Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // 3. Farmers (Bản đồ GIS & Nông hộ)
    Route::get('/farmers', [FarmerController::class, 'index']);
    Route::get('/farmers/{id}', [FarmerController::class, 'show']);

    // 4. Shipping Zones (CRUD Phí ship)
    Route::get('/shipping-zones', [ShippingZoneController::class, 'index']);
    Route::post('/shipping-zones', [ShippingZoneController::class, 'store']);
    Route::put('/shipping-zones/{id}', [ShippingZoneController::class, 'update']);
    Route::delete('/shipping-zones/{id}', [ShippingZoneController::class, 'destroy']);

    // 5. Orders (Đặt hàng & Theo dõi đơn & Quản lý đơn)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/tracking/{trackingNumber}', [OrderController::class, 'track']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // 6. Admin Endpoints
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::get('/admin/dashboard', [DashboardController::class, 'stats']);
});

// Direct aliases without v1 prefix for convenience
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/farmers', [FarmerController::class, 'index']);
Route::get('/farmers/{id}', [FarmerController::class, 'show']);
Route::get('/shipping-zones', [ShippingZoneController::class, 'index']);
Route::post('/shipping-zones', [ShippingZoneController::class, 'store']);
Route::put('/shipping-zones/{id}', [ShippingZoneController::class, 'update']);
Route::delete('/shipping-zones/{id}', [ShippingZoneController::class, 'destroy']);
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/tracking/{trackingNumber}', [OrderController::class, 'track']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::get('/admin/orders', [OrderController::class, 'index']);
Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::get('/admin/dashboard', [DashboardController::class, 'stats']);

