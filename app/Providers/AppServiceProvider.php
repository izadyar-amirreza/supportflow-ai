<?php

namespace App\Providers;

use App\Services\AI\Contracts\AiProvider;
use App\Services\AI\Providers\FakeAiProvider;
use App\Services\AI\Providers\OpenAiProvider;
use Illuminate\Support\ServiceProvider;
use App\Models\TicketComment;
use App\Observers\CommentObserver;

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
        TicketComment::observe(CommentObserver::class);
    }
}