<?php

namespace App\Modules\Dashboard\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Farmer;
use App\Models\User;

class DashboardService
{
    public function getStats(): array
    {
        $totalRevenue = Order::where('status', '!=', 'CANCELLED')->sum('total_amount');
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $totalFarmers = Farmer::count();
        $totalUsers = User::count();

        $recentOrders = Order::with('items')->latest()->take(5)->get();

        return [
            'total_revenue' => (float)$totalRevenue,
            'total_orders' => $totalOrders,
            'total_products' => $totalProducts,
            'total_farmers' => $totalFarmers,
            'total_users' => $totalUsers,
            'recent_orders' => $recentOrders
        ];
    }
}
