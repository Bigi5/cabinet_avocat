<?php

namespace App\Exports;

use App\Models\CrmUser;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UtilisateursExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = [])
    {
    }

    public function collection(): Collection
    {
        $query = CrmUser::query();

        if (! empty($this->filters['search'])) {
            $query->search($this->filters['search']);
        }

        if (! empty($this->filters['role']) && $this->filters['role'] !== 'all') {
            $query->where('role', $this->filters['role']);
        }

        if (! empty($this->filters['statut']) && $this->filters['statut'] !== 'all') {
            $query->where('statut', $this->filters['statut']);
        }

        return $query->orderBy('nom')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Email',
            'Nom',
            'Prénom',
            'Rôle',
            'Statut',
            'Téléphone',
            'Date création',
        ];
    }

    public function map($utilisateur): array
    {
        return [
            $utilisateur->id,
            $utilisateur->email,
            $utilisateur->nom,
            $utilisateur->prenom,
            $utilisateur->role_label,
            $utilisateur->statut_label,
            $utilisateur->telephone ?? '-',
            $utilisateur->created_at->format('d/m/Y H:i'),
        ];
    }
}
