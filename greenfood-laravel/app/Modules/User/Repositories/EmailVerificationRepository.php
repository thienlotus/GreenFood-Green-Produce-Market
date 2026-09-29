<?php

declare(strict_types=1);

namespace App\Modules\User\Repositories;

use App\Models\EmailVerification;
use Carbon\Carbon;

class EmailVerificationRepository
{
    public function createVerification(?string $userId, string $email, string $otpCode, int $expiresInMinutes = 10): EmailVerification
    {
        return EmailVerification::create([
            'user_id' => $userId,
            'email' => strtolower(trim($email)),
            'otp_code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes($expiresInMinutes),
            'verified_at' => null,
        ]);
    }

    public function findLatestPending(string $email): ?EmailVerification
    {
        return EmailVerification::where('email', strtolower(trim($email)))
            ->whereNull('verified_at')
            ->latest('created_at')
            ->first();
    }

    public function markAsVerified(EmailVerification $verification): bool
    {
        return $verification->update([
            'verified_at' => Carbon::now(),
        ]);
    }

    public function getRecentAttemptsCount(string $email, int $withinMinutes = 15): int
    {
        return EmailVerification::where('email', strtolower(trim($email)))
            ->where('created_at', '>=', Carbon::now()->subMinutes($withinMinutes))
            ->count();
    }

    public function invalidatePreviousPending(string $email): void
    {
        EmailVerification::where('email', strtolower(trim($email)))
            ->whereNull('verified_at')
            ->update([
                'expires_at' => Carbon::now()->subSecond(),
            ]);
    }
}
