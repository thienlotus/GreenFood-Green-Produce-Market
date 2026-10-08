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
                'phone' => $phone ?? ('09' . random_int(10000000, 99999999)),
                'email' => $email ?? ('farmer_' . time() . '@greenfood.asia'),
                'password' => bcrypt('GreenFood@123'),
                'role' => 'VENDOR',
                'email_verified' => true,
            ]);
        } else {
            // Cập nhật role nếu chưa có
            if ($user->role !== 'ADMIN') {
                $user->update(['role' => 'VENDOR']);
            }
        }

        // 2. Tự động phân giải Tọa độ GPS & Region ID dựa trên địa chỉ thực tế
        $address = $data['address'] ?? $data['location'] ?? 'Việt Nam';
        $geo = \App\Services\VietnamGeoService::resolve(
            $address,
            isset($data['latitude']) ? (float) $data['latitude'] : null,
            isset($data['longitude']) ? (float) $data['longitude'] : null,
            isset($data['region_id']) ? (int) $data['region_id'] : null
        );

        // 3. Tổng hợp thông tin chứng minh uy tín và năng lực canh tác
        $storyDetails = [];
        if (!empty($data['certifications'])) {
            $certs = is_array($data['certifications']) ? implode(', ', $data['certifications']) : $data['certifications'];
            $storyDetails[] = "Chứng nhận chất lượng: " . $certs;
        }
        if (!empty($data['cert_code'])) {
            $storyDetails[] = "Mã số chứng nhận/Cơ quan cấp: " . $data['cert_code'];
        }
        if (!empty($data['tax_id'])) {
            $storyDetails[] = "Mã số thuế/CCCD đại diện: " . $data['tax_id'];
        }
        if (!empty($data['farm_area'])) {
            $storyDetails[] = "Diện tích canh tác: " . $data['farm_area'];
        }
        if (!empty($data['farming_method'])) {
            $storyDetails[] = "Phương thức canh tác: " . $data['farming_method'];
        }
        if (!empty($data['experience_years'])) {
            $storyDetails[] = "Kinh nghiệm canh tác: " . $data['experience_years'];
        }
        if (!empty($data['scale'])) {
            $storyDetails[] = "Quy mô sản lượng: " . $data['scale'];
        }
        if (!empty($data['note'])) {
            $storyDetails[] = "Ghi chú: " . $data['note'];
        }

        $fullStory = !empty($storyDetails) ? implode("\n", $storyDetails) : ($data['note'] ?? $data['story'] ?? 'Nông trại cam kết canh tác sạch, đạt tiêu chuẩn an toàn thực phẩm.');

        // 4. Tạo hồ sơ Farmer với đầy đủ tọa độ chính xác
        return $this->farmerRepository->create([
            'user_id' => $user->id,
            'farm_name' => $data['farm_name'],
            'story' => $fullStory,
            'address' => $address,
            'region_id' => $geo['region_id'],
            'latitude' => $geo['latitude'],
            'longitude' => $geo['longitude'],
            'specialty' => $data['specialty'] ?? (!empty($data['certifications']) ? 'Chuẩn ' . (is_array($data['certifications']) ? $data['certifications'][0] : $data['certifications']) : 'Nông sản hữu cơ'),
            'rating' => 5.0,
            'is_verified' => false, // Chờ admin duyệt
            'image_url' => $data['image_url'] ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
        ]);
    }

    public function updateFarmer(string|int $id, array $data): ?\App\Models\Farmer
    {
        $farmer = $this->farmerRepository->findById($id);
        if (!$farmer) {
            return null;
        }

        $address = $data['address'] ?? $farmer->address;
        $lat = isset($data['latitude']) ? (float) $data['latitude'] : $farmer->latitude;
        $lng = isset($data['longitude']) ? (float) $data['longitude'] : $farmer->longitude;
        $regionId = isset($data['region_id']) ? (int) $data['region_id'] : $farmer->region_id;

        // Nếu địa chỉ thay đổi mà không truyền tọa độ mới, hoặc tọa độ đang trống => Tự động phân giải lại
        if ((empty($lat) || empty($lng) || (isset($data['address']) && $data['address'] !== $farmer->address && !isset($data['latitude'])))) {
            $geo = \App\Services\VietnamGeoService::resolve($address, $lat, $lng, $regionId);
            $lat = $geo['latitude'];
            $lng = $geo['longitude'];
            $regionId = $geo['region_id'];
        }

        $updateData = [];
        if (isset($data['farm_name'])) $updateData['farm_name'] = $data['farm_name'];
        if (isset($data['story'])) $updateData['story'] = $data['story'];
        if (isset($data['address'])) $updateData['address'] = $address;
        if (isset($data['specialty'])) $updateData['specialty'] = $data['specialty'];
        if (isset($data['image_url'])) $updateData['image_url'] = $data['image_url'];
        if (isset($data['is_verified'])) $updateData['is_verified'] = (bool) $data['is_verified'];
        $updateData['latitude'] = $lat;
        $updateData['longitude'] = $lng;
        $updateData['region_id'] = $regionId;

        $this->farmerRepository->update($farmer, $updateData);

        return $this->farmerRepository->findById($id);
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
