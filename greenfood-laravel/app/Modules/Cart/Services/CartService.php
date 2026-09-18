<?php

namespace App\Modules\Cart\Services;

use App\Modules\Cart\Repositories\CartRepository;

class CartService
{
    public function __construct(
        protected CartRepository $cartRepository
    ) {}

    public function calculateCart(array $items, ?string $shippingZoneId = null): array
    {
        $subtotal = 0;
        $processedItems = [];

        foreach ($items as $item) {
            $qty = (int)($item['quantity'] ?? 1);
            $price = (float)($item['price'] ?? 0);
            $itemTotal = $price * $qty;
            $subtotal += $itemTotal;

            $processedItems[] = [
                'product_id' => $item['product_id'] ?? null,
                'variant_id' => $item['variant_id'] ?? null,
                'product_name' => $item['product_name'] ?? 'Sản phẩm',
                'unit' => $item['unit'] ?? 'Kg',
                'quantity' => $qty,
                'price' => $price,
                'subtotal' => $itemTotal
            ];
        }

        $shippingFee = 0;
        $freeShipping = false;
        if ($shippingZoneId) {
            $zone = $this->cartRepository->getShippingZone($shippingZoneId);
            if ($zone) {
                if ($subtotal >= $zone->free_ship_minimum) {
                    $shippingFee = 0;
                    $freeShipping = true;
                } else {
                    $shippingFee = (float)$zone->base_fee;
                }
            }
        }

        $total = $subtotal + $shippingFee;

        return [
            'items' => $processedItems,
            'item_count' => count($processedItems),
            'total_quantity' => array_sum(array_column($processedItems, 'quantity')),
            'subtotal' => $subtotal,
            'shipping_fee' => $shippingFee,
            'free_shipping' => $freeShipping,
            'total' => $total
        ];
    }
}
