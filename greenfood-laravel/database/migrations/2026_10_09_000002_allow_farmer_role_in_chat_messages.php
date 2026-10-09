<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $connection = config('database.default');

        if ($connection === 'sqlite') {
            DB::statement('CREATE TABLE IF NOT EXISTS chat_messages_backup AS SELECT * FROM chat_messages');
            DB::statement('DROP TABLE IF EXISTS chat_messages');
            DB::statement('
                CREATE TABLE chat_messages (
                    id TEXT PRIMARY KEY,
                    conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
                    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    sender_role TEXT NOT NULL DEFAULT "customer",
                    message TEXT NOT NULL,
                    message_type TEXT NOT NULL DEFAULT "text",
                    is_read INTEGER NOT NULL DEFAULT 0,
                    created_at DATETIME,
                    updated_at DATETIME
                )
            ');
            DB::statement('INSERT INTO chat_messages SELECT * FROM chat_messages_backup');
            DB::statement('DROP TABLE IF EXISTS chat_messages_backup');
        } else {
            // MySQL / PostgreSQL
            DB::statement("ALTER TABLE chat_messages MODIFY COLUMN sender_role VARCHAR(50) DEFAULT 'customer'");
        }
    }

    public function down(): void
    {
        // No-op
    }
};
