<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('product_id')->index();
            $table->string('user_id')->nullable()->index();
            $table->string('user_name');
            $table->string('user_avatar')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->text('comment');
            $table->string('variant_info')->nullable();
            $table->string('product_quality')->nullable();
            $table->string('match_description')->nullable();
            $table->string('taste_experience')->nullable();
            
            // Video review fields (Shopee style)
            $table->text('video_url')->nullable();
            $table->text('video_thumbnail')->nullable();
            $table->string('video_duration')->nullable();
            
            // Photos and tags
            $table->json('images')->nullable();
            $table->json('tags')->nullable();
            
            // Interactions & seller feedback
            $table->unsignedInteger('likes_count')->default(0);
            $table->text('seller_reply')->nullable();
            $table->timestamp('seller_reply_at')->nullable();
            $table->boolean('is_verified_purchase')->default(true);
            $table->boolean('is_anonymous')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
