<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tracking_number',
        'ghn_order_code',
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'shipping_address',
        'to_district_id',
        'to_ward_code',
        'shipping_zone_id',
        'shipping_fee',
        'total_amount',
        'status',
        'shipping_status',
        'payment_method',
        'payment_status',
        'note',
        'shipper_name',
        'shipper_phone',
        'shipper_lat',
        'shipper_lng',
        'dest_lat',
        'dest_lng',
        // Aliases theo bài lab
        'name',
        'phone',
        'address',
        'total_price',
        'ghn_total_fee',
    ];

    protected $casts = [
        'shipping_fee' => 'float',
        'total_amount' => 'float',
        'shipper_lat' => 'float',
        'shipper_lng' => 'float',
        'dest_lat' => 'float',
        'dest_lng' => 'float',
    ];

    // Alias getters & setters để tương thích cả code bài lab và code hiện tại
    public function getNameAttribute(): ?string
    {
        return $this->attributes['customer_name'] ?? null;
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['customer_name'] = $value;
    }

    public function getPhoneAttribute(): ?string
    {
        return $this->attributes['customer_phone'] ?? null;
    }

    public function setPhoneAttribute($value): void
    {
        $this->attributes['customer_phone'] = $value;
    }

    public function getAddressAttribute(): ?string
    {
        return $this->attributes['shipping_address'] ?? null;
    }

    public function setAddressAttribute($value): void
    {
        $this->attributes['shipping_address'] = $value;
    }

    public function getTotalPriceAttribute(): float
    {
        return (float) ($this->attributes['total_amount'] ?? 0);
    }

    public function setTotalPriceAttribute($value): void
    {
        $this->attributes['total_amount'] = (float) $value;
    }

    public function getGhnTotalFeeAttribute(): float
    {
        return (float) ($this->attributes['shipping_fee'] ?? 0);
    }

    public function setGhnTotalFeeAttribute($value): void
    {
        $this->attributes['shipping_fee'] = (float) $value;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shippingZone(): BelongsTo
    {
        return $this->belongsTo(ShippingZone::class, 'shipping_zone_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function vendorOrders()
    {
        return $this->hasMany(VendorOrder::class);
    }

    public function paymentTransaction()
    {
        return $this->hasOne(PaymentTransaction::class)->latestOfMany();
    }
}
