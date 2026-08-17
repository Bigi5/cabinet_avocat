<?php

namespace App\Notifications;

use App\Models\CrmDossier;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DossierCreatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected CrmDossier $dossier
    ) {}

    /**
     * Canal de diffusion
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Données enregistrées dans la table notifications
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'dossier_created',
            'title' => 'Nouveau dossier créé',
            'message' => "Le dossier {$this->dossier->reference_unique} a été créé.",
            'dossier_id' => $this->dossier->id,
            'reference' => $this->dossier->reference_unique,
        ];
    }
}