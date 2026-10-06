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

    public function adminIndex(Request $request)
    {
        $farmers = $this->farmerService->getAllForAdmin();

        return response()->json([
            'success' => true,
            'count' => $farmers->count(),
            'data' => $farmers
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'farm_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'scale' => 'nullable|string',
            'specialty' => 'nullable|string',
            'note' => 'nullable|string',
            'region_id' => 'nullable|integer',
        ]);

        $farmer = $this->farmerService->registerFarmer($validated);

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký thông tin hợp tác nông hộ thành công! Hồ sơ của bạn đã được chuyển đến ban quản trị kiểm duyệt.',
            'data' => $farmer
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'is_verified' => 'required|boolean',
        ]);

        $farmer = $this->farmerService->updateVerification($id, $validated['is_verified']);

        if (!$farmer) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy nông hộ để cập nhật'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => $validated['is_verified'] ? 'Đã phê duyệt nông hộ thành công!' : 'Đã chuyển trạng thái nông hộ về Chờ duyệt.',
            'data' => $farmer
        ]);
    }

    public function destroy($id)
    {
        $deleted = $this->farmerService->deleteFarmer($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy nông hộ để xóa'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa nông hộ thành công'
        ]);
    }
}
