<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('b2b_inquiries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('inquiry_code', 32)->unique();
            $table->string('company_name');
            $table->string('contact_name');
            $table->string('phone', 20);
            $table->string('email')->nullable();
            $table->string('tax_id', 30)->nullable();
            $table->string('business_type');
            $table->json('categories')->nullable();
            $table->string('estimated_volume')->nullable();
            $table->string('delivery_time')->nullable();
            $table->string('address')->nullable();
            $table->text('note')->nullable();
            $table->enum('status', ['PENDING', 'CONTACTED', 'CONTRACTED', 'CANCELLED'])->default('PENDING');
            $table->text('admin_notes')->nullable();
            $table->timestamp('contacted_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('phone');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('b2b_inquiries');
    }
};
