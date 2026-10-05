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
    public function create(Order $order, string $toWardCode, int $toDistrictId, bool $isPaid = false): array
    {
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
            'to_ward_code' => (string) $toWardCode, // From frontend
            'to_district_id' => (int) $toDistrictId, // From frontend
            'cod_amount' => $isPaid ? 0 : (int) round($order->total_amount), // Tiền thu hộ COD (bằng 0 nếu khách đã thanh toán online)
            'weight' => $weight > 0 ? $weight : 200,           // Tổng khối lượng (gram)
            'length' => 15,                         // Chiều dài gói hàng (cm)
            'width' => 15,                          // Chiều rộng gói hàng (cm)
            'height' => 10,                         // Chiều cao gói hàng (cm)
            'service_type_id' => 2,                 // Gói cước: 2 là Chuẩn (Standard Delivery)
            'items' => $items,                      // Danh sách chi tiết các mặt hàng
        ]);
    }
}
