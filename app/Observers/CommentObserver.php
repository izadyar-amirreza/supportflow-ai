<?php

namespace App\Observers;

use App\Models\TicketComment;
use App\Jobs\AutoTriageTicketJob;

class CommentObserver
{
    public function created(TicketComment $comment): void
    {
        if ($comment->ticket_id) {
            AutoTriageTicketJob::dispatch(
                $comment->ticket,
                (int) $comment->user_id
            );
        }
    }
}