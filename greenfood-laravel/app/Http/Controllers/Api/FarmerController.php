<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farmer;
use Illuminate\Http\Request;

class FarmerController extends Controller
{
    public function index(Request $request)
    {
        $query = Farmer::with(['region', 'products.variants']);

        if ($request->has('zone') && $request->zone !== 'all') {
            $zone = $request->zone;
            $query->whereHas('region', function ($q) use ($zone) {
                $q->where('zone', $zone);
            });
        }

        if ($request->has('search') && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('farm_name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('specialty', 'like', "%{$search}%");
            });
        }

        $farmers = $query->get();

        return response()->json([
            'success' => true,
            'count' => $farmers->count(),
            'data' => $farmers
        ]);
    }

    public function show($id)
    {
        $farmer = Farmer::with(['region', 'products.variants'])->find($id);

        if (!$farmer) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy nông hộ'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $farmer
        ]);
    }
}
