<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Farmer;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalRevenue = Order::where('status', '!=', 'CANCELLED')->sum('total_amount');
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $totalFarmers = Farmer::count();
        $totalUsers = User::count();

        $recentOrders = Order::with('items')->latest()->take(5)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => (float)$totalRevenue,
                'total_orders' => $totalOrders,
                'total_products' => $totalProducts,
                'total_farmers' => $totalFarmers,
                'total_users' => $totalUsers,
                'recent_orders' => $recentOrders
            ]
        ]);
    }
}
