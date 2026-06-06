<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Services\AI\Contracts\AiProvider;
use App\Services\AI\Providers\FakeAiProvider;
use InvalidArgumentException;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
        public function register(): void
    {
        $this->app->bind(AiProvider::class, function () {
            $provider = config('ai.provider', 'fake');

            return match ($provider) {
                'fake' => new FakeAiProvider(),
                default => throw new InvalidArgumentException("Unsupported AI provider [{$provider}]."),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
