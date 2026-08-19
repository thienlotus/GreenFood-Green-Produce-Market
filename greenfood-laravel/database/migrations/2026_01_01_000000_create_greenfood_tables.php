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
            $table->string('zone')->default('south'); // north, central, south
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 3. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->string('banner_image')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->timestamps();
        });

        // 4. Farmers (Nông hộ & Tọa độ GIS)
        Schema::create('farmers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('farm_name');
            $table->text('story')->nullable();
            $table->string('address');
            $table->foreignId('region_id')->constrained('regions');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('image_url')->nullable();
            $table->string('specialty')->nullable();
            $table->decimal('rating', 3, 2)->default(5.0);
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
            $table->string('image_url')->nullable();
            $table->string('badge')->nullable();
            $table->integer('sold_count')->default(0);
            $table->decimal('rating', 3, 2)->default(5.0);
            $table->boolean('is_seasonal')->default(false);
            $table->string('harvest_season')->nullable();
            $table->timestamps();
        });

        // 6. Product Variants
        Schema::create('product_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('unit'); // kg, hộp, trái
            $table->decimal('price', 15, 2);
            $table->decimal('compare_at_price', 15, 2)->nullable();
            $table->integer('stock_quantity')->default(100);
            $table->string('sku')->unique()->nullable();
            $table->timestamps();
        });

        // 7. Shipping Zones (Quản lý Phí Vận Chuyển)
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->string('id')->primary(); // SZ001, SZ002...
            $table->string('name');
            $table->text('provinces');
            $table->decimal('base_fee', 15, 2)->default(0);
            $table->decimal('extra_fee_per_kg', 15, 2)->default(0);
            $table->decimal('free_ship_minimum', 15, 2)->default(0);
            $table->string('estimated_days')->default('1-2 ngày');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 8. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('tracking_number')->unique();
            $table->foreignUuid('user_id')->nullable()->constrained('users');
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->text('shipping_address');
            $table->string('shipping_zone_id')->nullable()->constrained('shipping_zones');
            $table->decimal('shipping_fee', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'])->default('PENDING');
            $table->enum('payment_method', ['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY'])->default('COD');
            $table->text('note')->nullable();
            $table->string('shipper_name')->nullable();
            $table->string('shipper_phone')->nullable();
            $table->decimal('shipper_lat', 10, 7)->nullable();
            $table->decimal('shipper_lng', 10, 7)->nullable();
            $table->decimal('dest_lat', 10, 7)->nullable();
            $table->decimal('dest_lng', 10, 7)->nullable();
            $table->timestamps();
        });

        // 9. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained('products');
            $table->foreignUuid('variant_id')->nullable()->constrained('product_variants');
            $table->string('product_name');
            $table->string('unit');
            $table->integer('quantity');
            $table->decimal('price_at_time', 15, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('shipping_zones');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('farmers');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('regions');
        Schema::dropIfExists('users');
    }
};
