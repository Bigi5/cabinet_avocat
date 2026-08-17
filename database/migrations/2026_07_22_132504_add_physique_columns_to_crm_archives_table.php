<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('crm_archives', function (Blueprint $table) {
            // Ajouter les colonnes manquantes
            if (!Schema::hasColumn('crm_archives', 'categorie')) {
                $table->string('categorie')->nullable()->after('titre');
            }
            if (!Schema::hasColumn('crm_archives', 'source')) {
                $table->string('source')->nullable()->default('dossier')->after('type');
            }
            if (!Schema::hasColumn('crm_archives', 'fichier_chemin')) {
                $table->string('fichier_chemin')->nullable()->after('emplacement_detail');
            }
            if (!Schema::hasColumn('crm_archives', 'fichier_nom')) {
                $table->string('fichier_nom')->nullable()->after('fichier_chemin');
            }
            if (!Schema::hasColumn('crm_archives', 'motif_label')) {
                $table->string('motif_label')->nullable()->after('motif');
            }
            if (!Schema::hasColumn('crm_archives', 'type_label')) {
                $table->string('type_label')->nullable()->after('type');
            }
        });

        // Modifier l'ENUM pour inclure 'physique' (MySQL uniquement).
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE crm_archives MODIFY type ENUM('dossier', 'document', 'acte', 'facture', 'bail', 'physique') NOT NULL");
        }
    }

    public function down()
    {
        Schema::table('crm_archives', function (Blueprint $table) {
            $table->dropColumn([
                'categorie',
                'source',
                'fichier_chemin',
                'fichier_nom',
                'motif_label',
                'type_label'
            ]);
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE crm_archives MODIFY type ENUM('dossier', 'document', 'acte', 'facture', 'bail') NOT NULL");
        }
    }
};
