<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $otpCode,
        public readonly string $recipientName = 'Quý khách',
        public readonly int $expiresInMinutes = 10
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                (string) config('mail.from.address', '0912lethieuhung@gmail.com'),
                (string) config('mail.from.name', 'GreenFood - Chợ Nông Sản Sạch')
            ),
            subject: "[GreenFood] Mã xác thực OTP: {$this->otpCode} - Kích hoạt tài khoản (" . date('H:i') . ")",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification-code',
            with: [
                'otpCode' => $this->otpCode,
                'recipientName' => $this->recipientName,
                'expiresInMinutes' => $this->expiresInMinutes,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
