<?php

namespace Tests\Feature;

use App\Models\ChatConversation;
use App\Models\User;
use App\Modules\Chat\Services\GeminiChatbotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GeminiChatbotTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed admin user
        User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Admin GreenFood',
            'full_name' => 'Admin GreenFood',
            'email' => 'admin@greenfood.vn',
            'phone' => '0900000000',
            'password' => bcrypt('123456'),
            'role' => 'ADMIN',
            'email_verified' => true,
        ]);
    }

    public function test_fast_faq_zero_token_greeting(): void
    {
        $service = app(GeminiChatbotService::class);
        $reply = $service->reply((string) Str::uuid(), 'Xin chào');

        $this->assertNotNull($reply);
        $this->assertStringContainsString('Trợ lý AI GreenFood', $reply);
    }

    public function test_fast_faq_payment_information(): void
    {
        $service = app(GeminiChatbotService::class);
        $reply = $service->reply((string) Str::uuid(), 'Shop có thanh toán MoMo không?');

        $this->assertNotNull($reply);
        $this->assertStringContainsString('MoMo', $reply);
    }

    public function test_fast_faq_shipping_ghn(): void
    {
        $service = app(GeminiChatbotService::class);
        $reply = $service->reply((string) Str::uuid(), 'Phí giao hàng bao nhiêu và vận chuyển qua đâu?');

        $this->assertNotNull($reply);
        $this->assertStringContainsString('GHN', $reply);
    }

    public function test_fallback_domain_vegetables_vietgap(): void
    {
        $service = app(GeminiChatbotService::class);
        $reply = $service->reply((string) Str::uuid(), 'Rau muống và xà lách có tươi không shop?');

        $this->assertNotNull($reply);
        $this->assertStringContainsString('VietGAP', $reply);
    }

    public function test_customer_message_triggers_ai_auto_reply_in_chat(): void
    {
        $customer = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Khách Hàng Test',
            'full_name' => 'Khách Hàng Test',
            'email' => 'customer@gmail.com',
            'phone' => '0912345678',
            'password' => bcrypt('123456'),
            'role' => 'CUSTOMER',
            'email_verified' => true,
        ]);

        // Tạo hội thoại
        $createRes = $this->postJson('/api/chat/conversations', [
            'customer_id' => $customer->id,
            'subject' => 'Tư vấn rau sạch',
        ]);
        $createRes->assertStatus(201);
        $convId = $createRes->json('data.id');

        // Gửi tin nhắn khách hàng
        $sendRes = $this->postJson("/api/chat/conversations/{$convId}/messages", [
            'sender_id' => $customer->id,
            'sender_role' => 'customer',
            'message' => 'Phí ship về Cần Thơ tính thế nào vậy ạ?',
        ]);

        $sendRes->assertStatus(201);
        $this->assertNotNull($sendRes->json('data.bot_reply'));
        $this->assertStringContainsString('GHN', $sendRes->json('data.bot_reply.message'));

        // Kiểm tra customer get messages đã chứa tin nhắn bot
        $historyRes = $this->getJson("/api/chat/conversations/{$convId}/customer?customer_id={$customer->id}");
        $historyRes->assertStatus(200);
        $messages = $historyRes->json('data.messages');
        $this->assertGreaterThanOrEqual(2, count($messages));
    }
}
