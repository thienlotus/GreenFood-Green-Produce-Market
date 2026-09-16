<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GHNService;
use Illuminate\Http\Request;

/**
 * Controller xử lý các tác vụ liên quan đến Giao Hàng Nhanh (GHN) cho Frontend Next.js
 */
class GHNController extends Controller
{
    /**
     * Lấy danh sách 63 Tỉnh / Thành phố từ API GHN
     */
    public function getProvinces(GHNService $ghn)
    {
        return response()->json($ghn->getProvinces());
    }

    /**
     * Lấy danh sách Quận / Huyện thuộc một Tỉnh/Thành phố cụ thể
     * @param int $provinceId Mã ID của tỉnh/thành
     */
    public function getDistricts(int $provinceId, GHNService $ghn)
    {
        return response()->json($ghn->getDistricts($provinceId));
    }

    /**
     * Lấy danh sách Phường / Xã thuộc một Quận/Huyện cụ thể
     * @param int $districtId Mã ID của quận/huyện
     */
    public function getWards(int $districtId, GHNService $ghn)
    {
        return response()->json($ghn->getWards($districtId));
    }

    /**
     * Tính toán cước phí vận chuyển qua GHN theo thời gian thực (Realtime)
     */
    public function getShippingFee(Request $request, GHNService $ghn)
    {
        // 1. Kiểm tra tính hợp lệ của dữ liệu gửi lên
        $request->validate([
            'to_district_id' => 'required|integer',
            'to_ward_code' => 'required|string',
            'weight' => 'nullable|integer', // Có thể gửi lên cân nặng trực tiếp hoặc tự tính mặc định
            'items' => 'nullable|array'     // Hoặc mảng items trong giỏ hàng để tính
        ]);

        // 2. Tính tổng khối lượng kiện hàng
        $weight = 200; // Mặc định
        if ($request->has('weight')) {
            $weight = $request->input('weight');
        } elseif ($request->has('items') && is_array($request->items)) {
            $weight = collect($request->items)->sum(
                fn ($item) => (int) config('services.ghn.default_weight', 200) * (int) ($item['quantity'] ?? 1)
            );
        }

        // 3. Gọi GHNService gửi request tính phí tới cổng GHN
        return response()->json($ghn->calculateFee(array_merge([
            'from_district_id' => (int) config('services.ghn.from_district_id'), // Mã huyện kho gửi
            'to_district_id' => (int) $request->to_district_id,                 // Mã huyện người nhận
            'to_ward_code' => (string) $request->to_ward_code,                   // Mã xã người nhận
        ], $ghn->packageParameters($weight))));                                  // Kích thước & cân nặng kiện hàng
    }
}
