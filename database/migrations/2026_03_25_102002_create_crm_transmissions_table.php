<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_transmissions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();
            $table->foreignId('emetteur_id')->constrained('crm_users')->onDelete('restrict');
            $table->string('destinataire_nom', 255);
            $table->string('destinataire_email', 255)->nullable();
            $table->string('destinataire_telephone', 20)->nullable();
            $table->foreignId('dossier_id')->nullable()->constrained('crm_dossiers')->onDelete('set null');
            $table->foreignId('document_id')->nullable()->constrained('crm_documents')->onDelete('set null');
            $table->enum('type', ['remise', 'transmission', 'notification', 'signification'])->default('remise');
            $table->enum('statut', ['envoye', 'recu', 'signe', 'refuse'])->default('envoye');
            $table->string('objet', 255);
            $table->text('message')->nullable();
            $table->string('preuve_chemin')->nullable();
            $table->date('date_transmission');
            $table->date('date_reception')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('reference');
            $table->index('emetteur_id');
            $table->index('dossier_id');
            $table->index('statut');
            $table->index('date_transmission');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_transmissions');
    }
};