<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_dossiers', function (Blueprint $table) {
            $table->id();
            $table->string('reference_unique', 50)->unique();
            $table->enum('type_mission', ['signification', 'recouvrement', 'execution', 'injonction', 'saisie', 'autre'])->index();
            $table->date('date_ouverture')->index();
            $table->foreignId('client_id')->constrained('crm_clients')->onDelete('restrict');
            $table->foreignId('responsable_id')->constrained('crm_users')->onDelete('restrict');
            $table->enum('statut', ['cree', 'en_cours', 'en_attente', 'execute', 'cloture', 'archive'])->default('cree')->index();
            $table->text('description')->nullable();
            $table->decimal('montant', 12, 2)->nullable();
            $table->timestamps();
            
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_dossiers');
    }
};