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
            'tax_id' => 'nullable|string|max:100',
            'certifications' => 'nullable|array',
            'cert_code' => 'nullable|string|max:255',
            'farm_area' => 'nullable|string|max:100',
            'farming_method' => 'nullable|string|max:255',
            'experience_years' => 'nullable|string|max:100',
            'proof_document' => 'nullable|string',
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

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'farm_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'story' => 'nullable|string',
            'specialty' => 'nullable|string|max:255',
            'image_url' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'region_id' => 'nullable|integer',
            'is_verified' => 'nullable|boolean',
            'ghn_province_id' => 'nullable|integer',
            'ghn_district_id' => 'nullable|integer',
            'ghn_ward_code' => 'nullable|string|max:30',
            'ghn_address' => 'nullable|string|max:255',
            'ghn_shop_id' => 'nullable|integer',
        ]);

        $farmer = $this->farmerService->updateFarmer($id, $validated);

        if (!$farmer) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy nông hộ'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin gian hàng nông hộ thành công',
            'data' => $farmer
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

    public function getOrders(Request $request, $id)
    {
        $filters = [
            'status' => $request->get('status'),
            'search' => $request->get('search'),
        ];

        $orders = $this->farmerService->getFarmerOrders((string)$id, $filters);

        return response()->json([
            'success' => true,
            'count' => $orders->count(),
            'data' => $orders
        ]);
    }

    public function updateSubOrderStatus(Request $request, $id, $orderId)
    {
        $status = $request->input('status');
        if (empty($status)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cung cấp trạng thái mới (status)'
            ], 400);
        }

        $res = $this->farmerService->updateVendorOrderStatus((string)$orderId, (string)$status, (string)$id);

        return response()->json($res, $res['code'] ?? 200);
    }

    public function getWallet(Request $request, $id)
    {
        $wallet = $this->farmerService->getFarmerWallet((string)$id);

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy nông hộ'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $wallet
        ]);
    }

    public function updateBank(Request $request, $id)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:100',
            'bank_account_number' => 'required|string|max:50',
            'bank_account_name' => 'required|string|max:100',
        ]);

        $success = $this->farmerService->updateBankInfo((string)$id, $validated);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật tài khoản ngân hàng thất bại'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật tài khoản ngân hàng nhận tiền thành công!'
        ]);
    }
}
