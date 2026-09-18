<?php

namespace App\Modules\Farmer\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Farmer\Services\FarmerService;
use Illuminate\Http\Request;

class FarmerController extends Controller
{
    public function __construct(
        protected FarmerService $farmerService
    ) {}

    public function index(Request $request)
    {
        $filters = [
            'zone' => $request->get('zone'),
            'search' => $request->get('search'),
        ];

        $farmers = $this->farmerService->getFarmers($filters);

        return response()->json([
            'success' => true,
            'count' => $farmers->count(),
            'data' => $farmers
        ]);
    }

    public function show($id)
    {
        $farmer = $this->farmerService->getFarmer($id);

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
