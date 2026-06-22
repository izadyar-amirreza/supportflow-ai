<?php

namespace App\Jobs;

use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Services\AI\Providers\OpenAiProvider;
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

    public function handle(): void
    {
        try {
            $comments = $this->ticket->comments()->oldest()->get();
            $ai = new OpenAiProvider();
            $summary = $ai->summarizeTicket($this->ticket, $comments);

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