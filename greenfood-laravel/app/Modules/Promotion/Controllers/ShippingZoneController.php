<?php

namespace App\Modules\Promotion\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Promotion\Services\PromotionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShippingZoneController extends Controller
{
    public function __construct(
        protected PromotionService $promotionService
    ) {}

    public function index(Request $request)
    {
        $filters = [
            'search' => $request->get('search'),
            'only_active' => $request->boolean('only_active'),
        ];

        $zones = $this->promotionService->getShippingZones($filters);

        return response()->json([
            'success' => true,
            'data' => $zones
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'provinces' => 'required|string',
            'base_fee' => 'required|numeric|min:0',
            'extra_fee_per_kg' => 'nullable|numeric|min:0',
            'free_ship_minimum' => 'nullable|numeric|min:0',
            'estimated_days' => 'required|string|max:100',
            'is_active' => 'nullable|boolean',
        ], [
            'name.required' => 'Tên vùng giao hàng không được để trống!',
            'provinces.required' => 'Danh sách tỉnh/thành không được để trống!',
            'base_fee.min' => 'Phí cơ bản không được âm!',
            'extra_fee_per_kg.min' => 'Phí mỗi kg thêm không được âm!',
            'free_ship_minimum.min' => 'Mức miễn phí ship không được âm!',
            'estimated_days.required' => 'Thời gian giao hàng dự kiến không được để trống!'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $zone = $this->promotionService->createShippingZone($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Thêm vùng giao hàng thành công!',
            'data' => $zone
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'provinces' => 'sometimes|required|string',
            'base_fee' => 'sometimes|required|numeric|min:0',
            'extra_fee_per_kg' => 'nullable|numeric|min:0',
            'free_ship_minimum' => 'nullable|numeric|min:0',
            'estimated_days' => 'sometimes|required|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $zone = $this->promotionService->updateShippingZone($id, $request->only([
            'name', 'provinces', 'base_fee', 'extra_fee_per_kg', 'free_ship_minimum', 'estimated_days', 'is_active'
        ]));

        if (!$zone) {
            return response()->json([
                'success' => false,
                'message' => 'Vùng giao hàng không tồn tại!'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật vùng giao hàng thành công!',
            'data' => $zone
        ]);
    }

    public function destroy($id)
    {
        $deleted = $this->promotionService->deleteShippingZone($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Vùng giao hàng không tồn tại!'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa vùng giao hàng thành công!'
        ]);
    }
}
