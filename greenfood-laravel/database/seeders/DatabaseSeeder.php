<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. Regions
        $regionId = DB::table('regions')->insertGetId([
            'name' => 'Đồng Bằng Sông Cửu Long',
            'slug' => 'dong-bang-song-cuu-long',
            'description' => 'Vựa trái cây lớn nhất cả nước',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Categories
        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Trái cây nhiệt đới',
            'slug' => 'trai-cay-nhiet-doi',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. User (Vendor)
        $userId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $userId,
            'full_name' => 'Nguyễn Văn Ba',
            'phone' => '0901234567',
            'email' => 'chuba@greenfood.vn',
            'password' => Hash::make('password123'),
            'role' => 'VENDOR',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Farmer
        $farmerId = (string) Str::uuid();
        DB::table('farmers')->insert([
            'id' => $farmerId,
            'user_id' => $userId,
            'farm_name' => 'Vườn Trái Cây Chú Ba',
            'story' => 'Hơn 20 năm gắn bó với cây sầu riêng và bưởi da xanh. Nông sản đạt chuẩn VietGAP...',
            'address' => 'Chợ Lách, Bến Tre',
            'region_id' => $regionId,
            'is_verified' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 5. Product 1 (Sầu Riêng)
        $productId1 = (string) Str::uuid();
        DB::table('products')->insert([
            'id' => $productId1,
            'farmer_id' => $farmerId,
            'category_id' => $categoryId,
            'name' => 'Sầu Riêng Ri6 Hạt Lép',
            'slug' => 'sau-rieng-ri6-hat-lep',
            'description' => 'Sầu riêng chín cây tự nhiên, không nhúng thuốc. Cơm vàng, hạt lép, vị ngọt béo ngậy.',
            'is_seasonal' => true,
            'harvest_season' => 'Tháng 4 - Tháng 7',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Variants for Product 1
        DB::table('product_variants')->insert([
            [
                'id' => (string) Str::uuid(),
                'product_id' => $productId1,
                'unit' => 'Tách vỏ (Hộp 500g)',
                'price' => 190000,
                'stock_quantity' => 50,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'product_id' => $productId1,
                'unit' => 'Nguyên trái (2.5-3.5kg)',
                'price' => 350000,
                'stock_quantity' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
        
        $this->command->info('Seed dữ liệu Nông sản GreenFood thành công!');
    }
}
