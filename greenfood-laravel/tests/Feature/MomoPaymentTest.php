<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use App\Services\MomoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MomoPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected Order $order;
    protected MomoService $momoService;

    protected function setUp(): void
    {
        parent::setUp();

        $user = User::create([
            'full_name' => 'Khach Hang Test',
            'phone' => '0912345678',
            'email' => 'customer@test.com',
            'password' => bcrypt('password'),
            'role' => 'CUSTOMER',
        ]);

        $this->order = Order::create([
            'tracking_number' => 'GF-MOMO-TEST',
            'user_id' => $user->id,
            'customer_name' => 'Khách Hàng MoMo',
            'customer_phone' => '0912345678',
            'shipping_address' => '123 Đường Cầu Giấy, Hà Nội',
            'shipping_fee' => 20000,
            'total_amount' => 250000,
            'status' => 'PENDING',
            'payment_method' => 'MOMO',
            'payment_status' => 'unpaid',
        ]);

        $this->momoService = app(MomoService::class);
    }

    /**
     * Test creating a MoMo payment returns a valid payUrl and requestId.
     */
    public function test_can_create_momo_payment()
    {
        \Illuminate\Support\Facades\Http::fake([
            'test-payment.momo.vn/*' => \Illuminate\Support\Facades\Http::response([
                'partnerCode' => 'MOMOBKUN20180529',
                'orderId' => $this->order->tracking_number,
                'requestId' => 'REQ_123456',
                'amount' => 250000,
                'responseTime' => time() . '000',
                'message' => 'Thành công.',
                'resultCode' => 0,
                'payUrl' => 'https://test-payment.momo.vn/v2/gateway/pay?s=123456',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/payment/momo/create', [
            'order_id' => $this->order->tracking_number,
            'amount' => 250000,
            'order_info' => 'Thanh toan don hang GF-MOMO-TEST',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonStructure([
                     'success',
                     'payUrl',
                     'orderId',
                     'requestId',
                     'amount'
                 ]);

        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $this->order->id,
            'payment_method' => 'MOMO',
            'amount' => 250000,
            'status' => 'pending',
        ]);
    }

    /**
     * Test create MoMo payment validation fails when order_id is missing.
     */
    public function test_create_momo_payment_requires_order_id()
    {
        $response = $this->postJson('/api/v1/payment/momo/create', [
            'amount' => 50000,
        ]);

        $response->assertStatus(422)
                 ->assertJson(['success' => false]);
    }

    /**
     * Test MoMo IPN Webhook callback with valid signature updates order and transaction to success.
     */
    public function test_momo_ipn_callback_with_valid_signature_updates_order()
    {
        $accessKey = config('services.momo.access_key', 'klm05TvNBzhg7h7j');
        $secretKey = config('services.momo.secret_key', 'at67qH6mk8w5Y1nAyMoYKMWACiEi2Aca');
        $partnerCode = config('services.momo.partner_code', 'MOMOBKUN20180529');

        $requestId = 'REQ_' . time();
        $transId = 'TRANS_' . time();
        $amount = 250000;
        $orderId = $this->order->tracking_number;
        $orderInfo = 'Thanh toan don hang GF-MOMO-TEST';
        $orderType = 'momo_wallet';
        $payType = 'qr';
        $responseTime = time() . '000';
        $resultCode = 0;
        $message = 'Giao dich thanh cong';
        $extraData = '';

        // Build exact MoMo signature
        $rawHash = "accessKey={$accessKey}&amount={$amount}&extraData={$extraData}&message={$message}&orderId={$orderId}&orderInfo={$orderInfo}&orderType={$orderType}&partnerCode={$partnerCode}&payType={$payType}&requestId={$requestId}&responseTime={$responseTime}&resultCode={$resultCode}&transId={$transId}";
        $signature = hash_hmac('sha256', $rawHash, $secretKey);

        $payload = [
            'partnerCode' => $partnerCode,
            'orderId' => $orderId,
            'requestId' => $requestId,
            'amount' => $amount,
            'orderInfo' => $orderInfo,
            'orderType' => $orderType,
            'transId' => $transId,
            'resultCode' => $resultCode,
            'message' => $message,
            'payType' => $payType,
            'responseTime' => $responseTime,
            'extraData' => $extraData,
            'signature' => $signature,
        ];

        $response = $this->postJson('/api/v1/payment/momo/callback', $payload);

        $response->assertStatus(200)
                 ->assertJson([
                     'resultCode' => 0,
                     'message' => 'Xác nhận IPN từ MoMo thành công'
                 ]);

        // Order status should be confirmed and paid
        $this->order->refresh();
        $this->assertEquals('CONFIRMED', $this->order->status);
        $this->assertEquals('paid', $this->order->payment_status);

        // Transaction should be success
        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $this->order->id,
            'status' => 'success',
            'momo_trans_id' => $transId,
        ]);
    }

    /**
     * Test MoMo IPN callback rejects invalid signature with status 400.
     */
    public function test_momo_ipn_callback_rejects_invalid_signature()
    {
        $payload = [
            'partnerCode' => 'MOMO',
            'orderId' => $this->order->tracking_number,
            'amount' => 250000,
            'resultCode' => 0,
            'signature' => 'invalid_signature_string',
        ];

        $response = $this->postJson('/api/v1/payment/momo/callback', $payload);

        $response->assertStatus(400)
                 ->assertJson([
                     'resultCode' => 99,
                 ]);
    }

    /**
     * Test checking MoMo transaction status via API endpoint.
     */
    public function test_check_momo_transaction_status()
    {
        // First create a pending transaction
        PaymentTransaction::create([
            'order_id' => $this->order->id,
            'payment_method' => 'MOMO',
            'amount' => 250000,
            'status' => 'pending',
            'momo_request_id' => 'REQ_STATUS_TEST',
        ]);

        $response = $this->postJson('/api/v1/payment/momo/check-status', [
            'order_id' => $this->order->tracking_number,
        ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonPath('data.status', 'pending');
    }
}
