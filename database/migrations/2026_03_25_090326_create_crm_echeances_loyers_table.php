<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_echeances_loyers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bail_id')->constrained('crm_baux')->onDelete('cascade');
            $table->date('date_echeance');
            $table->decimal('montant', 12, 2);
            $table->enum('statut', ['a_venir', 'en_attente', 'paye', 'impaye', 'annule'])->default('a_venir');
            $table->foreignId('paiement_id')->nullable()->constrained('crm_paiements_loyers')->onDelete('set null');
            $table->timestamps();

            $table->index('bail_id');
            $table->index('date_echeance');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_echeances_loyers');
    }
};