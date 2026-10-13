<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerComplaint extends Model
{
    protected $table = 'customer_complaints';

    protected $fillable = [
        'complaint_code',
        'order_code',
        'customer_name',
        'phone',
        'reason',
        'description',
        'resolution_type',
        'status',
        'admin_notes',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
