<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Services\MojibakeHealerService;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Chuẩn hóa sạch 6 vùng giao hàng chính
        $standardZones = [
            'SZ001' => [
                'name' => 'Nội thành TP.HCM',
                'provinces' => 'TP. Hồ Chí Minh (Quận 1-12, Bình Thạnh, Gò Vấp, Phú Nhuận, Tân Bình, Tân Phú)',
                'estimated_days' => '1-2 giờ',
            ],
            'SZ002' => [
                'name' => 'Ngoại thành TP.HCM',
                'provinces' => 'TP. Hồ Chí Minh (Củ Chi, Hóc Môn, Bình Chánh, Nhà Bè, Cần Giờ)',
                'estimated_days' => '2-4 giờ',
            ],
            'SZ003' => [
                'name' => 'Đồng Bằng Sông Cửu Long',
                'provinces' => 'Bến Tre, Vĩnh Long, Đồng Tháp, Tiền Giang, Cần Thơ, An Giang, Long An',
                'estimated_days' => '1-2 ngày',
            ],
            'SZ004' => [
                'name' => 'Miền Đông Nam Bộ',
                'provinces' => 'Bình Dương, Đồng Nai, Bà Rịa - Vũng Tàu, Tây Ninh, Bình Phước',
                'estimated_days' => '1-2 ngày',
            ],
            'SZ005' => [
                'name' => 'Tây Nguyên & Miền Trung',
                'provinces' => 'Đà Lạt, Lâm Đồng, Đắk Lắk, Đà Nẵng, Huế, Quảng Nam, Bình Định',
                'estimated_days' => '2-3 ngày',
            ],
            'SZ006' => [
                'name' => 'Miền Bắc',
                'provinces' => 'Hà Nội, Hải Phòng, Quảng Ninh, Nam Định, Ninh Bình, Hà Nam',
                'estimated_days' => '3-5 ngày',
            ],
        ];

        foreach ($standardZones as $id => $data) {
            DB::table('shipping_zones')->where('id', $id)->update($data);
        }

        // 2. Quét qua toàn bộ records còn lại của shipping_zones nếu có dính mojibake
        $allZones = DB::table('shipping_zones')->get();
        foreach ($allZones as $zone) {
            $nameClean = MojibakeHealerService::clean($zone->name);
            $provClean = MojibakeHealerService::clean($zone->provinces);
            $estClean = MojibakeHealerService::clean($zone->estimated_days);

            if ($nameClean !== $zone->name || $provClean !== $zone->provinces || $estClean !== $zone->estimated_days) {
                DB::table('shipping_zones')->where('id', $zone->id)->update([
                    'name' => $nameClean,
                    'provinces' => $provClean,
                    'estimated_days' => $estClean,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Không hoàn tác dữ liệu lỗi font
    }
};
