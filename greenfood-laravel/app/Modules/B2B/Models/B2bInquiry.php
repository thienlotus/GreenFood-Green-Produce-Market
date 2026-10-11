<?php

declare(strict_types=1);

namespace App\Modules\B2B\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class B2bInquiry extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'b2b_inquiries';

    protected $fillable = [
        'inquiry_code',
        'company_name',
        'contact_name',
        'phone',
        'email',
        'tax_id',
        'business_type',
        'categories',
        'estimated_volume',
        'delivery_time',
        'address',
        'note',
        'status',
        'admin_notes',
        'contacted_at',
    ];

    protected $casts = [
        'categories' => 'array',
        'contacted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Tự động sinh mã phiếu định dạng B2B-YYYYMMDD-XXXX
     */
    public static function generateInquiryCode(): string
    {
        $dateStr = date('Ymd');
        $random = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
        return "B2B-{$dateStr}-{$random}";
    }
}
