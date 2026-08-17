<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Services\Crm\DashboardChartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StatistiquesController extends Controller
{
    public function __construct(protected DashboardChartService $dashboardChartService)
    {
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (! $user || ! $crmUser) {
            return redirect()->route('login');
        }

        $canViewAll = $crmUser->isHuissier() || $crmUser->isSenior();
        $charts = $canViewAll
            ? $this->dashboardChartService->getCharts()
            : $this->dashboardChartService->getChartsForUser($crmUser);

        return Inertia::render('Crm/Statistiques', [
            'charts' => $charts,
            'canViewAll' => $canViewAll,
        ]);
    }
}
