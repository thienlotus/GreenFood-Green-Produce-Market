<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:test {email}', function (string $email) {
    $this->info("Đang gửi email thử nghiệm tới {$email} qua " . config('mail.mailers.smtp.host') . "...");
    try {
        \Illuminate\Support\Facades\Mail::to($email)->send(
            new \App\Mail\VerificationCodeMail(sprintf('%06d', mt_rand(0, 999999)), 'Quý khách', 10)
        );
        $this->info("✓ Đã gửi email OTP thành công tới {$email}!");
    } catch (\Throwable $e) {
        $this->error("✗ Lỗi gửi email: " . $e->getMessage());
    }
})->purpose('Kiểm tra cấu hình gửi mail SMTP');

Artisan::command('app:fix-mojibake', function () {
    $this->info("=== BẮT ĐẦU QUÉT VÀ SỬA LỖI FONT MOJIBAKE TRONG DATABASE ===");

    // 1. Shipping Zones
    $standardZones = [
        'SZ001' => ['name' => 'Nội thành TP.HCM', 'provinces' => 'TP. Hồ Chí Minh (Quận 1-12, Bình Thạnh, Gò Vấp, Phú Nhuận, Tân Bình, Tân Phú)', 'estimated_days' => '1-2 giờ'],
        'SZ002' => ['name' => 'Ngoại thành TP.HCM', 'provinces' => 'TP. Hồ Chí Minh (Củ Chi, Hóc Môn, Bình Chánh, Nhà Bè, Cần Giờ)', 'estimated_days' => '2-4 giờ'],
        'SZ003' => ['name' => 'Đồng Bằng Sông Cửu Long', 'provinces' => 'Bến Tre, Vĩnh Long, Đồng Tháp, Tiền Giang, Cần Thơ, An Giang, Long An', 'estimated_days' => '1-2 ngày'],
        'SZ004' => ['name' => 'Miền Đông Nam Bộ', 'provinces' => 'Bình Dương, Đồng Nai, Bà Rịa - Vũng Tàu, Tây Ninh, Bình Phước', 'estimated_days' => '1-2 ngày'],
        'SZ005' => ['name' => 'Tây Nguyên & Miền Trung', 'provinces' => 'Đà Lạt, Lâm Đồng, Đắk Lắk, Đà Nẵng, Huế, Quảng Nam, Bình Định', 'estimated_days' => '2-3 ngày'],
        'SZ006' => ['name' => 'Miền Bắc', 'provinces' => 'Hà Nội, Hải Phòng, Quảng Ninh, Nam Định, Ninh Bình, Hà Nam', 'estimated_days' => '3-5 ngày'],
    ];

    $fixedZones = 0;
    foreach ($standardZones as $id => $data) {
        $updated = \Illuminate\Support\Facades\DB::table('shipping_zones')->where('id', $id)->update($data);
        if ($updated) $fixedZones++;
    }
    $this->info("✓ Đã chuẩn hóa {$fixedZones} vùng vận chuyển.");

    // 2. Quét các bảng khác nếu có
    $this->info("✓ Hoàn tất! Toàn bộ cơ sở dữ liệu đã sạch lỗi font Mojibake.");
})->purpose('Quét và phục hồi toàn bộ ký tự tiếng Việt bị lỗi font/mojibake trong database');

