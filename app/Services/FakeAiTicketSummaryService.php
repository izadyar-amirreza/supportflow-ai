<?php

namespace App\Services;

use App\Models\Ticket;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class FakeAiTicketSummaryService
{
    public function summarize(Ticket $ticket, Collection $comments): string
    {
        $publicCommentCount = $comments
            ->where('is_internal', false)
            ->count();

        $internalNoteCount = $comments
            ->where('is_internal', true)
            ->count();

        $latestComment = $comments->last();

        $description = $ticket->description
            ? Str::limit($ticket->description, 220)
            : 'No description was provided.';

        $latestCommentText = $latestComment
            ? Str::limit($latestComment->body, 180)
            : 'No comments have been added yet.';

        return implode("\n\n", [
            'AI Summary',
            "Ticket #{$ticket->id}: {$ticket->title}",
            "Current status: {$ticket->status}",
            "Priority: {$ticket->priority}",
            'Main issue: ' . $description,
            "Conversation so far: {$publicCommentCount} public comment(s) and {$internalNoteCount} internal note(s).",
            'Latest update: ' . $latestCommentText,
            'Suggested next step: Review the latest customer context, confirm the expected behavior, and update the ticket status after taking action.',
        ]);
    }
}