<?php

namespace App\Http\Controllers\Crm\Auth;

use App\Http\Controllers\Controller;
use App\Models\CrmUser;
use App\Models\CrmDossier;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class UtilisateursController extends Controller
{
    /**
     * Affiche la liste des utilisateurs.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Récupérer l'utilisateur CRM depuis le middleware
        $crmUser = $request->get('crm_user');

        // Seuls les huissiers et seniors peuvent voir tous les utilisateurs
        if (!$crmUser->isHuissier() && !$crmUser->isSenior()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à cette page.');
        }
        
        // Construction de la requête de base
        $query = CrmUser::query();

        // Recherche
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        // Filtre par rôle
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Filtre par statut
        if ($request->has('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        // Tri
        $orderBy = $request->get('order_by', 'created_at');
        $orderDir = $request->get('order_dir', 'desc');
        $query->orderBy($orderBy, $orderDir);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $utilisateurs = $query->paginate($perPage);

        // Transformer les données pour l'affichage
        $utilisateurs->getCollection()->transform(function ($utilisateur) {
            return [
                'id' => $utilisateur->id,
                'reference' => 'USR-' . str_pad($utilisateur->id, 3, '0', STR_PAD_LEFT),
                'email' => $utilisateur->email,
                'nom' => $utilisateur->nom,
                'prenom' => $utilisateur->prenom,
                'nom_complet' => $utilisateur->nom_complet,
                'initiales' => $utilisateur->initiales,
                'role' => $utilisateur->role,
                'role_label' => $utilisateur->role_label,
                'role_color' => $utilisateur->role_color,
                'statut' => $utilisateur->statut,
                'statut_label' => $utilisateur->statut_label,
                'statut_color' => $utilisateur->statut_color,
                'telephone' => $utilisateur->telephone,
                'total_dossiers' => $utilisateur->total_dossiers,
                'dossiers_en_cours' => $utilisateur->dossiers_en_cours,
                'echeances_urgentes' => $utilisateur->echeances_urgentes,
                'actes_ce_mois' => $utilisateur->actes_ce_mois,
                'documents_ce_mois' => $utilisateur->documents_ce_mois,
                'created_at' => $utilisateur->created_at->format('d/m/Y'),
                'updated_at' => $utilisateur->updated_at->format('d/m/Y'),
            ];
        });

        // Statistiques pour les cartes
        $stats = $this->getStats();

        // Options pour les filtres
        $roles = $this->getRoles();
        $statuts = $this->getStatuts();

        return Inertia::render('Crm/Utilisateurs', [
            'auth' => [
                'user' => $user
            ],
            'utilisateurs' => $utilisateurs,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'role' => $request->get('role', 'all'),
                'statut' => $request->get('statut', 'all'),
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
            'options' => [
                'roles' => $roles,
                'statuts' => $statuts,
            ],
        ]);
    }

    /**
     * Affiche les détails d'un utilisateur.
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        // Seuls les huissiers et seniors peuvent voir les détails
        if (!$crmUser->isHuissier() && !$crmUser->isSenior() && $crmUser->id != $id) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à cet utilisateur.');
        }

        $utilisateur = CrmUser::with([
            'dossiers' => function ($q) {
                $q->orderBy('created_at', 'desc')->limit(10);
            },
            'dossiersCollaboration' => function ($q) {
                $q->orderBy('created_at', 'desc')->limit(10);
            },
            'actes' => function ($q) {
                $q->orderBy('horodatage', 'desc')->limit(10);
            },
            'documents' => function ($q) {
                $q->orderBy('created_at', 'desc')->limit(10);
            },
            'echeances' => function ($q) {
                $q->orderBy('date_echeance')->limit(10);
            },
        ])->findOrFail($id);

        return Inertia::render('Crm/Utilisateurs/Show', [
            'auth' => [
                'user' => $user
            ],
            'utilisateur' => [
                'id' => $utilisateur->id,
                'reference' => 'USR-' . str_pad($utilisateur->id, 3, '0', STR_PAD_LEFT),
                'email' => $utilisateur->email,
                'nom' => $utilisateur->nom,
                'prenom' => $utilisateur->prenom,
                'nom_complet' => $utilisateur->nom_complet,
                'initiales' => $utilisateur->initiales,
                'role' => $utilisateur->role,
                'role_label' => $utilisateur->role_label,
                'role_color' => $utilisateur->role_color,
                'statut' => $utilisateur->statut,
                'statut_label' => $utilisateur->statut_label,
                'statut_color' => $utilisateur->statut_color,
                'telephone' => $utilisateur->telephone,
                'total_dossiers' => $utilisateur->total_dossiers,
                'dossiers_en_cours' => $utilisateur->dossiers_en_cours,
                'dossiers_collaboration' => $utilisateur->dossiersCollaboration()->count(),
                'total_actes' => $utilisateur->actes()->count(),
                'total_documents' => $utilisateur->documents()->count(),
                'total_echeances' => $utilisateur->echeances()->count(),
                'echeances_urgentes' => $utilisateur->echeances_urgentes,
                'actes_ce_mois' => $utilisateur->actes_ce_mois,
                'documents_ce_mois' => $utilisateur->documents_ce_mois,
                'created_at' => $utilisateur->created_at->format('d/m/Y'),
                'updated_at' => $utilisateur->updated_at->format('d/m/Y'),
            ],
            'dossiers_responsable' => $utilisateur->dossiers->map(function ($dossier) {
                return [
                    'id' => $dossier->id,
                    'reference' => $dossier->reference_unique,
                    'type_mission' => $dossier->type_mission_label,
                    'client' => $dossier->client_nom,
                    'statut' => $dossier->statut_label,
                    'statut_color' => $dossier->statut_color,
                    'progression' => $dossier->progression,
                    'date_ouverture' => $dossier->date_ouverture_formatted,
                ];
            }),
            'dossiers_collaboration' => $utilisateur->dossiersCollaboration->map(function ($dossier) {
                return [
                    'id' => $dossier->id,
                    'reference' => $dossier->reference_unique,
                    'type_mission' => $dossier->type_mission_label,
                    'client' => $dossier->client_nom,
                    'role' => $dossier->pivot->role_assignation,
                    'role_label' => $this->getRolePivotLabel($dossier->pivot->role_assignation),
                    'statut' => $dossier->statut_label,
                    'date_ouverture' => $dossier->date_ouverture_formatted,
                ];
            }),
            'actes_recents' => $utilisateur->actes->map(function ($acte) {
                return [
                    'id' => $acte->id,
                    'type_acte' => $acte->type_acte_label,
                    'description' => $acte->description,
                    'dossier' => $acte->dossier ? $acte->dossier->reference_unique : null,
                    'horodatage' => $acte->horodatage->format('d/m/Y H:i'),
                ];
            }),
            'documents_recents' => $utilisateur->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'nom_fichier' => $doc->nom_fichier,
                    'type_document' => $doc->type_document_label,
                    'dossier' => $doc->dossier ? $doc->dossier->reference_unique : null,
                    'taille' => $doc->taille_formatted,
                    'date' => $doc->date_formatted,
                ];
            }),
            'echeances' => $utilisateur->echeances->map(function ($echeance) {
                return [
                    'id' => $echeance->id,
                    'titre' => $echeance->titre,
                    'date' => $echeance->date_formatted,
                    'criticite' => $echeance->criticite_label,
                    'criticite_color' => $echeance->criticite_color,
                    'statut' => $echeance->statut_label,
                    'statut_color' => $echeance->statut_color,
                    'est_urgent' => $echeance->est_urgent,
                    'est_en_retard' => $echeance->est_en_retard,
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

        $crmUser = $request->get('crm_user');

        // Seuls les huissiers peuvent créer des utilisateurs
        if (!$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour créer un utilisateur.');
        }

        return Inertia::render('Crm/Utilisateurs/Create', [
            'auth' => [
                'user' => $user
            ],
            'options' => [
                'roles' => $this->getRoles(),
                'statuts' => $this->getStatuts(),
            ],
        ]);
    }

    /**
     * Enregistre un nouvel utilisateur.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        // Seuls les huissiers peuvent créer des utilisateurs
        if (!$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour créer un utilisateur.');
        }

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email|unique:crm_users,email',
            'password' => 'required|string|min:8|confirmed',
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'role' => 'required|in:huissier,senior,secretaire,assistante,gestionnaire_baux,client',
            'statut' => 'required|in:actif,inactif',
            'telephone' => 'nullable|string|max:20',
        ]);

        try {
            DB::beginTransaction();

            $hashedPassword = Hash::make($validated['password']);
            $userType = match ($validated['role']) {
                'huissier', 'senior' => \App\Enums\UserType::AVOCAT->value,
                'client' => \App\Enums\UserType::CLIENT->value,
                default => \App\Enums\UserType::COLLABORATEUR->value,
            };

            $laravelUser = \App\Models\User::create([
                'name' => trim($validated['prenom'] . ' ' . $validated['nom']),
                'email' => $validated['email'],
                'password' => $hashedPassword,
                'type' => $userType,
                'telephone' => $validated['telephone'] ?? null,
                'est_actif' => ($validated['statut'] === 'actif'),
            ]);

            $nouvelUtilisateur = CrmUser::create([
                'user_id' => $laravelUser->id,
                'email' => $validated['email'],
                'password_hash' => $hashedPassword,
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'role' => $validated['role'],
                'statut' => $validated['statut'],
                'telephone' => $validated['telephone'] ?? null,
            ]);

            DB::commit();

            return redirect()->route('crm.utilisateurs.show', $nouvelUtilisateur->id)
                ->with('success', 'Utilisateur créé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la création de l\'utilisateur : ' . $e->getMessage())
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

        $crmUser = $request->get('crm_user');

        // Seuls les huissiers peuvent modifier des utilisateurs
        if (!$crmUser->isHuissier() && $crmUser->id != $id) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier cet utilisateur.');
        }

        $utilisateur = CrmUser::findOrFail($id);

        return Inertia::render('Crm/Utilisateurs/Edit', [
            'auth' => [
                'user' => $user
            ],
            'utilisateur' => [
                'id' => $utilisateur->id,
                'email' => $utilisateur->email,
                'nom' => $utilisateur->nom,
                'prenom' => $utilisateur->prenom,
                'role' => $utilisateur->role,
                'statut' => $utilisateur->statut,
                'telephone' => $utilisateur->telephone,
            ],
            'options' => [
                'roles' => $this->getRoles(),
                'statuts' => $this->getStatuts(),
            ],
        ]);
    }

    /**
     * Met à jour un utilisateur.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        // Seuls les huissiers peuvent modifier des utilisateurs
        if (!$crmUser->isHuissier() && $crmUser->id != $id) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier cet utilisateur.');
        }

        $utilisateur = CrmUser::findOrFail($id);

        $rules = [
            'email' => 'required|email|unique:crm_users,email,' . $id,
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'nullable|string|max:20',
        ];

        if ($utilisateur->user_id) {
            $rules['email'] .= '|unique:users,email,' . $utilisateur->user_id;
        }

        // Seuls les huissiers peuvent changer le rôle et le statut
        if ($crmUser->isHuissier()) {
            $rules['role'] = 'required|in:huissier,senior,secretaire,assistante,gestionnaire_baux,client';
            $rules['statut'] = 'required|in:actif,inactif';
        }

        // Si mot de passe fourni
        if ($request->filled('password')) {
            $rules['password'] = 'required|string|min:8|confirmed';
        }

        $validated = $request->validate($rules);

        try {
            DB::beginTransaction();

            $data = [
                'email' => $validated['email'],
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'telephone' => $validated['telephone'] ?? null,
            ];

            $userData = [
                'name' => trim($validated['prenom'] . ' ' . $validated['nom']),
                'email' => $validated['email'],
                'telephone' => $validated['telephone'] ?? null,
            ];

            if ($crmUser->isHuissier()) {
                $data['role'] = $validated['role'];
                $data['statut'] = $validated['statut'];
                $userData['est_actif'] = ($validated['statut'] === 'actif');
                $userData['type'] = match ($validated['role']) {
                    'huissier', 'senior' => \App\Enums\UserType::AVOCAT->value,
                    'client' => \App\Enums\UserType::CLIENT->value,
                    default => \App\Enums\UserType::COLLABORATEUR->value,
                };
            }

            if ($request->filled('password')) {
                $hashed = Hash::make($validated['password']);
                $data['password_hash'] = $hashed;
                $userData['password'] = $hashed;
            }

            $utilisateur->update($data);

            if ($utilisateur->user) {
                $utilisateur->user->update($userData);
            } else {
                $linkedUser = \App\Models\User::where('email', $utilisateur->email)->first();
                if ($linkedUser) {
                    $linkedUser->update($userData);
                    $utilisateur->update(['user_id' => $linkedUser->id]);
                }
            }

            DB::commit();

            return redirect()->route('crm.utilisateurs.show', $utilisateur->id)
                ->with('success', 'Utilisateur mis à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour : ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Supprime un utilisateur.
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        // Seuls les huissiers peuvent supprimer des utilisateurs
        if (!$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour supprimer un utilisateur.');
        }

        // Empêcher de se supprimer soi-même
        if ($crmUser->id == $id) {
            return redirect()->back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        $utilisateur = CrmUser::findOrFail($id);

        // Vérifier si l'utilisateur a des dossiers en tant que responsable
        if ($utilisateur->dossiers()->count() > 0) {
            return redirect()->back()->with('error', 'Impossible de supprimer un utilisateur qui a des dossiers en tant que responsable.');
        }

        try {
            DB::beginTransaction();

            $linkedUser = $utilisateur->user;
            $utilisateur->delete();
            if ($linkedUser) {
                $linkedUser->delete();
            }

            DB::commit();

            return redirect()->route('crm.utilisateurs.index')
                ->with('success', 'Utilisateur supprimé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de la suppression : ' . $e->getMessage());
        }
    }

    /**
     * Active un utilisateur.
     */
    public function activate(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        if (!$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour activer un utilisateur.');
        }

        $utilisateur = CrmUser::findOrFail($id);

        DB::beginTransaction();
        try {
            $utilisateur->update(['statut' => 'actif']);
            if ($utilisateur->user) {
                $utilisateur->user->update(['est_actif' => true]);
            }
            DB::commit();
            return redirect()->back()->with('success', 'Utilisateur activé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de l\'activation : ' . $e->getMessage());
        }
    }

    /**
     * Désactive un utilisateur.
     */
    public function deactivate(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        if (!$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour désactiver un utilisateur.');
        }

        // Empêcher de se désactiver soi-même
        if ($crmUser->id == $id) {
            return redirect()->back()->with('error', 'Vous ne pouvez pas désactiver votre propre compte.');
        }

        $utilisateur = CrmUser::findOrFail($id);

        DB::beginTransaction();
        try {
            $utilisateur->update(['statut' => 'inactif']);
            if ($utilisateur->user) {
                $utilisateur->user->update(['est_actif' => false]);
            }
            DB::commit();
            return redirect()->back()->with('success', 'Utilisateur désactivé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de la désactivation : ' . $e->getMessage());
        }
    }

    /**
     * Réinitialise le mot de passe.
     */
    public function resetPassword(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        if (!$crmUser->isHuissier() && $crmUser->id != $id) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour réinitialiser ce mot de passe.');
        }

        $utilisateur = CrmUser::findOrFail($id);
        
        // Générer un mot de passe temporaire
        $tempPassword = $this->generateTemporaryPassword();
        $hashed = Hash::make($tempPassword);

        DB::beginTransaction();
        try {
            $utilisateur->update([
                'password_hash' => $hashed
            ]);

            if ($utilisateur->user) {
                $utilisateur->user->update(['password' => $hashed]);
            } else {
                $linkedUser = \App\Models\User::where('email', $utilisateur->email)->first();
                if ($linkedUser) {
                    $linkedUser->update(['password' => $hashed]);
                    $utilisateur->update(['user_id' => $linkedUser->id]);
                }
            }

            DB::commit();

            return redirect()->back()->with('success', "Mot de passe réinitialisé. Nouveau mot de passe temporaire : {$tempPassword}");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de la réinitialisation : ' . $e->getMessage());
        }
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    /**
     * Calcule les statistiques pour les cartes.
     */
    private function getStats(): array
    {
        $total = CrmUser::count();
        $actifs = CrmUser::actifs()->count();
        $huissiers = CrmUser::huissiers()->count();
        $seniors = CrmUser::seniors()->count();
        $juniors = CrmUser::juniors()->count();
        $assistants = CrmUser::assistants()->count();
        
        // Utilisateurs en ligne (à implémenter avec un système de session)
        $enLigne = 0;

        return [
            'total' => $total,
            'actifs' => $actifs,
            'huissiers' => $huissiers,
            'seniors' => $seniors,
            'juniors' => $juniors,
            'assistants' => $assistants,
            'en_ligne' => $enLigne,
            'evolution' => 5,
        ];
    }

    /**
     * Récupère la liste des rôles.
     */
    private function getRoles(): array
    {
        return [
            ['value' => 'huissier', 'label' => 'Huissier'],
            ['value' => 'senior', 'label' => 'Senior'],
            ['value' => 'secretaire', 'label' => 'Secrétaire'],
            ['value' => 'assistante', 'label' => 'Assistante'],
            ['value' => 'gestionnaire_baux', 'label' => 'Gestionnaire de baux'],
            ['value' => 'client', 'label' => 'Client'],
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

    /**
     * Récupère le libellé du rôle dans la table pivot.
     */
    private function getRolePivotLabel($role): string
    {
        return [
            'principal' => 'Principal',
            'secondaire' => 'Secondaire',
            'consultant' => 'Consultant',
        ][$role] ?? $role;
    }

    /**
     * Génère un mot de passe temporaire.
     */
    private function generateTemporaryPassword(): string
    {
        $length = 10;
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        return substr(str_shuffle($chars), 0, $length);
    }
}