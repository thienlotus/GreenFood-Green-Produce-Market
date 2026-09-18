<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasUuids;

    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'password',
        'role',
        'avatar_url',
    ];

    protected $hidden = [
        'password',
    ];

    protected $appends = [
        'name',
        'avatar',
    ];

    public function getNameAttribute()
    {
        return $this->attributes['full_name'] ?? null;
    }

    public function setNameAttribute($value)
    {
        $this->attributes['full_name'] = $value;
    }

    public function getAvatarAttribute()
    {
        return $this->attributes['avatar_url'] ?? null;
    }

    public function setAvatarAttribute($value)
    {
        $this->attributes['avatar_url'] = $value;
    }

    public function farmer()
    {
        return $this->hasOne(Farmer::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
