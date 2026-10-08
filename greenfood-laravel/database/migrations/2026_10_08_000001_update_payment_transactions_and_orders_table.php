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
        if (Schema::hasTable('payment_transactions')) {
            Schema::table('payment_transactions', function (Blueprint $table) {
                if (!Schema::hasColumn('payment_transactions', 'gateway')) {
                    $table->string('gateway')->default('momo')->after('order_id');
                }
                if (!Schema::hasColumn('payment_transactions', 'gateway_order_id')) {
                    $table->string('gateway_order_id')->nullable()->index()->after('gateway');
                }
                if (!Schema::hasColumn('payment_transactions', 'result_code')) {
                    $table->integer('result_code')->nullable()->after('status');
                }
                if (!Schema::hasColumn('payment_transactions', 'message')) {
                    $table->string('message')->nullable()->after('result_code');
                }
                if (!Schema::hasColumn('payment_transactions', 'request_payload')) {
                    $table->json('request_payload')->nullable()->after('message');
                }
                if (!Schema::hasColumn('payment_transactions', 'response_payload')) {
                    $table->json('response_payload')->nullable()->after('request_payload');
                }
                if (!Schema::hasColumn('payment_transactions', 'paid_at')) {
                    $table->timestamp('paid_at')->nullable()->after('response_payload');
                }
            });
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'shipping_status')) {
                    $table->string('shipping_status')->default('pending')->after('status');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('payment_transactions')) {
            Schema::table('payment_transactions', function (Blueprint $table) {
                $columns = ['gateway', 'gateway_order_id', 'result_code', 'message', 'request_payload', 'response_payload', 'paid_at'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('payment_transactions', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'shipping_status')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('shipping_status');
            });
        }
    }
};
