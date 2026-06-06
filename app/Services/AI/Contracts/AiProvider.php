<?php

namespace App\Services\AI\Contracts;

use App\Models\Ticket;
use Illuminate\Support\Collection;

interface AiProvider
{
    public function summarizeTicket(Ticket $ticket, Collection $comments): string;

    public function suggestReply(Ticket $ticket, Collection $comments): string;
}