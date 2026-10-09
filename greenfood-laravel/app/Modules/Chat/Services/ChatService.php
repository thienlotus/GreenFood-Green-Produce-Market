<?php

declare(strict_types=1);

namespace App\Modules\Chat\Services;

use App\Modules\Chat\Repositories\ChatRepository;
use Illuminate\Support\Str;

class ChatService
{
    public function __construct(
        protected ChatRepository $chatRepository,
        protected GeminiChatbotService $geminiChatbotService
    ) {}

    public function getConversations(array $filters = [])
    {
        $conversations = $this->chatRepository->getConversations($filters);

        return $conversations->map(function ($conv) {
            return [
                'id' => $conv->id,
                'type' => $conv->type ?? 'customer_admin',
                'customer' => $conv->customer ? [
                    'id' => $conv->customer->id,
                    'name' => $conv->customer->full_name ?? $conv->customer->name ?? 'Khách hàng',
                    'email' => $conv->customer->email,
                    'phone' => $conv->customer->phone,
                    'avatar' => $conv->customer->avatar_url,
                ] : null,
                'farmer' => $conv->farmer ? [
                    'id' => $conv->farmer->id,
                    'farm_name' => $conv->farmer->farm_name,
                    'address' => $conv->farmer->address,
                    'image_url' => $conv->farmer->image_url,
                    'rating' => (float)$conv->farmer->rating,
                    'user' => $conv->farmer->user ? [
                        'id' => $conv->farmer->user->id,
                        'name' => $conv->farmer->user->full_name ?? $conv->farmer->user->name ?? 'Chủ vườn',
                        'phone' => $conv->farmer->user->phone,
                    ] : null,
                ] : null,
                'product' => $conv->product ? [
                    'id' => $conv->product->id,
                    'name' => $conv->product->name,
                    'slug' => $conv->product->slug,
                    'image_url' => $conv->product->image_url,
                ] : null,
                'admin' => $conv->admin ? [
                    'id' => $conv->admin->id,
                    'name' => $conv->admin->full_name ?? $conv->admin->name ?? 'Admin',
                ] : null,
                'subject' => $conv->subject,
                'status' => $conv->status,
                'unread_count' => $conv->unread_count ?? 0,
                'last_message' => $conv->latestMessage ? [
                    'message' => Str::limit($conv->latestMessage->message, 80),
                    'sender_role' => $conv->latestMessage->sender_role,
                    'created_at' => $conv->latestMessage->created_at->timezone('Asia/Ho_Chi_Minh')->diffForHumans(),
                ] : null,
                'created_at' => $conv->created_at->timezone('Asia/Ho_Chi_Minh')->format('H:i d/m'),
                'updated_at' => $conv->updated_at->timezone('Asia/Ho_Chi_Minh')->diffForHumans(),
            ];
        });
    }

    public function getConversationMessages(string $conversationId, string $viewerRole = 'admin')
    {
        $conversation = $this->chatRepository->findConversation($conversationId);
        if (!$conversation) {
            return null;
        }

        // Đánh dấu đã đọc các tin nhắn gửi từ bên kia
        $this->chatRepository->markAsRead($conversationId, $viewerRole);

        $messages = $this->chatRepository->getMessages($conversationId);

        return [
            'conversation' => [
                'id' => $conversation->id,
                'type' => $conversation->type ?? 'customer_admin',
                'customer' => $conversation->customer ? [
                    'id' => $conversation->customer->id,
                    'name' => $conversation->customer->full_name ?? $conversation->customer->name ?? 'Khách hàng',
                    'email' => $conversation->customer->email,
                    'phone' => $conversation->customer->phone,
                ] : null,
                'farmer' => $conversation->farmer ? [
                    'id' => $conversation->farmer->id,
                    'farm_name' => $conversation->farmer->farm_name,
                    'address' => $conversation->farmer->address,
                    'image_url' => $conversation->farmer->image_url,
                ] : null,
                'product' => $conversation->product ? [
                    'id' => $conversation->product->id,
                    'name' => $conversation->product->name,
                    'slug' => $conversation->product->slug,
                    'image_url' => $conversation->product->image_url,
                ] : null,
                'admin' => $conversation->admin ? [
                    'id' => $conversation->admin->id,
                    'name' => $conversation->admin->full_name ?? $conversation->admin->name ?? 'Admin',
                ] : null,
                'subject' => $conversation->subject,
                'status' => $conversation->status,
            ],
            'messages' => $messages->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'sender_id' => $msg->sender_id,
                    'sender_role' => $msg->sender_role,
                    'sender_name' => $msg->sender->full_name ?? $msg->sender->name ?? 'Người dùng',
                    'message' => $msg->message,
                    'message_type' => $msg->message_type,
                    'is_read' => $msg->is_read,
                    'created_at' => $msg->created_at->timezone('Asia/Ho_Chi_Minh')->format('H:i d/m'),
                    'created_at_iso' => $msg->created_at->timezone('Asia/Ho_Chi_Minh')->toIso8601String(),
                ];
            }),
        ];
    }

    public function createConversation(string $customerId, string $subject, ?string $initialMessage = null): array
    {
        $conversation = $this->chatRepository->findOrCreateConversation($customerId, $subject);

        if ($initialMessage) {
            $this->chatRepository->createMessage([
                'conversation_id' => $conversation->id,
                'sender_id' => $customerId,
                'sender_role' => 'customer',
                'message' => $initialMessage,
                'message_type' => 'text',
            ]);

            if ($this->geminiChatbotService->isAutoReplyEnabled() && empty($conversation->admin_id)) {
                $botReply = $this->geminiChatbotService->reply($conversation->id, $initialMessage);
                if ($botReply) {
                    $botSenderId = $this->geminiChatbotService->getBotSenderId();
                    if ($botSenderId) {
                        $this->chatRepository->createMessage([
                            'conversation_id' => $conversation->id,
                            'sender_id' => $botSenderId,
                            'sender_role' => 'admin',
                            'message' => $botReply,
                            'message_type' => 'text',
                        ]);
                    }
                }
            }
        }

        return [
            'id' => $conversation->id,
            'status' => $conversation->status,
        ];
    }

    public function createCustomerFarmerConversation(
        string $customerId,
        string $farmerId,
        ?string $productId = null,
        ?string $initialMessage = null
    ): array {
        $conversation = $this->chatRepository->findOrCreateCustomerFarmerConversation(
            $customerId,
            $farmerId,
            $productId
        );

        if ($initialMessage) {
            $this->chatRepository->createMessage([
                'conversation_id' => $conversation->id,
                'sender_id' => $customerId,
                'sender_role' => 'customer',
                'message' => $initialMessage,
                'message_type' => 'text',
            ]);
        }

        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'status' => $conversation->status,
        ];
    }

    public function createFarmerAdminConversation(
        string $farmerId,
        ?string $initialMessage = null
    ): array {
        $conversation = $this->chatRepository->findOrCreateFarmerAdminConversation($farmerId);

        if ($initialMessage) {
            $farmer = \App\Models\Farmer::find($farmerId);
            $senderId = $farmer ? $farmer->user_id : null;
            if ($senderId) {
                $this->chatRepository->createMessage([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $senderId,
                    'sender_role' => 'farmer',
                    'message' => $initialMessage,
                    'message_type' => 'text',
                ]);
            }
        }

        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'status' => $conversation->status,
        ];
    }

    public function sendMessage(
        string $conversationId,
        string $senderId,
        string $senderRole,
        string $message,
        string $messageType = 'text'
    ): ?array {
        $conversation = $this->chatRepository->findConversation($conversationId);
        if (!$conversation) {
            return null;
        }

        $msg = $this->chatRepository->createMessage([
            'conversation_id' => $conversationId,
            'sender_id' => $senderId,
            'sender_role' => $senderRole,
            'message' => $message,
            'message_type' => $messageType,
        ]);

        $botReplyData = null;

        // Chỉ auto-reply bot cho luồng customer_admin khi khách gửi tin và chưa có admin nhận
        if ($conversation->type === 'customer_admin' && $senderRole === 'customer' && $this->geminiChatbotService->isAutoReplyEnabled() && empty($conversation->admin_id)) {
            $replyText = $this->geminiChatbotService->reply($conversationId, $message);
            if ($replyText) {
                $botSenderId = $this->geminiChatbotService->getBotSenderId();
                if ($botSenderId) {
                    $bMsg = $this->chatRepository->createMessage([
                        'conversation_id' => $conversationId,
                        'sender_id' => $botSenderId,
                        'sender_role' => 'admin',
                        'message' => $replyText,
                        'message_type' => 'text',
                    ]);

                    $botReplyData = [
                        'id' => $bMsg->id,
                        'sender_id' => $bMsg->sender_id,
                        'sender_role' => $bMsg->sender_role,
                        'sender_name' => 'Trợ lý AI (Gemini Flash)',
                        'message' => $bMsg->message,
                        'message_type' => $bMsg->message_type,
                        'created_at' => $bMsg->created_at->timezone('Asia/Ho_Chi_Minh')->format('H:i d/m'),
                        'created_at_iso' => $bMsg->created_at->timezone('Asia/Ho_Chi_Minh')->toIso8601String(),
                    ];
                }
            }
        }

        return [
            'id' => $msg->id,
            'conversation_id' => $conversationId,
            'sender_id' => $senderId,
            'sender_role' => $senderRole,
            'message' => $msg->message,
            'message_type' => $msg->message_type,
            'created_at' => $msg->created_at->timezone('Asia/Ho_Chi_Minh')->format('H:i d/m'),
            'created_at_iso' => $msg->created_at->timezone('Asia/Ho_Chi_Minh')->toIso8601String(),
            'bot_reply' => $botReplyData,
        ];
    }

    public function assignAdmin(string $conversationId, string $adminId): bool
    {
        return $this->chatRepository->assignAdmin($conversationId, $adminId);
    }

    public function closeConversation(string $conversationId): bool
    {
        return $this->chatRepository->closeConversation($conversationId);
    }

    public function getUnreadCount(string $userId, string $role = 'admin', ?string $farmerId = null): int
    {
        return $this->chatRepository->getUnreadCount($userId, $role, $farmerId);
    }
}
