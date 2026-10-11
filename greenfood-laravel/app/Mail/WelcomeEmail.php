<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $recipientName = 'Quý khách',
        public readonly string $voucherCode = 'CHAOBANMOI',
        public readonly int $voucherDiscount = 50000,
        public readonly int $minOrder = 200000
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                (string) config('mail.from.address', '0912lethieuhung@gmail.com'),
                (string) config('mail.from.name', 'GreenFood - Nông Sản Sạch Việt Nam')
            ),
            subject: "🌿 Chào mừng {$this->recipientName} đến với GreenFood — Tặng bạn Voucher " . number_format($this->voucherDiscount, 0, ',', '.') . "đ!",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
            with: [
                'recipientName' => $this->recipientName,
                'voucherCode' => $this->voucherCode,
                'voucherDiscount' => $this->voucherDiscount,
                'minOrder' => $this->minOrder,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
