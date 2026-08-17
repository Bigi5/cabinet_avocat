<?php

namespace App\Imports;

use App\Models\CrmDossier;
use App\Models\CrmClient;
use App\Models\CrmUser;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class DossiersImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Trouver le client par email ou nom
        $client = null;
        if (!empty($row['client_email'])) {
            $client = CrmClient::where('email', $row['client_email'])->first();
        }
        if (!$client && !empty($row['client_nom'])) {
            $client = CrmClient::where('nom_complet', 'like', "%{$row['client_nom']}%")->first();
        }

        // Trouver le responsable par email
        $responsable = null;
        if (!empty($row['responsable_email'])) {
            $responsable = CrmUser::where('email', $row['responsable_email'])->first();
        }

        return new CrmDossier([
            'reference_unique' => $row['reference'] ?? $this->generateReference(),
            'type_mission' => $this->parseTypeMission($row['type_mission']),
            'client_id' => $client->id ?? null,
            'responsable_id' => $responsable->id ?? null,
            'date_ouverture' => $this->parseDate($row['date_ouverture'] ?? now()),
            'statut' => $this->parseStatut($row['statut'] ?? 'cree'),
            'montant' => $row['montant'] ?? null,
            'description' => $row['description'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'type_mission' => 'required|string',
            'client_email' => 'nullable|email',
            'responsable_email' => 'nullable|email',
            'montant' => 'nullable|numeric',
        ];
    }

    private function parseTypeMission($type)
    {
        $types = [
            'signification' => 'signification',
            'recouvrement' => 'recouvrement',
            'execution' => 'execution',
            'injonction' => 'injonction',
            'saisie' => 'saisie',
            'autre' => 'autre',
        ];

        $type = strtolower(trim($type));
        return $types[$type] ?? 'autre';
    }

    private function parseStatut($statut)
    {
        $statuts = [
            'cree' => 'cree',
            'en cours' => 'en_cours',
            'en attente' => 'en_attente',
            'execute' => 'execute',
            'cloture' => 'cloture',
            'archive' => 'archive',
        ];

        $statut = strtolower(trim($statut));
        return $statuts[$statut] ?? 'cree';
    }

    private function parseDate($date)
    {
        if (empty($date)) return now();
        
        if (strpos($date, '/') !== false) {
            return \Carbon\Carbon::createFromFormat('d/m/Y', $date)->format('Y-m-d');
        }
        return date('Y-m-d', strtotime($date));
    }

    private function generateReference()
    {
        $year = date('Y');
        $month = date('m');
        $lastDossier = CrmDossier::whereYear('created_at', $year)
                                 ->whereMonth('created_at', $month)
                                 ->orderBy('id', 'desc')
                                 ->first();
        
        $nextNumber = $lastDossier ? intval(substr($lastDossier->reference_unique, -3)) + 1 : 1;
        return sprintf('DOS-%s%s-%03d', $year, $month, $nextNumber);
    }
}