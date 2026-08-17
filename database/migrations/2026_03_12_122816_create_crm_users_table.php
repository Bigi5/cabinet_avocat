<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('password_hash');
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->enum('role', ['huissier', 'senior', 'junior', 'assistant'])->default('junior')->index();
            $table->enum('statut', ['actif', 'inactif'])->default('actif')->index();
            $table->string('telephone', 20)->nullable();
            $table->timestamps();
            
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_users');
    }
};