<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Vérifier si la table existe déjà
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email', 191)->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->rememberToken();
                $table->timestamps();
                
                // Champs CRM
                $table->string('type')->default('client');
                $table->string('telephone')->nullable();
                $table->string('adresse')->nullable();
                $table->string('ville')->nullable();
                $table->string('code_postal')->nullable();
                $table->string('pays')->nullable()->default('Bénin');
                $table->string('specialite')->nullable();
                $table->string('numero_avocat')->nullable();
                $table->decimal('taux_horaire', 10, 2)->nullable();
                $table->boolean('est_actif')->default(true);
                $table->text('notes')->nullable();
                $table->timestamp('date_embauche')->nullable();
                $table->timestamp('date_depart')->nullable();
                
                // Index
                $table->index('type');
                $table->index('est_actif');
            });
        } else {
            // La table existe, ajouter les champs manquants
            Schema::table('users', function (Blueprint $table) {
                $columnsToAdd = [
                    'type' => 'string',
                    'telephone' => 'string',
                    'adresse' => 'string',
                    'ville' => 'string',
                    'code_postal' => 'string',
                    'pays' => 'string',
                    'specialite' => 'string',
                    'numero_avocat' => 'string',
                    'taux_horaire' => 'decimal',
                    'est_actif' => 'boolean',
                    'notes' => 'text',
                    'date_embauche' => 'timestamp',
                    'date_depart' => 'timestamp',
                ];
                
                foreach ($columnsToAdd as $column => $type) {
                    if (!Schema::hasColumn('users', $column)) {
                        match($type) {
                            'string' => $table->string($column)->nullable(),
                            'decimal' => $table->decimal($column, 10, 2)->nullable(),
                            'boolean' => $table->boolean($column)->default(true),
                            'text' => $table->text($column)->nullable(),
                            'timestamp' => $table->timestamp($column)->nullable(),
                        };
                    }
                }
                
                // Définir des valeurs par défaut après création
                if (Schema::hasColumn('users', 'type')) {
                    \Illuminate\Support\Facades\DB::table('users')
                        ->whereNull('type')
                        ->update(['type' => 'client']);
                }
                
                if (Schema::hasColumn('users', 'est_actif')) {
                    \Illuminate\Support\Facades\DB::table('users')
                        ->whereNull('est_actif')
                        ->update(['est_actif' => true]);
                }
            });
        }
    }

    public function down(): void
    {
        // Ne pas supprimer la table en rollback pour éviter de perdre des données
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'type', 'telephone', 'adresse', 'ville', 'code_postal', 'pays',
                'specialite', 'numero_avocat', 'taux_horaire', 'est_actif',
                'notes', 'date_embauche', 'date_depart'
            ]);
        });
    }
};