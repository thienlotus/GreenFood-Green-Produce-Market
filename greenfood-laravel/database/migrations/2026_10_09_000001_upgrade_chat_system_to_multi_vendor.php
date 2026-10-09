<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Nâng cấp chat_conversations để hỗ trợ mô hình Chat Multi-Vendor (Khách <-> Shop, Shop <-> Admin)
        Schema::table('chat_conversations', function (Blueprint $table) {
            $table->foreignUuid('farmer_id')->nullable()->after('admin_id')->constrained('farmers')->cascadeOnDelete();
            $table->string('type', 30)->default('customer_admin')->after('farmer_id'); // customer_admin, customer_farmer, farmer_admin
            $table->foreignUuid('product_id')->nullable()->after('type')->constrained('products')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('chat_conversations', function (Blueprint $table) {
            $table->dropForeign(['farmer_id']);
            $table->dropForeign(['product_id']);
            $table->dropColumn(['farmer_id', 'type', 'product_id']);
        });
    }
};
