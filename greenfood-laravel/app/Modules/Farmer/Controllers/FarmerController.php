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
            'address' => 'nullable|string',
            'location' => 'nullable|string',
            'scale' => 'nullable|string',
            'specialty' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        try {
            $farmer = $this->farmerService->registerFarmer($validated);

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký đối tác nông hộ thành công! Hồ sơ đang chờ kiểm duyệt.',
                'data' => $farmer
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi đăng ký đối tác: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $isVerified = (bool) $request->input('is_verified', true);
        $success = $this->farmerService->updateVerification($id, $isVerified);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy nông hộ hoặc cập nhật thất bại'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái nông hộ thành công'
        ]);
    }

    public function destroy($id)
    {
        $success = $this->farmerService->deleteFarmer($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy nông hộ hoặc xóa thất bại'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa đối tác nông hộ thành công'
        ]);
    }
}
