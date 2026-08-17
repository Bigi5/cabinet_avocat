<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_lignes_facture', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facture_id')->constrained('crm_factures')->onDelete('cascade');
            $table->string('description', 255);
            $table->decimal('quantite', 10, 2)->default(1);
            $table->decimal('prix_unitaire', 12, 2);
            $table->decimal('montant_ht', 12, 2);
            $table->decimal('tva', 12, 2)->default(0);
            $table->decimal('montant_ttc', 12, 2);
            $table->timestamps();

            $table->index('facture_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_lignes_facture');
    }
};