<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Chat Conversations
        Schema::create('chat_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject')->default('Hỗ trợ khách hàng');
            $table->enum('status', ['open', 'assigned', 'resolved', 'closed'])->default('open');
            $table->timestamps();
        });

        // 2. Chat Messages
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('conversation_id')->constrained('chat_conversations')->cascadeOnDelete();
            $table->foreignUuid('sender_id')->constrained('users')->cascadeOnDelete();
            $table->enum('sender_role', ['customer', 'admin'])->default('customer');
            $table->text('message');
            $table->enum('message_type', ['text', 'image', 'system'])->default('text');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_conversations');
    }
};
