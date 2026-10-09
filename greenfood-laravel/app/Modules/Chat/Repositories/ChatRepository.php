<?php

declare(strict_types=1);

namespace App\Modules\Chat\Repositories;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\Farmer;

class ChatRepository
{
    public function getConversations(array $filters = [])
    {
        $query = ChatConversation::with(['customer', 'admin', 'farmer', 'product', 'latestMessage'])
            ->withCount(['messages as unread_count' => function ($q) use ($filters) {
                $role = $filters['role'] ?? 'admin';
                if ($role === 'admin') {
                    $q->where('sender_role', '!=', 'admin')->where('is_read', false);
                } elseif ($role === 'farmer') {
                    $q->where('sender_role', '!=', 'farmer')->where('is_read', false);
                } else {
                    $q->where('sender_role', '!=', 'customer')->where('is_read', false);
                }
            }]);

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['farmer_id'])) {
            $query->where('farmer_id', $filters['farmer_id']);
        }

        return $query->orderByDesc('updated_at')->get();
    }

    public function findConversation(string $id): ?ChatConversation
    {
        return ChatConversation::with(['customer', 'admin', 'farmer', 'product'])->find($id);
    }

    public function findOrCreateConversation(string $customerId, string $subject = 'Hỗ trợ khách hàng'): ChatConversation
    {
        $existing = ChatConversation::where('customer_id', $customerId)
            ->where('type', 'customer_admin')
            ->whereIn('status', ['open', 'assigned'])
            ->first();

        if ($existing) {
            return $existing;
        }

        return ChatConversation::create([
            'customer_id' => $customerId,
            'type' => 'customer_admin',
            'subject' => $subject,
            'status' => 'open',
        ]);
    }

    public function findOrCreateCustomerFarmerConversation(
        string $customerId,
        string $farmerId,
        ?string $productId = null,
        string $subject = 'Hỏi mua nông sản'
    ): ChatConversation {
        $farmer = Farmer::find($farmerId);
        $farmName = $farmer ? $farmer->farm_name : 'Gian hàng';

        $existing = ChatConversation::where('customer_id', $customerId)
            ->where('farmer_id', $farmerId)
            ->where('type', 'customer_farmer')
            ->whereIn('status', ['open', 'assigned'])
            ->first();

        if ($existing) {
            if ($productId && $existing->product_id !== $productId) {
                $existing->update(['product_id' => $productId]);
            }
            return $existing;
        }

        return ChatConversation::create([
            'customer_id' => $customerId,
            'farmer_id' => $farmerId,
            'type' => 'customer_farmer',
            'product_id' => $productId,
            'subject' => "Chat với {$farmName}: {$subject}",
            'status' => 'open',
        ]);
    }

    public function findOrCreateFarmerAdminConversation(
        string $farmerId,
        string $subject = 'Hỗ trợ đối tác Nông hộ'
    ): ChatConversation {
        $farmer = Farmer::find($farmerId);
        $userId = $farmer ? $farmer->user_id : null;

        $existing = ChatConversation::where('farmer_id', $farmerId)
            ->where('type', 'farmer_admin')
            ->whereIn('status', ['open', 'assigned'])
            ->first();

        if ($existing) {
            return $existing;
        }

        return ChatConversation::create([
            'customer_id' => $userId,
            'farmer_id' => $farmerId,
            'type' => 'farmer_admin',
            'subject' => $subject,
            'status' => 'open',
        ]);
    }

    public function getMessages(string $conversationId, int $limit = 80)
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

        ChatConversation::where('id', $data['conversation_id'])
            ->update(['updated_at' => now()]);

        return $message;
    }

    public function markAsRead(string $conversationId, string $excludeRole): int
    {
        return ChatMessage::where('conversation_id', $conversationId)
            ->where('sender_role', '!=', $excludeRole)
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

    public function getUnreadCount(string $userId, string $role = 'admin', ?string $farmerId = null): int
    {
        if ($role === 'admin') {
            return ChatMessage::where('sender_role', '!=', 'admin')
                ->where('is_read', false)
                ->whereHas('conversation')
                ->count();
        } elseif ($role === 'farmer' && $farmerId) {
            return ChatMessage::where('sender_role', '!=', 'farmer')
                ->where('is_read', false)
                ->whereHas('conversation', function ($q) use ($farmerId) {
                    $q->where('farmer_id', $farmerId);
                })
                ->count();
        } else {
            return ChatMessage::where('sender_role', '!=', 'customer')
                ->where('is_read', false)
                ->whereHas('conversation', function ($q) use ($userId) {
                    $q->where('customer_id', $userId);
                })
                ->count();
        }
    }
}
