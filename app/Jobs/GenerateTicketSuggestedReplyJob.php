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

class GenerateTicketSuggestedReplyJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120;

    public function __construct(
        public Ticket $ticket,
        public int $triggeredByUserId
    ) {}

    // Inject AiTicketService via Laravel Service Container
    public function handle(AiTicketService $aiService): void
    {
        try {
            $comments = $this->ticket->comments()->oldest()->get();
            
            // Generate reply dynamically using the active AI provider
            $suggestedReply = $aiService->suggestReply($this->ticket, $comments);

            $this->ticket->update([
                'ai_suggested_reply' => $suggestedReply,
                'ai_suggested_reply_generated_at' => now(),
            ]);

            TicketActivity::create([
                'ticket_id' => $this->ticket->id,
                'user_id' => $this->triggeredByUserId,
                'action' => 'ai_suggested_reply_generated',
                'description' => 'AI suggested reply was generated in the background.',
                'new_value' => 'AI suggested reply generated',
            ]);

        } catch (\Exception $exception) {
            Log::error('GenerateTicketSuggestedReplyJob Failed: ' . $exception->getMessage());
        }
    }
}