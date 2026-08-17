<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_dossiers', function (Blueprint $table) {
            $table->boolean('est_archive')->default(false);
            $table->timestamp('archive_le')->nullable();
            $table->foreignId('archive_par')->nullable()->constrained('crm_users')->onDelete('set null');
            $table->text('archive_motif')->nullable();
            $table->foreignId('archive_emplacement_id')->nullable()->constrained('crm_emplacements')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('crm_dossiers', function (Blueprint $table) {
            $table->dropColumn(['est_archive', 'archive_le', 'archive_par', 'archive_motif', 'archive_emplacement_id']);
        });
    }
};