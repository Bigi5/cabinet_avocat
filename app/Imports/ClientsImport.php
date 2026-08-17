<?php

namespace App\Imports;

use App\Models\CrmClient;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Support\Facades\Validator;

class ClientsImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Déterminer le type de client
        $type_client = 'physique';
        if (!empty($row['raison_sociale']) || !empty($row['siret'])) {
            $type_client = 'morale';
        }

        return new CrmClient([
            'type_client' => $type_client,
            'nom' => $row['nom'] ?? null,
            'prenom' => $row['prenom'] ?? null,
            'date_naissance' => $this->parseDate($row['date_naissance'] ?? null),
            'raison_sociale' => $row['raison_sociale'] ?? null,
            'siret' => $row['siret'] ?? null,
            'email' => $row['email'],
            'telephone' => $row['telephone'] ?? null,
            'adresse' => $row['adresse'] ?? null,
            'code_postal' => $row['code_postal'] ?? null,
            'ville' => $row['ville'] ?? null,
            'pays' => $row['pays'] ?? 'France',
            'statut' => $this->parseStatut($row['statut'] ?? 'actif'),
            'observations' => $row['observations'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:crm_clients,email',
            'nom' => 'nullable|string|max:100',
            'prenom' => 'nullable|string|max:100',
            'raison_sociale' => 'nullable|string|max:255',
            'siret' => 'nullable|string|max:14',
            'telephone' => 'nullable|string|max:20',
        ];
    }

    private function parseDate($date)
    {
        if (empty($date)) return null;
        
        // Essayer différents formats
        if (strpos($date, '/') !== false) {
            return \Carbon\Carbon::createFromFormat('d/m/Y', $date)->format('Y-m-d');
        }
        if (strpos($date, '-') !== false) {
            return date('Y-m-d', strtotime($date));
        }
        return null;
    }

    private function parseStatut($statut)
    {
        $statut = strtolower(trim($statut));
        if (in_array($statut, ['actif', '1', 'oui', 'true'])) {
            return 'actif';
        }
        return 'inactif';
    }
}