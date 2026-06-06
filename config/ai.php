<?php

return [
    'provider' => env('AI_PROVIDER', 'fake'),

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
    ],
];