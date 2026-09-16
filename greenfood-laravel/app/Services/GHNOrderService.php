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
        $items = [];
        $weight = 0;

        // 1. Duyệt qua từng sản phẩm trong đơn để định dạng mảng items và tính tổng khối lượng
        foreach ($order->items as $item) {
            // Mặc định quy ước 200g
            $itemWeight = 200; 
            $weight += $itemWeight * (int) $item->quantity;
            
            $items[] = [
                // Load product relation to get name if possible
                'name' => $item->product ? $item->product->name : 'Sản phẩm nông sản',
                'quantity' => (int) $item->quantity,
                'price' => (int) $item->price,
                'weight' => $itemWeight,
            ];
        }

        // 2. Gửi toàn bộ thông tin người nhận và bưu kiện sang GHNService
        return $this->ghn->createOrder([
            'payment_type_id' => 2,                // 1: Khách trả ship, 2: Cửa hàng trả ship cho GHN
            'note' => 'Đơn hàng #' . $order->id, // Ghi chú in trên tem vận đơn
            'required_note' => 'KHONGCHOXEMHANG',  // Quy định xem hàng: KHONGCHOXEMHANG / CHOXEMHANGKHONGTHU
            'to_name' => $order->customer_name,    // Họ tên người nhận hàng
            'to_phone' => $order->customer_phone,  // Số điện thoại người nhận
            'to_address' => $order->shipping_address, // Địa chỉ chi tiết (số nhà, ngõ ngách)
            'to_ward_code' => $toWardCode, // From frontend
            'to_district_id' => $toDistrictId, // From frontend
            'cod_amount' => $isPaid ? 0 : (int) $order->total_amount, // Tiền thu hộ COD (bằng 0 nếu khách đã thanh toán online)
            'weight' => $weight > 0 ? $weight : 200,           // Tổng khối lượng (gram)
            'length' => 15,                         // Chiều dài gói hàng (cm)
            'width' => 15,                          // Chiều rộng gói hàng (cm)
            'height' => 10,                         // Chiều cao gói hàng (cm)
            'service_type_id' => 2,                 // Gói cước: 2 là Chuẩn (Standard Delivery)
            'items' => $items,                      // Danh sách chi tiết các mặt hàng
        ]);
    }
}
