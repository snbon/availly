<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class CalendarConnection extends Model
{
    protected $fillable = [
        'user_id',
        'provider',
        'tokens_encrypted',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the calendar connection.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the connected calendars for this connection.
     */
    public function connectedCalendars(): HasMany
    {
        return $this->hasMany(ConnectedCalendar::class, 'connection_id');
    }

    /**
     * Get the cached events for this connection.
     */
    public function eventsCache(): HasMany
    {
        return $this->hasMany(EventsCache::class, 'user_id', 'user_id')
            ->where('provider', $this->provider);
    }

    /**
     * Decrypt and get the OAuth tokens.
     */
    protected function tokens(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? json_decode(decrypt($this->tokens_encrypted), true) : null,
            set: fn ($value) => $this->tokens_encrypted = encrypt(json_encode($value))
        );
    }

    /**
     * Check if the connection is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the connection has expired.
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired';
    }

    /**
     * Mark the connection as expired.
     */
    public function markAsExpired(): void
    {
        $this->update(['status' => 'expired']);
    }

    /**
     * Mark the connection as active.
     */
    public function markAsActive(): void
    {
        $this->update(['status' => 'active']);
    }
}
