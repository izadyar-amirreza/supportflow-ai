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

class AutoTriageTicketJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60;

    public function __construct(
        public Ticket $ticket,
        public int $triggeredByUserId
    ) {}

    public function handle(): void
    {
        try {
            $ai = new OpenAiProvider();
            $triage = $ai->triageTicket($this->ticket);

            $oldPriority = $this->ticket->priority;
            $newPriority = $triage['priority'] ?? $oldPriority;

            $this->ticket->update([
                'ai_sentiment' => $triage['sentiment'] ?? 'neutral',
                'priority'     => $newPriority,
                'ai_tags'      => $triage['tags'] ?? [],
            ]);

            TicketActivity::create([
                'ticket_id'   => $this->ticket->id,
                'user_id'     => $this->triggeredByUserId,
                'action'      => 'ai_triaged',
                'description' => "AI auto-triaged ticket. Detected sentiment: " . strtoupper($triage['sentiment'] ?? 'neutral'),
                'old_value'   => $oldPriority,
                'new_value'   => $newPriority,
            ]);

        } catch (\Exception $exception) {
            Log::error('AutoTriageTicketJob Failed: ' . $exception->getMessage());
        }
    }
}