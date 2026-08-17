<?php

namespace App\Http\Controllers\Crm\Auth;

use App\Http\Controllers\Controller;
use App\Models\CrmLog;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class LogsController extends Controller
{
    /**
     * Affiche la liste des logs.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        
        // Seuls les huissiers peuvent voir les logs
        if (!$crmUser->isHuissier()) {
            return redirect()->back()->with('error', "Vous n'avez pas accès aux logs.");
        }

        $query = CrmLog::with(['user'])->orderBy('created_at', 'desc');

        // Recherche
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('action', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function ($uq) use ($request) {
                      $uq->where('nom', 'like', "%{$request->search}%")
                        ->orWhere('prenom', 'like', "%{$request->search}%");
                  });
            });
        }

        // Filtre par type d'action
        if ($request->filled('action') && $request->action !== 'all') {
            $query->where('action', $request->action);
        }

        // Filtre par utilisateur
        if ($request->filled('user_id') && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        // Filtre par date
        if ($request->filled('date_debut')) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }
        if ($request->filled('date_fin')) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        // Pagination
        $perPage = min((int) $request->get('per_page', 25), 100);
        $logs = $query->paginate($perPage);

        // Transformer les données
        $logs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'nom_complet' => $log->user->nom_complet,
                    'role_label' => $log->user->role_label,
                ] : null,
                'action' => $log->action,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'created_at' => $log->created_at->format('d/m/Y H:i:s'),
            ];
        });

        // Options pour les filtres
        $actions = $this->getActions();
        $users = $this->getUsersList();

        return Inertia::render('Crm/Logs/Index', [
            'auth' => ['user' => $user],
            'logs' => $logs,
            'filters' => [
                'search' => $request->get('search', ''),
                'action' => $request->get('action', 'all'),
                'user_id' => $request->get('user_id', 'all'),
                'date_debut' => $request->get('date_debut', ''),
                'date_fin' => $request->get('date_fin', ''),
            ],
            'options' => [
                'actions' => $actions,
                'users' => $users,
            ],
        ]);
    }

    /**
     * Affiche les détails d'un log.
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        
        // Seuls les huissiers peuvent voir les logs
        if (!$crmUser->isHuissier()) {
            return redirect()->back()->with('error', "Vous n'avez pas accès aux logs.");
        }

        $log = CrmLog::with(['user'])->findOrFail($id);

        return Inertia::render('Crm/Logs/Show', [
            'auth' => ['user' => $user],
            'log' => [
                'id' => $log->id,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'nom_complet' => $log->user->nom_complet,
                    'role_label' => $log->user->role_label,
                ] : null,
                'action' => $log->action,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'created_at' => $log->created_at->format('d/m/Y H:i:s'),
            ],
        ]);
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    /**
     * Récupère la liste des actions.
     */
    private function getActions(): array
    {
        return [
            ['value' => 'create', 'label' => 'Création'],
            ['value' => 'update', 'label' => 'Modification'],
            ['value' => 'delete', 'label' => 'Suppression'],
            ['value' => 'view', 'label' => 'Consultation'],
            ['value' => 'login', 'label' => 'Connexion'],
            ['value' => 'logout', 'label' => 'Déconnexion'],
            ['value' => 'export', 'label' => 'Export'],
            ['value' => 'import', 'label' => 'Import'],
        ];
    }

    private function getUsersList(): array
    {
        return \App\Models\CrmUser::actifs()
            ->get()
            ->map(function ($user) {
                return [
                    'value' => $user->id,
                    'label' => $user->nom_complet,
                ];
            })
            ->toArray();
    }
}
