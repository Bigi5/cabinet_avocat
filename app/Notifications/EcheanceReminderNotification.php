<?php

namespace App\Notifications;

use App\Models\CrmEcheance;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class EcheanceReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected CrmEcheance $echeance
    ) {}

    public function via(object $notifiable): array
{
    return ['database', 'mail'];
}

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'echeance_reminder',
            'title' => 'Rappel d\'échéance',
            'message' => "L'échéance '{$this->echeance->titre}' est prévue le {$this->echeance->date_time_formatted}.",
            'dossier_id' => $this->echeance->dossier_id,
            'echeance_id' => $this->echeance->id,
            'date_echeance' => $this->echeance->date_time_formatted,
            'criticite' => $this->echeance->criticite,
        ];
    }
    public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->subject('Rappel d\'échéance')
        ->greeting('Bonjour ' . $notifiable->nom_complet . ',')
        ->line('Une échéance nécessite votre attention.')
        ->line('Titre : ' . $this->echeance->titre)
        ->line('Date : ' . $this->echeance->date_time_formatted)
        ->line('Criticité : ' . ucfirst($this->echeance->criticite))
        ->action(
            'Consulter le dossier',
            url('/crm/dossiers/' . $this->echeance->dossier_id)
        )
        ->line('Merci de traiter cette échéance dans les meilleurs délais.');
}
}