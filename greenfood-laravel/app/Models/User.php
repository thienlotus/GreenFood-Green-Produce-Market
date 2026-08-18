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

    public function farmer()
    {
        return $this->hasOne(Farmer::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
