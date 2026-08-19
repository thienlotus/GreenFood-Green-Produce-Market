<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShippingZoneController extends Controller
{
    public function index(Request $request)
    {
        $query = ShippingZone::query();

        if ($request->has('search') && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('provinces', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('only_active')) {
            $query->where('is_active', true);
        }

        $zones = $query->orderBy('id', 'asc')->get();

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

        // Generate ID
        $count = ShippingZone::count() + 1;
        $id = 'SZ' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);

        $zone = ShippingZone::create([
            'id' => $id,
            'name' => $request->name,
            'provinces' => $request->provinces,
            'base_fee' => $request->base_fee ?? 0,
            'extra_fee_per_kg' => $request->extra_fee_per_kg ?? 0,
            'free_ship_minimum' => $request->free_ship_minimum ?? 0,
            'estimated_days' => $request->estimated_days,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm vùng giao hàng thành công!',
            'data' => $zone
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $zone = ShippingZone::find($id);

        if (!$zone) {
            return response()->json([
                'success' => false,
                'message' => 'Vùng giao hàng không tồn tại!'
            ], 404);
        }

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

        $zone->update($request->only([
            'name', 'provinces', 'base_fee', 'extra_fee_per_kg', 'free_ship_minimum', 'estimated_days', 'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật vùng giao hàng thành công!',
            'data' => $zone
        ]);
    }

    public function destroy($id)
    {
        $zone = ShippingZone::find($id);

        if (!$zone) {
            return response()->json([
                'success' => false,
                'message' => 'Vùng giao hàng không tồn tại!'
            ], 404);
        }

        $zone->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa vùng giao hàng thành công!'
        ]);
    }
}
