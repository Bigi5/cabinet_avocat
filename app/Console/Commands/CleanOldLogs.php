<?php

namespace App\Console\Commands;

use App\Models\CrmLog;
use Illuminate\Console\Command;

class CleanOldLogs extends Command
{
    /**
     * Le nom et la signature de la commande.
     *
     * @var string
     */
    protected $signature = 'crm:clean-logs {--days=90 : Nombre de jours à conserver}';

    /**
     * La description de la commande.
     *
     * @var string
     */
    protected $description = 'Nettoie les logs plus anciens que X jours';

    /**
     * Exécute la commande.
     */
    public function handle()
    {
        $days = $this->option('days');
        $date = now()->subDays($days);

        $this->info("Recherche des logs plus anciens que {$days} jours...");

        $count = CrmLog::where('created_at', '<', $date)->delete();

        $this->info("✅ {$count} logs supprimés (plus de {$days} jours)");
    }
}