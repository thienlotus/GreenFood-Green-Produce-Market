<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_id',
        'vendor_order_id',
        'product_id',
        'variant_id',
        'product_name',
        'unit',
        'quantity',
        'price_at_time',
        'price',
    ];

    public function getPriceAttribute(): float
    {
        return (float) ($this->attributes['price_at_time'] ?? 0);
    }

    public function setPriceAttribute($value): void
    {
        $this->attributes['price_at_time'] = (float) $value;
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function vendorOrder()
    {
        return $this->belongsTo(VendorOrder::class, 'vendor_order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
