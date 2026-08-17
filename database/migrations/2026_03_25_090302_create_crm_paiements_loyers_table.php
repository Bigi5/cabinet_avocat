<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_paiements_loyers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bail_id')->constrained('crm_baux')->onDelete('cascade');
            $table->decimal('montant', 12, 2);
            $table->date('date_paiement');
            $table->date('mois_concerne');
            $table->enum('mode_paiement', ['especes', 'cheque', 'virement', 'carte'])->default('especes');
            $table->enum('statut', ['paye', 'partiel', 'impaye'])->default('paye');
            $table->string('reference_cheque', 50)->nullable();
            $table->boolean('cheque_encaisse')->default(false);
            $table->text('observations')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('crm_users')->onDelete('set null');
            $table->timestamps();

            $table->index('bail_id');
            $table->index('date_paiement');
            $table->index('mois_concerne');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_paiements_loyers');
    }
};