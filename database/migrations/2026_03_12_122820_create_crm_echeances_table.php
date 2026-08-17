<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_echeances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('crm_dossiers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('crm_users')->onDelete('restrict');
            $table->string('titre', 255);
            $table->text('description')->nullable();
            $table->datetime('date_echeance')->index();
            $table->enum('criticite', ['haute', 'moyenne', 'basse'])->default('moyenne')->index();
            $table->enum('statut', ['a_faire', 'en_cours', 'termine', 'annule'])->default('a_faire')->index();
            $table->boolean('notification_email')->default(false);
            $table->boolean('notification_sms')->default(false);
            $table->boolean('notification_whatsapp')->default(false);
            $table->timestamps();
            
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_echeances');
    }
};