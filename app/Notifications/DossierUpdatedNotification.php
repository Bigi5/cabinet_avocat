<?php

namespace App\Notifications;

use App\Models\CrmDossier;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DossierUpdatedNotification extends Notification
{
    use Queueable;

    protected CrmDossier $dossier;

    /**
     * Create a new notification instance.
     */
    public function __construct(CrmDossier $dossier)
    {
        $this->dossier = $dossier;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'dossier_updated',
            'title' => 'Dossier mis à jour',
            'message' => "Le dossier {$this->dossier->reference_unique} a été modifié.",
            'dossier_id' => $this->dossier->id,
            'reference' => $this->dossier->reference_unique,
        ];
    }
}