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
        if (Schema::hasTable('farmers')) {
            Schema::table('farmers', function (Blueprint $table) {
                if (!Schema::hasColumn('farmers', 'ghn_province_id')) {
                    $table->integer('ghn_province_id')->nullable()->after('longitude');
                }
                if (!Schema::hasColumn('farmers', 'ghn_district_id')) {
                    $table->integer('ghn_district_id')->nullable()->after('ghn_province_id');
                }
                if (!Schema::hasColumn('farmers', 'ghn_ward_code')) {
                    $table->string('ghn_ward_code', 30)->nullable()->after('ghn_district_id');
                }
                if (!Schema::hasColumn('farmers', 'ghn_address')) {
                    $table->string('ghn_address')->nullable()->after('ghn_ward_code');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('farmers')) {
            Schema::table('farmers', function (Blueprint $table) {
                $columns = ['ghn_province_id', 'ghn_district_id', 'ghn_ward_code', 'ghn_address'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('farmers', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
