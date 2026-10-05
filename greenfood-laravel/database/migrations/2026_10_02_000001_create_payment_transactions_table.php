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
        if (!Schema::hasTable('payment_transactions')) {
            Schema::create('payment_transactions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
                $table->string('payment_method')->default('MOMO');
                $table->string('transaction_id')->nullable();
                $table->decimal('amount', 15, 2);
                $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
                $table->string('momo_request_id')->nullable();
                $table->string('momo_trans_id')->nullable();
                $table->json('response_data')->nullable();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('orders') && !Schema::hasColumn('orders', 'payment_status')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('payment_status')->default('unpaid')->after('payment_method');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');

        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'payment_status')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('payment_status');
            });
        }
    }
};
