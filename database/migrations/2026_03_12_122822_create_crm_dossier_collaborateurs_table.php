<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_dossier_collaborateurs', function (Blueprint $table) {
            $table->foreignId('dossier_id')->constrained('crm_dossiers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('crm_users')->onDelete('cascade');
            $table->enum('role_assignation', ['principal', 'secondaire', 'consultant'])->default('secondaire');
            $table->timestamps();
            
            $table->primary(['dossier_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_dossier_collaborateurs');
    }
};