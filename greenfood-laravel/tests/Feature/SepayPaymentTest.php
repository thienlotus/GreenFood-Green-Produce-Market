<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use App\Services\SepayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SepayPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected Order $order;
    protected SepayService $sepayService;

    protected function setUp(): void
    {
        parent::setUp();

        $user = User::create([
            'full_name' => 'Khach Hang Test SePay',
            'phone' => '0987654321',
            'email' => 'sepay_customer@test.com',
            'password' => bcrypt('password'),
            'role' => 'CUSTOMER',
        ]);

        $this->order = Order::create([
            'tracking_number' => 'GF-SEPAY-001',
            'user_id' => $user->id,
            'customer_name' => 'Khách Hàng Test SePay',
            'customer_phone' => '0987654321',
            'shipping_address' => '456 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội',
            'shipping_fee' => 15000,
            'total_amount' => 150000,
            'status' => 'PENDING',
            'payment_method' => 'BANK_TRANSFER',
            'payment_status' => 'unpaid',
        ]);

        $this->sepayService = app(SepayService::class);
    }

    /**
     * Test creating a SePay payment returns a valid VietQR code and details.
     */
    public function test_can_create_sepay_payment()
    {
        $response = $this->postJson('/api/v1/payment/sepay/create', [
            'order_id' => $this->order->tracking_number,
            'amount' => 150000,
            'order_info' => 'Thanh toan don hang GF-SEPAY-001',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonStructure([
                     'success',
                     'orderId',
                     'amount',
                     'bank',
                     'accountNumber',
                     'accountName',
                     'description',
                     'qrCodeUrl',
                     'message',
                 ]);

        // Verify pending transaction was created
        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $this->order->id,
            'payment_method' => 'SEPAY',
            'status' => 'pending',
            'amount' => 150000,
        ]);
    }

    /**
     * Test SePay webhook authentication fails with invalid key.
     */
    public function test_sepay_webhook_rejects_invalid_api_key()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Apikey WRONG_KEY_123',
        ])->postJson('/api/v1/payment/sepay/webhook', [
            'transferType' => 'in',
            'transferAmount' => 150000,
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test SePay webhook confirms order and updates transaction to success.
     */
    public function test_sepay_webhook_confirms_order_and_transaction()
    {
        $apiKey = config('services.sepay.webhook_api_key');

        $response = $this->withHeaders([
            'Authorization' => 'Apikey ' . $apiKey,
        ])->postJson('/api/v1/payment/sepay/webhook', [
            'id' => 88888,
            'gateway' => 'MBBank',
            'transactionDate' => '2026-10-05 13:40:00',
            'accountNumber' => '0987654321',
            'code' => 'GF-SEPAY-001',
            'content' => 'GF-SEPAY-001 thanh toan don hang GreenFood',
            'transferType' => 'in',
            'transferAmount' => 150000,
            'accumulated' => 150000,
            'referenceCode' => 'MB_REF_88888',
            'description' => 'GF-SEPAY-001 thanh toan',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);

        // Order must be updated to CONFIRMED and paid
        $this->order->refresh();
        $this->assertEquals('CONFIRMED', $this->order->status);
        $this->assertEquals('paid', $this->order->payment_status);
        $this->assertEquals('BANK_TRANSFER', $this->order->payment_method);

        // PaymentTransaction must be updated to success
        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $this->order->id,
            'payment_method' => 'SEPAY',
            'status' => 'success',
        ]);
    }

    /**
     * Test checking SePay order status.
     */
    public function test_can_check_sepay_order_status()
    {
        // Unpaid first
        $response = $this->postJson('/api/v1/payment/sepay/check-status', [
            'order_id' => $this->order->tracking_number,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'isPaid' => false,
                     'status' => 'pending',
                 ]);

        // Mark paid
        $this->order->update([
            'payment_status' => 'paid',
            'status' => 'CONFIRMED',
        ]);

        $response2 = $this->postJson('/api/v1/payment/sepay/check-status', [
            'order_id' => $this->order->tracking_number,
        ]);

        $response2->assertStatus(200)
                  ->assertJson([
                      'success' => true,
                      'isPaid' => true,
                      'status' => 'paid',
                  ]);
    }
}
