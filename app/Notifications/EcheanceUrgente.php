<?php

namespace App\Notifications;

use App\Models\CrmEcheance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\NexmoMessage;
use Illuminate\Notifications\Notification;

class EcheanceUrgente extends Notification implements ShouldQueue
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
        
        if ($this->echeance->notification_sms) {
            $channels[] = 'nexmo';
        }
        
        return $channels;
    }

    public function toMail($notifiable)
    {
        $url = url('/crm/echeances/' . $this->echeance->id);
        
        return (new MailMessage)
            ->subject('🔴 Échéance urgente : ' . $this->echeance->titre)
            ->greeting('Bonjour ' . $notifiable->prenom . ',')
            ->line('Une échéance urgente nécessite votre attention :')
            ->line('**' . $this->echeance->titre . '**')
            ->line('Date : ' . $this->echeance->date_time_formatted)
            ->line('Dossier : ' . ($this->echeance->dossier->reference_unique ?? 'N/A'))
            ->action('Voir l\'échéance', $url)
            ->line('Merci de traiter cette échéance dans les meilleurs délais.');
    }

    public function toNexmo($notifiable)
    {
        return (new NexmoMessage)
            ->content('🔴 URGENT: ' . $this->echeance->titre . ' le ' . $this->echeance->date_formatted . ' - ' . url('/crm/echeances/' . $this->echeance->id));
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'echeance_urgente',
            'echeance_id' => $this->echeance->id,
            'titre' => $this->echeance->titre,
            'date' => $this->echeance->date_formatted,
            'dossier' => $this->echeance->dossier->reference_unique ?? null,
            'message' => 'Échéance urgente : ' . $this->echeance->titre,
            'url' => '/crm/echeances/' . $this->echeance->id,
        ];
    }
}