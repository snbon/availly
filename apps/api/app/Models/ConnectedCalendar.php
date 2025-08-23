<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConnectedCalendar extends Model
{
    protected $fillable = [
        'connection_id',
        'provider_calendar_id',
        'included',
    ];

    protected $casts = [
        'included' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the calendar connection that owns this connected calendar.
     */
    public function calendarConnection(): BelongsTo
    {
        return $this->belongsTo(CalendarConnection::class, 'connection_id');
    }

    /**
     * Get the user through the calendar connection.
     */
    public function user(): BelongsTo
    {
        return $this->calendarConnection()->user();
    }

    /**
     * Scope to get only included calendars.
     */
    public function scopeIncluded($query)
    {
        return $query->where('included', true);
    }

    /**
     * Toggle the included status.
     */
    public function toggleIncluded(): void
    {
        $this->update(['included' => !$this->included]);
    }
}
