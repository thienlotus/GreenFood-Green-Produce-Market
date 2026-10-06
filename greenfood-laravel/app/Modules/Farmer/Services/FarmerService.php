<?php

namespace App\Modules\Farmer\Services;

use App\Modules\Farmer\Repositories\FarmerRepository;

class FarmerService
{
    public function __construct(
        protected FarmerRepository $farmerRepository
    ) {}

    public function getFarmers(array $filters)
    {
        return $this->farmerRepository->getFiltered($filters);
    }

    public function getFarmer(string|int $id)
    {
        return $this->farmerRepository->findById($id);
    }

    public function getAllForAdmin()
    {
        return $this->farmerRepository->getAllForAdmin();
    }

    public function getFarmerByUserId(string $userId)
    {
        return $this->farmerRepository->findByUserId($userId);
    }

    public function registerFarmer(array $data)
    {
        // 1. Kiểm tra hoặc tạo User tài khoản nông hộ
        $phone = $data['phone'] ?? null;
        $email = $data['email'] ?? null;
        $name = $data['name'] ?? $data['farm_name'];

        $user = null;
        if ($phone) {
            $user = \App\Models\User::where('phone', $phone)->first();
        }
        if (!$user && $email) {
            $user = \App\Models\User::where('email', $email)->first();
        }

        if (!$user) {
            $user = \App\Models\User::create([
                'name' => $name,
                'full_name' => $name,
                'phone' => $phone ?? ('09' . rand(10000000, 99999999)),
                'email' => $email ?? ('farmer_' . time() . '@greenfood.asia'),
                'password' => bcrypt('GreenFood@123'),
                'role' => 'FARMER',
                'is_verified' => true,
            ]);
        } else {
            // Cập nhật role nếu chưa có
            if ($user->role !== 'ADMIN') {
                $user->update(['role' => 'FARMER']);
            }
        }

        // 2. Tìm hoặc gán Region mặc định
        $region = \App\Models\Region::first();
        $regionId = $data['region_id'] ?? ($region ? $region->id : 1);

        // 3. Tạo hồ sơ Farmer
        return $this->farmerRepository->create([
            'user_id' => $user->id,
            'farm_name' => $data['farm_name'],
            'story' => $data['note'] ?? $data['story'] ?? 'Nông trại cam kết canh tác sạch, đạt tiêu chuẩn an toàn thực phẩm.',
            'address' => $data['address'] ?? $data['location'] ?? 'Việt Nam',
            'region_id' => $regionId,
            'specialty' => $data['specialty'] ?? 'Nông sản hữu cơ',
            'rating' => 5.0,
            'is_verified' => false, // Chờ admin duyệt
            'image_url' => $data['image_url'] ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
        ]);
    }

    public function updateVerification(string|int $id, bool $isVerified): bool
    {
        return $this->farmerRepository->update($id, [
            'is_verified' => $isVerified,
        ]);
    }

    public function deleteFarmer(string|int $id): bool
    {
        return $this->farmerRepository->delete($id);
    }
}
