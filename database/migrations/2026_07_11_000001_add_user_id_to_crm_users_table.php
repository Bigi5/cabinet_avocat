<?php

use App\Enums\UserType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_users', function (Blueprint $table) {
            if (!Schema::hasColumn('crm_users', 'user_id')) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('users')
                    ->nullOnDelete();
            }
        });

        $allowedTypes = [
            UserType::ADMIN->value,
            UserType::AVOCAT->value,
            UserType::COLLABORATEUR->value,
        ];

        DB::table('crm_users')
            ->whereNull('user_id')
            ->orderBy('id')
            ->each(function ($crmUser) use ($allowedTypes) {
                $user = DB::table('users')
                    ->where('email', $crmUser->email)
                    ->whereIn('type', $allowedTypes)
                    ->first();

                if (!$user) {
                    return;
                }

                $alreadyLinked = DB::table('crm_users')
                    ->where('user_id', $user->id)
                    ->exists();

                if (!$alreadyLinked) {
                    DB::table('crm_users')
                        ->where('id', $crmUser->id)
                        ->update(['user_id' => $user->id]);
                }
            });

        Schema::table('crm_users', function (Blueprint $table) {
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('crm_users', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
