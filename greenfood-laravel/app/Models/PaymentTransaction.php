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

    public function setGatewayOrderIdAttribute($value): void
    {
        $this->attributes['gateway_order_id'] = $value;
        if (!isset($this->attributes['transaction_id']) || empty($this->attributes['transaction_id'])) {
            $this->attributes['transaction_id'] = $value;
        }
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

    protected static function booted(): void
    {
        static::saving(function ($model) {
            try {
                if (\Illuminate\Support\Facades\Schema::hasTable('payment_transactions')) {
                    // Nếu DB trên hosting thiếu cột gateway, tự động bổ sung ngay
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_transactions', 'gateway')) {
                        try {
                            \Illuminate\Support\Facades\Schema::table('payment_transactions', function ($table) {
                                if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_transactions', 'gateway')) {
                                    $table->string('gateway')->default('momo')->after('order_id');
                                }
                                if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_transactions', 'gateway_order_id')) {
                                    $table->string('gateway_order_id')->nullable()->index()->after('gateway');
                                }
                                if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_transactions', 'result_code')) {
                                    $table->integer('result_code')->nullable()->after('status');
                                }
                                if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_transactions', 'message')) {
                                    $table->string('message')->nullable()->after('result_code');
                                }
                                if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_transactions', 'request_payload')) {
                                    $table->json('request_payload')->nullable()->after('message');
                                }
                                if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_transactions', 'response_payload')) {
                                    $table->json('response_payload')->nullable()->after('request_payload');
                                }
                                if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_transactions', 'paid_at')) {
                                    $table->timestamp('paid_at')->nullable()->after('response_payload');
                                }
                            });
                        } catch (\Throwable $migErr) {
                            // Fallback nếu không có quyền ALTER: loại bỏ các cột không tồn tại khỏi attributes
                            $tableColumns = \Illuminate\Support\Facades\Schema::getColumnListing('payment_transactions');
                            if (!empty($tableColumns)) {
                                foreach (array_keys($model->attributes) as $key) {
                                    if (!in_array($key, $tableColumns)) {
                                        unset($model->attributes[$key]);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Tránh throw exception làm gián đoạn thanh toán
            }
        });
    }
}
