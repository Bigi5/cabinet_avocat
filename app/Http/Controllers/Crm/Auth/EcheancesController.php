<?php

namespace App\Http\Controllers\Crm\Auth;

use App\Http\Controllers\Controller;
use App\Models\CrmEcheance;
use App\Models\CrmDossier;
use App\Models\CrmUser;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class EcheancesController extends Controller
{
    /**
     * Affiche la liste des échéances.
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
        $canViewAll = $this->canViewAllEcheances($crmUser);
        
        // Construction de la requête de base avec relations
        $query = CrmEcheance::with(['dossier', 'user']);

        // Filtrage par permissions
        if (!$canViewAll) {
            // Si l'utilisateur ne peut pas tout voir, filtrer ses échéances
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

        // Filtre par période
        if ($request->has('periode') && $request->periode !== 'all') {
            switch ($request->periode) {
                case 'today':
                    $query->today();
                    break;
                case 'tomorrow':
                    $query->tomorrow();
                    break;
                case 'week':
                    $query->thisWeek();
                    break;
                case 'month':
                    $query->thisMonth();
                    break;
            }
        }

        // Recherche
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('titre', 'like', "%{$request->search}%")
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

        // Filtre par criticité
        if ($request->has('criticite') && $request->criticite !== 'all') {
            $query->where('criticite', $request->criticite);
        }

        // Filtre par statut
        if ($request->has('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        // Filtres spéciaux
        if ($request->has('urgent') && $request->urgent === 'true') {
            $query->urgent();
        }

        if ($request->has('en_retard') && $request->en_retard === 'true') {
            $query->enRetard();
        }

        // Filtre par date
        if ($request->has('date_debut') && !empty($request->date_debut)) {
            $query->whereDate('date_echeance', '>=', $request->date_debut);
        }
        if ($request->has('date_fin') && !empty($request->date_fin)) {
            $query->whereDate('date_echeance', '<=', $request->date_fin);
        }

        // Tri
        $orderBy = $request->get('order_by', 'date_echeance');
        $orderDir = $request->get('order_dir', 'asc');
        $query->orderBy($orderBy, $orderDir);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $echeances = $query->paginate($perPage);

        // Transformer les données pour l'affichage
        $echeances->getCollection()->transform(function ($echeance) {
            return [
                'id' => $echeance->id,
                'titre' => $echeance->titre,
                'titre_court' => $echeance->titre_court,
                'description' => $echeance->description,
                'date_echeance' => $echeance->date_echeance->format('Y-m-d H:i:s'),
                'date' => $echeance->date_formatted,
                'heure' => $echeance->heure_formatted,
                'date_time' => $echeance->date_time_formatted,
                'criticite' => $echeance->criticite,
                'criticite_label' => $echeance->criticite_label,
                'criticite_color' => $echeance->criticite_color,
                'statut' => $echeance->statut,
                'statut_label' => $echeance->statut_label,
                'statut_color' => $echeance->statut_color,
                'est_urgent' => $echeance->est_urgent,
                'est_en_retard' => $echeance->est_en_retard,
                'est_aujourd_hui' => $echeance->est_aujourd_hui,
                'est_demain' => $echeance->est_demain,
                'notifications' => $echeance->notifications_actives,
                'notification_email' => $echeance->notification_email,
                'notification_sms' => $echeance->notification_sms,
                'notification_whatsapp' => $echeance->notification_whatsapp,
                'dossier' => $echeance->dossier ? [
                    'id' => $echeance->dossier->id,
                    'reference' => $echeance->dossier->reference_unique,
                ] : null,
                'user' => $echeance->user ? [
                    'id' => $echeance->user->id,
                    'nom' => $echeance->user->nom_complet,
                ] : null,
                'created_at' => $echeance->created_at->format('d/m/Y H:i'),
                'updated_at' => $echeance->updated_at->format('d/m/Y H:i'),
            ];
        });

        // Statistiques pour les cartes
        $stats = $this->getStats($crmUser, $canViewAll);

        // Options pour les filtres
        $dossiers = $this->getDossiersList();
        $users = $this->getUsersList();
        $criticites = $this->getCriticites();
        $statuts = $this->getStatuts();

        return Inertia::render('Crm/Echeances', [
            'auth' => [
                'user' => $user
            ],
            'echeances' => $echeances,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'periode' => $request->get('periode', 'all'),
                'dossier_id' => $request->get('dossier_id', ''),
                'user_id' => $request->get('user_id', ''),
                'criticite' => $request->get('criticite', 'all'),
                'statut' => $request->get('statut', 'all'),
                'urgent' => $request->get('urgent', 'false'),
                'en_retard' => $request->get('en_retard', 'false'),
                'date_debut' => $request->get('date_debut', ''),
                'date_fin' => $request->get('date_fin', ''),
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
            'options' => [
                'dossiers' => $dossiers,
                'users' => $users,
                'criticites' => $criticites,
                'statuts' => $statuts,
            ],
        ]);
    }

    /**
     * Affiche les détails d'une échéance.
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $echeance = CrmEcheance::with(['dossier', 'user'])->findOrFail($id);

        // Vérifier les permissions d'accès
        if (!$this->canAccessEcheance($crmUser, $echeance)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à cette échéance.');
        }

        return Inertia::render('Crm/Echeances/Show', [
            'auth' => [
                'user' => $user
            ],
            'echeance' => [
                'id' => $echeance->id,
                'titre' => $echeance->titre,
                'description' => $echeance->description,
                'date_echeance' => $echeance->date_echeance->format('Y-m-d H:i:s'),
                'date' => $echeance->date_formatted,
                'heure' => $echeance->heure_formatted,
                'date_time' => $echeance->date_time_formatted,
                'criticite' => $echeance->criticite,
                'criticite_label' => $echeance->criticite_label,
                'criticite_color' => $echeance->criticite_color,
                'statut' => $echeance->statut,
                'statut_label' => $echeance->statut_label,
                'statut_color' => $echeance->statut_color,
                'est_urgent' => $echeance->est_urgent,
                'est_en_retard' => $echeance->est_en_retard,
                'est_aujourd_hui' => $echeance->est_aujourd_hui,
                'est_demain' => $echeance->est_demain,
                'notifications' => $echeance->notifications_actives,
                'notification_email' => $echeance->notification_email,
                'notification_sms' => $echeance->notification_sms,
                'notification_whatsapp' => $echeance->notification_whatsapp,
                'dossier' => $echeance->dossier ? [
                    'id' => $echeance->dossier->id,
                    'reference' => $echeance->dossier->reference_unique,
                    'type_mission' => $echeance->dossier->type_mission_label,
                    'client' => $echeance->dossier->client_nom,
                ] : null,
                'user' => $echeance->user ? [
                    'id' => $echeance->user->id,
                    'nom' => $echeance->user->nom_complet,
                    'role' => $echeance->user->role_label,
                ] : null,
                'created_at' => $echeance->created_at->format('d/m/Y H:i'),
                'updated_at' => $echeance->updated_at->format('d/m/Y H:i'),
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
        $users = $this->getUsersList();

        return Inertia::render('Crm/Echeances/Create', [
            'auth' => [
                'user' => $user
            ],
            'options' => [
                'dossiers' => $dossiers,
                'users' => $users,
                'criticites' => $this->getCriticites(),
                'statuts' => $this->getStatuts(),
            ],
            'preselected' => [
                'dossier_id' => $dossierId,
                'user_id' => $crmUser->id,
            ],
        ]);
    }

    /**
     * Enregistre une nouvelle échéance.
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
            'user_id' => 'required|exists:crm_users,id',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_echeance' => 'required|date',
            'criticite' => 'required|in:haute,moyenne,basse',
            'statut' => 'required|in:a_faire,en_cours,termine,annule',
            'notification_email' => 'boolean',
            'notification_sms' => 'boolean',
            'notification_whatsapp' => 'boolean',
        ]);

        // Vérifier que l'utilisateur a accès au dossier
        $dossier = CrmDossier::find($validated['dossier_id']);
        if (!$this->canAccessDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à ce dossier.');
        }

        // Créer l'échéance
        $echeance = CrmEcheance::create([
            'dossier_id' => $validated['dossier_id'],
            'user_id' => $validated['user_id'],
            'titre' => $validated['titre'],
            'description' => $validated['description'],
            'date_echeance' => $validated['date_echeance'],
            'criticite' => $validated['criticite'],
            'statut' => $validated['statut'],
            'notification_email' => $validated['notification_email'] ?? false,
            'notification_sms' => $validated['notification_sms'] ?? false,
            'notification_whatsapp' => $validated['notification_whatsapp'] ?? false,
        ]);

        // Si c'est une échéance urgente, on pourrait envoyer des notifications immédiates
        if ($echeance->est_urgent) {
            $this->sendUrgentNotifications($echeance);
        }

        return redirect()->route('crm.echeances.show', $echeance->id)
            ->with('success', 'Échéance créée avec succès.');
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
        $echeance = CrmEcheance::findOrFail($id);

        if (!$this->canEditEcheance($crmUser, $echeance)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier cette échéance.');
        }

        $dossiers = $this->getDossiersAccessibles($crmUser);
        $users = $this->getUsersList();

        return Inertia::render('Crm/Echeances/Edit', [
            'auth' => [
                'user' => $user
            ],
            'echeance' => [
                'id' => $echeance->id,
                'dossier_id' => $echeance->dossier_id,
                'user_id' => $echeance->user_id,
                'titre' => $echeance->titre,
                'description' => $echeance->description,
                'date_echeance' => $echeance->date_echeance->format('Y-m-d\TH:i'),
                'criticite' => $echeance->criticite,
                'statut' => $echeance->statut,
                'notification_email' => $echeance->notification_email,
                'notification_sms' => $echeance->notification_sms,
                'notification_whatsapp' => $echeance->notification_whatsapp,
            ],
            'options' => [
                'dossiers' => $dossiers,
                'users' => $users,
                'criticites' => $this->getCriticites(),
                'statuts' => $this->getStatuts(),
            ],
        ]);
    }

    /**
     * Met à jour une échéance.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $echeance = CrmEcheance::findOrFail($id);

        if (!$this->canEditEcheance($crmUser, $echeance)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier cette échéance.');
        }

        $validated = $request->validate([
            'dossier_id' => 'required|exists:crm_dossiers,id',
            'user_id' => 'required|exists:crm_users,id',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_echeance' => 'required|date',
            'criticite' => 'required|in:haute,moyenne,basse',
            'statut' => 'required|in:a_faire,en_cours,termine,annule',
            'notification_email' => 'boolean',
            'notification_sms' => 'boolean',
            'notification_whatsapp' => 'boolean',
        ]);

        // Vérifier que l'utilisateur a accès au nouveau dossier
        $dossier = CrmDossier::find($validated['dossier_id']);
        if (!$this->canAccessDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à ce dossier.');
        }

        $echeance->update([
            'dossier_id' => $validated['dossier_id'],
            'user_id' => $validated['user_id'],
            'titre' => $validated['titre'],
            'description' => $validated['description'],
            'date_echeance' => $validated['date_echeance'],
            'criticite' => $validated['criticite'],
            'statut' => $validated['statut'],
            'notification_email' => $validated['notification_email'] ?? false,
            'notification_sms' => $validated['notification_sms'] ?? false,
            'notification_whatsapp' => $validated['notification_whatsapp'] ?? false,
        ]);

        return redirect()->route('crm.echeances.show', $echeance->id)
            ->with('success', 'Échéance mise à jour avec succès.');
    }

    /**
     * Supprime une échéance.
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $echeance = CrmEcheance::findOrFail($id);

        if (!$this->canDeleteEcheance($crmUser, $echeance)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour supprimer cette échéance.');
        }

        $echeance->delete();

        return redirect()->route('crm.echeances.index')
            ->with('success', 'Échéance supprimée avec succès.');
    }

    /**
     * Change le statut d'une échéance.
     */
    public function changeStatut(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $echeance = CrmEcheance::findOrFail($id);

        if (!$this->canEditEcheance($crmUser, $echeance)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier cette échéance.');
        }

        $validated = $request->validate([
            'statut' => 'required|in:a_faire,en_cours,termine,annule',
        ]);

        $echeance->update(['statut' => $validated['statut']]);

        return redirect()->back()->with('success', 'Statut mis à jour avec succès.');
    }

    /**
     * Marque une échéance comme terminée.
     */
    public function markAsDone(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $echeance = CrmEcheance::findOrFail($id);

        if (!$this->canEditEcheance($crmUser, $echeance)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier cette échéance.');
        }

        $echeance->update(['statut' => 'termine']);

        return redirect()->back()->with('success', 'Échéance marquée comme terminée.');
    }

    /**
     * Rappel pour une échéance.
     */
    public function reminder(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $echeance = CrmEcheance::findOrFail($id);

        if (!$this->canAccessEcheance($crmUser, $echeance)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à cette échéance.');
        }

        // Envoyer un rappel (email, SMS, etc.)
        $this->sendReminder($echeance);

        return redirect()->back()->with('success', 'Rappel envoyé avec succès.');
    }
    public function report(Request $request, $id)
{
    $user = Auth::user();

    if (!$user) {
        return redirect()->route('login');
    }

    $crmUser = $request->get('crm_user');
    $echeance = CrmEcheance::findOrFail($id);

    if (!$this->canEditEcheance($crmUser, $echeance)) {
        return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier cette échéance.');
    }

    $validated = $request->validate([
        'date_echeance' => 'required|date',
    ]);

    $echeance->update([
        'date_echeance' => $validated['date_echeance'],
        'statut' => 'a_faire',
    ]);

    return redirect()->back()->with('success', 'Échéance reportée avec succès.');
}

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    /**
     * Vérifie si l'utilisateur peut voir toutes les échéances.
     */
    private function canViewAllEcheances($crmUser): bool
    {
        return $crmUser->isHuissier() || $crmUser->isSenior();
    }

    /**
     * Vérifie si l'utilisateur peut accéder à une échéance spécifique.
     */
    private function canAccessEcheance($crmUser, $echeance): bool
    {
        if ($this->canViewAllEcheances($crmUser)) {
            return true;
        }

        // S'il a créé l'échéance
        if ($echeance->user_id === $crmUser->id) {
            return true;
        }

        // S'il est responsable du dossier
        if ($echeance->dossier && $echeance->dossier->responsable_id === $crmUser->id) {
            return true;
        }

        // S'il est collaborateur sur le dossier
        if ($echeance->dossier && $echeance->dossier->collaborateurs()
                ->where('user_id', $crmUser->id)
                ->exists()) {
            return true;
        }

        return false;
    }

    /**
     * Vérifie si l'utilisateur peut modifier une échéance.
     */
    private function canEditEcheance($crmUser, $echeance): bool
    {
        // Les huissiers et seniors peuvent tout modifier
        if ($crmUser->isHuissier() || $crmUser->isSenior()) {
            return true;
        }

        // Le créateur peut modifier son échéance
        return $echeance->user_id === $crmUser->id;
    }

    /**
     * Vérifie si l'utilisateur peut supprimer une échéance.
     */
    private function canDeleteEcheance($crmUser, $echeance): bool
    {
        return $crmUser->isHuissier() || $echeance->user_id === $crmUser->id;
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
            $total = CrmEcheance::count();
            $aujourdHui = CrmEcheance::today()->count();
            $aVenir = CrmEcheance::aVenir()->count();
            $urgentes = CrmEcheance::urgent()->count();
            $enRetard = CrmEcheance::enRetard()->count();
            $terminees = CrmEcheance::where('statut', 'termine')->count();
        } else {
            $echeanceIds = CrmEcheance::where(function ($q) use ($crmUser) {
                $q->where('user_id', $crmUser->id)
                  ->orWhereHas('dossier', function ($dq) use ($crmUser) {
                      $dq->where('responsable_id', $crmUser->id)
                         ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                             $cq->where('user_id', $crmUser->id);
                         });
                  });
            })->pluck('id');

            $total = $echeanceIds->count();
            $aujourdHui = CrmEcheance::whereIn('id', $echeanceIds)->today()->count();
            $aVenir = CrmEcheance::whereIn('id', $echeanceIds)->aVenir()->count();
            $urgentes = CrmEcheance::whereIn('id', $echeanceIds)->urgent()->count();
            $enRetard = CrmEcheance::whereIn('id', $echeanceIds)->enRetard()->count();
            $terminees = CrmEcheance::whereIn('id', $echeanceIds)->where('statut', 'termine')->count();
        }

        return [
            'total' => $total,
            'aujourd_hui' => $aujourdHui,
            'a_venir' => $aVenir,
            'urgentes' => $urgentes,
            'en_retard' => $enRetard,
            'terminees' => $terminees,
            'evolution' => 7,
        ];
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

    /**
     * Récupère la liste des criticites.
     */
    private function getCriticites(): array
    {
        return [
            ['value' => 'haute', 'label' => 'Haute'],
            ['value' => 'moyenne', 'label' => 'Moyenne'],
            ['value' => 'basse', 'label' => 'Basse'],
        ];
    }

    /**
     * Récupère la liste des statuts.
     */
    private function getStatuts(): array
    {
        return [
            ['value' => 'a_faire', 'label' => 'À faire'],
            ['value' => 'en_cours', 'label' => 'En cours'],
            ['value' => 'termine', 'label' => 'Terminé'],
            ['value' => 'annule', 'label' => 'Annulé'],
        ];
    }

    /**
     * Envoie des notifications pour une échéance urgente.
     */
    private function sendUrgentNotifications($echeance)
    {
        // À implémenter avec Laravel Notifications
        // Notification::send($echeance->user, new UrgentEcheanceNotification($echeance));
    }

    /**
     * Envoie un rappel pour une échéance.
     */
    private function sendReminder($echeance)
    {
        // À implémenter avec Laravel Notifications
        // Notification::send($echeance->user, new EcheanceReminderNotification($echeance));
    }
}