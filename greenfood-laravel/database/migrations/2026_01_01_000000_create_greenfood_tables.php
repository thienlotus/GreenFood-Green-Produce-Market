<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Users
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('full_name');
            $table->string('phone')->unique();
            $table->string('email')->nullable()->unique();
            $table->string('password');
            $table->enum('role', ['CUSTOMER', 'VENDOR', 'ADMIN'])->default('CUSTOMER');
            $table->string('avatar_url')->nullable();
            $table->timestamps();
        });

        // 2. Regions
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 3. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->timestamps();
        });

        // 4. Farmers
        Schema::create('farmers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('farm_name');
            $table->text('story')->nullable();
            $table->string('address');
            $table->foreignId('region_id')->constrained('regions');
            $table->decimal('rating', 3, 2)->default(0);
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
        });

        // 5. Products
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('farmer_id')->constrained('farmers')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->boolean('is_seasonal')->default(false);
            $table->string('harvest_season')->nullable(); // e.g. "Tháng 5 - Tháng 8"
            $table->timestamps();
        });

        // 6. Product Variants
        Schema::create('product_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('unit'); // kg, hộp, túi
            $table->decimal('price', 15, 2);
            $table->decimal('compare_at_price', 15, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->string('sku')->unique()->nullable();
            $table->timestamps();
        });

        // 7. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users');
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'])->default('PENDING');
            $table->enum('payment_method', ['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY'])->default('COD');
            $table->text('shipping_address');
            $table->string('tracking_number')->nullable();
            $table->timestamps();
        });

        // 8. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('variant_id')->constrained('product_variants');
            $table->integer('quantity');
            $table->decimal('price_at_time', 15, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('farmers');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('regions');
        Schema::dropIfExists('users');
    }
};
