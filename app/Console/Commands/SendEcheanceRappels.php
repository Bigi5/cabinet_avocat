<?php

namespace App\Console\Commands;

use App\Models\CrmEcheance;
use App\Notifications\EcheanceReminderNotification;
use Illuminate\Console\Command;

class SendEcheanceRappels extends Command
{
    /**
     * Le nom de la commande.
     *
     * @var string
     */
    protected $signature = 'crm:send-echeance-rappels';

    /**
     * Description.
     *
     * @var string
     */
    protected $description = 'Envoie automatiquement les rappels des échéances';

    /**
     * Exécute la commande.
     */
    public function handle(): int
    {
        $this->info('=== Vérification des échéances ===');

        $echeances = CrmEcheance::whereIn('statut', [
                CrmEcheance::STATUT_A_FAIRE,
                CrmEcheance::STATUT_EN_COURS,
            ])
            ->where('notification_email', true)
            ->where(function ($query) {
                $query->whereNull('dernier_rappel_at')
                    ->orWhere('dernier_rappel_at', '<', now()->subDay());
            })
            ->where(function ($query) {
                $query->whereDate('date_echeance', today())
                    ->orWhereDate('date_echeance', today()->addDay())
                    ->orWhere('date_echeance', '<', now());
            })
            ->orderBy('date_echeance')
            ->get();

        $this->info("Échéances trouvées : {$echeances->count()}");

        $count = 0;

        foreach ($echeances as $echeance) {

            if (!$echeance->user) {
                continue;
            }

            if (empty($echeance->user->email)) {
                continue;
            }

            $echeance->user->notify(
                new EcheanceReminderNotification($echeance)
            );

            $echeance->update([
                'dernier_rappel_at' => now(),
            ]);

            $count++;

            $this->line("✔ {$echeance->titre}");
        }

        $this->newLine();
        $this->info("✅ {$count} rappel(s) envoyé(s)");

        return self::SUCCESS;
    }
}