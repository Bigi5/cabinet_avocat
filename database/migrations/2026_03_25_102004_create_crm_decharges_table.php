<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_decharges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transmission_id')->constrained('crm_transmissions')->onDelete('cascade');
            $table->string('signataire_nom', 255);
            $table->string('signataire_fonction', 100)->nullable();
            $table->date('date_decharge');
            $table->string('signature_chemin')->nullable();
            $table->string('document_chemin')->nullable();
            $table->enum('statut', ['en_attente', 'signe', 'refuse'])->default('en_attente');
            $table->text('observations')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('crm_users')->onDelete('set null');
            $table->timestamps();

            $table->index('transmission_id');
            $table->index('statut');
            $table->index('date_decharge');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_decharges');
    }
};