<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_actes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('crm_dossiers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('crm_users')->onDelete('restrict');
            $table->string('type_acte', 100);
            $table->text('description')->nullable();
            $table->timestamp('horodatage')->useCurrent()->index();
            $table->timestamps();
            
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_actes');
    }
};