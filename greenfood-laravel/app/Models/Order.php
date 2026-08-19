<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tracking_number',
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'shipping_address',
        'shipping_zone_id',
        'shipping_fee',
        'total_amount',
        'status',
        'payment_method',
        'note',
        'shipper_name',
        'shipper_phone',
        'shipper_lat',
        'shipper_lng',
        'dest_lat',
        'dest_lng'
    ];

    protected $casts = [
        'shipping_fee' => 'float',
        'total_amount' => 'float',
        'shipper_lat' => 'float',
        'shipper_lng' => 'float',
        'dest_lat' => 'float',
        'dest_lng' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shippingZone()
    {
        return $this->belongsTo(ShippingZone::class, 'shipping_zone_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
