<?php

namespace App\Exports;

use App\Models\CrmDossier;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class DossiersExport implements FromCollection, WithHeadings, WithMapping
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = CrmDossier::with(['client', 'responsable']);

        if (!empty($this->filters['search'])) {
            $query->search($this->filters['search']);
        }

        if (!empty($this->filters['type_mission']) && $this->filters['type_mission'] !== 'all') {
            $query->where('type_mission', $this->filters['type_mission']);
        }

        if (!empty($this->filters['statut']) && $this->filters['statut'] !== 'all') {
            $query->where('statut', $this->filters['statut']);
        }

        if (!empty($this->filters['client_id'])) {
            $query->where('client_id', $this->filters['client_id']);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Référence',
            'Type de mission',
            'Client',
            'Responsable',
            'Statut',
            'Montant (FCFA)',
            'Date ouverture',
            'Date création',
            'Description'
        ];
    }

    public function map($dossier): array
    {
        return [
            $dossier->id,
            $dossier->reference_unique,
            $dossier->type_mission_label,
            $dossier->client_nom,
            $dossier->responsable ? $dossier->responsable->nom_complet : 'Non assigné',
            $dossier->statut_label,
            $dossier->montant ? number_format($dossier->montant, 0, ',', ' ') : '-',
            $dossier->date_ouverture_formatted,
            $dossier->created_at->format('d/m/Y'),
            $dossier->description ?? '-',
        ];
    }
}