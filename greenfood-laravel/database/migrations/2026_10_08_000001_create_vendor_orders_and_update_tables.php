<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tạo bảng vendor_orders (Tách đơn hàng theo từng Nông hộ/Vendor)
        Schema::create('vendor_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('farmer_id')->constrained('farmers')->cascadeOnDelete();
            $table->string('sub_order_number')->index();
            $table->decimal('sub_total', 15, 2)->default(0);
            $table->decimal('shipping_fee', 15, 2)->default(0);
            $table->decimal('platform_commission', 15, 2)->default(0);
            $table->decimal('net_earnings', 15, 2)->default(0);
            $table->enum('status', ['PENDING', 'CONFIRMED', 'PACKING', 'SHIPPING', 'DELIVERED', 'CANCELLED'])->default('PENDING');
            $table->string('ghn_order_code')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        // 2. Thêm vendor_order_id vào order_items để liên kết từng sản phẩm với kiện hàng nông hộ
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignUuid('vendor_order_id')->nullable()->after('order_id')->constrained('vendor_orders')->nullOnDelete();
        });

        // 3. Thêm thông tin tài chính và thanh toán đối soát vào bảng farmers
        Schema::table('farmers', function (Blueprint $table) {
            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account_number', 50)->nullable();
            $table->string('bank_account_name', 100)->nullable();
            $table->decimal('balance_available', 15, 2)->default(0);
            $table->decimal('commission_rate', 5, 2)->default(8.00);
            $table->unsignedInteger('total_sales_count')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('farmers', function (Blueprint $table) {
            $table->dropColumn([
                'bank_name',
                'bank_account_number',
                'bank_account_name',
                'balance_available',
                'commission_rate',
                'total_sales_count'
            ]);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['vendor_order_id']);
            $table->dropColumn('vendor_order_id');
        });

        Schema::dropIfExists('vendor_orders');
    }
};
