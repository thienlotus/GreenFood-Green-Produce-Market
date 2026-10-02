<?php

declare(strict_types=1);

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
        'name',
        'phone',
        'email',
        'email_verified',
        'password',
        'role',
        'avatar_url',
        'address',
    ];

    protected $casts = [
        'email_verified' => 'boolean',
    ];

    protected $appends = [
        'name',
        'avatar',
    ];

    protected $hidden = [
        'password',
    ];

    public function getNameAttribute(): string
    {
        return $this->attributes['full_name'] ?? $this->attributes['name'] ?? '';
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['full_name'] = $value;
    }

    public function getAvatarAttribute(): ?string
    {
        return $this->attributes['avatar_url'] ?? null;
    }

    public function setAvatarAttribute($value): void
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

    public function emailVerifications()
    {
        return $this->hasMany(EmailVerification::class);
    }
}
