<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class EventsCache extends Model
{
    protected $table = 'events_cache';

    protected $fillable = [
        'user_id',
        'provider',
        'ext_event_id',
        'title',
        'start_at_utc',
        'end_at_utc',
        'all_day',
        'visibility',
    ];

    protected $casts = [
        'start_at_utc' => 'datetime',
        'end_at_utc' => 'datetime',
        'all_day' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns this cached event.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get events within a date range.
     */
    public function scopeInDateRange($query, Carbon $startDate, Carbon $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_at_utc', [$startDate, $endDate])
              ->orWhereBetween('end_at_utc', [$startDate, $endDate])
              ->orWhere(function ($q2) use ($startDate, $endDate) {
                  $q2->where('start_at_utc', '<=', $startDate)
                     ->where('end_at_utc', '>=', $endDate);
              });
        });
    }

    /**
     * Scope to get events for a specific provider.
     */
    public function scopeForProvider($query, string $provider)
    {
        return $query->where('provider', $provider);
    }

    /**
     * Scope to get events for Google Calendar.
     */
    public function scopeFromGoogle($query)
    {
        return $query->forProvider('google');
    }

    /**
     * Check if this event conflicts with a time range.
     */
    public function conflictsWith(Carbon $start, Carbon $end): bool
    {
        return $this->start_at_utc < $end && $this->end_at_utc > $start;
    }

    /**
     * Get the duration of the event in minutes.
     */
    public function getDurationInMinutes(): int
    {
        return $this->start_at_utc->diffInMinutes($this->end_at_utc);
    }

    /**
     * Check if the event is happening now.
     */
    public function isHappeningNow(): bool
    {
        $now = Carbon::now('UTC');
        return $this->start_at_utc <= $now && $this->end_at_utc >= $now;
    }
}
