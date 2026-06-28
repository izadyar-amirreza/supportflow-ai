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
use App\Events\TicketTriagedEvent;
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
            
            $oldStatus = $this->ticket->status;
            $newStatus = $oldStatus;

            // Check if the AI agent decided to execute an action
            if (isset($triage['action']) && $triage['action'] === 'close_ticket') {
                $newStatus = 'closed';
            }

            $this->ticket->update([
                'ai_sentiment' => $triage['sentiment'] ?? 'neutral',
                'priority'     => $newPriority,
                'ai_tags'      => $triage['tags'] ?? [],
                'status'       => $newStatus,
            ]);

            TicketActivity::create([
                'ticket_id'   => $this->ticket->id,
                'user_id'     => $this->triggeredByUserId,
                'action'      => 'ai_triaged',
                'description' => "AI auto-triaged ticket. Detected sentiment: " . strtoupper($triage['sentiment'] ?? 'neutral'),
                'old_value'   => $oldPriority,
                'new_value'   => $newPriority,
            ]);

            // If AI actually executed the close action, log it in the activity feed!
            if ($newStatus === 'closed' && $oldStatus !== 'closed') {
                TicketActivity::create([
                    'ticket_id'   => $this->ticket->id,
                    'user_id'     => $this->triggeredByUserId,
                    'action'      => 'ai_action_executed',
                    'description' => "AI autonomously closed the ticket based on conversation context.",
                    'old_value'   => $oldStatus,
                    'new_value'   => $newStatus,
                ]);
            }

            TicketTriagedEvent::dispatch($this->ticket);

        } catch (\Exception $exception) {
            \Illuminate\Support\Facades\Log::error('AutoTriageTicketJob Failed: ' . $exception->getMessage());
        }
    }
}