<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            ALTER TABLE crm_archives
            MODIFY motif ENUM(
                'cloture',
                'inactif',
                'ancien',
                'litige_resolu',
                'autre',
                'archivage_physique'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            ALTER TABLE crm_archives
            MODIFY motif ENUM(
                'cloture',
                'inactif',
                'ancien',
                'litige_resolu',
                'autre'
            ) NOT NULL
        ");
    }
};
