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
        Schema::create('connected_calendars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('connection_id')->constrained('calendar_connections')->onDelete('cascade');
            $table->string('provider_calendar_id');
            $table->boolean('included')->default(true);
            $table->timestamps();
            
            $table->unique(['connection_id', 'provider_calendar_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('connected_calendars');
    }
};
