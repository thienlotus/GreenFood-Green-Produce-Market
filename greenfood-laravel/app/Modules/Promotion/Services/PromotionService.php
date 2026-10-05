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
            'GREEN10' => ['type' => 'percent', 'value' => 10, 'min' => 100000, 'max_discount' => 50000, 'title' => 'Giảm 10% tối đa 50k'],
            'FREESHIP' => ['type' => 'shipping', 'value' => 100, 'min' => 150000, 'max_discount' => 30000, 'title' => 'Freeship tối đa 30k'],
            'CHAOBANMOI' => ['type' => 'fixed', 'value' => 20000, 'min' => 50000, 'max_discount' => 20000, 'title' => 'Giảm 20.000đ cho đơn đầu tiên'],
            'GF-WELCOME50' => ['type' => 'fixed', 'value' => 50000, 'min' => 250000, 'max_discount' => 50000, 'title' => 'Voucher Thành Viên Mới 50k'],
        ];

        $code = strtoupper(trim($code));
        $v = $vouchers[$code] ?? null;

        // Tự động nhận diện các mã voucher đổi từ điểm loyalty points (Dynamic Loyalty Vouchers)
        if (!$v) {
            if (str_starts_with($code, 'GF-WELCOME50')) {
                $v = ['type' => 'fixed', 'value' => 50000, 'min' => 250000, 'max_discount' => 50000, 'title' => 'Voucher Thành Viên Mới 50.000đ'];
            } elseif (str_starts_with($code, 'GF20K')) {
                $v = ['type' => 'fixed', 'value' => 20000, 'min' => 150000, 'max_discount' => 20000, 'title' => 'Voucher Giảm 20.000đ'];
            } elseif (str_starts_with($code, 'GF50K')) {
                $v = ['type' => 'fixed', 'value' => 50000, 'min' => 300000, 'max_discount' => 50000, 'title' => 'Voucher Giảm 50.000đ'];
            } elseif (str_starts_with($code, 'GFFREE') || str_starts_with($code, 'GF-FREE')) {
                $v = ['type' => 'shipping', 'value' => 100, 'min' => 200000, 'max_discount' => 25000, 'title' => 'Voucher Miễn Phí Vận Chuyển'];
            } elseif (str_starts_with($code, 'GF100K')) {
                $v = ['type' => 'fixed', 'value' => 100000, 'min' => 500000, 'max_discount' => 100000, 'title' => 'Voucher Khủng Giảm 100.000đ'];
            }
        }

        if (!$v) {
            return [
                'valid' => false,
                'message' => 'Mã khuyến mãi không tồn tại hoặc đã hết hạn.'
            ];
        }

        if ($orderTotal < $v['min']) {
            return [
                'valid' => false,
                'message' => 'Đơn hàng tối thiểu ' . number_format($v['min'], 0, ',', '.') . 'đ để sử dụng mã này (Hiện tại: ' . number_format($orderTotal, 0, ',', '.') . 'đ).'
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
            'discount_type' => $v['type'],
            'title' => $v['title'] ?? 'Ưu đãi GreenFood',
            'message' => 'Áp dụng mã giảm giá thành công!'
        ];
    }
}
