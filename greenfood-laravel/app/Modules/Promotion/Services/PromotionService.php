<?php

namespace App\Modules\Promotion\Services;

use App\Modules\Promotion\Repositories\PromotionRepository;

class PromotionService
{
    public function __construct(
        protected PromotionRepository $promotionRepository
    ) {}

    public function getShippingZones(array $filters)
    {
        return $this->promotionRepository->getShippingZones($filters);
    }

    public function createShippingZone(array $data)
    {
        $id = $this->promotionRepository->getNextShippingZoneId();

        return $this->promotionRepository->createShippingZone([
            'id' => $id,
            'name' => $data['name'],
            'provinces' => $data['provinces'],
            'base_fee' => $data['base_fee'] ?? 0,
            'extra_fee_per_kg' => $data['extra_fee_per_kg'] ?? 0,
            'free_ship_minimum' => $data['free_ship_minimum'] ?? 0,
            'estimated_days' => $data['estimated_days'],
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateShippingZone(string $id, array $data)
    {
        $zone = $this->promotionRepository->findShippingZone($id);
        if (!$zone) {
            return null;
        }

        return $this->promotionRepository->updateShippingZone($zone, $data);
    }

    public function deleteShippingZone(string $id): bool
    {
        $zone = $this->promotionRepository->findShippingZone($id);
        if (!$zone) {
            return false;
        }

        return $this->promotionRepository->deleteShippingZone($zone);
    }

    public function validateVoucher(string $code, float $orderTotal): array
    {
        $vouchers = [
            'GREEN10' => ['type' => 'percent', 'value' => 10, 'min' => 100000, 'max_discount' => 50000],
            'FREESHIP' => ['type' => 'shipping', 'value' => 100, 'min' => 150000, 'max_discount' => 30000],
            'CHAOBANMOI' => ['type' => 'fixed', 'value' => 20000, 'min' => 50000, 'max_discount' => 20000],
        ];

        $code = strtoupper(trim($code));
        if (!isset($vouchers[$code])) {
            return [
                'valid' => false,
                'message' => 'Mã khuyến mãi không tồn tại hoặc đã hết hạn.'
            ];
        }

        $v = $vouchers[$code];
        if ($orderTotal < $v['min']) {
            return [
                'valid' => false,
                'message' => 'Đơn hàng tối thiểu ' . number_format($v['min'], 0, ',', '.') . 'đ để sử dụng mã này.'
            ];
        }

        $discount = 0;
        if ($v['type'] === 'percent') {
            $discount = min(($orderTotal * $v['value']) / 100, $v['max_discount']);
        } elseif ($v['type'] === 'fixed') {
            $discount = min($v['value'], $orderTotal);
        } elseif ($v['type'] === 'shipping') {
            $discount = $v['max_discount'];
        }

        return [
            'valid' => true,
            'code' => $code,
            'discount' => $discount,
            'message' => 'Áp dụng mã giảm giá thành công!'
        ];
    }
}
