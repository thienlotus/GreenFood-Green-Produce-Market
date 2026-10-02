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

