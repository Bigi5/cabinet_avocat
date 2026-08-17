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
        Schema::create('crm_archive_documents', function (Blueprint $table) {
            $table->id();

            // Archive concernée
            $table->foreignId('archive_id')
                ->constrained('crm_archives')
                ->cascadeOnDelete();

            // Informations du fichier
            $table->string('nom_original');
            $table->string('nom_stockage');
            $table->string('chemin');
            $table->string('extension', 20);
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('taille')->default(0);

            // Description facultative
            $table->text('description')->nullable();

            // Gestion des versions
            $table->integer('version')->default(1);

            // Ordre d'affichage
            $table->integer('ordre')->default(1);

            // Document principal
            $table->boolean('est_principal')->default(false);

            // Utilisateur ayant ajouté le document
            $table->foreignId('ajoute_par')
                ->nullable()
                ->constrained('crm_users')
                ->nullOnDelete();

            $table->timestamps();

            // Index
            $table->index('archive_id');
            $table->index('extension');
            $table->index('est_principal');
            $table->index('version');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_archive_documents');
    }
};