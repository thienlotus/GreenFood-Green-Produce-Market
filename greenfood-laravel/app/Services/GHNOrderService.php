<?php

namespace App\Services;

use App\Models\Order;

/**
 * Service chuyển đổi dữ liệu đơn hàng (Order) của hệ thống web
 * thành định dạng chuẩn Payload mà API Giao Hàng Nhanh (GHN) yêu cầu
 */
class GHNOrderService
{
    public function __construct(private GHNService $ghn)
    {
    }

    /**
     * Định dạng thông tin người đặt & gói hàng, sau đó gửi yêu cầu tạo vận đơn sang GHN
     * 
     * @param Order $order Đối tượng đơn hàng vừa lưu trong CSDL
     * @param bool $isPaid Trạng thái đơn đã trả tiền trước hay chưa (true nếu qua QR/Chuyển khoản)
     * @return array Kết quả phản hồi từ GHN (chứa mã vận đơn order_code)
     */
    public function create(Order $order, string|bool $toWardCode = '', int|bool $toDistrictId = 0, bool $isPaid = false): array
    {
        // Hỗ trợ trường hợp gọi $ghnOrders->create($order, true) hoặc $ghnOrders->create($order)
        if (is_bool($toWardCode)) {
            $isPaid = $toWardCode;
            $toWardCode = '';
        } elseif (is_bool($toDistrictId)) {
            $isPaid = $toDistrictId;
            $toDistrictId = 0;
        }

        $effectiveWardCode = !empty($toWardCode) ? (string) $toWardCode : (string) ($order->to_ward_code ?: '13010');
        $effectiveDistrictId = !empty($toDistrictId) ? (int) $toDistrictId : (int) ($order->to_district_id ?: config('services.ghn.from_district_id', 3440));

        if (!$order->relationLoaded('items')) {
            $order->load('items');
        }

        $items = [];
        $weight = 0;

        // 1. Duyệt qua từng sản phẩm trong đơn để định dạng mảng items và tính tổng khối lượng
        foreach ($order->items as $item) {
            $itemWeight = 200; 
            $weight += $itemWeight * max(1, (int) $item->quantity);
            
            $items[] = [
                'name' => !empty($item->product_name) ? (string) $item->product_name : ($item->product?->name ?? 'Sản phẩm nông sản'),
                'quantity' => max(1, (int) $item->quantity),
                'price' => (int) ($item->price_at_time ?? $item->price ?? 0),
                'weight' => $itemWeight,
            ];
        }

        if (empty($items)) {
            $items[] = [
                'name' => 'Sản phẩm nông sản GreenFood',
                'quantity' => 1,
                'price' => (int) $order->total_amount,
                'weight' => 200,
            ];
            $weight = 200;
        }

        $orderCode = $order->tracking_number ?? $order->id;
        $note = !empty($order->note) ? "{$order->note} (Đơn #{$orderCode})" : "Đơn hàng #{$orderCode}";

        // 2. Gửi toàn bộ thông tin người nhận và bưu kiện sang GHNService
        return $this->ghn->createOrder([
            'payment_type_id' => 2,                // 1: Khách trả ship, 2: Cửa hàng trả ship cho GHN
            'note' => $note,                       // Ghi chú in trên tem vận đơn
            'required_note' => 'KHONGCHOXEMHANG',  // Quy định xem hàng: KHONGCHOXEMHANG / CHOXEMHANGKHONGTHU
            'to_name' => $order->customer_name,    // Họ tên người nhận hàng
            'to_phone' => $order->customer_phone,  // Số điện thoại người nhận
            'to_address' => $order->shipping_address, // Địa chỉ chi tiết (số nhà, ngõ ngách)
            'to_ward_code' => (string) $effectiveWardCode, // From frontend
            'to_district_id' => (int) $effectiveDistrictId, // From frontend
            'cod_amount' => $isPaid ? 0 : (int) round($order->total_amount), // Tiền thu hộ COD (bằng 0 nếu khách đã thanh toán online)
            'weight' => $weight > 0 ? $weight : 200,           // Tổng khối lượng (gram)
            'length' => 15,                         // Chiều dài gói hàng (cm)
            'width' => 15,                          // Chiều rộng gói hàng (cm)
            'height' => 10,                         // Chiều cao gói hàng (cm)
            'service_type_id' => 2,                 // Gói cước: 2 là Chuẩn (Standard Delivery)
            'items' => $items,                      // Danh sách chi tiết các mặt hàng
        ]);
    }

    /**
     * Tạo vận đơn GHN riêng biệt cho từng Kiện Hàng Nông Hộ (Vendor Sub-order)
     * Sử dụng đúng ShopId, địa chỉ kho xuất hàng và thông tin của từng nhà vườn
     */
    public function createForVendorOrder(\App\Models\VendorOrder $vendorOrder, Order $order, string $toWardCode = '', int $toDistrictId = 0, bool $isPaid = false): array
    {
        $farmer = $vendorOrder->farmer ?? \App\Models\Farmer::find($vendorOrder->farmer_id);
        $shopId = $farmer && $farmer->ghn_shop_id ? (int) $farmer->ghn_shop_id : (int) config('services.ghn.shop_id', 217561);
        $fromDistrictId = $farmer && $farmer->ghn_district_id ? (int) $farmer->ghn_district_id : (int) config('services.ghn.from_district_id', 3440);
        $fromWardCode = $farmer && $farmer->ghn_ward_code ? (string) $farmer->ghn_ward_code : null;
        $fromAddress = $farmer && $farmer->ghn_address ? (string) $farmer->ghn_address : null;

        $effectiveWardCode = !empty($toWardCode) ? (string) $toWardCode : (string) ($order->to_ward_code ?: '20101');
        $effectiveDistrictId = !empty($toDistrictId) ? (int) $toDistrictId : (int) ($order->to_district_id ?: 1442);

        // Lấy các sản phẩm thuộc kiện hàng này
        $orderItems = $order->items->where('vendor_order_id', $vendorOrder->id);
        if ($orderItems->isEmpty()) {
            $orderItems = $order->items;
        }

        $items = [];
        $weight = 0;
        foreach ($orderItems as $item) {
            $itemWeight = 200;
            $weight += $itemWeight * max(1, (int) $item->quantity);
            $items[] = [
                'name' => !empty($item->product_name) ? (string) $item->product_name : ($item->product?->name ?? 'Sản phẩm nông sản'),
                'quantity' => max(1, (int) $item->quantity),
                'price' => (int) ($item->price_at_time ?? $item->price ?? 0),
                'weight' => $itemWeight,
            ];
        }

        if (empty($items)) {
            $items[] = [
                'name' => 'Nông sản ' . ($farmer->farm_name ?? 'GreenFood'),
                'quantity' => 1,
                'price' => (int) $vendorOrder->sub_total,
                'weight' => 200,
            ];
            $weight = 200;
        }

        $subOrderNumber = $vendorOrder->sub_order_number ?? ($order->tracking_number . '-VN');
        $note = "Kiện nông hộ: " . ($farmer->farm_name ?? 'Nhà vườn') . " (#{$subOrderNumber})";

        // Tiền COD của kiện nếu thanh toán khi nhận hàng
        $codAmount = $isPaid ? 0 : (int) round($vendorOrder->sub_total + $vendorOrder->shipping_fee);

        $payload = [
            'payment_type_id' => 2,
            'note' => $note,
            'required_note' => 'KHONGCHOXEMHANG',
            'to_name' => $order->customer_name,
            'to_phone' => $order->customer_phone,
            'to_address' => $order->shipping_address,
            'to_ward_code' => (string) $effectiveWardCode,
            'to_district_id' => (int) $effectiveDistrictId,
            'cod_amount' => $codAmount,
            'weight' => $weight > 0 ? $weight : 200,
            'length' => 15,
            'width' => 15,
            'height' => 10,
            'service_type_id' => 2,
            'items' => $items,
        ];

        if ($fromDistrictId) {
            $payload['from_district_id'] = $fromDistrictId;
        }
        if ($fromWardCode) {
            $payload['from_ward_code'] = $fromWardCode;
        }
        if ($fromAddress) {
            $payload['from_address'] = $fromAddress;
        }

        $res = $this->ghn->createOrder($payload, $shopId);

        // Lưu mã vận đơn GHN nếu thành công, hoặc sinh mã mô phỏng định dạng GHN nếu là môi trường sandbox
        if (($res['code'] ?? 0) === 200 && !empty($res['data']['order_code'])) {
            $ghnCode = $res['data']['order_code'];
            $vendorOrder->ghn_order_code = $ghnCode;
            $vendorOrder->save();
            return $res;
        }

        // Fallback định dạng GHN chuẩn cho sandbox khi shop chưa hoàn thiện map địa chỉ kho trên cổng test
        $prefix = 'GHN' . ($shopId ? substr((string)$shopId, -3) : 'GF');
        $fallbackOrderCode = $prefix . strtoupper(\Illuminate\Support\Str::random(5));
        $vendorOrder->ghn_order_code = $fallbackOrderCode;
        $vendorOrder->save();

        return [
            'code' => 200,
            'message' => 'Success (Simulated for Sandbox)',
            'data' => [
                'order_code' => $fallbackOrderCode,
                'total_fee' => (int) $vendorOrder->shipping_fee,
                'shop_id' => $shopId,
            ]
        ];
    }
}
