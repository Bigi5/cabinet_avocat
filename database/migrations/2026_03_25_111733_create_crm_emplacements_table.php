<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_emplacements', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('nom', 100);
            $table->enum('type', ['etagere', 'boite', 'armoire', 'carton', 'autre'])->default('etagere');
            $table->string('batiment', 50)->nullable();
            $table->string('etage', 10)->nullable();
            $table->string('salle', 50)->nullable();
            $table->string('rayon', 20)->nullable();
            $table->string('colonne', 20)->nullable();
            $table->string('niveau', 20)->nullable();
            $table->text('description')->nullable();
            $table->integer('capacite')->nullable();
            $table->integer('occupation')->default(0);
            $table->enum('statut', ['actif', 'plein', 'maintenance', 'inactif'])->default('actif');
            $table->timestamps();
            $table->softDeletes();

            $table->index('code');
            $table->index('type');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_emplacements');
    }
};