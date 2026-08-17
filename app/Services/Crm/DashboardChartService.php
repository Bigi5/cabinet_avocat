<?php

namespace App\Services\Crm;

use App\Models\CrmDossier;
use App\Models\CrmFacture;
use Carbon\Carbon;


class DashboardChartService
{


    public function getCharts(): array
    {
        return [
            'dossiers_par_mois' => $this->dossiersParMois(),
            'honoraires_par_mois' => $this->honorairesParMois(),
            'dossiers_par_statut' => $this->dossiersParStatut(),
        ];
    }

    private function dossiersParMois(): array
    {
        $result = [];

        for ($i = 11; $i >= 0; $i--) {

            $date = Carbon::now()->subMonths($i);

            $result[] = [
                'mois' => $date->translatedFormat('M'),
                'total' => CrmDossier::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        }

        return $result;
    }

    private function honorairesParMois(): array
    {
        $result = [];

        for ($i = 11; $i >= 0; $i--) {

            $date = Carbon::now()->subMonths($i);

            $result[] = [
                'mois' => $date->translatedFormat('M'),
                'montant' => CrmFacture::payees()
                    ->whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->sum('montant_ttc'),
            ];
        }

        return $result;
    }

    private function dossiersParStatut(): array
    {
        return CrmDossier::selectRaw('statut, COUNT(*) total')
            ->groupBy('statut')
            ->get()
            ->toArray();
    }
    
    
}