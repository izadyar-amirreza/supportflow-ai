<?php

namespace App\Providers;

use App\Services\AI\Contracts\AiProvider;
use App\Services\AI\Providers\FakeAiProvider;
use App\Services\AI\Providers\OpenAiProvider; // <--- Updated path
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        if (env('AI_PROVIDER') === 'openai') {
            $this->app->bind(AiProvider::class, OpenAiProvider::class);
        } else {
            $this->app->bind(AiProvider::class, FakeAiProvider::class);
        }
    }

    public function boot(): void
    {
        //
    }
}