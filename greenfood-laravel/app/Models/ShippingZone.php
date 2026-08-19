<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'provinces',
        'base_fee',
        'extra_fee_per_kg',
        'free_ship_minimum',
        'estimated_days',
        'is_active',
    ];

    protected $casts = [
        'base_fee' => 'float',
        'extra_fee_per_kg' => 'float',
        'free_ship_minimum' => 'float',
        'is_active' => 'boolean',
    ];
}
