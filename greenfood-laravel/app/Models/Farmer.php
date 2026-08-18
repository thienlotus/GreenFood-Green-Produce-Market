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
        'rating',
        'is_verified'
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
}
