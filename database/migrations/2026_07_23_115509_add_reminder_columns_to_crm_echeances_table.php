<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_echeances', function (Blueprint $table) {
            $table->timestamp('dernier_rappel_at')->nullable()->after('notification_whatsapp');
            $table->timestamp('notification_envoyee_at')->nullable()->after('dernier_rappel_at');
        });
    }

    public function down(): void
    {
        Schema::table('crm_echeances', function (Blueprint $table) {
            $table->dropColumn([
                'dernier_rappel_at',
                'notification_envoyee_at',
            ]);
        });
    }
};