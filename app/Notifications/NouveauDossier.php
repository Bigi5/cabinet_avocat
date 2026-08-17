<?php

namespace App\Notifications;

use App\Models\CrmDossier;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NouveauDossier extends Notification implements ShouldQueue
{
    use Queueable;

    protected $dossier;

    public function __construct(CrmDossier $dossier)
    {
        $this->dossier = $dossier;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $url = url('/crm/dossiers/' . $this->dossier->id);
        
        return (new MailMessage)
            ->subject('📁 Nouveau dossier : ' . $this->dossier->reference_unique)
            ->greeting('Bonjour ' . $notifiable->prenom . ',')
            ->line('Un nouveau dossier a été créé :')
            ->line('**Référence :** ' . $this->dossier->reference_unique)
            ->line('**Type :** ' . $this->dossier->type_mission_label)
            ->line('**Client :** ' . $this->dossier->client_nom)
            ->line('**Responsable :** ' . ($this->dossier->responsable->nom_complet ?? 'Non assigné'))
            ->action('Voir le dossier', $url);
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'nouveau_dossier',
            'dossier_id' => $this->dossier->id,
            'reference' => $this->dossier->reference_unique,
            'type_mission' => $this->dossier->type_mission_label,
            'client' => $this->dossier->client_nom,
            'message' => 'Nouveau dossier : ' . $this->dossier->reference_unique,
            'url' => '/crm/dossiers/' . $this->dossier->id,
        ];
    }
}