<?php

namespace App\Http\Controllers\Crm\Auth;

use App\Http\Controllers\Controller;
use App\Models\CrmClient;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ClientsController extends Controller
{
    /**
     * Affiche la liste des clients.
     */
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

        $canViewAll = $crmUser->isHuissier() || $crmUser->isSenior();
        
        $query = CrmClient::query();

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('raison_sociale', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%");
            });
        }

        // Filtre par type
        if ($request->filled('type_client') && $request->type_client !== 'all') {
            $query->where('type_client', $request->type_client);
        }

        // Filtre par statut
        if ($request->filled('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        // Tri sécurisé
        $allowedSorts = ['created_at', 'nom', 'prenom', 'raison_sociale', 'email', 'statut'];
        $orderBy = in_array($request->get('order_by'), $allowedSorts)
            ? $request->get('order_by')
            : 'created_at';
        $orderDir = $request->get('order_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($orderBy, $orderDir);

        // Pagination limitée
        $perPage = min((int) $request->get('per_page', 15), 100);
        $clients = $query->paginate($perPage);

        // Transformer les données pour l'affichage
        $clients->getCollection()->transform(function ($client) {
            return [
                'id' => $client->id,
                'reference' => $client->reference,
                'nom' => $client->nom,
                'prenom' => $client->prenom,
                'nom_complet' => $client->nom_complet,
                'raison_sociale' => $client->raison_sociale,
                'type_client' => $client->type_client,
                'type_client_label' => $client->type_client_label,
                'email' => $client->email,
                'telephone' => $client->telephone,
                'adresse' => $client->adresse,
                'statut' => $client->statut,
                'statut_label' => $client->statut_label,
                'statut_color' => $client->statut_color,
                'total_dossiers' => $client->total_dossiers,
                'dossiers_en_cours' => $client->dossiers_en_cours,
                'roles' => $client->roles,
                'created_at' => $client->created_at->format('d/m/Y'),
                'updated_at' => $client->updated_at->format('d/m/Y'),
            ];
        });

        // Statistiques pour les cartes
        $stats = $this->getStats($crmUser, $canViewAll);

        return Inertia::render('Crm/Clients', [
            'auth' => ['user' => $user],
            'clients' => $clients,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'type_client' => $request->get('type_client', 'all'),
                'statut' => $request->get('statut', 'all'),
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
            'options' => [
                'type_clients' => $this->getTypeClients(),
                'statuts' => $this->getStatuts(),
            ],
        ]);
    }

    /**
     * Affiche les détails d'un client.
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $client = CrmClient::with([
            'dossiers' => function ($q) {
                $q->orderBy('created_at', 'desc')->limit(10);
            },
        ])->findOrFail($id);

        return Inertia::render('Crm/Clients/Show', [
            'auth' => ['user' => $user],
            'client' => [
                'id' => $client->id,
                'reference' => $client->reference,
                'nom' => $client->nom,
                'prenom' => $client->prenom,
                'nom_complet' => $client->nom_complet,
                'raison_sociale' => $client->raison_sociale,
                'type_client' => $client->type_client,
                'type_client_label' => $client->type_client_label,
                'email' => $client->email,
                'telephone' => $client->telephone,
                'adresse' => $client->adresse,
                'statut' => $client->statut,
                'statut_label' => $client->statut_label,
                'statut_color' => $client->statut_color,
                'total_dossiers' => $client->dossiers()->count(),
                'dossiers_en_cours' => $client->dossiers()->enCours()->count(),
                'observations' => $client->observations,
                'roles' => $client->roles,
                'created_at' => $client->created_at->format('d/m/Y'),
                'updated_at' => $client->updated_at->format('d/m/Y'),
            ],
            'dossiers' => $client->dossiers->map(function ($dossier) {
                return [
                    'id' => $dossier->id,
                    'reference' => $dossier->reference_unique,
                    'type_mission' => $dossier->type_mission_label,
                    'statut' => $dossier->statut_label,
                    'statut_color' => $dossier->statut_color,
                    'progression' => $dossier->progression,
                    'date_ouverture' => $dossier->date_ouverture_formatted,
                ];
            }),
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

        return Inertia::render('Crm/Clients/Create', [
            'auth' => ['user' => $user],
            'options' => [
                'type_clients' => $this->getTypeClients(),
                'statuts' => $this->getStatuts(),
            ],
        ]);
    }

    /**
     * Enregistre un nouveau client.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'type_client' => 'required|in:personne_physique,personne_morale',
            'nom' => 'required_if:type_client,personne_physique|nullable|string|max:100',
            'prenom' => 'nullable|string|max:100',
            'raison_sociale' => 'required_if:type_client,personne_morale|nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:crm_clients,email',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:500',
            'statut' => 'required|in:actif,inactif',
            'observations' => 'nullable|string|max:5000',
            'roles' => 'nullable|array',
            'roles.*' => 'in:client,bailleur,locataire',
        ]);

        // Nettoyer les données selon le type
        if ($validated['type_client'] === 'personne_physique') {
            $validated['raison_sociale'] = null;
        }

        if ($validated['type_client'] === 'personne_morale') {
            $validated['nom'] = null;
            $validated['prenom'] = null;
        }

        try {
            DB::beginTransaction();

            $client = CrmClient::create([
                'type_client' => $validated['type_client'],
                'nom' => $validated['nom'] ?? null,
                'prenom' => $validated['prenom'] ?? null,
                'raison_sociale' => $validated['raison_sociale'] ?? null,
                'email' => $validated['email'] ?? null,
                'telephone' => $validated['telephone'] ?? null,
                'adresse' => $validated['adresse'] ?? null,
                'statut' => $validated['statut'],
                'roles' => !empty($validated['roles']) 
                    ? $validated['roles'] 
                    : [CrmClient::ROLE_CLIENT],
                'observations' => $validated['observations'] ?? null,
            ]);

            DB::commit();

            return redirect()->route('crm.clients.show', $client->id)
                ->with('success', 'Client créé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Erreur lors de la création du client : ' . $e->getMessage())
                ->withInput();
        }
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

        $client = CrmClient::findOrFail($id);

        return Inertia::render('Crm/Clients/Edit', [
            'auth' => ['user' => $user],
            'client' => [
                'id' => $client->id,
                'type_client' => $client->type_client,
                'nom' => $client->nom,
                'prenom' => $client->prenom,
                'raison_sociale' => $client->raison_sociale,
                'email' => $client->email,
                'telephone' => $client->telephone,
                'adresse' => $client->adresse,
                'statut' => $client->statut,
                'observations' => $client->observations,
                'roles' => $client->roles,
            ],
            'options' => [
                'type_clients' => $this->getTypeClients(),
                'statuts' => $this->getStatuts(),
            ],
        ]);
    }

    /**
     * Met à jour un client.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $client = CrmClient::findOrFail($id);

        $validated = $request->validate([
            'type_client' => 'required|in:personne_physique,personne_morale',
            'nom' => 'required_if:type_client,personne_physique|nullable|string|max:100',
            'prenom' => 'nullable|string|max:100',
            'raison_sociale' => 'required_if:type_client,personne_morale|nullable|string|max:255',
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('crm_clients', 'email')->ignore($client->id),
            ],
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:500',
            'statut' => 'required|in:actif,inactif',
            'observations' => 'nullable|string|max:5000',
            'roles' => 'nullable|array',
            'roles.*' => 'in:client,bailleur,locataire',
        ]);

        // Nettoyer les données selon le type
        if ($validated['type_client'] === 'personne_physique') {
            $validated['raison_sociale'] = null;
        }

        if ($validated['type_client'] === 'personne_morale') {
            $validated['nom'] = null;
            $validated['prenom'] = null;
        }

        try {
            DB::beginTransaction();

            // Si aucun rôle n'est sélectionné, garder le rôle client par défaut
            if (empty($validated['roles'])) {
                $validated['roles'] = [CrmClient::ROLE_CLIENT];
            }

            $client->update($validated);

            DB::commit();

            return redirect()->route('crm.clients.show', $client->id)
                ->with('success', 'Client mis à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour du client : ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Supprime un client.
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        if (!$crmUser->isHuissier() && !$crmUser->isSenior()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour supprimer ce client.');
        }

        $client = CrmClient::findOrFail($id);

        // Vérifier si le client a des dossiers
        if ($client->dossiers()->count() > 0) {
            return redirect()->back()->with('error', 'Impossible de supprimer un client qui a des dossiers.');
        }

        // Vérifier si le client est impliqué dans des baux
        if (method_exists($client, 'bauxLocataire') && $client->bauxLocataire()->count() > 0) {
            return redirect()->back()->with('error', 'Impossible de supprimer un client impliqué dans des baux.');
        }

        if (method_exists($client, 'bauxBailleur') && $client->bauxBailleur()->count() > 0) {
            return redirect()->back()->with('error', 'Impossible de supprimer un client impliqué dans des baux.');
        }

        try {
            DB::beginTransaction();

            $client->delete();

            DB::commit();

            return redirect()->route('crm.clients.index')
                ->with('success', 'Client supprimé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la suppression du client : ' . $e->getMessage());
        }
    }

    /**
     * Exporte les clients.
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // À implémenter avec Laravel Excel
        return redirect()->back()->with('info', "Fonctionnalité d'export en cours de développement.");
    }

    /**
     * Importe des clients.
     */
    public function import(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        // À implémenter avec Laravel Excel
        return redirect()->back()->with('info', "Fonctionnalité d'import en cours de développement.");
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    /**
     * Calcule les statistiques pour les cartes.
     */
    private function getStats($crmUser, $canViewAll): array
    {
        if ($canViewAll) {
            $total = CrmClient::count();
            $actifs = CrmClient::where('statut', 'actif')->count();
            $inactifs = CrmClient::where('statut', 'inactif')->count();
            $personnesPhysiques = CrmClient::where('type_client', 'personne_physique')->count();
            $personnesMorales = CrmClient::where('type_client', 'personne_morale')->count();
            
            // Calcul de l'évolution réelle
            $currentMonth = now()->month;
            $previousMonth = now()->copy()->subMonth()->month;
            $currentYear = now()->year;
            $previousYear = now()->copy()->subMonth()->year;
            
            $currentMonthCount = CrmClient::whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();
            $previousMonthCount = CrmClient::whereMonth('created_at', $previousMonth)
                ->whereYear('created_at', $previousYear)
                ->count();
            
            $evolution = $previousMonthCount > 0 
                ? round(($currentMonthCount - $previousMonthCount) / $previousMonthCount * 100) 
                : ($currentMonthCount > 0 ? 100 : 0);
        } else {
            $total = 0;
            $actifs = 0;
            $inactifs = 0;
            $personnesPhysiques = 0;
            $personnesMorales = 0;
            $evolution = 0;
        }

        return [
            'total' => $total,
            'actifs' => $actifs,
            'inactifs' => $inactifs,
            'personnes_physiques' => $personnesPhysiques,
            'personnes_morales' => $personnesMorales,
            'evolution' => $evolution,
        ];
    }

    /**
     * Récupère la liste des types de clients.
     */
    private function getTypeClients(): array
    {
        return [
            ['value' => 'personne_physique', 'label' => 'Personne physique'],
            ['value' => 'personne_morale', 'label' => 'Personne morale'],
        ];
    }

    /**
     * Récupère la liste des statuts.
     */
    private function getStatuts(): array
    {
        return [
            ['value' => 'actif', 'label' => 'Actif'],
            ['value' => 'inactif', 'label' => 'Inactif'],
        ];
    }
}
