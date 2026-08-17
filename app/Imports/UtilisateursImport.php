<?php

namespace App\Imports;

use App\Enums\CrmRole;
use App\Models\CrmUser;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class UtilisateursImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new CrmUser([
            'email' => $row['email'],
            'password_hash' => Hash::make($row['password'] ?? 'password123'),
            'nom' => $row['nom'],
            'prenom' => $row['prenom'],
            'role' => $this->parseRole($row['role'] ?? 'junior'),
            'statut' => $this->parseStatut($row['statut'] ?? 'actif'),
            'telephone' => $row['telephone'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:crm_users,email',
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'role' => 'nullable|string',
            'statut' => 'nullable|string',
        ];
    }

    private function parseRole($role)
    {
        return CrmRole::normalize((string) $role);
    }

    private function parseStatut($statut)
    {
        $statut = strtolower(trim($statut));
        return in_array($statut, ['actif', '1', 'oui', 'true']) ? 'actif' : 'inactif';
    }
}