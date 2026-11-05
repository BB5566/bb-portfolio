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
        Schema::table('profiles', function (Blueprint $table) {
            $table->unsignedSmallInteger('years_experience')->default(0)->after('skills');
            $table->unsignedSmallInteger('projects_delivered')->default(0)->after('years_experience');
            $table->unsignedSmallInteger('hours_training')->default(0)->after('projects_delivered');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn(['years_experience', 'projects_delivered', 'hours_training']);
        });
    }
};
