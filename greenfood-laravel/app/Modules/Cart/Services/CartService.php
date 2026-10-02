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
            $qty = max(1, (int)($item['quantity'] ?? 1));

            // Bảo mật (Senior QA/QC): Luôn ưu tiên tra cứu giá niêm yết từ CSDL theo variant_id hoặc product_id
            $realPrice = null;
            if (!empty($item['variant_id'])) {
                $variant = $this->cartRepository->getVariantById($item['variant_id']);
                if ($variant) {
                    $realPrice = (float)$variant->price;
                }
            } elseif (!empty($item['product_id'])) {
                $product = $this->cartRepository->getProductById($item['product_id']);
                $firstVariant = $product?->variants()->first();
                if ($firstVariant) {
                    $realPrice = (float)$firstVariant->price;
                }
            }

            // Fallback giá gửi lên nếu không tìm thấy trong DB (phục vụ test hoặc item tùy biến)
            $price = $realPrice ?? (float)($item['price'] ?? 0);
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
