<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'payment_transactions';

    protected $fillable = [
        'order_id',
        'gateway',
        'gateway_order_id',
        'transaction_id',
        'amount',
        'status',
        'result_code',
        'message',
        'request_payload',
        'response_payload',
        'paid_at',
        // Giữ tương thích ngược
        'payment_method',
        'momo_request_id',
        'momo_trans_id',
        'response_data',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'request_payload' => 'array',
            'response_payload' => 'array',
            'response_data' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    // Tự động đồng bộ payment_method khi cập nhật gateway và ngược lại
    public function setGatewayAttribute($value): void
    {
        $this->attributes['gateway'] = $value;
        $this->attributes['payment_method'] = strtoupper($value);
    }

    public function setResponsePayloadAttribute($value): void
    {
        $json = is_array($value) ? json_encode($value) : $value;
        $this->attributes['response_payload'] = $json;
        $this->attributes['response_data'] = $json;
    }
}
