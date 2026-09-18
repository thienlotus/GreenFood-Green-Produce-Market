<?php

namespace App\Modules\Payment\Repositories;

use App\Models\Order;

class PaymentRepository
{
    public function findOrder(string $orderId): ?Order
    {
        $code = strtoupper(trim(str_replace('#', '', $orderId)));
        return Order::where('id', $orderId)
            ->orWhere('tracking_number', $code)
            ->first();
    }

    public function updatePaymentStatus(Order $order, string $paymentMethod, string $orderStatus = 'CONFIRMED'): Order
    {
        $order->payment_method = $paymentMethod;
        $order->status = $orderStatus;
        $order->save();
        return $order;
    }
}
