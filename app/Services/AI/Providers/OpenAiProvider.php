<?php

namespace App\Services\AI\Providers;

use App\Services\AI\Contracts\AiProvider;
use OpenAI;
use GuzzleHttp\Client as GuzzleClient;
use App\Models\Ticket;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Exception;

class OpenAiProvider implements AiProvider
{
    private function getClient(Ticket $ticket)
    {
        $workspace = $ticket->workspace;

        if (!$workspace) {
            throw new Exception("Ticket does not belong to any workspace.");
        }

        // Fetching the decrypted key directly from the workspace
        $apiKey = trim((string) $workspace->ai_api_key);
        
        if (empty($apiKey)) {
            $apiKey = trim((string) env('OPENAI_API_KEY', ''));
        }

        if (empty($apiKey)) {
            throw new Exception("No AI API key configured for Workspace: {$workspace->name}");
        }

        $proxy = env('OPENAI_PROXY');
        $options = ['verify' => false];
        
        if (!empty($proxy)) {
            $options['proxy'] = $proxy;
        }

        $guzzle = new GuzzleClient($options);

        // Forcing Groq Base URI to prevent default routing issues
        $baseUri = 'https://api.groq.com/openai/v1';

        return OpenAI::factory()
            ->withApiKey($apiKey)
            ->withBaseUri($baseUri)
            ->withHttpClient($guzzle)
            ->make();
    }

    private function resolveModel(Ticket $ticket): string
    {
        $workspace = $ticket->workspace;
        
        if ($workspace && !empty($workspace->ai_model)) {
            return $workspace->ai_model;
        }

        return env('OPENAI_MODEL', 'gpt-4o-mini');
    }

    public function summarizeTicket(Ticket $ticket, Collection $comments): string
    {
        $conversation = $comments->pluck('body')->implode("\n\n");

        if (empty(trim($conversation))) {
            $conversation = "Ticket Title: " . $ticket->title . "\nDescription: " . ($ticket->description ?? 'No description.');
        }

        $response = $this->getClient($ticket)->chat()->create([
            'model' => $this->resolveModel($ticket),
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

        $response = $this->getClient($ticket)->chat()->create([
            'model' => $this->resolveModel($ticket),
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

    public function triageTicket(Ticket $ticket): array
    {
        try {
            $content = "Title: " . $ticket->title . "\nDescription: " . ($ticket->description ?? 'No description provided.');

            $response = $this->getClient($ticket)->chat()->create([
                'model' => $this->resolveModel($ticket),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert AI support triage agent. Analyze the ticket content and respond STRICTLY with a valid JSON object containing exactly three keys:
                        1. "sentiment": strictly one of ["satisfied", "neutral", "urgent", "angry"].
                        2. "priority": strictly one of ["low", "medium", "high", "urgent"]. (If sentiment is angry or urgent, priority MUST be high or urgent).
                        3. "tags": an array of 1 to 4 short lowercase keywords representing the topic (e.g., ["bug", "database", "billing"]).'
                    ],
                    ['role' => 'user', 'content' => $content],
                ],
                'response_format' => ['type' => 'json_object'],
            ]);

            $result = json_decode($response->choices[0]->message->content, true);

            return [
                'sentiment' => $result['sentiment'] ?? 'neutral',
                'priority'  => $result['priority'] ?? $ticket->priority,
                'tags'      => is_array($result['tags'] ?? null) ? $result['tags'] : [],
            ];

        } catch (Exception $exception) {
            Log::error('AI Auto-Triage Failed: ' . $exception->getMessage());
            
            return [
                'sentiment' => 'neutral',
                'priority'  => $ticket->priority,
                'tags'      => ['triage_timeout'],
            ];
        }
    }
}