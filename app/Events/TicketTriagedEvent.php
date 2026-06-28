<?php

namespace App\Events;

use App\Models\Ticket;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketTriagedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Ticket $ticket)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('tickets.' . $this->ticket->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->ticket->id,
            'sentiment' => $this->ticket->ai_sentiment,
            'priority' => $this->ticket->priority,
            'tags' => $this->ticket->ai_tags ?? [],
        ];
    }

    public function broadcastAs(): string
    {
        return 'ticket.triaged';
    }

}