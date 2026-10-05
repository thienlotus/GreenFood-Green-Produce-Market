<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Mail\VerificationCodeMail;
use App\Models\EmailVerification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_registration_creates_pending_otp_and_sends_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/register', [
            'name' => 'Lê Thiều Hưng',
            'email' => 'lethieuhung@greenfood.vn',
            'phone' => '0912345678',
            'password' => 'secret123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('require_otp', true)
            ->assertJsonPath('data.email_verified', false);

        $this->assertDatabaseHas('users', [
            'email' => 'lethieuhung@greenfood.vn',
            'email_verified' => false,
        ]);

        $this->assertDatabaseHas('email_verifications', [
            'email' => 'lethieuhung@greenfood.vn',
            'verified_at' => null,
        ]);

        Mail::assertSent(VerificationCodeMail::class, function ($mail) {
            return $mail->hasTo('lethieuhung@greenfood.vn');
        });
    }

    public function test_verify_email_success_with_correct_otp(): void
    {
        Mail::fake();

        // 1. Đăng ký
        $regResponse = $this->postJson('/api/register', [
            'name' => 'Nguyễn Khách Hàng',
            'email' => 'customer@greenfood.vn',
            'phone' => '0987654321',
            'password' => 'password123',
        ]);
        $regResponse->assertStatus(201);

        $verification = EmailVerification::where('email', 'customer@greenfood.vn')->latest()->first();
        $this->assertNotNull($verification);

        // 2. Xác thực với OTP đúng
        $verifyResponse = $this->postJson('/api/verify-email', [
            'email' => 'customer@greenfood.vn',
            'otp_code' => $verification->otp_code,
        ]);

        $verifyResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email_verified', true);

        $this->assertDatabaseHas('users', [
            'email' => 'customer@greenfood.vn',
            'email_verified' => true,
        ]);

        $verification->refresh();
        $this->assertNotNull($verification->verified_at);
    }

    public function test_verify_email_fails_with_invalid_otp(): void
    {
        Mail::fake();

        $this->postJson('/api/register', [
            'name' => 'Khách Hàng Sai OTP',
            'email' => 'wrongotp@greenfood.vn',
            'phone' => '0933112233',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/verify-email', [
            'email' => 'wrongotp@greenfood.vn',
            'otp_code' => '000000',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('users', [
            'email' => 'wrongotp@greenfood.vn',
            'email_verified' => false,
        ]);
    }

    public function test_verify_email_fails_when_otp_expired(): void
    {
        Mail::fake();

        $this->postJson('/api/register', [
            'name' => 'Khách Hàng Hết Hạn',
            'email' => 'expired@greenfood.vn',
            'phone' => '0944556677',
            'password' => 'password123',
        ]);

        $verification = EmailVerification::where('email', 'expired@greenfood.vn')->latest()->first();
        // Giả lập mã OTP đã hết hạn 15 phút trước
        $verification->update([
            'expires_at' => Carbon::now()->subMinutes(15),
        ]);

        $response = $this->postJson('/api/verify-email', [
            'email' => 'expired@greenfood.vn',
            'otp_code' => $verification->otp_code,
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('success', false);
    }

    public function test_resend_otp_and_rate_limiting(): void
    {
        Mail::fake();

        $this->postJson('/api/register', [
            'name' => 'Khách Thử Gửi Lại',
            'email' => 'resend@greenfood.vn',
            'phone' => '0966778899',
            'password' => 'password123',
        ]);

        // Lần 1: đã có 1 OTP lúc đăng ký
        // Lần 2: resend lần 1 (tổng 2 lần) -> thành công
        $res1 = $this->postJson('/api/resend-otp', ['email' => 'resend@greenfood.vn']);
        $res1->assertStatus(200)->assertJsonPath('success', true);

        // Lần 3: resend lần 2 (tổng 3 lần) -> thành công
        $res2 = $this->postJson('/api/resend-otp', ['email' => 'resend@greenfood.vn']);
        $res2->assertStatus(200)->assertJsonPath('success', true);

        // Lần 4: resend lần 3 (vượt quá 3 lần / 15 phút) -> bị chặn 429
        $res3 = $this->postJson('/api/resend-otp', ['email' => 'resend@greenfood.vn']);
        $res3->assertStatus(429)
            ->assertJsonPath('success', false);
    }

    public function test_unverified_user_cannot_login(): void
    {
        Mail::fake();

        $this->postJson('/api/register', [
            'name' => 'Khách Chưa Kích Hoạt',
            'email' => 'unverified@greenfood.vn',
            'phone' => '0911223344',
            'password' => 'password123',
        ]);

        // Đăng nhập khi chưa xác thực OTP
        $response = $this->postJson('/api/login', [
            'account' => 'unverified@greenfood.vn',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('require_otp', true)
            ->assertJsonPath('email', 'unverified@greenfood.vn');
    }
}
