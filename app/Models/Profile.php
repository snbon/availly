<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Profile extends Model
{
    protected $fillable = [
        'user_id',
        'slug',
        'username',
        'username_last_changed',
        'is_active'
    ];

    protected $casts = [
        'username_last_changed' => 'datetime',
        'is_active' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function canChangeUsername(): bool
    {
        if (!$this->username_last_changed) {
            return true;
        }

        return $this->username_last_changed->diffInDays(now()) >= 14;
    }

    public function daysUntilUsernameChange(): int
    {
        if (!$this->username_last_changed) {
            return 0;
        }

        $daysSinceLastChange = $this->username_last_changed->diffInDays(now());
        return max(0, 14 - $daysSinceLastChange);
    }

    public function generateSlug(): string
    {
        return $this->username ?? substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 8);
    }
}
