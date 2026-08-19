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
        $regions = [
            ['name' => 'Đồng Bằng Sông Cửu Long', 'slug' => 'dong-bang-song-cuu-long', 'description' => 'Vựa trái cây lớn nhất cả nước'],
            ['name' => 'Tây Nguyên & Đà Lạt', 'slug' => 'tay-nguyen-da-lat', 'description' => 'Xứ sở rau củ, cà phê và dâu tây ôn đới'],
            ['name' => 'Miền Bắc', 'slug' => 'mien-bac', 'description' => 'Đặc sản vùng cao Tây Bắc và chè Thái Nguyên'],
            ['name' => 'Miền Trung', 'slug' => 'mien-trung', 'description' => 'Nắng gió sản sinh đặc sản thơm ngọt đậm đà'],
        ];

        $regionMap = [];
        foreach ($regions as $r) {
            $id = DB::table('regions')->insertGetId(array_merge($r, ['created_at' => now(), 'updated_at' => now()]));
            $regionMap[$r['slug']] = $id;
        }

        // 2. Categories
        $categories = [
            ['name' => 'Đi chợ online', 'slug' => 'di-cho-online', 'description' => 'Rau củ quả, thực phẩm tươi ngon mỗi ngày'],
            ['name' => 'Trái cây tươi ngon', 'slug' => 'trai-cay', 'description' => 'Trái cây đặc sản nhiệt đới và ôn đới chín cây tự nhiên'],
            ['name' => 'Trà - Cà phê - Socola', 'slug' => 'tra-ca-phe', 'description' => 'Trà Thái Nguyên, Cà phê Robusta Mộc Châu, Cacao Bến Tre'],
            ['name' => 'Đặc sản vùng miền', 'slug' => 'dac-san', 'description' => 'Mật ong rừng, sầu riêng, bánh phồng tôm, đặc sản trứ danh'],
            ['name' => 'Agrishow Triển Lãm', 'slug' => 'agrishow', 'description' => 'Nông sản hữu cơ tiêu chuẩn VietGAP xuất khẩu'],
            ['name' => 'Rau củ hữu cơ', 'slug' => 'rau-cu', 'description' => 'Rau củ sạch trồng theo chuẩn hữu cơ không thuốc trừ sâu'],
        ];

        $categoryMap = [];
        foreach ($categories as $c) {
            $id = DB::table('categories')->insertGetId(array_merge($c, ['created_at' => now(), 'updated_at' => now()]));
            $categoryMap[$c['slug']] = $id;
        }

        // 3. Admin & Vendors
        $adminId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $adminId,
            'full_name' => 'Quản trị viên GreenFood',
            'phone' => '0900000000',
            'email' => 'admin@greenfood.vn',
            'password' => Hash::make('admin123'),
            'role' => 'ADMIN',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $farmersData = [
            ['name' => 'Vườn Trái Cây Chú Ba', 'owner' => 'Nguyễn Văn Ba', 'phone' => '0901234567', 'email' => 'chuba@greenfood.vn', 'address' => 'Chợ Lách, Bến Tre', 'region' => 'dong-bang-song-cuu-long', 'story' => 'Hơn 20 năm gắn bó với cây sầu riêng và bưởi da xanh. Nông sản đạt chuẩn VietGAP.', 'rating' => 4.8],
            ['name' => 'HTX Bưởi Da Xanh', 'owner' => 'Trần Văn Năm', 'phone' => '0902345678', 'email' => 'bentre@greenfood.vn', 'address' => 'Bình Minh, Vĩnh Long', 'region' => 'dong-bang-song-cuu-long', 'story' => 'Hợp tác xã quy tụ 50 hộ trồng bưởi chuẩn VietGAP xuất khẩu.', 'rating' => 4.6],
            ['name' => 'Nông Trại Xanh Đà Lạt', 'owner' => 'Phạm Thị Lan', 'phone' => '0903456789', 'email' => 'dalatfarm@greenfood.vn', 'address' => 'Đơn Dương, Lâm Đồng', 'region' => 'tay-nguyen-da-lat', 'story' => 'Canh tác hữu cơ trong nhà kính thông minh không hóa chất.', 'rating' => 4.9],
            ['name' => 'Trang Trại Mộc Châu', 'owner' => 'Hoàng Văn Minh', 'phone' => '0904567890', 'email' => 'mocchau@greenfood.vn', 'address' => 'Mộc Châu, Sơn La', 'region' => 'mien-bac', 'story' => 'Đặc sản mận hậu, trà shan tuyết và mật ong vùng cao Tây Bắc.', 'rating' => 4.7],
        ];

        $farmerMap = [];
        foreach ($farmersData as $f) {
            $uId = (string) Str::uuid();
            DB::table('users')->insert([
                'id' => $uId,
                'full_name' => $f['owner'],
                'phone' => $f['phone'],
                'email' => $f['email'],
                'password' => Hash::make('password123'),
                'role' => 'VENDOR',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $farmId = (string) Str::uuid();
            DB::table('farmers')->insert([
                'id' => $farmId,
                'user_id' => $uId,
                'farm_name' => $f['name'],
                'story' => $f['story'],
                'address' => $f['address'],
                'region_id' => $regionMap[$f['region']],
                'rating' => $f['rating'],
                'is_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $farmerMap[$f['name']] = $farmId;
        }

        // 4. Products & Variants
        $products = [
            [
                'farmer' => 'Vườn Trái Cây Chú Ba', 'category' => 'trai-cay',
                'name' => 'Sầu Riêng Ri6 Hạt Lép', 'slug' => 'sau-rieng-ri6',
                'description' => 'Sầu riêng chín cây tự nhiên Chợ Lách Bến Tre, không nhúng thuốc. Cơm vàng óng, hạt lép, vị béo ngậy.',
                'variants' => [
                    ['unit' => 'Tách vỏ (Hộp 500g)', 'price' => 190000, 'compare' => 220000, 'stock' => 50],
                    ['unit' => 'Nguyên trái (2.5-3.5kg)', 'price' => 350000, 'compare' => 400000, 'stock' => 20]
                ]
            ],
            [
                'farmer' => 'HTX Bưởi Da Xanh', 'category' => 'trai-cay',
                'name' => 'Bưởi Da Xanh Ruột Hồng', 'slug' => 'buoi-da-xanh',
                'description' => 'Bưởi da xanh Bến Tre vỏ mỏng, ruột hồng ngọt thanh, nhiều nước, chuẩn VietGAP.',
                'variants' => [
                    ['unit' => 'Trái 1.2 - 1.5kg', 'price' => 65000, 'compare' => 85000, 'stock' => 100],
                    ['unit' => 'Thùng 6 trái', 'price' => 360000, 'compare' => 420000, 'stock' => 30]
                ]
            ],
            [
                'farmer' => 'Nông Trại Xanh Đà Lạt', 'category' => 'trai-cay',
                'name' => 'Dưa Lưới Mật Hữu Cơ', 'slug' => 'dua-luoi-mat',
                'description' => 'Dưa lưới ruột cam ngọt đậm đà, độ đường cao, trồng trong nhà kính chuẩn GlobalGAP.',
                'variants' => [
                    ['unit' => 'Trái 1.5kg', 'price' => 99000, 'compare' => 120000, 'stock' => 80],
                ]
            ],
            [
                'farmer' => 'Vườn Trái Cây Chú Ba', 'category' => 'trai-cay',
                'name' => 'Xoài Cát Hòa Lộc', 'slug' => 'xoai-cat-hoa-loc',
                'description' => 'Xoài cát Hòa Lộc Đồng Tháp trứ danh thơm lừng, thịt dẻo ngọt lịm.',
                'variants' => [
                    ['unit' => 'Kg (2-3 trái)', 'price' => 120000, 'compare' => 150000, 'stock' => 45],
                ]
            ],
            [
                'farmer' => 'Nông Trại Xanh Đà Lạt', 'category' => 'trai-cay',
                'name' => 'Dâu Tây Đà Lạt Cấp Đông', 'slug' => 'dau-tay',
                'description' => 'Dâu giống New Zealand quả to mọng, đỏ tươi, thơm lừng vị chua ngọt dịu.',
                'variants' => [
                    ['unit' => 'Hộp 500g', 'price' => 120000, 'compare' => 140000, 'stock' => 60],
                    ['unit' => 'Hộp 1kg', 'price' => 220000, 'compare' => 260000, 'stock' => 30]
                ]
            ],
            [
                'farmer' => 'Trang Trại Mộc Châu', 'category' => 'tra-ca-phe',
                'name' => 'Cà Phê Robusta Mộc Châu', 'slug' => 'ca-phe-robusta',
                'description' => 'Cà phê nguyên chất rang mộc hương vị đậm đà, vị đắng thanh quyến rũ.',
                'variants' => [
                    ['unit' => 'Gói 500g (Hạt)', 'price' => 100000, 'compare' => 120000, 'stock' => 80],
                    ['unit' => 'Gói 500g (Bột)', 'price' => 100000, 'compare' => 120000, 'stock' => 80],
                ]
            ],
            [
                'farmer' => 'Trang Trại Mộc Châu', 'category' => 'tra-ca-phe',
                'name' => 'Chè Thái Nguyên Tân Cương', 'slug' => 'che-thai-nguyen',
                'description' => 'Trà nõn tôm Tân Cương cánh xoăn hương cốm nồng nàn, hậu ngọt sâu lắng.',
                'variants' => [
                    ['unit' => 'Gói 200g', 'price' => 95000, 'compare' => 110000, 'stock' => 70],
                ]
            ],
            [
                'farmer' => 'Vườn Trái Cây Chú Ba', 'category' => 'dac-san',
                'name' => 'Mật Ong Rừng Tràm U Minh', 'slug' => 'mat-ong-rung-tram',
                'description' => 'Mật ong hoa tràm nguyên chất 100% thu hoạch tự nhiên từ rừng tràm U Minh.',
                'variants' => [
                    ['unit' => 'Chai 500ml', 'price' => 180000, 'compare' => 210000, 'stock' => 50],
                    ['unit' => 'Chai 1 Lít', 'price' => 340000, 'compare' => 390000, 'stock' => 30]
                ]
            ],
            [
                'farmer' => 'HTX Bưởi Da Xanh', 'category' => 'di-cho-online',
                'name' => 'Cam Sành Mọng Nước Vĩnh Long', 'slug' => 'cam-sanh',
                'description' => 'Cam sành vườn ngọt mát nhiều nước, giàu Vitamin C tăng cường sức đề kháng.',
                'variants' => [
                    ['unit' => 'Kg (3-4 trái)', 'price' => 35000, 'compare' => 45000, 'stock' => 150],
                ]
            ],
            [
                'farmer' => 'Nông Trại Xanh Đà Lạt', 'category' => 'di-cho-online',
                'name' => 'Chuối Laba Trứ Danh Lâm Đồng', 'slug' => 'chuoi-laba',
                'description' => 'Chuối tiến vua thơm dẻo đặc biệt, hàm lượng dinh dưỡng cao.',
                'variants' => [
                    ['unit' => 'Nải (1.2-1.5kg)', 'price' => 45000, 'compare' => 55000, 'stock' => 90],
                ]
            ],
            [
                'farmer' => 'Nông Trại Xanh Đà Lạt', 'category' => 'agrishow',
                'name' => 'Rau Hữu Cơ Tổng Hợp Đà Lạt', 'slug' => 'rau-huu-co-tong-hop',
                'description' => 'Combo 5 loại rau củ chuẩn hữu cơ organic thu hoạch sớm giao trong ngày.',
                'variants' => [
                    ['unit' => 'Combo 2kg', 'price' => 85000, 'compare' => 100000, 'stock' => 40],
                ]
            ],
        ];

        foreach ($products as $p) {
            $pId = (string) Str::uuid();
            DB::table('products')->insert([
                'id' => $pId,
                'farmer_id' => $farmerMap[$p['farmer']],
                'category_id' => $categoryMap[$p['category']],
                'name' => $p['name'],
                'slug' => $p['slug'],
                'description' => $p['description'],
                'is_seasonal' => true,
                'harvest_season' => 'Quanh năm',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($p['variants'] as $v) {
                DB::table('product_variants')->insert([
                    'id' => (string) Str::uuid(),
                    'product_id' => $pId,
                    'unit' => $v['unit'],
                    'price' => $v['price'],
                    'compare_at_price' => $v['compare'] ?? null,
                    'stock_quantity' => $v['stock'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('Seed toàn bộ Nông sản, Danh mục & Nông hộ GreenFood thành công!');
    }
}
