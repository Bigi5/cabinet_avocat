<?php

namespace App\Exports;

use App\Models\CrmClient;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ClientsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = CrmClient::query();

        if (!empty($this->filters['search'])) {
            $query->search($this->filters['search']);
        }

        if (!empty($this->filters['type']) && $this->filters['type'] !== 'all') {
            $query->where('type_client', $this->filters['type']);
        }

        if (!empty($this->filters['statut']) && $this->filters['statut'] !== 'all') {
            $query->where('statut', $this->filters['statut']);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Type',
            'Nom/Prénom',
            'Raison Sociale',
            'Email',
            'Téléphone',
            'Adresse',
            'Ville',
            'Code Postal',
            'Pays',
            'Statut',
            'Date création'
        ];
    }

    public function map($client): array
    {
        return [
            $client->id,
            $client->type_client === 'physique' ? 'Personne physique' : 'Personne morale',
            $client->type_client === 'physique' ? $client->prenom . ' ' . $client->nom : '-',
            $client->raison_sociale ?? '-',
            $client->email,
            $client->telephone ?? '-',
            $client->adresse ?? '-',
            $client->ville ?? '-',
            $client->code_postal ?? '-',
            $client->pays ?? '-',
            $client->statut === 'actif' ? 'Actif' : 'Inactif',
            $client->created_at->format('d/m/Y'),
        ];
    }
}