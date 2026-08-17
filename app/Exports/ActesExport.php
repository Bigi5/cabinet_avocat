<?php

namespace App\Exports;

use App\Models\CrmActe;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ActesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = CrmActe::with(['dossier', 'user']);

        if (!empty($this->filters['search'])) {
            $query->where(function ($q) {
                $q->where('type_acte', 'like', "%{$this->filters['search']}%")
                  ->orWhere('description', 'like', "%{$this->filters['search']}%");
            });
        }

        if (!empty($this->filters['dossier_id'])) {
            $query->where('dossier_id', $this->filters['dossier_id']);
        }

        if (!empty($this->filters['user_id'])) {
            $query->where('user_id', $this->filters['user_id']);
        }

        if (!empty($this->filters['type_acte']) && $this->filters['type_acte'] !== 'all') {
            $query->where('type_acte', $this->filters['type_acte']);
        }

        if (!empty($this->filters['date_debut'])) {
            $query->whereDate('horodatage', '>=', $this->filters['date_debut']);
        }

        if (!empty($this->filters['date_fin'])) {
            $query->whereDate('horodatage', '<=', $this->filters['date_fin']);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Type d\'acte',
            'Dossier',
            'Créé par',
            'Date et heure',
            'Description',
            'Date création'
        ];
    }

    public function map($acte): array
    {
        return [
            $acte->id,
            $acte->type_acte_label,
            $acte->dossier ? $acte->dossier->reference_unique : 'Non associé',
            $acte->user ? $acte->user->nom_complet : 'Inconnu',
            $acte->horodatage->format('d/m/Y H:i'),
            $acte->description ?? '-',
            $acte->created_at->format('d/m/Y H:i'),
        ];
    }
}