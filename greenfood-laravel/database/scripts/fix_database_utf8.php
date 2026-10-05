<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== GREENFOOD DATABASE UTF-8 & MOJIBAKE FIX ===\n";

$dbName = 'ajmylihnhosting_greenfood';
$dbUser = 'ajmylihnhosting_greenfood';
$dbPass = 'Arc0*%4GiNJF6nfUh62D';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ]);

    // 1. Convert Database & Tables to utf8mb4
    $tables = ['regions', 'categories', 'farmers', 'products', 'product_variants', 'shipping_zones', 'users', 'orders', 'order_items'];
    $pdo->exec("ALTER DATABASE `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Converted database to utf8mb4_unicode_ci\n";

    foreach ($tables as $t) {
        try {
            $pdo->exec("ALTER TABLE `$t` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            echo "Converted table `$t` to utf8mb4_unicode_ci\n";
        } catch (Exception $e) {
            echo "Notice on table `$t`: " . $e->getMessage() . "\n";
        }
    }

    // 2. Fix Regions
    $regions = [
        ['name' => 'Đồng Bằng Sông Cửu Long', 'slug' => 'dong-bang-song-cuu-long', 'zone' => 'south', 'description' => 'Vựa trái cây nhiệt đới lớn nhất cả nước'],
        ['name' => 'Tây Nguyên & Đà Lạt', 'slug' => 'tay-nguyen-da-lat', 'zone' => 'central', 'description' => 'Xứ sở rau củ, dâu tây và hoa quả ôn đới'],
        ['name' => 'Miền Bắc', 'slug' => 'mien-bac', 'zone' => 'north', 'description' => 'Nông sản vùng cao Tây Bắc và chè Thái Nguyên'],
        ['name' => 'Miền Trung', 'slug' => 'mien-trung', 'zone' => 'central', 'description' => 'Nông sản sạch miền Trung'],
    ];

    $regionStmt = $pdo->prepare("UPDATE `regions` SET `name` = :name, `description` = :description WHERE `slug` = :slug");
    foreach ($regions as $r) {
        $regionStmt->execute([':name' => $r['name'], ':description' => $r['description'], ':slug' => $r['slug']]);
    }
    echo "Updated regions with clean Vietnamese UTF-8\n";

    // 3. Fix Categories
    $categories = [
        [
            'name' => 'Đi chợ online',
            'slug' => 'di-cho-online',
            'icon' => '🛒',
            'description' => 'Thực phẩm tươi ngon, rau củ quả sạch thu hoạch trong ngày giao tận nhà.'
        ],
        [
            'name' => 'Trái cây tươi ngon',
            'slug' => 'trai-cay',
            'icon' => '🍉',
            'description' => 'Trái cây đặc sản nhiệt đới và ôn đới chín cây tự nhiên, chuẩn VietGAP, ngọt thơm mọng nước.'
        ],
        [
            'name' => 'Trà - Cà phê - Socola',
            'slug' => 'tra-ca-phe',
            'icon' => '☕',
            'description' => 'Trà Thái Nguyên thượng hạng, Cà phê Robusta Mộc Châu rang mộc, Cacao Bến Tre nguyên chất.'
        ],
        [
            'name' => 'Đặc sản vùng miền',
            'slug' => 'dac-san',
            'icon' => '🎁',
            'description' => 'Đặc sản trứ danh 3 miền: Sầu riêng Ri6, Mật ong rừng Tràm, Bưởi da xanh Bến Tre.'
        ],
        [
            'name' => 'Agrishow Triển Lãm',
            'slug' => 'agrishow',
            'icon' => '🌾',
            'description' => 'Bộ sưu tập nông sản đạt chuẩn xuất khẩu chất lượng cao tại Hội chợ Nông sản Việt.'
        ]
    ];

    $catStmt = $pdo->prepare("UPDATE `categories` SET `name` = :name, `icon` = :icon, `description` = :description WHERE `slug` = :slug");
    foreach ($categories as $c) {
        $catStmt->execute([':name' => $c['name'], ':icon' => $c['icon'], ':description' => $c['description'], ':slug' => $c['slug']]);
    }
    echo "Updated categories with clean Vietnamese UTF-8\n";

    // 4. Fix Farmers
    $farmers = [
        [
            'name' => 'Vườn Trái Cây Chú Ba', 'email' => 'chuba@greenfood.vn',
            'address' => 'Chợ Lách, Bến Tre', 'specialty' => 'Sầu riêng Ri6, Bưởi da xanh',
            'story' => 'Hơn 20 năm gắn bó với cây sầu riêng và bưởi da xanh. Nông sản đạt chuẩn VietGAP mang lại vị ngọt béo ngậy an toàn nhất.'
        ],
        [
            'name' => 'HTX Bưởi Da Xanh', 'email' => 'bentre@greenfood.vn',
            'address' => 'Bình Minh, Vĩnh Long', 'specialty' => 'Bưởi da xanh ruột hồng',
            'story' => 'Hợp tác xã quy tụ 50 hộ gia đình trồng bưởi truyền thống với tiêu chuẩn sinh học sạch.'
        ],
        [
            'name' => 'Nông Trại Xanh Đà Lạt', 'email' => 'dalatfarm@greenfood.vn',
            'address' => 'Đơn Dương, Lâm Đồng', 'specialty' => 'Dâu tây, Dưa lưới hữu cơ',
            'story' => 'Nông trại ứng dụng công nghệ tưới nhỏ giọt Israel và phân bón vi sinh hữu cơ 100% trong nhà kính thông minh.'
        ],
        [
            'name' => 'Vườn Xoài Ông Năm', 'email' => 'ongnam@greenfood.vn',
            'address' => 'Cao Lãnh, Đồng Tháp', 'specialty' => 'Xoài cát Hòa Lộc',
            'story' => 'Truyền thống 3 đời canh tác giống xoài quý trên đất phù sa bồi đắp màu mỡ ven sông Tiền.'
        ],
        [
            'name' => 'Trang Trại Mộc Châu', 'email' => 'mocchau@greenfood.vn',
            'address' => 'Mộc Châu, Sơn La', 'specialty' => 'Mận hậu, Cà phê Robusta',
            'story' => 'Đặc sản mận hậu, cà phê rang mộc và mật ong vùng cao Tây Bắc ở độ cao trên 1000m.'
        ],
        [
            'name' => 'HTX Chè Thái Nguyên', 'email' => 'chetn@greenfood.vn',
            'address' => 'Tân Cương, Thái Nguyên', 'specialty' => 'Chè Tân Cương, Trà xanh nõn tôm',
            'story' => 'Búp chè hái tay 1 tôm 2 lá lúc sáng sớm giữ trọn hương sương mai thơm ngát.'
        ],
    ];

    $farmerStmt = $pdo->prepare("UPDATE `farmers` SET `farm_name` = :name, `address` = :address, `specialty` = :specialty, `story` = :story WHERE `farm_name` = :name OR `user_id` IN (SELECT `id` FROM `users` WHERE `email` = :email)");
    foreach ($farmers as $f) {
        $farmerStmt->execute([
            ':name' => $f['name'],
            ':address' => $f['address'],
            ':specialty' => $f['specialty'],
            ':story' => $f['story'],
            ':email' => $f['email']
        ]);
    }
    echo "Updated farmers with clean Vietnamese UTF-8\n";

    // 5. Fix Products & Variants
    $products = [
        [
            'slug' => 'sau-rieng-ri6',
            'name' => 'Sầu Riêng Ri6 Hạt Lép',
            'badge' => 'Freeship',
            'harvest_season' => 'Quanh năm',
            'description' => 'Sầu riêng Ri6 trứ danh được trồng tại vùng phù sa màu mỡ Chợ Lách, Bến Tre. Cơm vàng óng, hạt lép, độ ngọt vừa phải và béo ngậy. Cam kết chín cây tự nhiên, không nhúng thuốc ép chín.',
            'variants' => [
                ['price' => 150000, 'unit' => 'Tách vỏ (Hộp 500g)'],
                ['price' => 350000, 'unit' => 'Nguyên trái (2.5-3kg)']
            ]
        ],
        [
            'slug' => 'buoi-da-xanh',
            'name' => 'Bưởi Da Xanh Ruột Hồng',
            'badge' => 'VietGAP',
            'harvest_season' => 'Quanh năm',
            'description' => 'Bưởi da xanh Bến Tre vỏ mỏng, múi căng mọng, tép bưởi màu hồng tự nhiên, vị ngọt thanh mát đậm đà. Đạt chuẩn chứng nhận VietGAP an toàn tuyệt đối.',
            'variants' => [
                ['price' => 65000, 'unit' => 'Trái 1.2 - 1.5kg'],
                ['price' => 360000, 'unit' => 'Thùng 6 trái']
            ]
        ],
        [
            'slug' => 'dua-luoi-mat',
            'name' => 'Dưa Lưới Mật Hữu Cơ',
            'badge' => 'Hữu cơ',
            'harvest_season' => 'Quanh năm',
            'description' => 'Dưa lưới mật trồng trong nhà màng công nghệ cao tại Đà Lạt. Ruột màu cam đậm, vị ngọt lịm như mật, giòn thơm nức mũi.',
            'variants' => [
                ['price' => 99000, 'unit' => 'Trái 1.5kg']
            ]
        ],
        [
            'slug' => 'xoai-cat-hoa-loc',
            'name' => 'Xoài Cát Hòa Lộc',
            'badge' => 'Mới về',
            'harvest_season' => 'Quanh năm',
            'description' => 'Xoài cát Hòa Lộc Đồng Tháp loại 1 quả thon dài, vỏ vàng tươi khi chín, thịt quả dẻo mịn không xơ, hương thơm ngào ngạt.',
            'variants' => [
                ['price' => 120000, 'unit' => '1kg (2-3 trái)']
            ]
        ],
        [
            'slug' => 'dau-tay',
            'name' => 'Dâu Tây Đà Lạt Cấp Đông',
            'badge' => 'VietGAP',
            'harvest_season' => 'Quanh năm',
            'description' => 'Dâu tây giống New Zealand quả đỏ tươi, vị chua ngọt hài hòa tự nhiên. Thu hoạch sáng sớm và cấp đông nhanh chuẩn IQF giữ trọn dinh dưỡng.',
            'variants' => [
                ['price' => 120000, 'unit' => 'Hộp 500g'],
                ['price' => 220000, 'unit' => 'Hộp 1kg']
            ]
        ],
        [
            'slug' => 'nho-mau-don',
            'name' => 'Nho Mẫu Đơn Shine Muscat',
            'badge' => 'Cao cấp',
            'harvest_season' => 'Nhập khẩu',
            'description' => 'Nho mẫu đơn quả to tròn, vỏ mỏng không hạt, vị ngọt đậm thơm mùi xoài sữa quý tộc.',
            'variants' => [
                ['price' => 450000, 'unit' => 'Chùm 600g']
            ]
        ],
        [
            'slug' => 'cam-sanh',
            'name' => 'Cam Sành Mọng Nước',
            'badge' => 'Mọng nước',
            'harvest_season' => 'Quanh năm',
            'description' => 'Cam sành Vĩnh Long vỏ sần mọng nước, tép vàng ươm, vắt nước uống giải nhiệt và tăng sức đề kháng mỗi ngày.',
            'variants' => [
                ['price' => 35000, 'unit' => '1kg (3-4 trái)']
            ]
        ],
        [
            'slug' => 'chuoi-laba',
            'name' => 'Chuối Laba Trứ Danh',
            'badge' => 'Tiến vua',
            'harvest_season' => 'Quanh năm',
            'description' => 'Chuối Laba Đà Lạt dẻo thơm, ruột vàng ánh kim, vị ngọt đậm đà đặc trưng từng dâng vua ngày xưa.',
            'variants' => [
                ['price' => 45000, 'unit' => 'Nải (1.2-1.5kg)']
            ]
        ],
        [
            'slug' => 'ca-phe-robusta',
            'name' => 'Cà Phê Robusta Mộc Châu',
            'badge' => 'Rang mộc',
            'harvest_season' => 'Quanh năm',
            'description' => 'Cà phê nguyên chất rang mộc hương vị đậm đà, vị đắng thanh quyến rũ, thu hoạch từ cao nguyên Mộc Châu.',
            'variants' => [
                ['price' => 100000, 'unit' => 'Gói 500g (Hạt)'],
                ['price' => 100000, 'unit' => 'Gói 500g (Bột)']
            ]
        ],
        [
            'slug' => 'che-thai-nguyen',
            'name' => 'Chè Thái Nguyên Tân Cương',
            'badge' => 'Thượng hạng',
            'harvest_season' => 'Quanh năm',
            'description' => 'Trà nõn tôm Tân Cương cánh xoăn hương cốm nồng nàn, nước xanh ánh vàng, hậu ngọt sâu lắng chuẩn vị.',
            'variants' => [
                ['price' => 95000, 'unit' => 'Gói 200g']
            ]
        ],
        [
            'slug' => 'mat-ong-rung-tram',
            'name' => 'Mật Ong Rừng Tràm U Minh',
            'badge' => 'Rừng 100%',
            'harvest_season' => 'Quanh năm',
            'description' => 'Mật ong hoa tràm nguyên chất 100% thu hoạch tự nhiên từ rừng tràm U Minh Cà Mau, màu vàng óng, thơm nồng dịu.',
            'variants' => [
                ['price' => 180000, 'unit' => 'Chai 500ml'],
                ['price' => 340000, 'unit' => 'Chai 1 Lít']
            ]
        ],
        [
            'slug' => 'rau-huu-co-tong-hop',
            'name' => 'Rau Hữu Cơ Tổng Hợp Đà Lạt',
            'badge' => 'Organic',
            'harvest_season' => 'Quanh năm',
            'description' => 'Combo 5 loại rau củ hữu cơ Đà Lạt: Xà lách lolo, cải kale, cà chua bi cherry, cà rốt baby, ớt chuông ngọt.',
            'variants' => [
                ['price' => 85000, 'unit' => 'Combo 2kg (5 loại rau)']
            ]
        ]
    ];

    $prodStmt = $pdo->prepare("UPDATE `products` SET `name` = :name, `badge` = :badge, `harvest_season` = :harvest_season, `description` = :description WHERE `slug` = :slug");
    $variantStmt = $pdo->prepare("UPDATE `product_variants` SET `unit` = :unit WHERE `product_id` = :prod_id AND ABS(`price` - :price) < 1");

    foreach ($products as $p) {
        $prodStmt->execute([
            ':name' => $p['name'],
            ':badge' => $p['badge'],
            ':harvest_season' => $p['harvest_season'],
            ':description' => $p['description'],
            ':slug' => $p['slug']
        ]);

        // Get product id
        $pRow = $pdo->query("SELECT `id` FROM `products` WHERE `slug` = " . $pdo->quote($p['slug']))->fetch(PDO::FETCH_ASSOC);
        if ($pRow) {
            foreach ($p['variants'] as $v) {
                $variantStmt->execute([
                    ':unit' => $v['unit'],
                    ':prod_id' => $pRow['id'],
                    ':price' => $v['price']
                ]);
            }
        }
    }
    echo "Updated all products and variants with clean Vietnamese UTF-8\n";

    echo "=== DATABASE UTF-8 & MOJIBAKE FIX COMPLETED SUCCESSFULLY ===\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
