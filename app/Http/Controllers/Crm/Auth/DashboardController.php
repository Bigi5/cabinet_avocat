<?php

namespace App\Http\Controllers\Crm\Auth;

use App\Http\Controllers\Controller;
use App\Models\CrmClient;
use App\Models\CrmDossier;
use App\Models\CrmActe;
use App\Models\CrmDocument;
use App\Models\CrmEcheance;
use App\Models\CrmUser;
use App\Models\CrmBail;
use App\Models\CrmFacture;
use App\Models\CrmTransmission;
use App\Models\CrmEcheanceLoyer;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Services\Crm\DashboardChartService;

class DashboardController extends Controller
{
    protected DashboardChartService $dashboardChartService;

    public function __construct(DashboardChartService $dashboardChartService)
    {
        $this->dashboardChartService = $dashboardChartService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $now = now();
        $currentMonth = $now->month;
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        
        if (!$crmUser) {
            return redirect()->route('dashboard')->with('error', 'Utilisateur CRM non trouvé');
        }

        $canViewAll = $crmUser->isHuissier() || $crmUser->isSenior();

        // ============================================
        // KPIS PRINCIPAUX
        // ============================================
        
        // Dossiers
        $dossiersActifs = CrmDossier::enCours()->count();
        $dossiersClotures = CrmDossier::clotures()->count();
        $totalDossiers = CrmDossier::count();
        
        // Clients
        $clientsActifs = CrmClient::where('statut', 'actif')->count();
        $totalClients = CrmClient::count();
        
        // Utilisateurs
        $avocatsActifs = CrmUser::avocats()->actifs()->count();
        
        // Documents
        $documentsTotal = CrmDocument::count();
        
        // Actes
        $actesTotal = CrmActe::count();
        $actesMois = CrmActe::whereMonth('created_at', $currentMonth)->count();
        
        // Échéances
        $echeancesAujourdHui = CrmEcheance::today()->count();
        $echeancesSemaine = CrmEcheance::thisWeek()->count();
        $echeancesUrgentes = CrmEcheance::urgent()->count();
        
        // Baux
        $bauxActifs = CrmBail::actifs()->count();
        $loyersImpayes = CrmEcheanceLoyer::where('statut', 'impaye')->count();
        $montantLoyersImpayes = CrmEcheanceLoyer::where('statut', 'impaye')->sum('montant');
        
        // Factures
        $facturesImpayees = CrmFacture::impayees()->count();
        $montantFacturesImpayees = CrmFacture::impayees()->sum('montant_ttc');
        $facturesPayees = CrmFacture::payees()->count();
        $montantFacturesPayees = CrmFacture::payees()->sum('montant_ttc');
        $totalFactures = CrmFacture::count();
        
        // Transmissions
        $transmissionsEnAttente = CrmTransmission::where('statut', 'envoye')->count();
        $dechargesEnAttente = CrmTransmission::whereHas('decharge', function($q) {
            $q->where('statut', 'en_attente');
        })->count();

        // ============================================
        // STATISTIQUES POUR LES CARTES
        // ============================================
        $clientsEvolution = $this->getEvolution('clients');
        $dossiersEvolution = $this->getEvolution('dossiers');
        $documentsEvolution = $this->getEvolution('documents');
        $actesEvolution = $this->getEvolution('actes');
        $bauxEvolution = $this->getEvolution('baux');
        $facturesEvolution = $this->getEvolution('factures');
        
        $stats = [
            [
                'label' => 'Clients actifs',
                'value' => $clientsActifs,
                'change' => $clientsEvolution,
                'change_text' => sprintf('%+d%% ce mois', $clientsEvolution),
                'icon' => 'Users',
                'color' => 'bg-blue-100 text-blue-600',
                'trend' => $clientsEvolution >= 0 ? 'up' : 'down',
            ],
            [
                'label' => 'Dossiers en cours',
                'value' => $dossiersActifs,
                'change' => $dossiersEvolution,
                'change_text' => sprintf('%+d%% ce mois', $dossiersEvolution),
                'icon' => 'Folder',
                'color' => 'bg-green-100 text-green-600',
                'trend' => $dossiersEvolution >= 0 ? 'up' : 'down',
            ],
            [
                'label' => 'Actes du mois',
                'value' => $actesMois,
                'change' => $actesEvolution,
                'change_text' => sprintf('%+d%% vs mois dernier', $actesEvolution),
                'icon' => 'FileText',
                'color' => 'bg-amber-100 text-amber-600',
                'trend' => $actesEvolution >= 0 ? 'up' : 'down',
            ],
            [
                'label' => 'Documents',
                'value' => $documentsTotal,
                'change' => $documentsEvolution,
                'change_text' => sprintf('%+d%% ce mois', $documentsEvolution),
                'icon' => 'FileText',
                'color' => 'bg-purple-100 text-purple-600',
                'trend' => $documentsEvolution >= 0 ? 'up' : 'down',
            ],
            [
                'label' => 'Baux actifs',
                'value' => $bauxActifs,
                'change' => $bauxEvolution,
                'change_text' => sprintf('%+d%% ce mois', $bauxEvolution),
                'icon' => 'Home',
                'color' => 'bg-indigo-100 text-indigo-600',
                'trend' => $bauxEvolution >= 0 ? 'up' : 'down',
            ],
            [
                'label' => 'Factures impayées',
                'value' => $facturesImpayees,
                'change' => $facturesEvolution,
                'change_text' => sprintf('%+d%% ce mois', $facturesEvolution),
                'icon' => 'FileText',
                'color' => 'bg-red-100 text-red-600',
                'trend' => $facturesEvolution >= 0 ? 'down' : 'up',
            ],
        ];

        // ============================================
        // ÉCHÉANCES URGENTES
        // ============================================
        
        $urgentEcheances = CrmEcheance::with(['dossier', 'user'])
            ->whereIn('criticite', ['haute'])
            ->whereIn('statut', ['a_faire', 'en_cours'])
            ->orderBy('date_echeance')
            ->limit(5)
            ->get()
            ->map(function ($echeance) {
                return [
                    'id' => $echeance->id,
                    'title' => $echeance->titre,
                    'reference' => $echeance->dossier ? $echeance->dossier->reference_unique : null,
                    'date_formatted' => $echeance->date_time_formatted,
                    'location' => $echeance->description,
                    'type' => $this->getEcheanceType($echeance),
                    'priorite' => $echeance->criticite,
                    'statut' => $echeance->statut,
                    'dossier_id' => $echeance->dossier_id,
                    'user' => $echeance->user ? $echeance->user->nom_complet : null,
                ];
            })->toArray();

        // ============================================
        // ACTIVITÉS RÉCENTES
        // ============================================
        
        $recentActivities = $this->getRecentActivities($crmUser);

        // ============================================
        // DOSSIERS RÉCENTS
        // ============================================
        
        $recentDossiers = $this->getRecentDossiers($crmUser);

        // ============================================
        // STATISTIQUES FINANCIÈRES
        // ============================================
        
        $statsFinancieres = [
            'honoraires_encaisses' => $montantFacturesPayees,
            'factures_payees' => $facturesPayees,
            'factures_impayees' => $facturesImpayees,
            'taux_recouvrement' => $totalFactures > 0 ? round(($facturesPayees / $totalFactures) * 100) : 0,
            'loyers_impayes' => $montantLoyersImpayes,
            'total_encours' => $montantLoyersImpayes + $montantFacturesImpayees,
        ];

        // ============================================
        // DONNÉES POUR LES GRAPHIQUES
        // ============================================
        $chartData = $this->dashboardChartService->getCharts();
        $activiteData = $this->getActiviteData($crmUser);

        return Inertia::render('Crm/Dashboard', [
            'auth' => [
                'user' => [
                    'id' => $crmUser->id,
                    'name' => $crmUser->nom_complet,
                    'email' => $crmUser->email,
                    'role' => $crmUser->role_label,
                    'avatar' => null,
                ]
            ],
            'data' => [
                'kpis' => [
                    'dossiers_actifs' => $dossiersActifs,
                    'dossiers_clotures' => $dossiersClotures,
                    'taux_reussite' => $totalDossiers > 0 ? round(($dossiersClotures / $totalDossiers) * 100) : 0,
                    'dossiers_par_avocat' => $avocatsActifs > 0 ? round($totalDossiers / $avocatsActifs, 1) : 0,
                    'avocats_actifs' => $avocatsActifs,
                    'clients_actifs' => $clientsActifs,
                    'actes_en_attente' => $actesTotal,
                    'documents_total' => $documentsTotal,
                    'echeances_aujourd_hui' => $echeancesAujourdHui,
                    'echeances_semaine' => $echeancesSemaine,
                    'baux_actifs' => $bauxActifs,
                    'loyers_impayes' => $loyersImpayes,
                    'factures_impayees' => $facturesImpayees,
                    'transmissions_en_attente' => $transmissionsEnAttente,
                    'decharges_en_attente' => $dechargesEnAttente,
                ],
                'charts' => $chartData,
                'stats' => $stats,
                'urgent_echeances' => $urgentEcheances,
                'recent_activities' => $recentActivities,
                'recent_dossiers' => $recentDossiers,
                'stats_financieres' => $statsFinancieres,
                'activite' => $activiteData,
            ],
            'user' => [
                'id' => $crmUser->id,
                'name' => $crmUser->nom_complet,
                'role' => $crmUser->role_label,
                'avatar' => null,
            ],
        ]);
    }

    public function search(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $query = $request->get('q', '');
        $canViewAll = $crmUser->isHuissier() || $crmUser->isSenior();

        if (empty($query)) {
            return redirect()->route('crm.dashboard');
        }

        // Recherche clients
        $clientsQuery = CrmClient::where(function ($q) use ($query) {
            $q->where('nom', 'like', "%{$query}%")
              ->orWhere('prenom', 'like', "%{$query}%")
              ->orWhere('raison_sociale', 'like', "%{$query}%")
              ->orWhere('email', 'like', "%{$query}%");
        });
        
        // Recherche dossiers
        $dossiersQuery = CrmDossier::with(['client', 'responsable'])->where(function ($q) use ($query) {
            $q->where('reference_unique', 'like', "%{$query}%")
              ->orWhere('objet_litige', 'like', "%{$query}%");
        });
        
        // Recherche actes
        $actesQuery = CrmActe::with(['dossier', 'user'])->where(function ($q) use ($query) {
            $q->where('type_acte', 'like', "%{$query}%")
              ->orWhere('numero', 'like', "%{$query}%")
              ->orWhere('tribunal', 'like', "%{$query}%");
        });
        
        // Recherche documents
        $documentsQuery = CrmDocument::with(['dossier', 'user'])->where(function ($q) use ($query) {
            $q->where('nom_fichier', 'like', "%{$query}%")
              ->orWhere('type_document', 'like', "%{$query}%");
        });
        
        // Appliquer les filtres de permissions
        if (!$canViewAll) {
            $dossierIds = $this->getUserDossierIds($crmUser);
            $dossiersQuery->whereIn('id', $dossierIds);
            $actesQuery->whereIn('dossier_id', $dossierIds);
            $documentsQuery->whereIn('dossier_id', $dossierIds);
        }

        $results = [
            'clients' => $clientsQuery->limit(10)->get()->map(fn($c) => [
                'type' => 'client',
                'id' => $c->id,
                'title' => $c->nom_complet,
                'subtitle' => $c->email,
                'url' => '/crm/clients/' . $c->id,
            ])->toArray(),
            'dossiers' => $dossiersQuery->limit(10)->get()->map(fn($d) => [
                'type' => 'dossier',
                'id' => $d->id,
                'title' => $d->reference_unique,
                'subtitle' => $d->client_nom,
                'url' => '/crm/dossiers/' . $d->id,
            ])->toArray(),
            'actes' => $actesQuery->limit(10)->get()->map(fn($a) => [
                'type' => 'acte',
                'id' => $a->id,
                'title' => $a->type_acte_label,
                'subtitle' => $a->dossier ? $a->dossier->reference_unique : 'Sans dossier',
                'url' => '/crm/actes/' . $a->id,
            ])->toArray(),
            'documents' => $documentsQuery->limit(10)->get()->map(fn($doc) => [
                'type' => 'document',
                'id' => $doc->id,
                'title' => $doc->nom_fichier,
                'subtitle' => $doc->dossier ? $doc->dossier->reference_unique : 'Sans dossier',
                'url' => '/crm/documents/' . $doc->id,
            ])->toArray(),
        ];

        return Inertia::render('Crm/Search', [
            'auth' => [
                'user' => [
                    'id' => $crmUser->id,
                    'name' => $crmUser->nom_complet,
                    'email' => $crmUser->email,
                    'role' => $crmUser->role_label,
                ]
            ],
            'results' => $results,
            'query' => $query,
            'total' => count($results['clients']) + count($results['dossiers']) + count($results['actes']) + count($results['documents']),
        ]);
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    private function getEvolution(string $type): int
    {
        $currentMonth = now()->month;
        $previousMonth = now()->copy()->subMonth()->month;
        
        switch($type) {
            case 'clients':
                $current = CrmClient::whereMonth('created_at', $currentMonth)->count();
                $previous = CrmClient::whereMonth('created_at', $previousMonth)->count();
                break;
            case 'dossiers':
                $current = CrmDossier::whereMonth('created_at', $currentMonth)->count();
                $previous = CrmDossier::whereMonth('created_at', $previousMonth)->count();
                break;
            case 'documents':
                $current = CrmDocument::whereMonth('created_at', $currentMonth)->count();
                $previous = CrmDocument::whereMonth('created_at', $previousMonth)->count();
                break;
            case 'actes':
                $current = CrmActe::whereMonth('created_at', $currentMonth)->count();
                $previous = CrmActe::whereMonth('created_at', $previousMonth)->count();
                break;
            case 'baux':
                $current = CrmBail::whereMonth('created_at', $currentMonth)->count();
                $previous = CrmBail::whereMonth('created_at', $previousMonth)->count();
                break;
            case 'factures':
                $current = CrmFacture::whereMonth('created_at', $currentMonth)->count();
                $previous = CrmFacture::whereMonth('created_at', $previousMonth)->count();
                break;
            default:
                return 0;
        }
        
        if ($previous == 0) return $current > 0 ? 100 : 0;
        return round(($current - $previous) / $previous * 100);
    }

    private function getEcheanceType($echeance): string
    {
        if (stripos($echeance->titre, 'audience') !== false) return 'audience';
        if (stripos($echeance->titre, 'dépôt') !== false) return 'deadline';
        if (stripos($echeance->titre, 'rdv') !== false) return 'meeting';
        if (stripos($echeance->titre, 'signature') !== false) return 'signature';
        return 'rappel';
    }

    private function getRecentActivities($crmUser): array
    {
        $activities = [];
        $canViewAll = $crmUser->isHuissier() || $crmUser->isSenior();

        // Derniers dossiers
        $dossiersQuery = CrmDossier::with('client')->orderBy('created_at', 'desc')->limit(5);
        if (!$canViewAll) {
            $dossierIds = $this->getUserDossierIds($crmUser);
            $dossiersQuery->whereIn('id', $dossierIds);
        }
        
        foreach ($dossiersQuery->get() as $dossier) {
            $activities[] = [
                'id' => 'dossier_' . $dossier->id,
                'action' => 'Nouveau dossier',
                'detail' => $dossier->reference_unique . ' - ' . $dossier->client_nom,
                'time' => $dossier->created_at->diffForHumans(),
                'time_formatted' => $dossier->created_at->format('d/m/Y H:i'),
                'icon' => 'Folder',
                'color' => 'bg-green-500',
                'user' => $dossier->responsable ? $dossier->responsable->nom_complet : null,
                'type' => 'dossier',
                'url' => '/crm/dossiers/' . $dossier->id,
            ];
        }

        // Derniers actes
        $actesQuery = CrmActe::with(['dossier', 'user'])->orderBy('created_at', 'desc')->limit(5);
        if (!$canViewAll) {
            $actesQuery->where('user_id', $crmUser->id);
        }
        
        foreach ($actesQuery->get() as $acte) {
            $activities[] = [
                'id' => 'acte_' . $acte->id,
                'action' => 'Acte créé',
                'detail' => $acte->type_acte_label . ' - ' . ($acte->dossier ? $acte->dossier->reference_unique : 'Sans dossier'),
                'time' => $acte->created_at->diffForHumans(),
                'time_formatted' => $acte->created_at->format('d/m/Y H:i'),
                'icon' => 'FileText',
                'color' => 'bg-blue-500',
                'user' => $acte->user ? $acte->user->nom_complet : null,
                'type' => 'acte',
                'url' => '/crm/actes/' . $acte->id,
            ];
        }

        return $activities;
    }

    private function getRecentDossiers($crmUser): array
    {
        $canViewAll = $crmUser->isHuissier() || $crmUser->isSenior();

        $query = CrmDossier::with(['client', 'responsable'])
            ->orderBy('updated_at', 'desc')
            ->limit(5);

        if (!$canViewAll) {
            $query->where(function ($q) use ($crmUser) {
                $q->where('responsable_id', $crmUser->id)
                  ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                      $cq->where('user_id', $crmUser->id);
                  });
            });
        }

        return $query->get()->map(function ($dossier) {
            return [
                'id' => $dossier->id,
                'reference' => $dossier->reference_unique,
                'titre' => $dossier->type_mission_label,
                'client' => $dossier->client_nom,
                'client_id' => $dossier->client_id,
                'statut' => $dossier->statut_label,
                'statut_color' => $dossier->statut_color,
                'avocat' => $dossier->responsable ? $dossier->responsable->nom_complet : 'Non assigné',
                'avocat_id' => $dossier->responsable_id,
                'progression' => $dossier->progression,
            ];
        })->toArray();
    }

    private function getActiviteData($crmUser): array
    {
        $canViewAll = $crmUser->isHuissier() || $crmUser->isSenior();
        $data = [];

        $dateDebut = now()->startOfWeek();
        $dateFin = now()->endOfWeek();

        $period = \Carbon\CarbonPeriod::create($dateDebut, $dateFin);
        
        foreach ($period as $date) {
            $dayStart = $date->copy()->startOfDay();
            $dayEnd = $date->copy()->endOfDay();

            if ($canViewAll) {
                $actes = CrmActe::whereBetween('created_at', [$dayStart, $dayEnd])->count();
                $documents = CrmDocument::whereBetween('created_at', [$dayStart, $dayEnd])->count();
                $echeances = CrmEcheance::whereBetween('created_at', [$dayStart, $dayEnd])->count();
                $factures = CrmFacture::whereBetween('created_at', [$dayStart, $dayEnd])->count();
                $transmissions = CrmTransmission::whereBetween('created_at', [$dayStart, $dayEnd])->count();
            } else {
                $dossierIds = $this->getUserDossierIds($crmUser);
                
                $actes = CrmActe::whereIn('dossier_id', $dossierIds)
                    ->whereBetween('created_at', [$dayStart, $dayEnd])
                    ->count();
                $documents = CrmDocument::whereIn('dossier_id', $dossierIds)
                    ->whereBetween('created_at', [$dayStart, $dayEnd])
                    ->count();
                $echeances = CrmEcheance::whereIn('dossier_id', $dossierIds)
                    ->whereBetween('created_at', [$dayStart, $dayEnd])
                    ->count();
                $factures = CrmFacture::whereIn('dossier_id', $dossierIds)
                    ->whereBetween('created_at', [$dayStart, $dayEnd])
                    ->count();
                $transmissions = CrmTransmission::where('emetteur_id', $crmUser->id)
                    ->whereBetween('created_at', [$dayStart, $dayEnd])
                    ->count();
            }

            $data[] = [
                'date' => $date->format('d/m'),
                'actes' => $actes,
                'documents' => $documents,
                'echeances' => $echeances,
                'factures' => $factures,
                'transmissions' => $transmissions,
                'total' => $actes + $documents + $echeances + $factures + $transmissions,
            ];
        }

        return $data;
    }

    private function getUserDossierIds($crmUser): array
    {
        return CrmDossier::where(function ($q) use ($crmUser) {
            $q->where('responsable_id', $crmUser->id)
              ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                  $cq->where('user_id', $crmUser->id);
              });
        })->pluck('id')->toArray();
    }
}
