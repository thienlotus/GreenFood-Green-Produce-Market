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
        try {
            $res = $ghn->getProvinces();
            return response()->json($res);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('GHN getProvinces error: ' . $e->getMessage());
            return response()->json(['code' => 500, 'message' => $e->getMessage(), 'data' => []]);
        }
    }

    /**
     * Lấy danh sách Quận / Huyện thuộc một Tỉnh/Thành phố cụ thể
     * @param int $provinceId Mã ID của tỉnh/thành
     */
    public function getDistricts(int $provinceId, GHNService $ghn)
    {
        try {
            $res = $ghn->getDistricts($provinceId);
            return response()->json($res);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("GHN getDistricts for {$provinceId} error: " . $e->getMessage());
            return response()->json(['code' => 500, 'message' => $e->getMessage(), 'data' => []]);
        }
    }

    /**
     * Lấy danh sách Phường / Xã thuộc một Quận/Huyện cụ thể
     * @param int $districtId Mã ID của quận/huyện
     */
    public function getWards(int $districtId, GHNService $ghn)
    {
        try {
            $res = $ghn->getWards($districtId);
            return response()->json($res);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("GHN getWards for {$districtId} error: " . $e->getMessage());
            return response()->json(['code' => 500, 'message' => $e->getMessage(), 'data' => []]);
        }
    }

    /**
     * Tính toán cước phí vận chuyển qua GHN theo thời gian thực (Realtime)
     */
    public function getShippingFee(Request $request, GHNService $ghn)
    {
        try {
            // 1. Kiểm tra tính hợp lệ của dữ liệu gửi lên
            $request->validate([
                'to_district_id' => 'required|integer',
                'to_ward_code' => 'required|string',
                'from_district_id' => 'nullable|integer',
                'weight' => 'nullable|integer',
                'items' => 'nullable|array'
            ]);

            $toDistrictId = (int) $request->to_district_id;
            $toWardCode = (string) $request->to_ward_code;
            $items = $request->input('items', []);

            // Nếu frontend truyền trực tiếp from_district_id (ví dụ từ đơn hàng 1 nông hộ hoặc override)
            if ($request->filled('from_district_id') && empty($items)) {
                $weight = (int) ($request->input('weight') ?? 200);
                $res = $ghn->calculateFee(array_merge([
                    'from_district_id' => (int) $request->from_district_id,
                    'to_district_id' => $toDistrictId,
                    'to_ward_code' => $toWardCode,
                ], $ghn->packageParameters($weight)));
                return response()->json($res);
            }

            // Nếu có danh sách items -> Tách gói hàng theo từng Nông Hộ (Chuẩn Sàn Shopee)
            if (!empty($items) && is_array($items)) {
                // Nhóm sản phẩm theo nhà vườn / nông hộ
                $grouped = [];
                foreach ($items as $item) {
                    $farmerKey = $item['farmer_id'] ?? ($item['farmer']['id'] ?? ($item['farmer_name'] ?? ($item['farmer']['name'] ?? ($item['farmer'] ?? 'default'))));
                    if (is_array($farmerKey)) {
                        $farmerKey = $farmerKey['name'] ?? 'default';
                    }
                    $grouped[(string) $farmerKey][] = $item;
                }

                $packages = [];
                $totalShippingFee = 0;

                // Load danh sách nông hộ có sẵn để tra cứu nhanh
                $farmersCache = \App\Models\Farmer::all()->keyBy('id');
                $farmersByName = \App\Models\Farmer::all()->keyBy(fn ($f) => mb_strtolower($f->farm_name, 'UTF-8'));

                foreach ($grouped as $key => $pkgItems) {
                    $farmer = $farmersCache->get($key) ?? $farmersByName->get(mb_strtolower((string) $key, 'UTF-8'));

                    // Xác định kho gửi hàng của Nông Hộ (from_district_id)
                    $fromDistrictId = null;
                    $fromWardCode = null;
                    $farmerName = $farmer ? $farmer->farm_name : (string) $key;
                    $fromLocation = $farmer ? ($farmer->ghn_address ?: $farmer->address) : 'Kho GreenFood';

                    // 1. Kiểm tra trong model Farmer
                    if ($farmer && !empty($farmer->ghn_district_id)) {
                        $fromDistrictId = (int) $farmer->ghn_district_id;
                        $fromWardCode = $farmer->ghn_ward_code;
                    }

                    // 2. Kiểm tra nếu item truyền sẵn from_district_id
                    if (!$fromDistrictId && !empty($pkgItems[0]['from_district_id'])) {
                        $fromDistrictId = (int) $pkgItems[0]['from_district_id'];
                    }

                    // 3. Fallback theo cấu hình kho mặc định
                    if (!$fromDistrictId) {
                        $fromDistrictId = (int) config('services.ghn.from_district_id', 3440);
                    }

                    // Tính khối lượng kiện hàng của nhà vườn này
                    $pkgWeight = collect($pkgItems)->sum(function ($it) {
                        $itemWeight = (int) ($it['weight'] ?? config('services.ghn.default_weight', 200));
                        $qty = (int) ($it['quantity'] ?? 1);
                        return $itemWeight * $qty;
                    });
                    if ($pkgWeight <= 0) $pkgWeight = 200;

                    // Gọi GHN tính phí vận chuyển từ kho của nhà vườn này tới khách hàng
                    $feeParams = array_merge([
                        'from_district_id' => $fromDistrictId,
                        'to_district_id' => $toDistrictId,
                        'to_ward_code' => $toWardCode,
                    ], $ghn->packageParameters($pkgWeight));

                    $shopId = $farmer && !empty($farmer->ghn_shop_id) ? (int) $farmer->ghn_shop_id : null;
                    if ($shopId) {
                        $feeParams['shop_id'] = $shopId;
                    }

                    if ($fromWardCode) {
                        $feeParams['from_ward_code'] = $fromWardCode;
                    }

                    $pkgRes = $ghn->calculateFee($feeParams, $shopId);
                    $pkgFee = (int) ($pkgRes['data']['total'] ?? $pkgRes['data']['service_fee'] ?? 28000);
                    $totalShippingFee += $pkgFee;

                    $packages[] = [
                        'farmer_key' => $key,
                        'farmer_id' => $farmer ? $farmer->id : null,
                        'farmer_name' => $farmerName,
                        'ghn_shop_id' => $shopId,
                        'from_district_id' => $fromDistrictId,
                        'from_ward_code' => $fromWardCode,
                        'from_location' => $fromLocation,
                        'weight' => $pkgWeight,
                        'shipping_fee' => $pkgFee,
                        'items_count' => count($pkgItems),
                        'items' => $pkgItems
                    ];
                }

                return response()->json([
                    'code' => 200,
                    'message' => 'Success',
                    'data' => [
                        'total' => $totalShippingFee,
                        'service_fee' => $totalShippingFee,
                        'package_count' => count($packages),
                        'packages' => $packages
                    ]
                ]);
            }

            // 3. Trường hợp đơn lẻ không truyền items
            $weight = (int) ($request->input('weight') ?? 200);
            $res = $ghn->calculateFee(array_merge([
                'from_district_id' => (int) ($request->from_district_id ?: config('services.ghn.from_district_id', 3440)),
                'to_district_id' => $toDistrictId,
                'to_ward_code' => $toWardCode,
            ], $ghn->packageParameters($weight)));

            return response()->json($res);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('GHN getShippingFee error: ' . $e->getMessage());
            return response()->json([
                'code' => 200,
                'message' => 'Sử dụng cước vận chuyển tiêu chuẩn',
                'data' => [
                    'total' => 25000,
                    'service_fee' => 25000
                ]
            ]);
        }
    }
}
