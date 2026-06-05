<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Ticket extends Model
{
    protected $fillable = [
        'workspace_id',
        'created_by',
        'assigned_to',
        'title',
        'description',
        'status',
        'priority',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

        public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class);
    }

}