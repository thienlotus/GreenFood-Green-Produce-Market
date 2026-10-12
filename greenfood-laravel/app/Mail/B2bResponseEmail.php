<?php

declare(strict_types=1);

namespace App\Mail;

use App\Modules\B2B\Models\B2bInquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class B2bResponseEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly B2bInquiry $inquiry,
        public readonly string $responseMessage,
        public readonly string $specialistName = 'Chuyên viên B2B GreenFood'
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                (string) config('mail.from.address', 'b2b@greenfood.vn'),
                (string) config('mail.from.name', 'GreenFood B2B - Cung Ứng Nông Sản Doanh Nghiệp')
            ),
            subject: "🌿 [GreenFood B2B] Phản hồi tư vấn & Báo giá sỉ hồ sơ #{$this->inquiry->inquiry_code} - {$this->inquiry->company_name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.b2b-response',
            with: [
                'inquiry' => $this->inquiry,
                'responseMessage' => $this->responseMessage,
                'specialistName' => $this->specialistName,
            ]
        );
    }
}
