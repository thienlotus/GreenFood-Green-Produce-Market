<?php

use App\Http\Controllers\User\MomoController;
use App\Http\Controllers\User\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('http://localhost:3000');
});

/*
|--------------------------------------------------------------------------
| 💳 THIRD-PARTY WEBHOOKS & CALLBACKS (GHN, MOMO IPN)
|--------------------------------------------------------------------------
| NOTE:
| - Không dùng middleware 'auth' vì bên thứ 3 (GHN, MoMo) gọi sang tự động.
| - Đã được bypass CSRF trong bootstrap/app.php.
|--------------------------------------------------------------------------
*/
Route::post('/payment/momo/ipn', [MomoController::class, 'ipn'])->name('payment.momo.ipn');
Route::get('/payment/momo/callback', [MomoController::class, 'callback'])->name('user.payment.momo.callback');

/*
|--------------------------------------------------------------------------
| 🛒 USER PAYMENT & ORDERS ROUTES (THEO HƯỚNG DẪN LAB SANDBOX)
|--------------------------------------------------------------------------
*/
Route::prefix('user')->name('user.')->group(function () {
    // Payment
    Route::get('/payment', [OrderController::class, 'index'])->name('payment.index');
    Route::post('/payment/process', [OrderController::class, 'processPayment'])->name('payment.process');
    
    // Lịch sử đơn hàng & Thanh toán lại
    Route::get('/orders', [OrderController::class, 'ordersList'])->name('orders.index');
    Route::get('/orders/{order}/pay/momo', [MomoController::class, 'payAgain'])->name('orders.momo.pay');
    Route::get('/orders/{order}/start-momo', [MomoController::class, 'start'])->name('orders.momo.start');
    Route::get('/orders/{order}/simulate-momo-success', [MomoController::class, 'simulateSuccess'])->name('orders.momo.simulate');
});
