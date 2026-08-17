<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_baux', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();
            $table->foreignId('locataire_id')->constrained('crm_clients')->onDelete('restrict');
            $table->foreignId('bailleur_id')->constrained('crm_clients')->onDelete('restrict');
            $table->foreignId('dossier_id')->nullable()->constrained('crm_dossiers')->onDelete('set null');
            $table->decimal('montant_loyer', 12, 2);
            $table->enum('frequence', ['mensuel', 'trimestriel', 'semestriel', 'annuel'])->default('mensuel');
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->integer('jour_echeance')->default(1); // Jour du mois pour l'échéance
            $table->decimal('caution', 12, 2)->nullable();
            $table->text('description')->nullable();
            $table->string('adresse_bien', 500)->nullable();
            $table->string('reference_cadastrale', 100)->nullable();
            $table->enum('statut', ['actif', 'termine', 'resilie'])->default('actif');
            $table->timestamps();
            $table->softDeletes();

            $table->index('reference');
            $table->index('locataire_id');
            $table->index('bailleur_id');
            $table->index('statut');
            $table->index('date_debut');
            $table->index('date_fin');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_baux');
    }
};