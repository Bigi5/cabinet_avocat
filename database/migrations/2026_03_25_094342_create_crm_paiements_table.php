<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facture_id')->constrained('crm_factures')->onDelete('cascade');
            $table->foreignId('dossier_id')->constrained('crm_dossiers')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('crm_clients')->onDelete('cascade');
            $table->decimal('montant', 12, 2);
            $table->date('date_paiement');
            $table->enum('mode', ['especes', 'cheque', 'virement', 'carte'])->default('especes');
            $table->string('reference_cheque', 50)->nullable();
            $table->boolean('cheque_encaisse')->default(false);
            $table->text('observations')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('crm_users')->onDelete('set null');
            $table->timestamps();

            $table->index('facture_id');
            $table->index('dossier_id');
            $table->index('client_id');
            $table->index('date_paiement');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_paiements');
    }
};