<?php

namespace App\Http\Controllers\Crm\Auth;

use App\Http\Controllers\Controller;
use App\Models\CrmDossier;
use App\Models\CrmClient;
use App\Models\CrmUser;
use App\Models\User;
use App\Notifications\DossierCreatedNotification;
use App\Notifications\DossierUpdatedNotification;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\ArchiveService;
use App\Services\ActivityLogService;

class DossiersController extends Controller
{
    public function __construct(
        private ArchiveService $archiveService
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        
        if (!$crmUser) {
            return redirect()->route('dashboard')->with('error', 'Utilisateur CRM non trouvé');
        }

        $canViewAll = $this->canViewAllDossiers($crmUser);
        
        $query = CrmDossier::with(['client', 'responsable']);

        if (!$canViewAll) {
            $query->where(function ($q) use ($crmUser) {
                $q->where('responsable_id', $crmUser->id)
                  ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                      $cq->where('user_id', $crmUser->id);
                  });
            });
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('type_mission') && $request->type_mission !== 'all') {
            $query->where('type_mission', $request->type_mission);
        }

        if ($request->filled('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('responsable_id')) {
            $query->where('responsable_id', $request->responsable_id);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('date_ouverture', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_ouverture', '<=', $request->date_fin);
        }

        $allowedSorts = [
            'created_at',
            'date_ouverture',
            'reference_unique',
            'type_mission',
            'statut',
            'montant',
        ];

        $orderBy = in_array($request->get('order_by'), $allowedSorts)
            ? $request->get('order_by')
            : 'created_at';

        $orderDir = $request->get('order_dir') === 'asc' ? 'asc' : 'desc';

        $query->orderBy($orderBy, $orderDir);

        $perPage = min((int) $request->get('per_page', 15), 100);
        $dossiers = $query->paginate($perPage);

        $dossiers->getCollection()->transform(function ($dossier) {
            return [
                'id' => $dossier->id,
                'reference' => $dossier->reference_unique,
                'type_mission' => $dossier->type_mission,
                'type_mission_label' => $dossier->type_mission_label,
                'date_ouverture' => $dossier->date_ouverture_formatted,
                'client' => $dossier->client ? [
                    'id' => $dossier->client->id,
                    'nom' => $dossier->client_nom,
                    'type' => $dossier->client->type_client,
                ] : null,
                'responsable' => $dossier->responsable ? [
                    'id' => $dossier->responsable->id,
                    'nom' => $dossier->responsable->nom_complet,
                    'role' => $dossier->responsable->role,
                ] : null,
                'statut' => $dossier->statut,
                'statut_label' => $dossier->statut_label,
                'statut_color' => $dossier->statut_color,
                'montant' => $dossier->montant,
                'description' => $dossier->description,
                'progression' => $dossier->progression,
                'total_actes' => $dossier->total_actes,
                'total_documents' => $dossier->total_documents,
                'total_echeances' => $dossier->total_echeances,
                'echeances_urgentes' => $dossier->echeances_urgentes,
                'echeances_en_retard' => $dossier->echeances_en_retard,
                'collaborateurs' => $dossier->collaborateurs_list,
                'created_at' => $dossier->created_at->format('d/m/Y'),
                'updated_at' => $dossier->updated_at->format('d/m/Y'),
            ];
        });

        $stats = $this->getStats($crmUser, $canViewAll);

        return Inertia::render('Crm/Dossiers', [
            'auth' => ['user' => $user],
            'dossiers' => $dossiers,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'type_mission' => $request->get('type_mission', 'all'),
                'statut' => $request->get('statut', 'all'),
                'client_id' => $request->get('client_id', ''),
                'responsable_id' => $request->get('responsable_id', ''),
                'date_debut' => $request->get('date_debut', ''),
                'date_fin' => $request->get('date_fin', ''),
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
            'options' => [
                'type_missions' => $this->getTypeMissions(),
                'statuts' => $this->getStatuts(),
                'clients' => $this->getClientsList(),
                'responsables' => $this->getResponsablesList(),
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        $dossier = CrmDossier::with([
            'client',
            'responsable',
            'actes' => function ($q) {
                $q->orderBy('horodatage', 'desc');
            },
            'documents' => function ($q) {
                $q->orderBy('created_at', 'desc');
            },
            'echeances' => function ($q) {
                $q->orderBy('date_echeance');
            }
        ])->withCount(['actes', 'documents', 'echeances'])
          ->findOrFail($id);

        if (!$this->canAccessDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Accès refusé à ce dossier.');
        }

        return Inertia::render('Crm/Dossiers/Show', [
            'auth' => ['user' => $user],
            'dossier' => [
                'id' => $dossier->id,
                'reference' => $dossier->reference_unique,
                'type_mission' => $dossier->type_mission,
                'type_mission_label' => $dossier->type_mission_label,
                'date_ouverture' => $dossier->date_ouverture_formatted,
                'client' => $dossier->client ? [
                    'id' => $dossier->client->id,
                    'nom' => $dossier->client_nom,
                    'email' => $dossier->client->email,
                    'telephone' => $dossier->client->telephone,
                ] : null,
                'responsable' => $dossier->responsable ? [
                    'id' => $dossier->responsable->id,
                    'nom' => $dossier->responsable->nom_complet,
                    'role' => $dossier->responsable->role_label,
                ] : null,
                'statut' => $dossier->statut,
                'statut_label' => $dossier->statut_label,
                'statut_color' => $dossier->statut_color,
                'montant' => $dossier->montant,
                'description' => $dossier->description,
                'progression' => $dossier->progression,
                'collaborateurs' => $dossier->collaborateurs_list,
                'total_actes' => $dossier->actes_count,
                'total_documents' => $dossier->documents_count,
                'total_echeances' => $dossier->echeances_count,
                'created_at' => $dossier->created_at->format('d/m/Y'),
                'updated_at' => $dossier->updated_at->format('d/m/Y'),
            ],
            'actes' => $dossier->actes->map(function ($acte) {
                return [
                    'id' => $acte->id,
                    'type_acte' => $acte->type_acte,
                    'type_acte_label' => $acte->type_acte_label,
                    'description' => $acte->description,
                    'horodatage' => $acte->horodatage->format('d/m/Y H:i'),
                    'user' => $acte->user ? $acte->user->nom_complet : null,
                ];
            }),
            'documents' => $dossier->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'nom_fichier' => $doc->nom_fichier,
                    'type_document' => $doc->type_document_label,
                    'extension' => $doc->extension,
                    'taille' => $doc->taille_formatted,
                    'icone' => $doc->icone,
                    'couleur' => $doc->couleur,
                    'date' => $doc->date_formatted,
                    'user' => $doc->user ? $doc->user->nom_complet : null,
                ];
            }),
            'echeances' => $dossier->echeances->map(function ($echeance) {
                return [
                    'id' => $echeance->id,
                    'titre' => $echeance->titre,
                    'description' => $echeance->description,
                    'date' => $echeance->date_formatted,
                    'heure' => $echeance->heure_formatted,
                    'criticite' => $echeance->criticite,
                    'criticite_label' => $echeance->criticite_label,
                    'criticite_color' => $echeance->criticite_color,
                    'statut' => $echeance->statut,
                    'statut_label' => $echeance->statut_label,
                    'statut_color' => $echeance->statut_color,
                    'est_urgent' => $echeance->est_urgent,
                    'est_en_retard' => $echeance->est_en_retard,
                ];
            }),
        ]);
    }

    public function create(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $clients = CrmClient::actifs()->get()->map(function ($client) {
            return [
                'id' => $client->id,
                'nom' => $client->nom_complet,
                'type' => $client->type_client,
            ];
        });

        $responsables = CrmUser::actifs()->avocats()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'nom' => $user->nom_complet,
                'role' => $user->role_label,
            ];
        });

        return Inertia::render('Crm/Dossiers/Create', [
            'auth' => ['user' => $user],
            'options' => [
                'clients' => $clients,
                'responsables' => $responsables,
                'type_missions' => $this->getTypeMissions(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'type_mission' => 'required|in:' . implode(',', array_keys(CrmDossier::TYPES_MISSION)),
            'client_id' => 'required|exists:crm_clients,id',
            'responsable_id' => 'required|exists:crm_users,id',
            'montant' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'collaborateurs' => 'nullable|array',
            'collaborateurs.*' => 'exists:crm_users,id',
        ]);

        $dossier = null;
        DB::transaction(function () use (&$dossier, $validated) {
            $dossier = CrmDossier::create([
                'type_mission' => $validated['type_mission'],
                'client_id' => $validated['client_id'],
                'responsable_id' => $validated['responsable_id'],
                'montant' => $validated['montant'] ?? null,
                'description' => $validated['description'] ?? null,
                'statut' => 'cree',
            ]);

            if (!empty($validated['collaborateurs'])) {
                $dossier->collaborateurs()->attach(
                    $validated['collaborateurs'],
                    ['role_assignation' => 'secondaire']
                );
            }
        });

        // ✅ Notifier tous les utilisateurs du CRM actifs de la création
        $users = User::where('est_actif', true)
            ->whereIn('type', ['admin', 'avocat', 'collaborateur'])
            ->get();

        foreach ($users as $user) {
            $user->notify(new DossierCreatedNotification($dossier));
        }
        ActivityLogService::log(
    action: 'dossier_created',
    model: $dossier,
    newData: $dossier->toArray()
);

        return redirect()->route('crm.dossiers.show', $dossier->id)
            ->with('success', 'Dossier créé avec succès.');
    }

    public function edit(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $dossier = CrmDossier::with('collaborateurs')->findOrFail($id);

        if (!$this->canEditDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Accès refusé à ce dossier.');
        }

        $clients = CrmClient::actifs()->get()->map(function ($client) {
            return [
                'id' => $client->id,
                'nom' => $client->nom_complet,
            ];
        });

        $responsables = CrmUser::actifs()->avocats()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'nom' => $user->nom_complet,
            ];
        });

        $collaborateursIds = $dossier->collaborateurs->pluck('id')->toArray();

        return Inertia::render('Crm/Dossiers/Edit', [
            'auth' => ['user' => $user],
            'dossier' => [
                'id' => $dossier->id,
                'type_mission' => $dossier->type_mission,
                'client_id' => $dossier->client_id,
                'responsable_id' => $dossier->responsable_id,
                'montant' => $dossier->montant,
                'description' => $dossier->description,
                'statut' => $dossier->statut,
                'collaborateurs' => $collaborateursIds,
            ],
            'options' => [
                'clients' => $clients,
                'responsables' => $responsables,
                'type_missions' => $this->getTypeMissions(),
                'statuts' => $this->getStatuts(),
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $dossier = CrmDossier::findOrFail($id);

        if (!$this->canEditDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Accès refusé à ce dossier.');
        }

        $validated = $request->validate([
            'type_mission' => 'required|in:' . implode(',', array_keys(CrmDossier::TYPES_MISSION)),
            'client_id' => 'required|exists:crm_clients,id',
            'responsable_id' => 'required|exists:crm_users,id',
            'statut' => 'required|in:' . implode(',', array_keys(CrmDossier::STATUTS)),
            'montant' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'collaborateurs' => 'nullable|array',
            'collaborateurs.*' => 'exists:crm_users,id',
        ]);

        DB::transaction(function () use ($dossier, $validated) {
            $dossier->update([
                'type_mission' => $validated['type_mission'],
                'client_id' => $validated['client_id'],
                'responsable_id' => $validated['responsable_id'],
                'statut' => $validated['statut'],
                'montant' => $validated['montant'] ?? null,
                'description' => $validated['description'] ?? null,
            ]);

            if (isset($validated['collaborateurs'])) {
                $dossier->collaborateurs()->sync($validated['collaborateurs']);
            }
        });

        // ✅ Notifier les utilisateurs actifs de la mise à jour
        $users = User::where('est_actif', true)
            ->whereIn('type', ['admin', 'avocat', 'collaborateur'])
            ->get();

        foreach ($users as $user) {
            $user->notify(new DossierUpdatedNotification($dossier));
        }
        ActivityLogService::log(
  action: 'dossier_updated',
    model: $dossier,
    newData: $dossier->toArray()
);

        return redirect()->route('crm.dossiers.show', $dossier->id)
            ->with('success', 'Dossier mis à jour avec succès.');
    }

    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $dossier = CrmDossier::findOrFail($id);

        if (!$this->canDeleteDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Accès refusé à ce dossier.');
        }

        if ($dossier->actes()->count() > 0) {
            return redirect()->back()->with('error', 'Impossible de supprimer un dossier avec des actes.');
        }

        if ($dossier->documents()->count() > 0) {
            return redirect()->back()->with('error', 'Impossible de supprimer un dossier avec des documents.');
        }

        if ($dossier->echeances()->count() > 0) {
            return redirect()->back()->with('error', 'Impossible de supprimer un dossier avec des échéances.');
        }

        DB::transaction(function () use ($dossier) {
            $dossier->collaborateurs()->detach();
            $dossier->delete();
        });

        return redirect()->route('crm.dossiers.index')
            ->with('success', 'Dossier supprimé avec succès.');
    }

    public function changeStatut(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $dossier = CrmDossier::findOrFail($id);

        if (!$this->canEditDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Accès refusé à ce dossier.');
        }

        $validated = $request->validate([
            'statut' => 'required|in:' . implode(',', array_keys(CrmDossier::STATUTS)),
            'motif' => 'nullable|string|in:cloture,inactif,ancien,litige_resolu,autre',
            'motif_commentaire' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($dossier, $validated, $crmUser) {
            $dossier->update([
                'statut' => $validated['statut']
            ]);

            // ✅ Si clôturé, archiver automatiquement
            if ($validated['statut'] === CrmDossier::STATUT_CLOTURE) {
                $this->archiveService->archiverDossier(
                    $dossier->fresh(),
                    $crmUser
                );
            }
        });

        // ✅ Notifier les utilisateurs actifs du changement de statut
        $users = User::where('est_actif', true)
            ->whereIn('type', ['admin', 'avocat', 'collaborateur'])
            ->get();

        foreach ($users as $user) {
            $user->notify(new DossierUpdatedNotification($dossier->fresh()));
        }

        return redirect()->back()->with('success', 'Statut mis à jour avec succès.');
    }

    public function addCollaborateur(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $dossier = CrmDossier::findOrFail($id);

        if (!$this->canEditDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Accès refusé à ce dossier.');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:crm_users,id',
            'role' => 'required|in:principal,secondaire,consultant',
        ]);

        $dossier->collaborateurs()->syncWithoutDetaching([
            $validated['user_id'] => [
                'role_assignation' => $validated['role']
            ]
        ]);

        return redirect()->back()->with('success', 'Collaborateur ajouté.');
    }

    public function removeCollaborateur(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $dossier = CrmDossier::findOrFail($id);

        if (!$this->canEditDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Accès refusé à ce dossier.');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:crm_users,id',
        ]);

        $dossier->collaborateurs()->detach($validated['user_id']);

        return redirect()->back()->with('success', 'Collaborateur retiré.');
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    private function canViewAllDossiers(CrmUser $crmUser): bool
    {
        return $crmUser->isHuissier() || $crmUser->isSenior();
    }

    private function canAccessDossier(CrmUser $crmUser, CrmDossier $dossier): bool
    {
        if ($this->canViewAllDossiers($crmUser)) {
            return true;
        }

        if ($dossier->responsable_id === $crmUser->id) {
            return true;
        }

        return $dossier->collaborateurs()
            ->where('user_id', $crmUser->id)
            ->exists();
    }

    private function canEditDossier(CrmUser $crmUser, CrmDossier $dossier): bool
    {
        if ($crmUser->isHuissier() || $crmUser->isSenior()) {
            return true;
        }

        return $dossier->responsable_id === $crmUser->id;
    }

    private function canDeleteDossier(CrmUser $crmUser, CrmDossier $dossier): bool
    {
        return $crmUser->isHuissier();
    }

    private function getStats(CrmUser $crmUser, bool $canViewAll): array
    {
        if ($canViewAll) {
            $total = CrmDossier::count();
            $enCours = CrmDossier::enCours()->count();
            $clotures = CrmDossier::clotures()->count();
            $archives = CrmDossier::archives()->count();
            $avecEcheancesUrgentes = CrmDossier::avecEcheancesUrgentes()->count();
        } else {
            $dossierIds = CrmDossier::where(function ($q) use ($crmUser) {
                $q->where('responsable_id', $crmUser->id)
                  ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                      $cq->where('user_id', $crmUser->id);
                  });
            })->pluck('id');

            $total = $dossierIds->count();
            $enCours = CrmDossier::whereIn('id', $dossierIds)->enCours()->count();
            $clotures = CrmDossier::whereIn('id', $dossierIds)->clotures()->count();
            $archives = CrmDossier::whereIn('id', $dossierIds)->archives()->count();
            $avecEcheancesUrgentes = CrmDossier::whereIn('id', $dossierIds)->avecEcheancesUrgentes()->count();
        }

        return [
            'total' => $total,
            'en_cours' => $enCours,
            'clotures' => $clotures,
            'archives' => $archives,
            'avec_echeances_urgentes' => $avecEcheancesUrgentes,
            'evolution' => 8,
        ];
    }

    private function getTypeMissions(): array
    {
        return collect(CrmDossier::TYPES_MISSION)->map(function ($label, $value) {
            return [
                'value' => $value,
                'label' => $label,
            ];
        })->values()->toArray();
    }

    private function getStatuts(): array
    {
        return collect(CrmDossier::STATUTS)->map(function ($label, $value) {
            return [
                'value' => $value,
                'label' => $label,
            ];
        })->values()->toArray();
    }

    private function getClientsList(): array
    {
        return CrmClient::actifs()->get()->map(function ($client) {
            return [
                'id' => $client->id,
                'nom' => $client->nom_complet,
            ];
        })->toArray();
    }

    private function getResponsablesList(): array
    {
        return CrmUser::actifs()->avocats()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'nom' => $user->nom_complet,
            ];
        })->toArray();
    }
}