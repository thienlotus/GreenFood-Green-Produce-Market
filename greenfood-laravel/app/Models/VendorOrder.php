<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorOrder extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'vendor_orders';

    protected $fillable = [
        'order_id',
        'farmer_id',
        'sub_order_number',
        'sub_total',
        'shipping_fee',
        'platform_commission',
        'net_earnings',
        'status',
        'ghn_order_code',
        'note',
    ];

    protected $casts = [
        'sub_total' => 'float',
        'shipping_fee' => 'float',
        'platform_commission' => 'float',
        'net_earnings' => 'float',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'vendor_order_id');
    }
}
