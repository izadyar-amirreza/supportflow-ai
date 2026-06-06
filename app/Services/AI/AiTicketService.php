<?php

namespace App\Services\AI;

use App\Models\Ticket;
use App\Services\AI\Contracts\AiProvider;
use Illuminate\Support\Collection;

class AiTicketService
{
    public function __construct(
        private readonly AiProvider $provider,
    ) {
    }

    public function summarizeTicket(Ticket $ticket, Collection $comments): string
    {
        return $this->provider->summarizeTicket($ticket, $comments);
    }

    public function suggestReply(Ticket $ticket, Collection $comments): string
    {
        return $this->provider->suggestReply($ticket, $comments);
    }
}