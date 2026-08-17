<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('crm_archive_historiques', function (Blueprint $table) {
            $table->id();

            // Archive concernée
            $table->foreignId('archive_id')
                ->constrained('crm_archives')
                ->cascadeOnDelete();

            // Utilisateur
            $table->foreignId('utilisateur_id')
                ->nullable()
                ->constrained('crm_users')
                ->nullOnDelete();

            // Action effectuée
            $table->enum('action', [
                'creation',
                'consultation',
                'telechargement',
                'ajout_document',
                'suppression_document',
                'modification',
                'restauration',
                'archivage',
                'suppression_archive'
            ]);

            // Détails
            $table->text('description')->nullable();

            // Traçabilité
            $table->string('ip_adresse', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamps();

            // Index
            $table->index('archive_id');
            $table->index('utilisateur_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_archive_historiques');
    }
};