<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'payment_transactions';

    protected $fillable = [
        'order_id',
        'payment_method',
        'transaction_id',
        'amount',
        'status',
        'momo_request_id',
        'momo_trans_id',
        'response_data',
    ];

    protected $casts = [
        'amount' => 'float',
        'response_data' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
