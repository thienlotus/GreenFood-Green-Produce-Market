<?php

namespace App\Modules\Order\Repositories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShippingZone;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Collection;

class OrderRepository
{
    public function createOrder(array $data): Order
    {
        return Order::create($data);
    }

    public function createOrderItem(array $data): OrderItem
    {
        return OrderItem::create($data);
    }

    public function findByIdOrTracking(string $id): ?Order
    {
        $code = strtoupper(trim(str_replace(['#', '{', '}', ' '], '', $id)));
        return Order::where('id', $id)
            ->orWhere('tracking_number', $code)
            ->orWhere('ghn_order_code', $code)
            ->with(['items', 'shippingZone'])
            ->first();
    }

    public function getByPhone(string $phone): Collection
    {
        $cleanPhone = preg_replace('/\D/', '', $phone);
        $variants = array_filter(array_unique([
            $phone,
            $cleanPhone,
            str_starts_with($cleanPhone, '84') ? '0' . substr($cleanPhone, 2) : null,
            str_starts_with($cleanPhone, '84') ? '+' . $cleanPhone : null,
            str_starts_with($cleanPhone, '0') ? '84' . substr($cleanPhone, 1) : null,
            str_starts_with($cleanPhone, '0') ? '+84' . substr($cleanPhone, 1) : null,
        ]));

        return Order::whereIn('customer_phone', $variants)->latest()->get();
    }

    public function getFiltered(array $filters): Collection
    {
        $query = Order::with(['items', 'shippingZone'])->latest();

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $status = strtoupper($filters['status']);
            if ($status === 'PROCESSING') $status = 'SHIPPING';
            if ($status === 'COMPLETED') $status = 'DELIVERED';
            $query->where('status', $status);
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%")
                  ->orWhere('ghn_order_code', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $order->status = $status;
        $order->save();
        return $order;
    }

    public function delete(Order $order): bool
    {
        $order->items()->delete();
        return $order->delete();
    }

    public function getShippingZone(string $zoneId): ?ShippingZone
    {
        return ShippingZone::find($zoneId);
    }

    public function resolveProductId(?string $productId, string $productName): ?string
    {
        if (!empty($productId) && is_string($productId)) {
            if (Product::where('id', $productId)->exists()) {
                return $productId;
            }
        }

        $matched = Product::where('name', 'like', '%' . trim($productName) . '%')->first();
        return $matched ? $matched->id : null;
    }

    public function resolveVariantId(?string $variantId): ?string
    {
        if (!empty($variantId) && is_string($variantId)) {
            if (ProductVariant::where('id', $variantId)->exists()) {
                return $variantId;
            }
        }
        return null;
    }
}
