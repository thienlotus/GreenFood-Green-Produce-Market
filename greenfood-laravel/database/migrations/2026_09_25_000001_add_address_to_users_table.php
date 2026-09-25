<?php

declare(strict_types=1);

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
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'address')) {
            Schema::table('users', function (Blueprint $table) {
                $table->text('address')->nullable()->after('avatar_url');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'address')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('address');
            });
        }
    }
};
