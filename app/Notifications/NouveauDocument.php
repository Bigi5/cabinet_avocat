<?php

namespace App\Notifications;

use App\Models\CrmDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NouveauDocument extends Notification implements ShouldQueue
{
    use Queueable;

    protected $document;

    public function __construct(CrmDocument $document)
    {
        $this->document = $document;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $url = url('/crm/documents/' . $this->document->id);
        
        return (new MailMessage)
            ->subject('📄 Nouveau document : ' . $this->document->nom_fichier)
            ->greeting('Bonjour ' . $notifiable->prenom . ',')
            ->line('Un nouveau document a été ajouté :')
            ->line('**Fichier :** ' . $this->document->nom_fichier)
            ->line('**Type :** ' . $this->document->type_document_label)
            ->line('**Dossier :** ' . ($this->document->dossier->reference_unique ?? 'N/A'))
            ->line('**Ajouté par :** ' . ($this->document->user->nom_complet ?? 'Système'))
            ->action('Voir le document', $url);
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'nouveau_document',
            'document_id' => $this->document->id,
            'nom_fichier' => $this->document->nom_fichier,
            'type_document' => $this->document->type_document_label,
            'dossier' => $this->document->dossier->reference_unique ?? null,
            'message' => 'Nouveau document : ' . $this->document->nom_fichier,
            'url' => '/crm/documents/' . $this->document->id,
        ];
    }
}