<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    use HasFactory;

    protected $table = 'product_reviews';

    protected $fillable = [
        'product_id',
        'user_id',
        'user_name',
        'user_avatar',
        'rating',
        'comment',
        'variant_info',
        'product_quality',
        'match_description',
        'taste_experience',
        'video_url',
        'video_thumbnail',
        'video_duration',
        'images',
        'tags',
        'likes_count',
        'seller_reply',
        'seller_reply_at',
        'is_verified_purchase',
        'is_anonymous',
    ];

    protected $casts = [
        'rating' => 'integer',
        'likes_count' => 'integer',
        'images' => 'array',
        'tags' => 'array',
        'is_verified_purchase' => 'boolean',
        'is_anonymous' => 'boolean',
        'seller_reply_at' => 'datetime',
    ];

    /**
     * Relationship to Product
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    /**
     * Relationship to User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
