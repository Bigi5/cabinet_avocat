<?php

namespace App\Imports;

use App\Models\CrmEcheance;
use App\Models\CrmDossier;
use App\Models\CrmUser;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class EcheancesImport implements ToModel, WithHeadingRow, WithValidation
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

        return new CrmEcheance([
            'dossier_id' => $dossier->id ?? null,
            'user_id' => $user->id ?? null,
            'titre' => $row['titre'] ?? 'Échéance',
            'description' => $row['description'] ?? null,
            'date_echeance' => $this->parseDateTime($row['date_echeance'] ?? now()),
            'criticite' => $this->parseCriticite($row['criticite'] ?? 'moyenne'),
            'statut' => $this->parseStatut($row['statut'] ?? 'a_faire'),
            'notification_email' => $this->parseBoolean($row['notification_email'] ?? false),
            'notification_sms' => $this->parseBoolean($row['notification_sms'] ?? false),
            'notification_whatsapp' => $this->parseBoolean($row['notification_whatsapp'] ?? false),
        ]);
    }

    public function rules(): array
    {
        return [
            'titre' => 'required|string',
            'date_echeance' => 'required',
            'dossier_reference' => 'nullable|string',
            'user_email' => 'nullable|email',
        ];
    }

    private function parseCriticite($criticite)
    {
        $criticites = [
            'haute' => 'haute',
            'moyenne' => 'moyenne',
            'basse' => 'basse',
        ];

        $criticite = strtolower(trim($criticite));
        return $criticites[$criticite] ?? 'moyenne';
    }

    private function parseStatut($statut)
    {
        $statuts = [
            'a faire' => 'a_faire',
            'à faire' => 'a_faire',
            'en cours' => 'en_cours',
            'termine' => 'termine',
            'terminé' => 'termine',
            'annule' => 'annule',
            'annulé' => 'annule',
        ];

        $statut = strtolower(trim($statut));
        return $statuts[$statut] ?? 'a_faire';
    }

    private function parseBoolean($value)
    {
        if (is_bool($value)) return $value;
        if (is_numeric($value)) return (bool)$value;
        
        $value = strtolower(trim($value));
        return in_array($value, ['oui', 'yes', 'true', '1', 'actif']);
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