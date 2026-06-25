<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workspaces', function (Blueprint $table) {
            // 🌟 تنظیمات هوش مصنوعی برای هر شرکت
            $table->string('ai_provider')->default('fake')->after('slug');
            $table->string('ai_model')->nullable()->after('ai_provider');
            $table->text('ai_api_key')->nullable()->after('ai_model'); 
        });
    }

    public function down(): void
    {
        Schema::table('workspaces', function (Blueprint $table) {
            $table->dropColumn(['ai_provider', 'ai_model', 'ai_api_key']);
        });
    }
};