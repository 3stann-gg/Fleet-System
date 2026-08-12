<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['assigned_driver_id']);
            $table->dropColumn('assigned_driver_id');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignId('assigned_driver_id')
                ->nullable()
                ->constrained('drivers')
                ->nullOnDelete();
        });
    }
};