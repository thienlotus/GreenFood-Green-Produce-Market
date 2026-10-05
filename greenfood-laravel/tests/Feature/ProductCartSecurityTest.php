<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Farmer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCartSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected $category;
    protected $farmer;

    protected function setUp(): void
    {
        parent::setUp();

        $user = User::create([
            'full_name' => 'Nong Dan Test',
            'phone' => '0988776655',
            'email' => 'farmer@test.com',
            'password' => bcrypt('password'),
            'role' => 'VENDOR',
        ]);

        $this->category = Category::create([
            'name' => 'Rau củ hữu cơ',
            'slug' => 'rau-cu-huu-co',
            'description' => 'Các loại rau củ hữu cơ tươi sạch',
        ]);

        // Create a dummy region
        $region = \App\Models\Region::create([
            'name' => 'Đà Lạt',
            'slug' => 'da-lat',
            'zone' => 'central',
        ]);

        $this->farmer = Farmer::create([
            'user_id' => $user->id,
            'farm_name' => 'Nông trại Xanh Đà Lạt',
            'address' => 'Đà Lạt, Lâm Đồng',
            'region_id' => $region->id,
        ]);
    }

    /**
     * Test StoreProductRequest successfully creates product and default variant.
     */
    public function test_can_create_product_with_form_request()
    {
        $payload = [
            'name' => 'Cà rốt hữu cơ Đà Lạt',
            'category_id' => $this->category->id,
            'farmer_id' => $this->farmer->id,
            'description' => 'Cà rốt tươi ngon trồng tự nhiên',
            'price' => 35000,
            'stock' => 50,
            'unit' => '1kg',
            'image_url' => 'https://example.com/carot.jpg',
        ];

        $response = $this->postJson('/api/v1/products', $payload);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Tạo sản phẩm thành công!',
                 ])
                 ->assertJsonPath('data.name', 'Cà rốt hữu cơ Đà Lạt')
                 ->assertJsonPath('data.price', 35000);

        $this->assertDatabaseHas('products', ['name' => 'Cà rốt hữu cơ Đà Lạt']);
        $this->assertDatabaseHas('product_variants', ['price' => 35000, 'stock_quantity' => 50]);
    }

    /**
     * Test StoreProductRequest validation errors on missing fields.
     */
    public function test_create_product_validation_errors()
    {
        $response = $this->postJson('/api/v1/products', [
            'description' => 'Thiếu tên và giá',
        ]);

        $response->assertStatus(400)
                 ->assertJson([
                     'success' => false,
                     'status' => 400,
                 ])
                 ->assertJsonStructure(['errors' => ['name', 'category_id', 'price']]);
    }

    /**
     * Test Product sorting by price without duplicate product rows when products have multiple variants.
     */
    public function test_product_price_sorting_does_not_duplicate_products()
    {
        // Product 1 with 2 variants: 50k and 90k
        $p1 = Product::create([
            'farmer_id' => $this->farmer->id,
            'category_id' => $this->category->id,
            'name' => 'Bắp cải tí hon',
            'slug' => 'bap-cai-ti-hon',
            'description' => 'Ngon ngọt',
        ]);
        ProductVariant::create([
            'product_id' => $p1->id,
            'unit' => '500g',
            'price' => 50000,
            'stock_quantity' => 20,
        ]);
        ProductVariant::create([
            'product_id' => $p1->id,
            'unit' => '1kg',
            'price' => 90000,
            'stock_quantity' => 10,
        ]);

        // Product 2 with 1 variant: 20k
        $p2 = Product::create([
            'farmer_id' => $this->farmer->id,
            'category_id' => $this->category->id,
            'name' => 'Rau muống sạch',
            'slug' => 'rau-muong-sach',
            'description' => 'Rau muống nước',
        ]);
        ProductVariant::create([
            'product_id' => $p2->id,
            'unit' => '1 bó',
            'price' => 20000,
            'stock_quantity' => 30,
        ]);

        // Sort price-asc
        $responseAsc = $this->getJson('/api/v1/products?sort=price-asc');
        $responseAsc->assertStatus(200);
        $dataAsc = $responseAsc->json('data');

        // Check count: exactly 2 products, no duplicates!
        $this->assertCount(2, $dataAsc);
        $this->assertEquals('Rau muống sạch', $dataAsc[0]['name']);
        $this->assertEquals('Bắp cải tí hon', $dataAsc[1]['name']);

        // Sort price-desc
        $responseDesc = $this->getJson('/api/v1/products?sort=price-desc');
        $responseDesc->assertStatus(200);
        $dataDesc = $responseDesc->json('data');

        $this->assertCount(2, $dataDesc);
        $this->assertEquals('Bắp cải tí hon', $dataDesc[0]['name']);
        $this->assertEquals('Rau muống sạch', $dataDesc[1]['name']);
    }

    /**
     * CRITICAL SECURITY TEST: Client Price Tampering Protection.
     * Even if client sends price: 1 VNĐ, the server recalculates based on actual variant price.
     */
    public function test_cart_calculation_prevents_client_price_tampering()
    {
        $product = Product::create([
            'farmer_id' => $this->farmer->id,
            'category_id' => $this->category->id,
            'name' => 'Nấm linh chi đỏ',
            'slug' => 'nam-linh-chi-do',
            'description' => 'Thảo dược cao cấp',
        ]);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'unit' => 'Hộp 500g',
            'price' => 750000, // Real price: 750,000đ
            'stock_quantity' => 15,
        ]);

        // Malicious client tries tampering price down to 1đ
        $tamperedRequest = [
            'items' => [
                [
                    'variant_id' => $variant->id,
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'price' => 1, // Tampered price
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/cart/calculate', $tamperedRequest);

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);

        // Must calculate 750,000 * 2 = 1,500,000đ, NOT 2đ!
        $calculatedSubtotal = $response->json('data.subtotal');
        $this->assertEquals(1500000, $calculatedSubtotal);
        $this->assertEquals(750000, $response->json('data.items.0.price'));
    }

    /**
     * Test CalculateCartRequest validation fails when items are missing.
     */
    public function test_calculate_cart_validation_rules()
    {
        $response = $this->postJson('/api/v1/cart/calculate', [
            'items' => []
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                 ]);
    }

    /**
     * Test Cart calculation with shipping zone and free shipping minimum.
     */
    public function test_cart_calculation_with_shipping_zone_and_voucher()
    {
        $product = Product::create([
            'farmer_id' => $this->farmer->id,
            'category_id' => $this->category->id,
            'name' => 'Bưởi da xanh',
            'slug' => 'buoi-da-xanh',
            'description' => 'Bưởi ngọt thanh',
        ]);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'unit' => '1 quả',
            'price' => 60000,
            'stock_quantity' => 50,
        ]);

        $zone = ShippingZone::create([
            'id' => 'SZ-TEST',
            'name' => 'Khu vực Nội thành',
            'provinces' => 'Hà Nội',
            'base_fee' => 25000,
            'extra_fee_per_kg' => 0,
            'free_ship_minimum' => 200000,
            'estimated_days' => '1 ngày',
            'is_active' => true,
        ]);

        // Buy 2 items: 120k < 200k -> shipping fee 25k
        $res1 = $this->postJson('/api/v1/cart/calculate', [
            'items' => [
                ['variant_id' => $variant->id, 'quantity' => 2]
            ],
            'shipping_zone_id' => 'SZ-TEST',
            'voucher_code' => 'GREEN10' // 10% on 120k = 12,000đ
        ]);

        $res1->assertStatus(200);
        $this->assertEquals(120000, $res1->json('data.subtotal'));
        $this->assertEquals(25000, $res1->json('data.shipping_fee'));
        $this->assertEquals(12000, $res1->json('data.discount'));
        $this->assertEquals(133000, $res1->json('data.total')); // 120k - 12k + 25k = 133k

        // Buy 4 items: 240k >= 200k -> free shipping!
        $res2 = $this->postJson('/api/v1/cart/calculate', [
            'items' => [
                ['variant_id' => $variant->id, 'quantity' => 4]
            ],
            'shipping_zone_id' => 'SZ-TEST'
        ]);

        $res2->assertStatus(200);
        $this->assertEquals(240000, $res2->json('data.subtotal'));
        $this->assertEquals(0, $res2->json('data.shipping_fee'));
        $this->assertTrue($res2->json('data.free_shipping'));
        $this->assertEquals(240000, $res2->json('data.total'));
    }
}
