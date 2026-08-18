<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description'];

    public function farmers()
    {
        return $this->hasMany(Farmer::class);
    }
}
