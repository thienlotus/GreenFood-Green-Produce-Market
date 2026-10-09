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
