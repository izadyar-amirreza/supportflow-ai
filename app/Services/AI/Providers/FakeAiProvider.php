<?php

namespace App\Services\AI\Providers;

use App\Models\Ticket;
use App\Services\AI\Contracts\AiProvider;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class FakeAiProvider implements AiProvider
{
    public function summarizeTicket(Ticket $ticket, Collection $comments): string
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

    public function suggestReply(Ticket $ticket, Collection $comments): string
    {
        $latestPublicComment = $comments
            ->where('is_internal', false)
            ->last();

        $context = $latestPublicComment
            ? Str::limit($latestPublicComment->body, 220)
            : Str::limit($ticket->description ?? 'No customer message was provided.', 220);

        return implode("\n\n", [
            'Hi,',
            "Thanks for reaching out about: {$ticket->title}.",
            "I reviewed the ticket details and the latest context: {$context}",
            'The next step is to investigate the issue, confirm the expected behavior, and update you as soon as we have a clear resolution or workaround.',
            'Best regards,',
            'Support Team',
        ]);
    }
}