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
    private function isGroqMode(): bool
    {
        return !empty(env('GROQ_API_KEY')) || env('AI_PROVIDER') === 'groq';
    }

    private function getClient(Ticket $ticket)
    {
        $workspace = $ticket->workspace;

        if (!$workspace) {
            throw new Exception("Ticket does not belong to any workspace.");
        }

        $isGroq = $this->isGroqMode();

        // If Groq is active, strictly prioritize GROQ_API_KEY. Otherwise check OPENAI_API_KEY.
        if ($isGroq) {
            $apiKey = trim((string) env('GROQ_API_KEY', env('OPENAI_API_KEY', '')));
        } else {
            $apiKey = trim((string) env('OPENAI_API_KEY', env('GROQ_API_KEY', '')));
        }

        // Fallback to workspace key if environment keys are missing
        if (empty($apiKey)) {
            $apiKey = trim((string) $workspace->ai_api_key);
        }

        if (empty($apiKey)) {
            throw new Exception("No valid AI API key configured.");
        }

        $proxy = env('OPENAI_PROXY');
        $options = ['verify' => false];
        
        if (!empty($proxy)) {
            $options['proxy'] = $proxy;
        }

        $guzzle = new GuzzleClient($options);

        // Dynamically switch Base URI for Groq
        $baseUri = $isGroq ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1';

        return OpenAI::factory()
            ->withApiKey($apiKey)
            ->withBaseUri($baseUri)
            ->withHttpClient($guzzle)
            ->make();
    }

    private function resolveModel(Ticket $ticket): string
    {
        // When using Groq, force the Llama model to prevent 404 Model Not Found errors
        if ($this->isGroqMode()) {
            return env('GROQ_MODEL', 'llama3-8b-8192');
        }

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

    public function suggestReply(Ticket $ticket, $comments): string
    {
        $conversation = $comments->pluck('body')->implode("\n\n");

        if (empty(trim($conversation))) {
            $conversation = "Ticket Description: " . ($ticket->description ?? 'No description.');
        }

        $knowledgeBases = \App\Models\KnowledgeBase::where('workspace_id', $ticket->workspace_id)->get();
        
        $systemPrompt = 'You are a professional customer support agent. Based on the provided conversation, write a helpful, solution-oriented suggested reply for the customer. IMPORTANT: Write the reply entirely in clear, professional English.';

        if ($knowledgeBases->isNotEmpty()) {
            $systemPrompt .= "\n\n--- COMPANY KNOWLEDGE BASE ---\nUse the following internal documents to accurately answer the customer's request. Strictly adhere to these policies and do not invent rules:\n";
            
            foreach ($knowledgeBases as $kb) {
                $systemPrompt .= "\nDocument Title: {$kb->title}\nContent: {$kb->content}\n---";
            }
        }

        $response = $this->getClient($ticket)->chat()->create([
            'model' => $this->resolveModel($ticket),
            'messages' => [
                [
                    'role' => 'system', 
                    'content' => $systemPrompt
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

            if ($ticket->comments && $ticket->comments->count() > 0) {
                $content .= "\n\n--- Conversation History ---\n";
                foreach ($ticket->comments as $comment) {
                    $text = $comment->content ?? $comment->body ?? $comment->message ?? '';
                    if (!empty($text)) {
                        $content .= "Reply: " . $text . "\n";
                    }
                }
                $content .= "\n(IMPORTANT: Analyze the CURRENT state. If the user explicitly says the issue is fixed, resolved, or asks to close it, you MUST trigger the close_ticket action).";
            }

            $response = $this->getClient($ticket)->chat()->create([
                'model' => $this->resolveModel($ticket),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert AI support triage agent. Analyze the ticket content. Respond STRICTLY with a valid JSON object containing exactly four keys:
                        1. "sentiment": strictly one of ["satisfied", "neutral", "urgent", "angry"].
                        2. "priority": strictly one of ["low", "medium", "high", "urgent"].
                        3. "tags": array of short lowercase keywords.
                        4. "action": strictly one of ["none", "close_ticket"]. (Default is "none". Use "close_ticket" ONLY if the conversation explicitly confirms the issue is completely resolved or the user requests closure).'
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
                'action'    => $result['action'] ?? 'none',
            ];

        } catch (\Exception $exception) {
            \Illuminate\Support\Facades\Log::error('AI Auto-Triage Failed: ' . $exception->getMessage());
            
            return [
                'sentiment' => 'neutral',
                'priority'  => $ticket->priority,
                'tags'      => ['triage_timeout'],
                'action'    => 'none',
            ];
        }
    }
}