<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->text('ai_suggested_reply')->nullable()->after('ai_summary_generated_at');
            $table->timestamp('ai_suggested_reply_generated_at')->nullable()->after('ai_suggested_reply');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn([
                'ai_suggested_reply',
                'ai_suggested_reply_generated_at',
            ]);
        });
    }
};