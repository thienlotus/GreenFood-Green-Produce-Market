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
            ['name' => 'Đồng Bằng Sông Cửu Long', 'slug' => 'dong-bang-song-cuu-long', 'zone' => 'south', 'description' => 'Vựa trái cây nhiệt đới lớn nhất cả nước'],
            ['name' => 'Tây Nguyên & Đà Lạt', 'slug' => 'tay-nguyen-da-lat', 'zone' => 'central', 'description' => 'Xứ sở rau củ, dâu tây và hoa quả ôn đới'],
            ['name' => 'Miền Bắc', 'slug' => 'mien-bac', 'zone' => 'north', 'description' => 'Nông sản vùng cao Tây Bắc và chè Thái Nguyên'],
            ['name' => 'Miền Trung', 'slug' => 'mien-trung', 'zone' => 'central', 'description' => 'Nông sản sạch miền Trung'],
        ];

        $regionMap = [];
        foreach ($regions as $r) {
            $id = DB::table('regions')->insertGetId(array_merge($r, ['created_at' => now(), 'updated_at' => now()]));
            $regionMap[$r['slug']] = $id;
        }

        // 2. Categories
        $categories = [
            [
                'name' => 'Đi chợ online',
                'slug' => 'di-cho-online',
                'icon' => '🛒',
                'banner_image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop',
                'description' => 'Thực phẩm tươi ngon, rau củ quả sạch thu hoạch trong ngày giao tận nhà.'
            ],
            [
                'name' => 'Trái cây tươi ngon',
                'slug' => 'trai-cay',
                'icon' => '🍉',
                'banner_image' => 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=1920&auto=format&fit=crop',
                'description' => 'Trái cây đặc sản nhiệt đới và ôn đới chín cây tự nhiên, chuẩn VietGAP, ngọt thơm mọng nước.'
            ],
            [
                'name' => 'Trà - Cà phê - Socola',
                'slug' => 'tra-ca-phe',
                'icon' => '☕',
                'banner_image' => 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1920&auto=format&fit=crop',
                'description' => 'Trà Thái Nguyên thượng hạng, Cà phê Robusta Mộc Châu rang mộc, Cacao Bến Tre nguyên chất.'
            ],
            [
                'name' => 'Đặc sản vùng miền',
                'slug' => 'dac-san',
                'icon' => '🎁',
                'banner_image' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1920&auto=format&fit=crop',
                'description' => 'Đặc sản trứ danh 3 miền: Sầu riêng Ri6, Mật ong rừng Tràm, Bưởi da xanh Bến Tre.'
            ],
            [
                'name' => 'Agrishow Triển Lãm',
                'slug' => 'agrishow',
                'icon' => '🌾',
                'banner_image' => 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1920&auto=format&fit=crop',
                'description' => 'Bộ sưu tập nông sản đạt chuẩn xuất khẩu chất lượng cao tại Hội chợ Nông sản Việt.'
            ]
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

        // 4. Farmers (Nông hộ với Tọa độ GIS)
        $farmersData = [
            [
                'name' => 'Vườn Trái Cây Chú Ba', 'owner' => 'Nguyễn Văn Ba', 'phone' => '0901234567', 'email' => 'chuba@greenfood.vn',
                'address' => 'Chợ Lách, Bến Tre', 'region' => 'dong-bang-song-cuu-long',
                'latitude' => 10.2348, 'longitude' => 106.3485,
                'image' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
                'specialty' => 'Sầu riêng Ri6, Bưởi da xanh', 'rating' => 4.8, 'is_verified' => true,
                'story' => 'Hơn 20 năm gắn bó với cây sầu riêng và bưởi da xanh. Nông sản đạt chuẩn VietGAP mang lại vị ngọt béo ngậy an toàn nhất.'
            ],
            [
                'name' => 'HTX Bưởi Da Xanh', 'owner' => 'Trần Văn Năm', 'phone' => '0902345678', 'email' => 'bentre@greenfood.vn',
                'address' => 'Bình Minh, Vĩnh Long', 'region' => 'dong-bang-song-cuu-long',
                'latitude' => 10.0772, 'longitude' => 105.9545,
                'image' => 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600',
                'specialty' => 'Bưởi da xanh ruột hồng', 'rating' => 4.6, 'is_verified' => true,
                'story' => 'Hợp tác xã quy tụ 50 hộ gia đình trồng bưởi truyền thống với tiêu chuẩn sinh học sạch.'
            ],
            [
                'name' => 'Nông Trại Xanh Đà Lạt', 'owner' => 'Phạm Thị Lan', 'phone' => '0903456789', 'email' => 'dalatfarm@greenfood.vn',
                'address' => 'Đơn Dương, Lâm Đồng', 'region' => 'tay-nguyen-da-lat',
                'latitude' => 11.8188, 'longitude' => 108.4933,
                'image' => 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600',
                'specialty' => 'Dâu tây, Dưa lưới hữu cơ', 'rating' => 4.9, 'is_verified' => true,
                'story' => 'Nông trại ứng dụng công nghệ tưới nhỏ giọt Israel và phân bón vi sinh hữu cơ 100% trong nhà kính thông minh.'
            ],
            [
                'name' => 'Vườn Xoài Ông Năm', 'owner' => 'Lê Văn Năm', 'phone' => '0904567891', 'email' => 'ongnam@greenfood.vn',
                'address' => 'Cao Lãnh, Đồng Tháp', 'region' => 'dong-bang-song-cuu-long',
                'latitude' => 10.4563, 'longitude' => 105.6409,
                'image' => 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
                'specialty' => 'Xoài cát Hòa Lộc', 'rating' => 4.5, 'is_verified' => false,
                'story' => 'Truyền thống 3 đời canh tác giống xoài quý trên đất phù sa bồi đắp màu mỡ ven sông Tiền.'
            ],
            [
                'name' => 'Trang Trại Mộc Châu', 'owner' => 'Hoàng Văn Minh', 'phone' => '0905678902', 'email' => 'mocchau@greenfood.vn',
                'address' => 'Mộc Châu, Sơn La', 'region' => 'mien-bac',
                'latitude' => 20.8332, 'longitude' => 104.6724,
                'image' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
                'specialty' => 'Mận hậu, Cà phê Robusta', 'rating' => 4.7, 'is_verified' => true,
                'story' => 'Đặc sản mận hậu, cà phê rang mộc và mật ong vùng cao Tây Bắc ở độ cao trên 1000m.'
            ],
            [
                'name' => 'HTX Chè Thái Nguyên', 'owner' => 'Nguyễn Thị Mai', 'phone' => '0906789013', 'email' => 'chetn@greenfood.vn',
                'address' => 'Tân Cương, Thái Nguyên', 'region' => 'mien-bac',
                'latitude' => 21.5546, 'longitude' => 105.8008,
                'image' => 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600',
                'specialty' => 'Chè Tân Cương, Trà xanh nõn tôm', 'rating' => 4.4, 'is_verified' => true,
                'story' => 'Búp chè hái tay 1 tôm 2 lá lúc sáng sớm giữ trọn hương sương mai thơm ngát.'
            ],
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
                'latitude' => $f['latitude'],
                'longitude' => $f['longitude'],
                'image_url' => $f['image'],
                'specialty' => $f['specialty'],
                'rating' => $f['rating'],
                'is_verified' => $f['is_verified'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $farmerMap[$f['name']] = $farmId;
        }

        // 5. Products & Variants
        $products = [
            [
                'id' => 'p1', 'farmer' => 'Vườn Trái Cây Chú Ba', 'category' => 'trai-cay',
                'name' => 'Sầu Riêng Ri6 Hạt Lép', 'slug' => 'sau-rieng-ri6',
                'image' => 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Freeship', 'sold_count' => 154, 'rating' => 4.8, 'is_seasonal' => true,
                'description' => 'Sầu riêng Ri6 trứ danh được trồng tại vùng phù sa màu mỡ Chợ Lách, Bến Tre. Cơm vàng óng, hạt lép, độ ngọt vừa phải và béo ngậy. Cam kết chín cây tự nhiên, không nhúng thuốc ép chín.',
                'variants' => [
                    ['unit' => 'Tách vỏ (Hộp 500g)', 'price' => 150000, 'compare' => 190000, 'stock' => 50],
                    ['unit' => 'Nguyên trái (2.5-3kg)', 'price' => 350000, 'compare' => 400000, 'stock' => 20]
                ]
            ],
            [
                'id' => 'p2', 'farmer' => 'HTX Bưởi Da Xanh', 'category' => 'trai-cay',
                'name' => 'Bưởi Da Xanh Ruột Hồng', 'slug' => 'buoi-da-xanh',
                'image' => 'https://images.unsplash.com/photo-1557161189-ce564ad72591?q=80&w=800&auto=format&fit=crop',
                'badge' => 'VietGAP', 'sold_count' => 42, 'rating' => 4.6, 'is_seasonal' => true,
                'description' => 'Bưởi da xanh Bến Tre vỏ mỏng, múi căng mọng, tép bưởi màu hồng tự nhiên, vị ngọt thanh mát đậm đà. Đạt chuẩn chứng nhận VietGAP an toàn tuyệt đối.',
                'variants' => [
                    ['unit' => 'Trái 1.2 - 1.5kg', 'price' => 65000, 'compare' => 85000, 'stock' => 100],
                    ['unit' => 'Thùng 6 trái', 'price' => 360000, 'compare' => 420000, 'stock' => 30]
                ]
            ],
            [
                'id' => 'p3', 'farmer' => 'Nông Trại Xanh Đà Lạt', 'category' => 'trai-cay',
                'name' => 'Dưa Lưới Mật Hữu Cơ', 'slug' => 'dua-luoi-mat',
                'image' => 'https://images.unsplash.com/photo-1598468305048-fb2ce57bc6ff?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Hữu cơ', 'sold_count' => 89, 'rating' => 4.9, 'is_seasonal' => true,
                'description' => 'Dưa lưới mật trồng trong nhà màng công nghệ cao tại Đà Lạt. Ruột màu cam đậm, vị ngọt lịm như mật, giòn thơm nức mũi.',
                'variants' => [
                    ['unit' => 'Trái 1.5kg', 'price' => 99000, 'compare' => 120000, 'stock' => 80],
                ]
            ],
            [
                'id' => 'p4', 'farmer' => 'Vườn Xoài Ông Năm', 'category' => 'trai-cay',
                'name' => 'Xoài Cát Hòa Lộc', 'slug' => 'xoai-cat-hoa-loc',
                'image' => 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Mới về', 'sold_count' => 20, 'rating' => 4.7, 'is_seasonal' => true,
                'description' => 'Xoài cát Hòa Lộc Đồng Tháp loại 1 quả thon dài, vỏ vàng tươi khi chín, thịt quả dẻo mịn không xơ, hương thơm ngào ngạt.',
                'variants' => [
                    ['unit' => '1kg (2-3 trái)', 'price' => 120000, 'compare' => 150000, 'stock' => 45],
                ]
            ],
            [
                'id' => 'f1', 'farmer' => 'Nông Trại Xanh Đà Lạt', 'category' => 'trai-cay',
                'name' => 'Dâu Tây Đà Lạt Cấp Đông', 'slug' => 'dau-tay',
                'image' => 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800&auto=format&fit=crop',
                'badge' => 'VietGAP', 'sold_count' => 200, 'rating' => 4.9, 'is_seasonal' => true,
                'description' => 'Dâu tây giống New Zealand quả đỏ tươi, vị chua ngọt hài hòa tự nhiên. Thu hoạch sáng sớm và cấp đông nhanh chuẩn IQF giữ trọn dinh dưỡng.',
                'variants' => [
                    ['unit' => 'Hộp 500g', 'price' => 120000, 'compare' => 140000, 'stock' => 60],
                    ['unit' => 'Hộp 1kg', 'price' => 220000, 'compare' => 260000, 'stock' => 30]
                ]
            ],
            [
                'id' => 'f2', 'farmer' => 'Vườn Trái Cây Chú Ba', 'category' => 'trai-cay',
                'name' => 'Nho Mẫu Đơn Shine Muscat', 'slug' => 'nho-mau-don',
                'image' => 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Cao cấp', 'sold_count' => 15, 'rating' => 4.9, 'is_seasonal' => false,
                'description' => 'Nho mẫu đơn quả to tròn, vỏ mỏng không hạt, vị ngọt đậm thơm mùi xoài sữa quý tộc.',
                'variants' => [
                    ['unit' => 'Chùm 600g', 'price' => 450000, 'compare' => 500000, 'stock' => 25]
                ]
            ],
            [
                'id' => 'f3', 'farmer' => 'HTX Bưởi Da Xanh', 'category' => 'di-cho-online',
                'name' => 'Cam Sành Mọng Nước', 'slug' => 'cam-sanh',
                'image' => 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Mọng nước', 'sold_count' => 450, 'rating' => 4.5, 'is_seasonal' => true,
                'description' => 'Cam sành Vĩnh Long vỏ sần mọng nước, tép vàng ươm, vắt nước uống giải nhiệt và tăng sức đề kháng mỗi ngày.',
                'variants' => [
                    ['unit' => '1kg (3-4 trái)', 'price' => 35000, 'compare' => 45000, 'stock' => 150]
                ]
            ],
            [
                'id' => 'f4', 'farmer' => 'Nông Trại Xanh Đà Lạt', 'category' => 'di-cho-online',
                'name' => 'Chuối Laba Trứ Danh', 'slug' => 'chuoi-laba',
                'image' => 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Tiến vua', 'sold_count' => 120, 'rating' => 4.8, 'is_seasonal' => false,
                'description' => 'Chuối Laba Đà Lạt dẻo thơm, ruột vàng ánh kim, vị ngọt đậm đà đặc trưng từng dâng vua ngày xưa.',
                'variants' => [
                    ['unit' => 'Nải (1.2-1.5kg)', 'price' => 45000, 'compare' => 55000, 'stock' => 90]
                ]
            ],
            [
                'id' => 't1', 'farmer' => 'Trang Trại Mộc Châu', 'category' => 'tra-ca-phe',
                'name' => 'Cà Phê Robusta Mộc Châu', 'slug' => 'ca-phe-robusta',
                'image' => 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Rang mộc', 'sold_count' => 85, 'rating' => 4.7, 'is_seasonal' => false,
                'description' => 'Cà phê nguyên chất rang mộc hương vị đậm đà, vị đắng thanh quyến rũ, thu hoạch từ cao nguyên Mộc Châu.',
                'variants' => [
                    ['unit' => 'Gói 500g (Hạt)', 'price' => 100000, 'compare' => 120000, 'stock' => 80],
                    ['unit' => 'Gói 500g (Bột)', 'price' => 100000, 'compare' => 120000, 'stock' => 80]
                ]
            ],
            [
                'id' => 't2', 'farmer' => 'HTX Chè Thái Nguyên', 'category' => 'tra-ca-phe',
                'name' => 'Chè Thái Nguyên Tân Cương', 'slug' => 'che-thai-nguyen',
                'image' => 'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Thượng hạng', 'sold_count' => 95, 'rating' => 4.6, 'is_seasonal' => false,
                'description' => 'Trà nõn tôm Tân Cương cánh xoăn hương cốm nồng nàn, nước xanh ánh vàng, hậu ngọt sâu lắng chuẩn vị.',
                'variants' => [
                    ['unit' => 'Gói 200g', 'price' => 95000, 'compare' => 110000, 'stock' => 70]
                ]
            ],
            [
                'id' => 'd1', 'farmer' => 'Vườn Trái Cây Chú Ba', 'category' => 'dac-san',
                'name' => 'Mật Ong Rừng Tràm U Minh', 'slug' => 'mat-ong-rung-tram',
                'image' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Rừng 100%', 'sold_count' => 160, 'rating' => 4.9, 'is_seasonal' => false,
                'description' => 'Mật ong hoa tràm nguyên chất 100% thu hoạch tự nhiên từ rừng tràm U Minh Cà Mau, màu vàng óng, thơm nồng dịu.',
                'variants' => [
                    ['unit' => 'Chai 500ml', 'price' => 180000, 'compare' => 210000, 'stock' => 50],
                    ['unit' => 'Chai 1 Lít', 'price' => 340000, 'compare' => 390000, 'stock' => 30]
                ]
            ],
            [
                'id' => 'a1', 'farmer' => 'Nông Trại Xanh Đà Lạt', 'category' => 'agrishow',
                'name' => 'Rau Hữu Cơ Tổng Hợp Đà Lạt', 'slug' => 'rau-huu-co-tong-hop',
                'image' => 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Organic', 'sold_count' => 65, 'rating' => 4.9, 'is_seasonal' => true,
                'description' => 'Combo 5 loại rau củ hữu cơ Đà Lạt: Xà lách lolo, cải kale, cà chua bi cherry, cà rốt baby, ớt chuông ngọt.',
                'variants' => [
                    ['unit' => 'Combo 2kg (5 loại rau)', 'price' => 85000, 'compare' => 100000, 'stock' => 40]
                ]
            ]
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
                'image_url' => $p['image'],
                'badge' => $p['badge'],
                'sold_count' => $p['sold_count'],
                'rating' => $p['rating'],
                'is_seasonal' => $p['is_seasonal'],
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

        // 6. Shipping Zones (6 Vùng giao hàng chuẩn)
        $shippingZones = [
            [
                'id' => 'SZ001',
                'name' => 'Nội thành TP.HCM',
                'provinces' => 'TP. Hồ Chí Minh (Quận 1-12, Bình Thạnh, Gò Vấp, Phú Nhuận, Tân Bình, Tân Phú)',
                'base_fee' => 15000,
                'extra_fee_per_kg' => 3000,
                'free_ship_minimum' => 300000,
                'estimated_days' => '1-2 giờ',
                'is_active' => true,
            ],
            [
                'id' => 'SZ002',
                'name' => 'Ngoại thành TP.HCM',
                'provinces' => 'TP. Hồ Chí Minh (Củ Chi, Hóc Môn, Bình Chánh, Nhà Bè, Cần Giờ)',
                'base_fee' => 25000,
                'extra_fee_per_kg' => 4000,
                'free_ship_minimum' => 500000,
                'estimated_days' => '2-4 giờ',
                'is_active' => true,
            ],
            [
                'id' => 'SZ003',
                'name' => 'Đồng Bằng Sông Cửu Long',
                'provinces' => 'Bến Tre, Vĩnh Long, Đồng Tháp, Tiền Giang, Cần Thơ, An Giang, Long An',
                'base_fee' => 30000,
                'extra_fee_per_kg' => 5000,
                'free_ship_minimum' => 500000,
                'estimated_days' => '1-2 ngày',
                'is_active' => true,
            ],
            [
                'id' => 'SZ004',
                'name' => 'Miền Đông Nam Bộ',
                'provinces' => 'Bình Dương, Đồng Nai, Bà Rịa - Vũng Tàu, Tây Ninh, Bình Phước',
                'base_fee' => 25000,
                'extra_fee_per_kg' => 4500,
                'free_ship_minimum' => 500000,
                'estimated_days' => '1-2 ngày',
                'is_active' => true,
            ],
            [
                'id' => 'SZ005',
                'name' => 'Tây Nguyên & Miền Trung',
                'provinces' => 'Đà Lạt, Lâm Đồng, Đắk Lắk, Đà Nẵng, Huế, Quảng Nam, Bình Định',
                'base_fee' => 40000,
                'extra_fee_per_kg' => 6000,
                'free_ship_minimum' => 700000,
                'estimated_days' => '2-3 ngày',
                'is_active' => true,
            ],
            [
                'id' => 'SZ006',
                'name' => 'Miền Bắc',
                'provinces' => 'Hà Nội, Hải Phòng, Quảng Ninh, Nam Định, Ninh Bình, Hà Nam',
                'base_fee' => 50000,
                'extra_fee_per_kg' => 7000,
                'free_ship_minimum' => 800000,
                'estimated_days' => '3-5 ngày',
                'is_active' => true,
            ],
        ];

        foreach ($shippingZones as $sz) {
            DB::table('shipping_zones')->insert(array_merge($sz, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 7. Sample Orders with Tracking
        $sampleOrders = [
            [
                'tracking_number' => 'GF284910',
                'customer_name' => 'Nguyễn Văn An',
                'customer_phone' => '0909123456',
                'customer_email' => 'an.nguyen@gmail.com',
                'shipping_address' => '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
                'shipping_zone_id' => 'SZ001',
                'shipping_fee' => 15000,
                'total_amount' => 340000,
                'status' => 'SHIPPING',
                'payment_method' => 'COD',
                'shipper_name' => 'Trần Minh Đức',
                'shipper_phone' => '0912345678',
                'shipper_lat' => 10.7769,
                'shipper_lng' => 106.7009,
                'dest_lat' => 10.7766,
                'dest_lng' => 106.7019,
                'items' => [
                    ['name' => 'Sầu Riêng Ri6 Hạt Lép', 'unit' => 'Hộp 500g', 'quantity' => 1, 'price' => 150000],
                    ['name' => 'Bưởi Da Xanh Ruột Hồng', 'unit' => 'Trái', 'quantity' => 2, 'price' => 65000],
                    ['name' => 'Cam Sành Mọng Nước', 'unit' => '1kg', 'quantity' => 1, 'price' => 35000]
                ]
            ],
            [
                'tracking_number' => 'GF285020',
                'customer_name' => 'Trần Thị Bích',
                'customer_phone' => '0918765432',
                'customer_email' => 'bich.tran@gmail.com',
                'shipping_address' => '456 Lê Lợi, Quận 3, TP. Hồ Chí Minh',
                'shipping_zone_id' => 'SZ001',
                'shipping_fee' => 0,
                'total_amount' => 1250000,
                'status' => 'DELIVERED',
                'payment_method' => 'MOMO',
                'shipper_name' => 'Lê Hoàng Nam',
                'shipper_phone' => '0923456789',
                'shipper_lat' => 10.7814,
                'shipper_lng' => 106.6827,
                'dest_lat' => 10.7814,
                'dest_lng' => 106.6827,
                'items' => [
                    ['name' => 'Sầu Riêng Ri6 Hạt Lép', 'unit' => 'Nguyên trái', 'quantity' => 3, 'price' => 350000],
                    ['name' => 'Dâu Tây Đà Lạt Cấp Đông', 'unit' => 'Hộp 1kg', 'quantity' => 1, 'price' => 220000]
                ]
            ],
            [
                'tracking_number' => 'GF285130',
                'customer_name' => 'Lê Hoàng Cường',
                'customer_phone' => '0933456789',
                'customer_email' => 'cuong.le@gmail.com',
                'shipping_address' => '789 Phan Đăng Lưu, Quận Bình Thạnh, TP. Hồ Chí Minh',
                'shipping_zone_id' => 'SZ001',
                'shipping_fee' => 15000,
                'total_amount' => 85000,
                'status' => 'CONFIRMED',
                'payment_method' => 'BANK_TRANSFER',
                'items' => [
                    ['name' => 'Bưởi Da Xanh Ruột Hồng', 'unit' => 'Trái', 'quantity' => 1, 'price' => 65000]
                ]
            ]
        ];

        foreach ($sampleOrders as $ord) {
            $orderId = (string) Str::uuid();
            $items = $ord['items'];
            unset($ord['items']);

            DB::table('orders')->insert(array_merge($ord, [
                'id' => $orderId,
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            foreach ($items as $it) {
                DB::table('order_items')->insert([
                    'id' => (string) Str::uuid(),
                    'order_id' => $orderId,
                    'product_name' => $it['name'],
                    'unit' => $it['unit'],
                    'quantity' => $it['quantity'],
                    'price_at_time' => $it['price'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('Seed toàn bộ CSDL Nông sản GreenFood thành công!');
    }
}
