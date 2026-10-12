<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('b2b_inquiries', function (Blueprint $table) {
            $table->text('client_response')->nullable()->after('admin_notes');
            $table->string('assigned_staff')->nullable()->after('client_response');
            $table->timestamp('responded_at')->nullable()->after('assigned_staff');
        });
    }

    public function down(): void
    {
        Schema::table('b2b_inquiries', function (Blueprint $table) {
            $table->dropColumn(['client_response', 'assigned_staff', 'responded_at']);
        });
    }
};
