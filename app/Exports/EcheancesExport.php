<?php

namespace App\Exports;

use App\Models\CrmEcheance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EcheancesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = CrmEcheance::with(['dossier', 'user']);

        if (!empty($this->filters['search'])) {
            $query->where(function ($q) {
                $q->where('titre', 'like', "%{$this->filters['search']}%")
                  ->orWhere('description', 'like', "%{$this->filters['search']}%");
            });
        }

        if (!empty($this->filters['periode']) && $this->filters['periode'] !== 'all') {
            switch ($this->filters['periode']) {
                case 'today':
                    $query->today();
                    break;
                case 'week':
                    $query->thisWeek();
                    break;
                case 'month':
                    $query->thisMonth();
                    break;
            }
        }

        if (!empty($this->filters['dossier_id'])) {
            $query->where('dossier_id', $this->filters['dossier_id']);
        }

        if (!empty($this->filters['user_id'])) {
            $query->where('user_id', $this->filters['user_id']);
        }

        if (!empty($this->filters['criticite']) && $this->filters['criticite'] !== 'all') {
            $query->where('criticite', $this->filters['criticite']);
        }

        if (!empty($this->filters['statut']) && $this->filters['statut'] !== 'all') {
            $query->where('statut', $this->filters['statut']);
        }

        if (!empty($this->filters['urgent']) && $this->filters['urgent'] === 'true') {
            $query->urgent();
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Titre',
            'Dossier',
            'Responsable',
            'Date échéance',
            'Priorité',
            'Statut',
            'Notifications',
            'Description',
            'Date création'
        ];
    }

    public function map($echeance): array
    {
        $notifications = [];
        if ($echeance->notification_email) $notifications[] = 'Email';
        if ($echeance->notification_sms) $notifications[] = 'SMS';
        if ($echeance->notification_whatsapp) $notifications[] = 'WhatsApp';

        return [
            $echeance->id,
            $echeance->titre,
            $echeance->dossier ? $echeance->dossier->reference_unique : 'Non associé',
            $echeance->user ? $echeance->user->nom_complet : 'Non assigné',
            $echeance->date_time,
            $echeance->criticite_label,
            $echeance->statut_label,
            implode(', ', $notifications) ?: 'Aucune',
            $echeance->description ?? '-',
            $echeance->created_at->format('d/m/Y H:i'),
        ];
    }
}