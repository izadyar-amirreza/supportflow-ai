<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use App\Models\Ticket;
use Illuminate\Support\Facades\Log;

class OpenAiProvider 
{
    /**
     * Summarize the ticket
     */
    public function summarizeTicket(Ticket $ticket)
    {
        try {
            // Assuming the text to be summarized is in the ticket body or its comments
            // Sending a simple text for testing purposes
            $textToSummarize = "تیکت شماره: " . $ticket->id . " - متن: " . ($ticket->content ?? 'متن تیکت خالی است');

            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o-mini', // Using the fast and cost-effective mini model
                'messages' => [
                    ['role' => 'system', 'content' => 'شما یک دستیار هوشمند پشتیبانی هستید. لطفا متن زیر را به صورت کوتاه و به زبان فارسی خلاصه کنید.'],
                    ['role' => 'user', 'content' => $textToSummarize],
                ],
                'max_tokens' => 300,
            ]);

            $summary = $response->choices[0]->message->content;

            // Save to database
            $ticket->update([
                'ai_summary' => $summary
            ]);

            return $summary;

        } catch (\Exception $e) {
            Log::error('OpenAI Connection Error: ' . $e->getMessage());
            return 'Error generating summary.';
        }
    }

    /**
     * Suggest a reply
     */
    public function suggestReply(Ticket $ticket)
    {
        try {
            $textToAnalyze = "متن تیکت: " . ($ticket->content ?? '');

            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => 'شما یک پشتیبان حرفه‌ای هستید. با توجه به متن زیر، یک پاسخ مناسب، محترمانه و راهگشا برای کاربر به زبان فارسی بنویسید.'],
                    ['role' => 'user', 'content' => $textToAnalyze],
                ],
            ]);

            return $response->choices[0]->message->content;

        } catch (\Exception $e) {
            Log::error('OpenAI Connection Error: ' . $e->getMessage());
            return 'Error generating reply.';
        }
    }
}