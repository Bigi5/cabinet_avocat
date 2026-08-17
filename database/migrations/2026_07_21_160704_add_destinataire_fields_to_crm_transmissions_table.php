<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_transmissions', function (Blueprint $table) {
            $table->string('destinataire_fonction', 255)->nullable()->after('destinataire_telephone');
            $table->string('destinataire_organisation', 255)->nullable()->after('destinataire_fonction');
            $table->text('destinataire_adresse')->nullable()->after('destinataire_organisation');
        });
    }

    public function down(): void
    {
        Schema::table('crm_transmissions', function (Blueprint $table) {
            $table->dropColumn([
                'destinataire_fonction',
                'destinataire_organisation',
                'destinataire_adresse'
            ]);
        });
    }
};