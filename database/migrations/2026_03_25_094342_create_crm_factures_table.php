<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_factures', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();
            $table->foreignId('dossier_id')->constrained('crm_dossiers')->onDelete('restrict');
            $table->foreignId('client_id')->constrained('crm_clients')->onDelete('restrict');
            $table->date('date_emission');
            $table->date('date_echeance');
            $table->decimal('montant_ht', 12, 2);
            $table->decimal('tva', 12, 2)->default(0);
            $table->decimal('montant_ttc', 12, 2);
            $table->enum('statut', ['brouillon', 'envoyee', 'payee', 'impayee', 'annulee'])->default('brouillon');
            $table->enum('type', ['honoraire', 'frais', 'avance'])->default('honoraire');
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('crm_users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index('reference');
            $table->index('dossier_id');
            $table->index('client_id');
            $table->index('statut');
            $table->index('date_echeance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_factures');
    }
};