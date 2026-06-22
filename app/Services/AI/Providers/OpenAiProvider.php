<?php

namespace App\Services\AI\Providers;

use App\Services\AI\Contracts\AiProvider;
use OpenAI;
use GuzzleHttp\Client as GuzzleClient;
use App\Models\Ticket;
use Illuminate\Support\Collection;

class OpenAiProvider implements AiProvider
{
    private function getClient()
    {
        $proxy = env('OPENAI_PROXY');

        $options = ['verify' => false];
        if (!empty($proxy)) {
            $options['proxy'] = $proxy;
        }

        $guzzle = new GuzzleClient($options);

        return OpenAI::factory()
            ->withApiKey(env('OPENAI_API_KEY'))
            ->withBaseUri(env('OPENAI_BASE_URI', 'https://api.openai.com/v1'))
            ->withHttpClient($guzzle)
            ->make();
    }

    public function summarizeTicket(Ticket $ticket, Collection $comments): string
    {
        $conversation = $comments->pluck('body')->implode("\n\n");

        if (empty(trim($conversation))) {
            $conversation = "Ticket Title: " . $ticket->title . "\nDescription: " . ($ticket->description ?? 'No description.');
        }

        $response = $this->getClient()->chat()->create([
            'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
            'messages' => [
                [
                    'role' => 'system', 
                    'content' => 'You are an expert customer support AI. Provide a brief, highly accurate summary of the following support ticket conversation. IMPORTANT: Write your final summary entirely in clear, professional English.'
                ],
                ['role' => 'user', 'content' => $conversation],
            ],
            'max_tokens' => 300,
        ]);

        return $response->choices[0]->message->content;
    }

    public function suggestReply(Ticket $ticket, Collection $comments): string
    {
        $conversation = $comments->pluck('body')->implode("\n\n");

        if (empty(trim($conversation))) {
            $conversation = "Ticket Description: " . ($ticket->description ?? 'No description.');
        }

        $response = $this->getClient()->chat()->create([
            'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
            'messages' => [
                [
                    'role' => 'system', 
                    'content' => 'You are a professional customer support agent. Based on the provided conversation, write a helpful, solution-oriented suggested reply for the customer. IMPORTANT: Write the reply entirely in clear, professional English.'
                ],
                ['role' => 'user', 'content' => $conversation],
            ],
        ]);

        return $response->choices[0]->message->content;
    }
}