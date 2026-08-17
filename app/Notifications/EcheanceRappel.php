<?php

namespace App\Notifications;

use App\Models\CrmEcheance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EcheanceRappel extends Notification implements ShouldQueue
{
    use Queueable;

    protected $echeance;

    public function __construct(CrmEcheance $echeance)
    {
        $this->echeance = $echeance;
    }

    public function via($notifiable)
    {
        $channels = ['database'];
        
        if ($this->echeance->notification_email) {
            $channels[] = 'mail';
        }
        
        return $channels;
    }

    public function toMail($notifiable)
    {
        $url = url('/crm/echeances/' . $this->echeance->id);
        
        $jour = $this->echeance->est_aujourd_hui ? "aujourd'hui" : "demain";
        
        return (new MailMessage)
            ->subject('⏰ Rappel : ' . $this->echeance->titre . ' ' . $jour)
            ->greeting('Bonjour ' . $notifiable->prenom . ',')
            ->line('Rappel pour votre échéance :')
            ->line('**' . $this->echeance->titre . '**')
            ->line('Date : ' . $this->echeance->date_time_formatted)
            ->line('Dossier : ' . ($this->echeance->dossier->reference_unique ?? 'N/A'))
            ->action('Voir l\'échéance', $url)
            ->line('Merci de votre attention.');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'echeance_rappel',
            'echeance_id' => $this->echeance->id,
            'titre' => $this->echeance->titre,
            'date' => $this->echeance->date_formatted,
            'dossier' => $this->echeance->dossier->reference_unique ?? null,
            'message' => 'Rappel : ' . $this->echeance->titre . ' le ' . $this->echeance->date_formatted,
            'url' => '/crm/echeances/' . $this->echeance->id,
        ];
    }
}