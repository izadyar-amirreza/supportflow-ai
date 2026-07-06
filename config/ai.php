<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default AI Provider
    |--------------------------------------------------------------------------
    |
    | This option controls the default AI provider that will be used by the
    | application to generate summaries, suggested replies, and triage tickets.
    |
    */
    'provider' => env('AI_PROVIDER', 'fake'),

    /*
    |--------------------------------------------------------------------------
    | AI Providers Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the settings for each AI provider used by your
    | application. You can switch between providers using environment variables.
    |
    */
    'providers' => [
        'fake' => [
            'name' => 'Fake Local AI',
        ],

        'gemini' => [
            'name' => 'Google Gemini',
            'api_key' => env('GEMINI_API_KEY'),
            'model' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
        ],

        'openai' => [
            'name' => 'OpenAI',
            'api_key' => env('OPENAI_API_KEY'),
            'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        ],

        'groq' => [
            'name' => 'Groq Cloud AI',
            'api_key' => env('GROQ_API_KEY'),
            'model' => env('GROQ_MODEL', 'llama3-8b-8192'),
        ],
    ],
];