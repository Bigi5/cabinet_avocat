<?php

namespace App\Http\Controllers\Crm\Auth;

use App\Http\Controllers\Controller;
use App\Models\CrmActe;
use App\Models\CrmDossier;
use App\Models\CrmUser;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ActesController extends Controller
{
    /**
     * Affiche la liste des actes.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Récupérer l'utilisateur CRM depuis le middleware
        $crmUser = $request->get('crm_user');
        
        if (!$crmUser) {
            return redirect()->route('dashboard')->with('error', 'Utilisateur CRM non trouvé');
        }

        // Vérifier les permissions
        $canViewAll = $this->canViewAllActes($crmUser);
        
        // Construction de la requête de base avec relations
        $query = CrmActe::with(['dossier', 'user']);

        // Filtrage par permissions
        if (!$canViewAll) {
            // Si l'utilisateur ne peut pas tout voir, filtrer ses actes
            $query->where(function ($q) use ($crmUser) {
                $q->where('user_id', $crmUser->id)
                  ->orWhereHas('dossier', function ($dq) use ($crmUser) {
                      $dq->where('responsable_id', $crmUser->id)
                         ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                             $cq->where('user_id', $crmUser->id);
                         });
                  });
            });
        }

        // Recherche
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('type_acte', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhereHas('dossier', function ($dq) use ($request) {
                      $dq->where('reference_unique', 'like', "%{$request->search}%");
                  });
            });
        }

        // Filtre par dossier
        if ($request->has('dossier_id') && !empty($request->dossier_id)) {
            $query->where('dossier_id', $request->dossier_id);
        }

        // Filtre par utilisateur
        if ($request->has('user_id') && !empty($request->user_id)) {
            $query->where('user_id', $request->user_id);
        }

        // Filtre par type d'acte
        if ($request->has('type_acte') && $request->type_acte !== 'all') {
            $query->where('type_acte', $request->type_acte);
        }

        // Filtre par date
        if ($request->has('date_debut') && !empty($request->date_debut)) {
            $query->whereDate('horodatage', '>=', $request->date_debut);
        }
        if ($request->has('date_fin') && !empty($request->date_fin)) {
            $query->whereDate('horodatage', '<=', $request->date_fin);
        }

        // Tri
        $orderBy = $request->get('order_by', 'horodatage');
        $orderDir = $request->get('order_dir', 'desc');
        $query->orderBy($orderBy, $orderDir);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $actes = $query->paginate($perPage);

        // Transformer les données pour l'affichage
        $actes->getCollection()->transform(function ($acte) {
            return [
                'id' => $acte->id,
                'type_acte' => $acte->type_acte,
                'type_acte_label' => $acte->type_acte_label,
                'description' => $acte->description,
                'horodatage' => $acte->horodatage->format('d/m/Y H:i'),
                'date' => $acte->horodatage->format('d/m/Y'),
                'heure' => $acte->horodatage->format('H:i'),
                'dossier' => $acte->dossier ? [
                    'id' => $acte->dossier->id,
                    'reference' => $acte->dossier->reference_unique,
                ] : null,
                'user' => $acte->user ? [
                    'id' => $acte->user->id,
                    'nom' => $acte->user->nom_complet,
                ] : null,
                'created_at' => $acte->created_at->format('d/m/Y H:i'),
            ];
        });

        // Statistiques pour les cartes
        $stats = $this->getStats($crmUser, $canViewAll);

        // Options pour les filtres
        $typesActes = $this->getTypesActes();
        $dossiers = $this->getDossiersList();
        $users = $this->getUsersList();

        return Inertia::render('Crm/Actes', [
            'auth' => [
                'user' => $user
            ],
            'actes' => $actes,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'dossier_id' => $request->get('dossier_id', ''),
                'user_id' => $request->get('user_id', ''),
                'type_acte' => $request->get('type_acte', 'all'),
                'date_debut' => $request->get('date_debut', ''),
                'date_fin' => $request->get('date_fin', ''),
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
            'options' => [
                'types_actes' => $typesActes,
                'dossiers' => $dossiers,
                'users' => $users,
            ],
        ]);
    }

    /**
     * Affiche les détails d'un acte.
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $acte = CrmActe::with(['dossier', 'user'])->findOrFail($id);

        // Vérifier les permissions d'accès
        if (!$this->canAccessActe($crmUser, $acte)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à cet acte.');
        }

        return Inertia::render('Crm/Actes/Show', [
            'auth' => [
                'user' => $user
            ],
            'acte' => [
                'id' => $acte->id,
                'type_acte' => $acte->type_acte,
                'type_acte_label' => $acte->type_acte_label,
                'description' => $acte->description,
                'horodatage' => $acte->horodatage->format('d/m/Y H:i'),
                'date' => $acte->horodatage->format('d/m/Y'),
                'heure' => $acte->horodatage->format('H:i'),
                'dossier' => $acte->dossier ? [
                    'id' => $acte->dossier->id,
                    'reference' => $acte->dossier->reference_unique,
                    'type_mission' => $acte->dossier->type_mission_label,
                    'client' => $acte->dossier->client_nom,
                ] : null,
                'user' => $acte->user ? [
                    'id' => $acte->user->id,
                    'nom' => $acte->user->nom_complet,
                    'role' => $acte->user->role_label,
                ] : null,
                'created_at' => $acte->created_at->format('d/m/Y H:i'),
            ],
        ]);
    }

    /**
     * Affiche le formulaire de création.
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        // Si un dossier_id est fourni, le présélectionner
        $dossierId = $request->get('dossier_id');

        // Récupérer les listes pour les sélecteurs
        $dossiers = $this->getDossiersAccessibles($crmUser);

        return Inertia::render('Crm/Actes/Create', [
            'auth' => [
                'user' => $user
            ],
            'options' => [
                'dossiers' => $dossiers,
                'types_actes' => $this->getTypesActes(),
            ],
            'preselected' => [
                'dossier_id' => $dossierId,
            ],
        ]);
    }

    /**
     * Enregistre un nouvel acte.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        $validated = $request->validate([
            'dossier_id' => 'required|exists:crm_dossiers,id',
            'type_acte' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        // Vérifier que l'utilisateur a accès au dossier
        $dossier = CrmDossier::find($validated['dossier_id']);
        if (!$this->canAccessDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à ce dossier.');
        }

        // Créer l'acte
        $acte = CrmActe::create([
            'dossier_id' => $validated['dossier_id'],
            'user_id' => $crmUser->id,
            'type_acte' => $validated['type_acte'],
            'description' => $validated['description'] ?? null,
            'horodatage' => now(),
        ]);

        return redirect()->route('crm.actes.show', $acte->id)
            ->with('success', 'Acte créé avec succès.');
    }

    /**
     * Affiche le formulaire d'édition.
     */
    public function edit(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $acte = CrmActe::findOrFail($id);

        if (!$this->canEditActe($crmUser, $acte)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier cet acte.');
        }

        $dossiers = $this->getDossiersAccessibles($crmUser);

        return Inertia::render('Crm/Actes/Edit', [
            'auth' => [
                'user' => $user
            ],
            'acte' => [
                'id' => $acte->id,
                'dossier_id' => $acte->dossier_id,
                'type_acte' => $acte->type_acte,
                'description' => $acte->description,
            ],
            'options' => [
                'dossiers' => $dossiers,
                'types_actes' => $this->getTypesActes(),
            ],
        ]);
    }

    /**
     * Met à jour un acte.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $acte = CrmActe::findOrFail($id);

        if (!$this->canEditActe($crmUser, $acte)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier cet acte.');
        }

        $validated = $request->validate([
            'dossier_id' => 'required|exists:crm_dossiers,id',
            'type_acte' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        // Vérifier que l'utilisateur a accès au nouveau dossier
        $dossier = CrmDossier::find($validated['dossier_id']);
        if (!$this->canAccessDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à ce dossier.');
        }

        $acte->update([
            'dossier_id' => $validated['dossier_id'],
            'type_acte' => $validated['type_acte'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->route('crm.actes.show', $acte->id)
            ->with('success', 'Acte mis à jour avec succès.');
    }

    /**
     * Supprime un acte.
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $acte = CrmActe::findOrFail($id);

        if (!$this->canDeleteActe($crmUser, $acte)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour supprimer cet acte.');
        }

        $acte->delete();

        return redirect()->route('crm.actes.index')
            ->with('success', 'Acte supprimé avec succès.');
    }

    /**
     * Exporte les actes d'un dossier.
     */
    public function exportByDossier($dossierId)
    {
        // À implémenter avec Laravel Excel
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    /**
     * Vérifie si l'utilisateur peut voir tous les actes.
     */
    private function canViewAllActes($crmUser): bool
    {
        return $crmUser->isHuissier() || $crmUser->isSenior();
    }

    /**
     * Vérifie si l'utilisateur peut accéder à un acte spécifique.
     */
    private function canAccessActe($crmUser, $acte): bool
    {
        if ($this->canViewAllActes($crmUser)) {
            return true;
        }

        // S'il a créé l'acte
        if ($acte->user_id === $crmUser->id) {
            return true;
        }

        // S'il est responsable du dossier
        if ($acte->dossier && $acte->dossier->responsable_id === $crmUser->id) {
            return true;
        }

        // S'il est collaborateur sur le dossier
        if ($acte->dossier && $acte->dossier->collaborateurs()
                ->where('user_id', $crmUser->id)
                ->exists()) {
            return true;
        }

        return false;
    }

    /**
     * Vérifie si l'utilisateur peut modifier un acte.
     */
    private function canEditActe($crmUser, $acte): bool
    {
        // Les huissiers et seniors peuvent tout modifier
        if ($crmUser->isHuissier() || $crmUser->isSenior()) {
            return true;
        }

        // Le créateur peut modifier son acte
        return $acte->user_id === $crmUser->id;
    }

    /**
     * Vérifie si l'utilisateur peut supprimer un acte.
     */
    private function canDeleteActe($crmUser, $acte): bool
    {
        return $crmUser->isHuissier() || $acte->user_id === $crmUser->id;
    }

    /**
     * Vérifie si l'utilisateur a accès à un dossier.
     */
    private function canAccessDossier($crmUser, $dossier): bool
    {
        if (!$dossier) {
            return false;
        }

        if ($crmUser->isHuissier() || $crmUser->isSenior()) {
            return true;
        }

        if ($dossier->responsable_id === $crmUser->id) {
            return true;
        }

        return $dossier->collaborateurs()
            ->where('user_id', $crmUser->id)
            ->exists();
    }

    /**
     * Calcule les statistiques pour les cartes.
     */
    private function getStats($crmUser, $canViewAll): array
    {
        if ($canViewAll) {
            $total = CrmActe::count();
            $aujourdhui = CrmActe::whereDate('horodatage', today())->count();
            $cetteSemaine = CrmActe::whereBetween('horodatage', [now()->startOfWeek(), now()->endOfWeek()])->count();
            $ceMois = CrmActe::whereMonth('horodatage', now()->month)
                            ->whereYear('horodatage', now()->year)
                            ->count();
        } else {
            $acteIds = CrmActe::where(function ($q) use ($crmUser) {
                $q->where('user_id', $crmUser->id)
                  ->orWhereHas('dossier', function ($dq) use ($crmUser) {
                      $dq->where('responsable_id', $crmUser->id)
                         ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                             $cq->where('user_id', $crmUser->id);
                         });
                  });
            })->pluck('id');

            $total = $acteIds->count();
            $aujourdhui = CrmActe::whereIn('id', $acteIds)->whereDate('horodatage', today())->count();
            $cetteSemaine = CrmActe::whereIn('id', $acteIds)
                ->whereBetween('horodatage', [now()->startOfWeek(), now()->endOfWeek()])
                ->count();
            $ceMois = CrmActe::whereIn('id', $acteIds)
                ->whereMonth('horodatage', now()->month)
                ->whereYear('horodatage', now()->year)
                ->count();
        }

        return [
            'total' => $total,
            'aujourdhui' => $aujourdhui,
            'cette_semaine' => $cetteSemaine,
            'ce_mois' => $ceMois,
            'evolution' => 5,
        ];
    }

    /**
     * Récupère la liste des types d'actes.
     */
    private function getTypesActes(): array
    {
        // Récupérer les types distincts de la base
        $types = CrmActe::distinct()->pluck('type_acte')->toArray();
        
        // Si pas de types, retourner des valeurs par défaut
        if (empty($types)) {
            $types = [
                'assignation',
                'conclusion',
                'requete',
                'appel',
                'contrat',
                'testament',
                'donation',
                'signification',
                'commandement',
                'autre',
            ];
        }

        return collect($types)->map(function ($type) {
            return [
                'value' => $type,
                'label' => ucfirst($type),
            ];
        })->toArray();
    }

    /**
     * Récupère la liste des dossiers accessibles.
     */
    private function getDossiersAccessibles($crmUser): array
    {
        $query = CrmDossier::query();

        if (!$crmUser->isHuissier() && !$crmUser->isSenior()) {
            $query->where(function ($q) use ($crmUser) {
                $q->where('responsable_id', $crmUser->id)
                  ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                      $cq->where('user_id', $crmUser->id);
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->map(function ($dossier) {
                return [
                    'id' => $dossier->id,
                    'reference' => $dossier->reference_unique,
                    'client' => $dossier->client_nom,
                ];
            })
            ->toArray();
    }

    /**
     * Récupère la liste des dossiers pour les filtres.
     */
    private function getDossiersList(): array
    {
        return CrmDossier::orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($dossier) {
                return [
                    'id' => $dossier->id,
                    'reference' => $dossier->reference_unique,
                    'client' => $dossier->client_nom,
                ];
            })
            ->toArray();
    }

    /**
     * Récupère la liste des utilisateurs pour les filtres.
     */
    private function getUsersList(): array
    {
        return CrmUser::actifs()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'nom' => $user->nom_complet,
                'role' => $user->role_label,
            ];
        })->toArray();
    }
}