<?php

namespace App\Exports;

use App\Models\CrmDocument;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class DocumentsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = CrmDocument::with(['dossier', 'user']);

        if (!empty($this->filters['search'])) {
            $query->where('nom_fichier', 'like', "%{$this->filters['search']}%");
        }

        if (!empty($this->filters['dossier_id'])) {
            $query->where('dossier_id', $this->filters['dossier_id']);
        }

        if (!empty($this->filters['type_document']) && $this->filters['type_document'] !== 'all') {
            $query->where('type_document', $this->filters['type_document']);
        }

        if (!empty($this->filters['extension']) && $this->filters['extension'] !== 'all') {
            $query->where('extension', $this->filters['extension']);
        }

        if (!empty($this->filters['user_id'])) {
            $query->where('user_id', $this->filters['user_id']);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nom du fichier',
            'Type',
            'Extension',
            'Taille (Ko)',
            'Version',
            'Dossier',
            'Ajouté par',
            'Date d\'ajout'
        ];
    }

    public function map($document): array
    {
        return [
            $document->id,
            $document->nom_fichier,
            $document->type_document_label,
            $document->extension,
            round($document->taille / 1024, 2),
            $document->version,
            $document->dossier ? $document->dossier->reference_unique : 'Non associé',
            $document->user ? $document->user->nom_complet : 'Inconnu',
            $document->created_at->format('d/m/Y H:i'),
        ];
    }
}