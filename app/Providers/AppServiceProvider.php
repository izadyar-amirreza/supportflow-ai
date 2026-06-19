<?php

namespace App\Providers;

use App\Services\AI\Contracts\AiProvider;
use App\Services\AI\Providers\FakeAiProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    use App\Services\OpenAiProvider;

    public function register(): void
    {
        // اگر در فایل .env مقدار AI_PROVIDER برابر openai بود، کلاس واقعی را لود کن
        if (env('AI_PROVIDER') === 'openai') {
            $this->app->bind('AiService', function ($app) {
                return new OpenAiProvider();
            });
        } else {
            // در غیر این صورت همان فایل Fake قبلی لود شود
            // $this->app->bind('AiService', FakeAiProvider::class);
        }
    }

    public function boot(): void
    {
        //
    }
}