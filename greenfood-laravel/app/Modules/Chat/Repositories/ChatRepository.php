<?php

namespace App\Modules\Chat\Repositories;

use App\Models\ChatConversation;
use App\Models\ChatMessage;

class ChatRepository
{
    public function getConversations(array $filters = [])
    {
        $query = ChatConversation::with(['customer', 'admin', 'latestMessage'])
            ->withCount(['messages as unread_count' => function ($q) {
                $q->where('sender_role', 'customer')->where('is_read', false);
            }]);

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        return $query->orderByDesc('updated_at')->get();
    }

    public function findConversation(string $id): ?ChatConversation
    {
        return ChatConversation::with(['customer', 'admin'])->find($id);
    }

    public function findOrCreateConversation(string $customerId, string $subject = 'Hỗ trợ khách hàng'): ChatConversation
    {
        // Check if customer has an open/assigned conversation
        $existing = ChatConversation::where('customer_id', $customerId)
            ->whereIn('status', ['open', 'assigned'])
            ->first();

        if ($existing) {
            return $existing;
        }

        return ChatConversation::create([
            'customer_id' => $customerId,
            'subject' => $subject,
            'status' => 'open',
        ]);
    }

    public function getMessages(string $conversationId, int $limit = 50)
    {
        return ChatMessage::where('conversation_id', $conversationId)
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->limit($limit)
            ->get();
    }

    public function createMessage(array $data): ChatMessage
    {
        $message = ChatMessage::create($data);

        // Update conversation updated_at
        ChatConversation::where('id', $data['conversation_id'])
            ->update(['updated_at' => now()]);

        return $message;
    }

    public function markAsRead(string $conversationId, string $senderRole): int
    {
        return ChatMessage::where('conversation_id', $conversationId)
            ->where('sender_role', $senderRole)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    public function assignAdmin(string $conversationId, string $adminId): bool
    {
        return ChatConversation::where('id', $conversationId)
            ->update([
                'admin_id' => $adminId,
                'status' => 'assigned',
            ]) > 0;
    }

    public function closeConversation(string $conversationId): bool
    {
        return ChatConversation::where('id', $conversationId)
            ->update(['status' => 'closed']) > 0;
    }

    public function getUnreadCount(string $userId, string $role = 'admin'): int
    {
        $senderRole = $role === 'admin' ? 'customer' : 'admin';

        $query = ChatMessage::where('sender_role', $senderRole)
            ->where('is_read', false);

        if ($role === 'admin') {
            // Admin sees all unread customer messages
            $query->whereHas('conversation');
        } else {
            // Customer sees only their own conversations
            $query->whereHas('conversation', function ($q) use ($userId) {
                $q->where('customer_id', $userId);
            });
        }

        return $query->count();
    }
}
