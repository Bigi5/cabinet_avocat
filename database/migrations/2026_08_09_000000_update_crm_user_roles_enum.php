<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('crm_users')
            ->whereIn('role', ['junior', 'collaborateur', 'assistant'])
            ->update(['role' => 'assistante']);

        Schema::table('crm_users', function (Blueprint $table) {
            $table->enum('role', [
                'huissier',
                'senior',
                'secretaire',
                'assistante',
                'gestionnaire_baux',
                'client',
            ])->default('assistante')->change();
        });
    }

    public function down(): void
    {
        DB::table('crm_users')
            ->whereIn('role', ['secretaire', 'assistante', 'gestionnaire_baux', 'client'])
            ->update(['role' => 'junior']);

        Schema::table('crm_users', function (Blueprint $table) {
            $table->enum('role', ['huissier', 'senior', 'junior', 'assistant'])->default('junior')->change();
        });
    }
};
