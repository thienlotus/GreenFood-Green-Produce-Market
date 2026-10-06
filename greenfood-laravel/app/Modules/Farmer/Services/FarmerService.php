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
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'name' => $name,
                'phone' => $phone ?? ('09' . mt_rand(10000000, 99999999)),
                'email' => $email,
                'password' => \Illuminate\Support\Facades\Hash::make('GreenFood@123'),
                'role' => 'FARMER',
                'is_active' => true,
                'email_verified' => true,
            ]);
        } else {
            // Nâng cấp role thành FARMER nếu đang là CUSTOMER
            if ($user->role !== 'ADMIN') {
                $user->update(['role' => 'FARMER']);
            }
        }

        // 2. Tìm region mặc định nếu không truyền
        $regionId = $data['region_id'] ?? 1;
        if (!\App\Models\Region::where('id', $regionId)->exists()) {
            $firstRegion = \App\Models\Region::first();
            $regionId = $firstRegion ? $firstRegion->id : 1;
        }

        // 3. Tạo hồ sơ Farmer
        $farmer = $this->farmerRepository->create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'farm_name' => $data['farm_name'],
            'story' => $data['story'] ?? ($data['note'] ?? 'Nông trại canh tác nông sản sạch chuẩn VietGAP.'),
            'address' => $data['address'] ?? ($data['location'] ?? 'Việt Nam'),
            'region_id' => $regionId,
            'latitude' => $data['latitude'] ?? (10.7769 + (mt_rand(-50, 50) / 1000)),
            'longitude' => $data['longitude'] ?? (106.7009 + (mt_rand(-50, 50) / 1000)),
            'image_url' => $data['image_url'] ?? 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
            'specialty' => $data['specialty'] ?? ($data['scale'] ?? 'Nông sản hữu cơ theo mùa'),
            'rating' => 5.0,
            'is_verified' => false, // Mặc định chờ duyệt
        ]);

        return $farmer->load(['region', 'user']);
    }

    public function updateVerification(string $id, bool $isVerified)
    {
        $farmer = $this->farmerRepository->findById($id);
        if (!$farmer) {
            return null;
        }

        return $this->farmerRepository->update($farmer, [
            'is_verified' => $isVerified
        ]);
    }

    public function deleteFarmer(string $id): bool
    {
        $farmer = $this->farmerRepository->findById($id);
        if (!$farmer) {
            return false;
        }

        return $this->farmerRepository->delete($farmer);
    }
}
