<?php

namespace App\Jobs;

use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Services\AI\AiTicketService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateTicketSummaryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120;

    public function __construct(
        public Ticket $ticket,
        public int $triggeredByUserId
    ) {}

    // Inject AiTicketService via Laravel Service Container to use the configured AI provider
    public function handle(AiTicketService $aiService): void
    {
        try {
            $comments = $this->ticket->comments()->oldest()->get();
            
            // Generate summary dynamically using whatever provider is active (Groq, Gemini, etc.)
            $summary = $aiService->summarizeTicket($this->ticket, $comments);

            $this->ticket->update([
                'ai_summary' => $summary,
                'ai_summary_generated_at' => now(),
            ]);

            TicketActivity::create([
                'ticket_id' => $this->ticket->id,
                'user_id' => $this->triggeredByUserId,
                'action' => 'ai_summary_generated',
                'description' => 'AI summary was generated in the background.',
                'new_value' => 'AI summary generated',
            ]);

        } catch (\Exception $exception) {
            Log::error('GenerateTicketSummaryJob Failed: ' . $exception->getMessage());
        }
    }
}