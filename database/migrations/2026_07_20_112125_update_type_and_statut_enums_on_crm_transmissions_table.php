<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE crm_transmissions MODIFY COLUMN type ENUM(
            'transmission', 'remise', 'notification', 'signification',
            'retour_dossier', 'courrier', 'convocation', 'decision'
        ) NOT NULL DEFAULT 'transmission'");

        DB::statement("ALTER TABLE crm_transmissions MODIFY COLUMN statut ENUM(
            'brouillon', 'en_attente', 'envoye', 'recu', 'signe',
            'archive', 'annule'
        ) NOT NULL DEFAULT 'brouillon'");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE crm_transmissions MODIFY COLUMN type ENUM(
            'remise', 'transmission', 'notification', 'signification'
        ) NOT NULL DEFAULT 'remise'");

        DB::statement("ALTER TABLE crm_transmissions MODIFY COLUMN statut ENUM(
            'envoye', 'recu', 'signe', 'refuse'
        ) NOT NULL DEFAULT 'envoye'");
    }
};
