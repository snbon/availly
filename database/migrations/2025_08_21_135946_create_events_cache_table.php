<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events_cache', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('provider', ['google', 'microsoft', 'apple']);
            $table->string('ext_event_id');
            $table->timestamp('start_at_utc');
            $table->timestamp('end_at_utc');
            $table->boolean('all_day')->default(false);
            $table->enum('visibility', ['public', 'private'])->default('private');
            $table->timestamps();

            $table->index(['user_id', 'start_at_utc', 'end_at_utc']);
            $table->unique(['user_id', 'provider', 'ext_event_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events_cache');
    }
};
