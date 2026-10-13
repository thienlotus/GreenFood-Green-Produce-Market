<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Farmer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'farm_name',
        'story',
        'address',
        'region_id',
        'latitude',
        'longitude',
        'image_url',
        'specialty',
        'rating',
        'is_verified',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'balance_available',
        'commission_rate',
        'total_sales_count',
        'ghn_province_id',
        'ghn_district_id',
        'ghn_ward_code',
        'ghn_address',
        'ghn_shop_id'
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
        'is_verified' => 'boolean',
        'balance_available' => 'float',
        'commission_rate' => 'float',
        'total_sales_count' => 'integer',
        'ghn_province_id' => 'integer',
        'ghn_district_id' => 'integer',
        'ghn_shop_id' => 'integer',
    ];

    protected $appends = [
        'registration_details',
    ];

    public function getRegistrationDetailsAttribute(): array
    {
        return self::parseRegistrationStory($this->story);
    }

    public static function parseRegistrationStory(?string $story): array
    {
        $result = [
            'certifications' => [],
            'cert_code' => '',
            'tax_id' => '',
            'farm_area' => '',
            'farming_method' => '',
            'experience_years' => '',
            'scale' => '',
            'note' => '',
            'clean_story' => '',
        ];

        if (empty($story)) {
            return $result;
        }

        $lines = explode("\n", $story);
        $remainingLines = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (empty($trimmed)) continue;

            if (preg_match('/^Chứng nhận chất lượng:\s*(.+)$/iu', $trimmed, $m)) {
                $certs = array_map('trim', explode(',', $m[1]));
                $result['certifications'] = array_values(array_filter($certs));
            } elseif (preg_match('/^Mã số chứng nhận\/Cơ quan cấp:\s*(.+)$/iu', $trimmed, $m)) {
                $result['cert_code'] = trim($m[1]);
            } elseif (preg_match('/^Mã số thuế\/CCCD đại diện:\s*(.+)$/iu', $trimmed, $m)) {
                $result['tax_id'] = trim($m[1]);
            } elseif (preg_match('/^Diện tích canh tác:\s*(.+)$/iu', $trimmed, $m)) {
                $result['farm_area'] = trim($m[1]);
            } elseif (preg_match('/^Phương thức canh tác:\s*(.+)$/iu', $trimmed, $m)) {
                $result['farming_method'] = trim($m[1]);
            } elseif (preg_match('/^Kinh nghiệm canh tác:\s*(.+)$/iu', $trimmed, $m)) {
                $result['experience_years'] = trim($m[1]);
            } elseif (preg_match('/^Quy mô sản lượng:\s*(.+)$/iu', $trimmed, $m)) {
                $result['scale'] = trim($m[1]);
            } elseif (preg_match('/^Ghi chú:\s*(.+)$/iu', $trimmed, $m)) {
                $result['note'] = trim($m[1]);
            } else {
                $remainingLines[] = $trimmed;
            }
        }

        $result['clean_story'] = implode("\n", $remainingLines);
        return $result;
    }

    public static function buildRegistrationStory(array $params, ?string $originalStory = null): string
    {
        $lines = [];
        if (!empty($params['certifications'])) {
            $certs = is_array($params['certifications']) ? implode(', ', $params['certifications']) : $params['certifications'];
            $lines[] = "Chứng nhận chất lượng: " . $certs;
        }
        if (!empty($params['cert_code'])) {
            $lines[] = "Mã số chứng nhận/Cơ quan cấp: " . trim($params['cert_code']);
        }
        if (!empty($params['tax_id'])) {
            $lines[] = "Mã số thuế/CCCD đại diện: " . trim($params['tax_id']);
        }
        if (!empty($params['farm_area'])) {
            $lines[] = "Diện tích canh tác: " . trim($params['farm_area']);
        }
        if (!empty($params['farming_method'])) {
            $lines[] = "Phương thức canh tác: " . trim($params['farming_method']);
        }
        if (!empty($params['experience_years'])) {
            $lines[] = "Kinh nghiệm canh tác: " . trim($params['experience_years']);
        }
        if (!empty($params['scale'])) {
            $lines[] = "Quy mô sản lượng: " . trim($params['scale']);
        }
        if (!empty($params['note'])) {
            $lines[] = "Ghi chú: " . trim($params['note']);
        }
        if (!empty($params['clean_story'])) {
            $lines[] = trim($params['clean_story']);
        } elseif (!empty($params['story']) && empty($lines)) {
            return trim($params['story']);
        }

        return implode("\n", $lines);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function vendorOrders()
    {
        return $this->hasMany(VendorOrder::class);
    }

    public function conversations()
    {
        return $this->hasMany(ChatConversation::class, 'farmer_id');
    }
}
