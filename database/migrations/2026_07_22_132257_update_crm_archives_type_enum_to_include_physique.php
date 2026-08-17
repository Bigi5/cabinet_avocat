<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Pour MySQL
        DB::statement("ALTER TABLE crm_archives MODIFY type ENUM('dossier', 'document', 'acte', 'facture', 'bail', 'physique') NOT NULL");
    }

    public function down()
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE crm_archives MODIFY type ENUM('dossier', 'document', 'acte', 'facture', 'bail') NOT NULL");
    }
};
