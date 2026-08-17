<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_archives', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();
            $table->enum('type', ['dossier', 'document', 'acte', 'facture', 'bail']);
            $table->unsignedBigInteger('original_id');
            $table->string('original_reference')->nullable();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->date('date_archivage');
            $table->enum('motif', ['cloture', 'inactif', 'ancien', 'litige_resolu', 'autre']);
            $table->text('motif_commentaire')->nullable();
            $table->foreignId('emplacement_id')->nullable()->constrained('crm_emplacements')->onDelete('set null');
            $table->string('emplacement_detail')->nullable();
            $table->enum('statut', ['archive', 'en_cours_de_restauration', 'restaure', 'supprime'])->default('archive');
            $table->date('date_restauration')->nullable();
            $table->foreignId('restaure_par')->nullable()->constrained('crm_users')->onDelete('set null');
            $table->integer('duree_conservation_mois')->nullable();
            $table->date('date_destruction')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadonnees')->nullable();
            $table->foreignId('archive_par')->constrained('crm_users')->onDelete('restrict');
            $table->timestamps();

            $table->index('reference');
            $table->index('type');
            $table->index('original_id');
            $table->index('statut');
            $table->index('emplacement_id');
            $table->index('date_archivage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_archives');
    }
};