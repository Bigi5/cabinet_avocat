<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CrmOptimizationServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Écouter les événements pour vider le cache
        $this->listenToModelEvents();
        
        // Optimiser les requêtes par défaut (seulement si pas en test)
        $this->optimizeQueries();
    }

    protected function listenToModelEvents()
    {
        $models = [
            \App\Models\CrmClient::class,
            \App\Models\CrmDossier::class,
            \App\Models\CrmActe::class,
            \App\Models\CrmDocument::class,
            \App\Models\CrmEcheance::class,
            \App\Models\CrmUser::class,
        ];

        foreach ($models as $model) {
            $model::created(function () {
                Cache::flush();
            });
            $model::updated(function () {
                Cache::flush();
            });
            $model::deleted(function () {
                Cache::flush();
            });
        }
    }

    protected function optimizeQueries()
    {
        // Vérifier si on est en environnement de test
        if (app()->environment('testing')) {
            return; // Ne rien faire en mode test
        }

        try {
            // Forcer l'utilisation d'index sur certaines requêtes
            DB::statement('SET SESSION optimizer_switch="index_merge=on"');
        } catch (\Exception $e) {
            // Ignorer l'erreur si la commande n'est pas supportée
        }
    }
}