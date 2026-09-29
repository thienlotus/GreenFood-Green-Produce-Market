<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatConversation extends Model
{
    use HasUuids;

    protected $fillable = [
        'id', 'customer_id', 'admin_id', 'subject', 'status'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id');
    }

    public function latestMessage()
    {
        return $this->hasOne(ChatMessage::class, 'conversation_id')->latestOfMany();
    }

    public function unreadMessagesCount(string $role = 'admin'): int
    {
        $senderRole = $role === 'admin' ? 'customer' : 'admin';
        return $this->messages()
            ->where('sender_role', $senderRole)
            ->where('is_read', false)
            ->count();
    }
}
