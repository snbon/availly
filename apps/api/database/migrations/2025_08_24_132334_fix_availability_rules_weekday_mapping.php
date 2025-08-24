<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Fix weekday mapping from old system (1=Monday, 2=Tuesday, ..., 0=Sunday)
     * to new system (0=Monday, 1=Tuesday, ..., 6=Sunday)
     */
    public function up(): void
    {
        // Update weekday mapping for availability rules
        // Old mapping: 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 0=Sunday
        // New mapping: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday

        DB::transaction(function () {
            // Create a temporary column to avoid conflicts
            Schema::table('availability_rules', function (Blueprint $table) {
                $table->integer('new_weekday')->nullable()->after('weekday');
            });

            // Map old weekdays to new weekdays
            DB::table('availability_rules')->where('weekday', 1)->update(['new_weekday' => 0]); // Monday: 1 → 0
            DB::table('availability_rules')->where('weekday', 2)->update(['new_weekday' => 1]); // Tuesday: 2 → 1
            DB::table('availability_rules')->where('weekday', 3)->update(['new_weekday' => 2]); // Wednesday: 3 → 2
            DB::table('availability_rules')->where('weekday', 4)->update(['new_weekday' => 3]); // Thursday: 4 → 3
            DB::table('availability_rules')->where('weekday', 5)->update(['new_weekday' => 4]); // Friday: 5 → 4
            DB::table('availability_rules')->where('weekday', 6)->update(['new_weekday' => 5]); // Saturday: 6 → 5
            DB::table('availability_rules')->where('weekday', 0)->update(['new_weekday' => 6]); // Sunday: 0 → 6

            // Copy new_weekday values to weekday column
            DB::statement('UPDATE availability_rules SET weekday = new_weekday WHERE new_weekday IS NOT NULL');

            // Drop the temporary column
            Schema::table('availability_rules', function (Blueprint $table) {
                $table->dropColumn('new_weekday');
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the weekday mapping
        DB::transaction(function () {
            // Create a temporary column to avoid conflicts
            Schema::table('availability_rules', function (Blueprint $table) {
                $table->integer('old_weekday')->nullable()->after('weekday');
            });

            // Map new weekdays back to old weekdays
            DB::table('availability_rules')->where('weekday', 0)->update(['old_weekday' => 1]); // Monday: 0 → 1
            DB::table('availability_rules')->where('weekday', 1)->update(['old_weekday' => 2]); // Tuesday: 1 → 2
            DB::table('availability_rules')->where('weekday', 2)->update(['old_weekday' => 3]); // Wednesday: 2 → 3
            DB::table('availability_rules')->where('weekday', 3)->update(['old_weekday' => 4]); // Thursday: 3 → 4
            DB::table('availability_rules')->where('weekday', 4)->update(['old_weekday' => 5]); // Friday: 4 → 5
            DB::table('availability_rules')->where('weekday', 5)->update(['old_weekday' => 6]); // Saturday: 5 → 6
            DB::table('availability_rules')->where('weekday', 6)->update(['old_weekday' => 0]); // Sunday: 6 → 0

            // Copy old_weekday values to weekday column
            DB::statement('UPDATE availability_rules SET weekday = old_weekday WHERE old_weekday IS NOT NULL');

            // Drop the temporary column
            Schema::table('availability_rules', function (Blueprint $table) {
                $table->dropColumn('old_weekday');
            });
        });
    }
};
