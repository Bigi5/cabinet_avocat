<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_clients', function (Blueprint $table) {
            $table->id();
            $table->enum('type_client', ['physique', 'morale'])->index();
            $table->string('nom', 100)->nullable();
            $table->string('prenom', 100)->nullable();
            $table->date('date_naissance')->nullable();
            $table->string('raison_sociale', 255)->nullable();
            $table->string('siret', 14)->nullable();
            $table->string('email')->unique();
            $table->string('telephone', 20)->nullable();
            $table->string('adresse', 500)->nullable();
            $table->string('code_postal', 10)->nullable();
            $table->string('ville', 100)->nullable()->index();
            $table->string('pays', 100)->default('France');
            $table->enum('statut', ['actif', 'inactif'])->default('actif')->index();
            $table->text('observations')->nullable();
            $table->timestamps();
            
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_clients');
    }
};