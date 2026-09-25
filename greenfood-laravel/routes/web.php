<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'GreenFood E-Commerce API Gateway',
        'status' => 'healthy',
        'architecture' => 'Modular Monolith (3-Layer Pattern)',
        'lead' => 'Lê Vũ Thiên',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString()
    ]);
});
