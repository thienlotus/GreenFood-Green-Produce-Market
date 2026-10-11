<?php

declare(strict_types=1);

namespace App\Mail;

use App\Modules\B2B\Models\B2bInquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class B2bConfirmationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public B2bInquiry $inquiry
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🌿 [GreenFood B2B] Xác nhận tiếp nhận hồ sơ đăng ký đối tác #{$this->inquiry->inquiry_code}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.b2b-confirmation',
            with: [
                'inquiry' => $this->inquiry,
                'trackingUrl' => config('app.url', 'http://localhost:3000') . '/b2b',
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
