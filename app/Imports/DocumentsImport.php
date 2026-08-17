<?php

namespace App\Imports;

use App\Models\CrmDocument;
use App\Models\CrmDossier;
use App\Models\CrmUser;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class DocumentsImport implements ToModel, WithHeadingRow, WithValidation
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

        return new CrmDocument([
            'dossier_id' => $dossier->id ?? null,
            'user_id' => $user->id ?? null,
            'type_document' => $this->parseTypeDocument($row['type_document'] ?? 'entrant'),
            'nom_fichier' => $row['nom_fichier'] ?? 'document.pdf',
            'chemin' => $row['chemin'] ?? 'imports/' . uniqid() . '.pdf',
            'extension' => $row['extension'] ?? 'pdf',
            'taille' => $row['taille'] ?? 0,
            'version' => $row['version'] ?? 1,
        ]);
    }

    public function rules(): array
    {
        return [
            'nom_fichier' => 'required|string',
            'type_document' => 'nullable|string',
            'dossier_reference' => 'nullable|string',
            'user_email' => 'nullable|email',
        ];
    }

    private function parseTypeDocument($type)
    {
        $types = [
            'entrant' => 'entrant',
            'produit' => 'produit',
            'transmis' => 'transmis',
        ];

        $type = strtolower(trim($type));
        return $types[$type] ?? 'entrant';
    }
}