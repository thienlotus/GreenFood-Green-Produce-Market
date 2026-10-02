<?php

namespace App\Modules\Chat\Services;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiChatbotService
{
    protected string $apiKey;
    protected string $model;
    protected int $maxTokens;
    protected bool $autoReply;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', env('GEMINI_API_KEY', ''));
        $this->model = config('services.gemini.model', env('GEMINI_MODEL', 'gemini-1.5-flash'));
        $this->maxTokens = (int) config('services.gemini.max_tokens', env('GEMINI_MAX_TOKENS', 200));
        $this->autoReply = (bool) config('services.gemini.auto_reply', env('GEMINI_AUTO_REPLY', true));
    }

    /**
     * Kiểm tra có bật tính năng tự động trả lời bằng AI hay không
     */
    public function isAutoReplyEnabled(): bool
    {
        return $this->autoReply;
    }

    /**
     * Sinh câu trả lời thông minh cho tin nhắn của khách hàng
     * Tối ưu token tối đa: Zero-token FAQ matching -> Context Windowing (max 4 tin) -> Gemini Flash (max 200 tokens) -> Fallback Engine
     */
    public function reply(string $conversationId, string $customerMessage): ?string
    {
        $cleanMessage = trim($customerMessage);
        if (empty($cleanMessage)) {
            return null;
        }

        // BƯỚC 1: Tiết kiệm token 100% bằng Fast-Path Zero-Token FAQ Engine
        $fastResponse = $this->matchFastFaq($cleanMessage);
        if ($fastResponse !== null) {
            return $fastResponse;
        }

        // BƯỚC 2: Nếu có Gemini API Key, gọi Gemini Flash API với Context Windowing (tiết kiệm 80% token)
        if (!empty($this->apiKey)) {
            $geminiResponse = $this->callGeminiFlash($conversationId, $cleanMessage);
            if (!empty($geminiResponse)) {
                return $geminiResponse;
            }
        }

        // BƯỚC 3: Fallback Domain AI Engine chuyên sâu về GreenFood (0 token tiêu tốn, phản hồi tức thì)
        return $this->fallbackDomainResponse($cleanMessage);
    }

    /**
     * BƯỚC 1: Zero-Token Quick Matching (0 tokens, 0ms latency)
     */
    protected function matchFastFaq(string $text): ?string
    {
        $lower = mb_strtolower($text, 'UTF-8');

        // Yêu cầu gặp nhân viên tư vấn
        if (preg_match('/(gặp nhân viên|người thật|nhân viên|chăm sóc khách hàng|cskh|admin|tổng đài)/i', $lower)) {
            return "🤖 Dạ em đã ghi nhận yêu cầu của Quý khách! Em đã chuyển tiếp hội thoại đến chuyên viên tư vấn GreenFood. Nhân viên hỗ trợ sẽ phản hồi trong ít phút ạ.";
        }

        // Lời chào mở đầu
        if (preg_match('/^(xin chào|chào bạn|chào shop|chào ad|hello|hi|alo|chào|hé lô)$/i', $lower)) {
            return "🤖 Chào bạn! Em là Trợ lý AI GreenFood 🌱. Em có thể giúp bạn tìm kiếm nông sản sạch VietGAP, kiểm tra cước ship GHN, mã giảm giá hoặc thông tin đơn hàng ạ!";
        }

        // Cảm ơn & tạm biệt
        if (preg_match('/^(cảm ơn|thank|thanks|ok shop|dạ vâng|cảm ơn shop)$/i', $lower)) {
            return "🤖 Dạ không có chi ạ! Nếu cần hỗ trợ thêm thông tin gì về nông sản sạch GreenFood, bạn cứ nhắn em nhé. Chúc bạn một ngày nhiều năng lượng! 🌾";
        }

        // Địa chỉ & cửa hàng
        if (preg_match('/(địa chỉ|ở đâu|cửa hàng|chi nhánh|kho hàng)/i', $lower)) {
            return "🏠 GreenFood có kho trung tâm tại: Đường 3/2, Quận Ninh Kiều, TP. Cần Thơ & Trạm thu hoạch liên kết tại Đà Lạt, Bến Tre, Tiền Giang. Hàng hóa được giao tươi mỗi ngày qua Giao Hàng Nhanh (GHN) trên toàn quốc ạ!";
        }

        // Thanh toán
        if (preg_match('/(thanh toán|momo|cod|tiền mặt|chuyển khoản)/i', $lower)) {
            return "💳 GreenFood hỗ trợ các hình thức thanh toán linh hoạt: Ví điện tử MoMo (thanh toán an toàn qua QR/App), Chuyển khoản ngân hàng hoặc Thanh toán khi nhận hàng (COD) tận nơi ạ.";
        }

        // Giao hàng / GHN / Phí ship
        if (preg_match('/(phí ship|giao hàng|vận chuyển|ghn|giao trong bao lâu|bao lâu nhận được)/i', $lower)) {
            return "🚚 GreenFood liên kết cùng Giao Hàng Nhanh (GHN). Thời gian giao hàng từ 1-3 ngày tùy khu vực. Đơn hàng từ 300.000đ được hỗ trợ miễn phí vận chuyển trong nội ô ạ!";
        }

        return null;
    }

    /**
     * BƯỚC 2: Gọi Google Gemini Flash API với Context Windowing và Max Tokens giới hạn
     */
    protected function callGeminiFlash(string $conversationId, string $customerMessage): ?string
    {
        try {
            // Lấy tối đa 4 tin nhắn gần nhất để tạo ngữ cảnh vừa đủ, tránh phình to prompt (tiết kiệm token)
            $recentMessages = ChatMessage::where('conversation_id', $conversationId)
                ->latest()
                ->take(4)
                ->get()
                ->reverse();

            $contents = [];

            // System instructions ngắn gọn, súc tích (tiết kiệm token)
            $systemInstruction = "Bạn là Trợ lý ảo AI của GreenFood - Sàn thương mại điện tử Nông sản sạch & Đặc sản Việt Nam. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn trong tối đa 2-3 câu. Hỗ trợ thông tin về rau củ quả VietGAP, nông sản Đà Lạt, Bến Tre, giao hàng GHN, thanh toán MoMo/COD và chính sách GreenFood.";

            foreach ($recentMessages as $msg) {
                $role = ($msg->sender_role === 'customer') ? 'user' : 'model';
                $contents[] = [
                    'role' => $role,
                    'parts' => [['text' => $msg->message]]
                ];
            }

            // Thêm tin nhắn hiện tại nếu chưa có trong history
            if (empty($contents) || end($contents)['role'] !== 'user') {
                $contents[] = [
                    'role' => 'user',
                    'parts' => [['text' => $customerMessage]]
                ];
            }

            $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

            $response = Http::timeout(6)->post($endpoint, [
                'system_instruction' => [
                    'parts' => [['text' => $systemInstruction]]
                ],
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.6,
                    'maxOutputTokens' => $this->maxTokens,
                    'topP' => 0.8,
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $replyText = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if (!empty($replyText)) {
                    return "🤖 " . trim($replyText);
                }
            } else {
                Log::warning("Gemini API Error: " . $response->body());
            }
        } catch (\Throwable $e) {
            Log::warning("Gemini Service Exception: " . $e->getMessage());
        }

        return null;
    }

    /**
     * BƯỚC 3: Fallback Nông sản Thông minh (Không tốn token API, trả lời sát nghiệp vụ GreenFood)
     */
    protected function fallbackDomainResponse(string $text): string
    {
        $lower = mb_strtolower($text, 'UTF-8');

        if (preg_match('/(rau|cải|muống|mồng tơi|xà lách|cà chua|dưa leo|bí đao|bầu|khoai)/i', $lower)) {
            return "🥦 Các mặt hàng rau củ quả tại GreenFood đều đạt chuẩn VietGAP/Hữu cơ, được nông dân thu hoạch vào sáng sớm và đóng gói bảo quản mát. Bạn có thể ghé mục 'Đi chợ online' để chọn rau tươi trong ngày nhé!";
        }

        if (preg_match('/(trái cây|hoa quả|dâu tây|sầu riêng|bưởi|xoài|cam|ổi|thanh long)/i', $lower)) {
            return "🍉 Trái cây tại GreenFood chuẩn chín cây tự nhiên, xuất xứ từ các vựa đặc sản nổi tiếng như Dâu tây Đà Lạt, Sầu riêng Ri6 Bến Tre, Bưởi da xanh. Hàng được cam kết bao ăn, 1 đổi 1 nếu bị dập úng ạ!";
        }

        if (preg_match('/(trà|cà phê|cacao|mật ong|đặc sản|gạo)/i', $lower)) {
            return "☕ GreenFood có đầy đủ các dòng đặc sản sạch: Trà xanh Thái Nguyên, Cà phê Robusta Mộc Châu rang mộc nguyên chất, và Mật ong hoa tràm nguyên chất chuẩn xuất khẩu ạ.";
        }

        if (preg_match('/(đơn hàng|mã đơn|kiểm tra đơn|tra cứu|hủy đơn)/i', $lower)) {
            return "📦 Bạn có thể vào mục 'Đơn hàng của tôi' để theo dõi chi tiết tình trạng đơn hàng và lộ trình giao GHN. Nếu cần hỗ trợ thay đổi địa chỉ hoặc hủy đơn chờ xử lý, hãy cho em xin Mã đơn hàng nhé!";
        }

        if (preg_match('/(khuyến mãi|giảm giá|voucher|mã|sale|ưu đãi)/i', $lower)) {
            return "🎁 Hiện GreenFood đang có chương trình tặng mã Freeship cho đơn từ 300.000đ và giảm 10% cho thành viên mới đăng ký. Bạn có thể nhập mã voucher ở bước Đặt hàng nhé!";
        }

        if (preg_match('/(giá|bao nhiêu tiền|bao nhiêu|báo giá)/i', $lower)) {
            return "🏷️ Giá sản phẩm tại GreenFood được niêm yết công khai và cập nhật liên tục theo ngày tại website. Bạn có thể gõ tên sản phẩm vào thanh tìm kiếm để xem giá chi tiết và ưu đãi kèm theo ạ!";
        }

        return "🤖 Dạ em đã ghi nhận thắc mắc của bạn về \"{$text}\". GreenFood cam kết cung cấp 100% nông sản sạch, tươi ngon chuẩn VietGAP. Bạn có muốn em kết nối với Nhân viên tư vấn để hỗ trợ chi tiết hơn không ạ?";
    }

    /**
     * Lấy ID tài khoản Admin để làm sender đại diện cho tin nhắn bot
     */
    public function getBotSenderId(): ?string
    {
        $admin = User::where('role', 'ADMIN')->first();
        return $admin ? $admin->id : User::first()?->id;
    }
}
