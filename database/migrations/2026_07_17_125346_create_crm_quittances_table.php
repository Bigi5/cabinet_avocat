<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_quittances', function (Blueprint $table) {

            $table->id();

            $table->foreignId('paiement_id')
                ->constrained('crm_paiements_loyers')
                ->cascadeOnDelete();

            $table->foreignId('bail_id')
                ->constrained('crm_baux')
                ->cascadeOnDelete();

            $table->string('numero')->unique();

            $table->date('date_quittance');

            $table->decimal('montant',15,2);

            $table->string('mois');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_quittances');
    }
};