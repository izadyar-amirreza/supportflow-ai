<?php

namespace App\Providers;

use App\Services\AI\Contracts\AiProvider;
use App\Services\AI\Providers\FakeAiProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AiProvider::class, function () {
            $provider = config('ai.provider', 'fake');

            return match ($provider) {
                'fake' => new FakeAiProvider(),

                default => new FakeAiProvider(),
            };
        });
    }

    public function boot(): void
    {
        //
    }
}