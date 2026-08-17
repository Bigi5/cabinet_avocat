<?php

namespace App\Imports;

use App\Models\CrmActe;
use App\Models\CrmDossier;
use App\Models\CrmUser;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ActesImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Trouver le dossier par référence
        $dossier = null;
        if (!empty($row['dossier_reference'])) {
            $dossier = CrmDossier::where('reference_unique', $row['dossier_reference'])->first();
        }

        // Trouver l'utilisateur par email
        $user = null;
        if (!empty($row['user_email'])) {
            $user = CrmUser::where('email', $row['user_email'])->first();
        }

        return new CrmActe([
            'dossier_id' => $dossier->id ?? null,
            'user_id' => $user->id ?? null,
            'type_acte' => $row['type_acte'] ?? 'autre',
            'description' => $row['description'] ?? null,
            'horodatage' => $this->parseDateTime($row['horodatage'] ?? now()),
        ]);
    }

    public function rules(): array
    {
        return [
            'type_acte' => 'required|string',
            'dossier_reference' => 'nullable|string',
            'user_email' => 'nullable|email',
        ];
    }

    private function parseDateTime($datetime)
    {
        if (empty($datetime)) return now();
        
        try {
            return \Carbon\Carbon::parse($datetime);
        } catch (\Exception $e) {
            return now();
        }
    }
}