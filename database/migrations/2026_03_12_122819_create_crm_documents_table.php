<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('crm_dossiers')->onDelete('cascade');
            $table->enum('type_document', ['entrant', 'produit', 'transmis'])->index();
            $table->string('nom_fichier', 255);
            $table->string('chemin', 500);
            $table->string('extension', 10)->nullable();
            $table->integer('taille')->nullable();
            $table->integer('version')->default(1);
            $table->foreignId('user_id')->nullable()->constrained('crm_users')->onDelete('set null');
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_documents');
    }
};