<?php

namespace App\Modules\Payment\Services;

use App\Modules\Payment\Repositories\PaymentRepository;

class PaymentService
{
    public function __construct(
        protected PaymentRepository $paymentRepository
    ) {}

    public function getSupportedMethods(): array
    {
        return [
            [
                'code' => 'COD',
                'name' => 'Thanh toán khi nhận hàng (COD)',
                'description' => 'Thanh toán tiền mặt cho shipper khi nhận được sản phẩm',
                'is_active' => true
            ],
            [
                'code' => 'BANK_TRANSFER',
                'name' => 'Chuyển khoản ngân hàng (QR Code)',
                'description' => 'Quét mã VietQR chuyển khoản nhanh 24/7',
                'is_active' => true
            ],
            [
                'code' => 'MOMO',
                'name' => 'Ví điện tử MoMo',
                'description' => 'Thanh toán tức thời qua ứng dụng ví MoMo',
                'is_active' => true
            ],
            [
                'code' => 'VNPAY',
                'name' => 'Cổng VNPAY-QR / Thẻ ATM',
                'description' => 'Thanh toán qua cổng VNPAY hỗ trợ thẻ nội địa và quốc tế',
                'is_active' => true
            ]
        ];
    }

    public function processPayment(string $orderId, string $method): array
    {
        $order = $this->paymentRepository->findOrder($orderId);
        if (!$order) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng cần thanh toán'
            ];
        }

        $nextStatus = match ($method) {
            'COD' => 'PENDING',
            'BANK_TRANSFER', 'MOMO', 'VNPAY' => 'CONFIRMED',
            default => 'PENDING'
        };

        $updated = $this->paymentRepository->updatePaymentStatus($order, $method, $nextStatus);

        return [
            'success' => true,
            'message' => "Xử lý thanh toán {$method} thành công!",
            'data' => [
                'order_id' => $updated->id,
                'tracking_number' => $updated->tracking_number,
                'payment_method' => $updated->payment_method,
                'status' => $updated->status,
                'total_amount' => (float)$updated->total_amount
            ]
        ];
    }
}
