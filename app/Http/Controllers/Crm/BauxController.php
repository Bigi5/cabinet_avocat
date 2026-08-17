<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmBail;
use App\Models\CrmClient;
use App\Models\CrmDossier;
use App\Models\CrmUser;
use App\Models\CrmEcheanceLoyer;
use App\Models\CrmPaiementLoyer;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class BauxController extends Controller
{
    /**
     * Affiche la liste des baux.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user) {
            return redirect()->route('login');
        }

        $canViewAll = $crmUser->isHuissier() || $crmUser->isSenior();

        $query = CrmBail::with(['locataire', 'bailleur', 'dossier']);

        if (!$canViewAll) {
            $query->where(function ($q) use ($crmUser) {
                $q->whereHas('locataire', function ($lq) use ($crmUser) {
                    $lq->whereHas('dossiers', function ($dq) use ($crmUser) {
                        $dq->where('responsable_id', $crmUser->id);
                    });
                })->orWhereHas('bailleur', function ($bq) use ($crmUser) {
                    $bq->whereHas('dossiers', function ($dq) use ($crmUser) {
                        $dq->where('responsable_id', $crmUser->id);
                    });
                });
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('adresse_bien', 'like', "%{$search}%")
                  ->orWhereHas('locataire', function ($cq) use ($search) {
                      $cq->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('raison_sociale', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('locataire_id')) {
            $query->where('locataire_id', $request->locataire_id);
        }

        $allowedSorts = ['created_at', 'reference', 'montant_loyer', 'date_debut', 'statut'];
        $orderBy = in_array($request->get('order_by'), $allowedSorts)
            ? $request->get('order_by')
            : 'created_at';
        $orderDir = $request->get('order_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($orderBy, $orderDir);

        $perPage = min((int) $request->get('per_page', 15), 100);
        $baux = $query->paginate($perPage);

        $baux->getCollection()->transform(function ($bail) {
            return [
                'id' => $bail->id,
                'reference' => $bail->reference,
                'locataire' => $bail->locataire ? [
                    'id' => $bail->locataire->id,
                    'nom' => $bail->locataire->nom_complet,
                ] : null,
                'bailleur' => $bail->bailleur ? [
                    'id' => $bail->bailleur->id,
                    'nom' => $bail->bailleur->nom_complet,
                ] : null,
                'dossier' => $bail->dossier ? [
                    'id' => $bail->dossier->id,
                    'reference' => $bail->dossier->reference_unique,
                ] : null,
                'montant_loyer' => $bail->montant_loyer,
                'montant_loyer_formatted' => $bail->montant_loyer_formatted,
                'frequence' => $bail->frequence,
                'frequence_label' => $bail->frequence_label,
                'date_debut' => $bail->date_debut->format('d/m/Y'),
                'date_fin' => $bail->date_fin ? $bail->date_fin->format('d/m/Y') : null,
                'adresse_bien' => $bail->adresse_bien,
                'statut' => $bail->statut,
                'statut_label' => $bail->statut_label,
                'total_impaye' => $bail->montant_total_impaye,
                'total_impaye_formatted' => number_format($bail->montant_total_impaye, 0, ',', ' ') . ' FCFA',
                'created_at' => $bail->created_at->format('d/m/Y'),
                'updated_at' => $bail->updated_at->format('d/m/Y'),
            ];
        });

        $stats = [
            'total' => CrmBail::count(),
            'actifs' => CrmBail::actifs()->count(),
            'termines' => CrmBail::termines()->count(),
            'resilies' => CrmBail::where('statut', 'resilie')->count(),
            'avec_impayes' => CrmBail::avecImpayes()->count(),
            'montant_mensuel_total' => CrmBail::actifs()->sum('montant_loyer'),
        ];

        $clients = CrmClient::actifs()->get()->map(function ($client) {
            return [
                'id' => $client->id,
                'nom' => $client->nom_complet,
            ];
        });

        return Inertia::render('Crm/Baux/Index', [
            'auth' => ['user' => $user],
            'baux' => $baux,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'statut' => $request->get('statut', 'all'),
                'locataire_id' => $request->get('locataire_id', ''),
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
            'options' => [
                'clients' => $clients,
            ],
        ]);
    }

    private function canAccessBail(?CrmUser $crmUser, CrmBail $bail): bool
    {
        if (!$crmUser) {
            return false;
        }

        if ($crmUser->isHuissier() || $crmUser->isSenior() || $crmUser->isGestionnaireBaux()) {
            return true;
        }

        if ($bail->dossier_id) {
            return $crmUser->peutAccederDossier($bail->dossier_id);
        }

        $hasAccessToClient = false;
        if ($bail->locataire_id) {
            $hasAccessToClient = CrmDossier::where('client_id', $bail->locataire_id)
                ->where(function ($q) use ($crmUser) {
                    $q->where('responsable_id', $crmUser->id)
                      ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                          $cq->where('user_id', $crmUser->id);
                      });
                })->exists();
        }

        if (!$hasAccessToClient && $bail->bailleur_id) {
            $hasAccessToClient = CrmDossier::where('client_id', $bail->bailleur_id)
                ->where(function ($q) use ($crmUser) {
                    $q->where('responsable_id', $crmUser->id)
                      ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                          $cq->where('user_id', $crmUser->id);
                      });
                })->exists();
        }

        return $hasAccessToClient;
    }

    /**
     * Affiche les détails d'un bail.
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $bail = CrmBail::with(['locataire', 'bailleur', 'dossier', 'paiements' => function ($q) {
            $q->with('quittance')->orderBy('date_paiement', 'desc');
        }, 'echeances' => function ($q) {
            $q->orderBy('date_echeance');
        }])->findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à ce bail.');
        }

        return Inertia::render('Crm/Baux/Show', [
            'auth' => ['user' => $user],
            'bail' => [
                'id' => $bail->id,
                'reference' => $bail->reference,
                'locataire' => $bail->locataire ? [
                    'id' => $bail->locataire->id,
                    'nom' => $bail->locataire->nom_complet,
                    'email' => $bail->locataire->email,
                    'telephone' => $bail->locataire->telephone,
                ] : null,
                'bailleur' => $bail->bailleur ? [
                    'id' => $bail->bailleur->id,
                    'nom' => $bail->bailleur->nom_complet,
                    'email' => $bail->bailleur->email,
                    'telephone' => $bail->bailleur->telephone,
                ] : null,
                'dossier' => $bail->dossier ? [
                    'id' => $bail->dossier->id,
                    'reference' => $bail->dossier->reference_unique,
                ] : null,
                'montant_loyer' => $bail->montant_loyer,
                'montant_loyer_formatted' => $bail->montant_loyer_formatted,
                'frequence' => $bail->frequence,
                'frequence_label' => $bail->frequence_label,
                'date_debut' => $bail->date_debut->format('d/m/Y'),
                'date_fin' => $bail->date_fin ? $bail->date_fin->format('d/m/Y') : null,
                'jour_echeance' => $bail->jour_echeance,
                'caution' => $bail->caution,
                'caution_formatted' => $bail->caution ? number_format($bail->caution, 0, ',', ' ') . ' FCFA' : null,
                'description' => $bail->description,
                'adresse_bien' => $bail->adresse_bien,
                'reference_cadastrale' => $bail->reference_cadastrale,
                'statut' => $bail->statut,
                'statut_label' => $bail->statut_label,
                'duree' => $bail->duree,
                'total_impaye' => $bail->montant_total_impaye,
                'total_impaye_formatted' => number_format($bail->montant_total_impaye, 0, ',', ' ') . ' FCFA',
                'created_at' => $bail->created_at->format('d/m/Y'),
            ],
            'paiements' => $bail->paiements->map(function ($paiement) {
                return [
                    'id' => $paiement->id,
                    'montant' => $paiement->montant,
                    'montant_formatted' => $paiement->montant_formatted,
                    'date_paiement' => $paiement->date_paiement->format('d/m/Y'),
                    'mois_concerne' => $paiement->mois_concerne->format('m/Y'),
                    'mode_paiement' => $paiement->mode_paiement,
                    'mode_paiement_label' => $paiement->mode_paiement_label,
                    'statut' => $paiement->statut,
                    'statut_label' => $paiement->statut_label,
                    'statut_color' => $paiement->statut_color,
                    'reference_cheque' => $paiement->reference_cheque,
                    'cheque_encaisse' => $paiement->cheque_encaisse,
                    'observations' => $paiement->observations,
                    'quittance' => $paiement->quittance ? [
                        'id' => $paiement->quittance->id,
                        'numero' => $paiement->quittance->numero,
                    ] : null,
                ];
            }),
            'echeances' => $bail->echeances->map(function ($echeance) {
                return [
                    'id' => $echeance->id,
                    'date_echeance' => $echeance->date_echeance->format('d/m/Y'),
                    'montant' => $echeance->montant,
                    'montant_formatted' => $echeance->montant_formatted,
                    'statut' => $echeance->statut,
                    'statut_label' => $echeance->statut_label,
                    'statut_color' => $echeance->statut_color,
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
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        if (!$crmUser->isHuissier() && !$crmUser->isSenior() && !$crmUser->isGestionnaireBaux()) {
            abort(403, 'Accès non autorisé.');
        }

        $bailleurs = CrmClient::actifs()
            ->bailleurs()
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'nom' => $client->nom_complet,
                    'type' => $client->type_client_label,
                ];
            });

        $locataires = CrmClient::actifs()
            ->locataires()
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'nom' => $client->nom_complet,
                    'type' => $client->type_client_label,
                ];
            });

        return Inertia::render('Crm/Baux/Create', [
            'auth' => ['user' => $user],
            'options' => [
                'bailleurs' => $bailleurs,
                'locataires' => $locataires,
            ],
        ]);
    }

    /**
     * Enregistre un nouveau bail.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        if (!$crmUser->isHuissier() && !$crmUser->isSenior() && !$crmUser->isGestionnaireBaux()) {
            abort(403, 'Accès non autorisé.');
        }

        $validated = $request->validate([
            'reference' => 'required|string|max:50|unique:crm_baux,reference',
            'locataire_id' => 'required|exists:crm_clients,id',
            'bailleur_id' => 'required|exists:crm_clients,id',
            'dossier_id' => 'nullable|exists:crm_dossiers,id',
            'montant_loyer' => 'required|numeric|min:0',
            'frequence' => 'required|in:mensuel,trimestriel,semestriel,annuel',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'jour_echeance' => 'required|integer|between:1,31',
            'caution' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'adresse_bien' => 'nullable|string|max:500',
            'reference_cadastrale' => 'nullable|string|max:100',
            'statut' => 'required|in:actif,termine,resilie',
        ]);

        try {
            DB::beginTransaction();

            $bail = CrmBail::create($validated);
            $bail->genererEcheances();

            DB::commit();

            return redirect()->route('crm.baux.show', $bail->id)
                ->with('success', 'Bail créé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la création du bail : ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Affiche le formulaire d'édition.
     */
    public function edit(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $bail = CrmBail::findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à ce bail.');
        }

        $bailleurs = CrmClient::actifs()
            ->bailleurs()
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'nom' => $client->nom_complet,
                    'type' => $client->type_client_label,
                ];
            });

        $locataires = CrmClient::actifs()
            ->locataires()
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'nom' => $client->nom_complet,
                    'type' => $client->type_client_label,
                ];
            });

        return Inertia::render('Crm/Baux/Edit', [
            'auth' => ['user' => $user],
            'bail' => [
                'id' => $bail->id,
                'reference' => $bail->reference,
                'locataire_id' => $bail->locataire_id,
                'bailleur_id' => $bail->bailleur_id,
                'dossier_id' => $bail->dossier_id,
                'montant_loyer' => $bail->montant_loyer,
                'frequence' => $bail->frequence,
                'date_debut' => $bail->date_debut->format('Y-m-d'),
                'date_fin' => $bail->date_fin ? $bail->date_fin->format('Y-m-d') : null,
                'jour_echeance' => $bail->jour_echeance,
                'caution' => $bail->caution,
                'description' => $bail->description,
                'adresse_bien' => $bail->adresse_bien,
                'reference_cadastrale' => $bail->reference_cadastrale,
                'statut' => $bail->statut,
            ],
            'options' => [
                'bailleurs' => $bailleurs,
                'locataires' => $locataires,
            ],
        ]);
    }

    /**
     * Met à jour un bail.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $bail = CrmBail::findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à ce bail.');
        }

        $validated = $request->validate([
            'reference' => 'required|string|max:50|unique:crm_baux,reference,' . $id,
            'locataire_id' => 'required|exists:crm_clients,id',
            'bailleur_id' => 'required|exists:crm_clients,id',
            'dossier_id' => 'nullable|exists:crm_dossiers,id',
            'montant_loyer' => 'required|numeric|min:0',
            'frequence' => 'required|in:mensuel,trimestriel,semestriel,annuel',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'jour_echeance' => 'required|integer|between:1,31',
            'caution' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'adresse_bien' => 'nullable|string|max:500',
            'reference_cadastrale' => 'nullable|string|max:100',
            'statut' => 'required|in:actif,termine,resilie',
        ]);

        try {
            DB::beginTransaction();

            $bail->update($validated);
            $bail->genererEcheances();

            DB::commit();

            return redirect()->route('crm.baux.show', $bail->id)
                ->with('success', 'Bail mis à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour du bail : ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Supprime un bail.
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        if (!$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour supprimer un bail.');
        }

        $bail = CrmBail::findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à ce bail.');
        }

        if ($bail->paiements()->count() > 0) {
            return redirect()->back()->with('error', 'Impossible de supprimer un bail qui a des paiements.');
        }

        try {
            DB::beginTransaction();

            $bail->echeances()->delete();
            $bail->delete();

            DB::commit();

            return redirect()->route('crm.baux.index')
                ->with('success', 'Bail supprimé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la suppression du bail : ' . $e->getMessage());
        }
    }

    /**
     * Génère les échéances pour un bail.
     */
    public function generateEcheances(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        if (!$crmUser->isHuissier() && !$crmUser->isSenior() && !$crmUser->isGestionnaireBaux()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour cette action.');
        }

        $bail = CrmBail::findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à ce bail.');
        }

        try {
            DB::beginTransaction();

            $bail->echeances()->delete();
            $bail->genererEcheances();

            DB::commit();

            return redirect()->back()->with('success', 'Échéances générées avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la génération des échéances : ' . $e->getMessage());
        }
    }

    /**
     * Étape 1 - Résilier un bail.
     */
    public function resilier(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        if (!$crmUser->isHuissier() && !$crmUser->isSenior() && !$crmUser->isGestionnaireBaux()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour cette action.');
        }

        $bail = CrmBail::findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à ce bail.');
        }

        if ($bail->statut === 'resilie') {
            return redirect()->back()->with('error', 'Ce bail est déjà résilié.');
        }

        try {
            DB::beginTransaction();

            $bail->update([
                'statut' => 'resilie',
                'date_fin' => now(),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Bail résilié avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la résiliation du bail : ' . $e->getMessage());
        }
    }

    /**
     * Étape 2 - Envoyer un rappel de paiement.
     */
    public function reminder(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $bail = CrmBail::with(['locataire'])->findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à ce bail.');
        }

        if (!$bail->locataire || !$bail->locataire->email) {
            return redirect()->back()->with('error', 'Le locataire n\'a pas d\'adresse email.');
        }

        try {
            $echeancesImpaees = $bail->echeances()
                ->where('statut', 'impaye')
                ->where('date_echeance', '<', now())
                ->orderBy('date_echeance')
                ->get();

            if ($echeancesImpaees->isEmpty()) {
                return redirect()->back()->with('info', 'Aucun impayé à relancer.');
            }

            $montantTotalImpaye = $echeancesImpaees->sum('montant');
            $nbEcheances = $echeancesImpaees->count();

            $message = "Rappel envoyé au locataire {$bail->locataire->nom_complet} ";
            $message .= "pour {$nbEcheances} échéance(s) impayée(s) d'un montant total de " . number_format($montantTotalImpaye, 0, ',', ' ') . ' FCFA.';

            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de l\'envoi du rappel : ' . $e->getMessage());
        }
    }

    /**
     * Étape 3 - Générer un PDF du bail.
     */
    public function pdf(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $bail = CrmBail::with([
            'bailleur',
            'locataire',
            'dossier',
            'echeances'
        ])->findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à ce bail.');
        }

        $pdf = Pdf::loadView('pdf.bail', [
            'bail' => $bail,
            'logo' => public_path('images/logo.png'),
        ]);

        $pdf->setPaper('A4', 'portrait');

        return $pdf->stream(
            'Contrat-Bail-'.$bail->reference_formatted.'.pdf'
        );
    }

    public function exportEcheances(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $bail = CrmBail::findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à cet export.');
        }

        $echeances = $bail->echeances()->orderBy('date_echeance')->get();

        $filename = 'echeances-bail-' . ($bail->reference ?? $bail->id) . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($echeances) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF");
            fputcsv($file, ['Date echeance', 'Montant (FCFA)', 'Statut'], ';');

            foreach ($echeances as $e) {
                fputcsv($file, [
                    $e->date_echeance ? $e->date_echeance->format('d/m/Y') : '',
                    $e->montant,
                    $e->statut_label,
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Enregistrer un paiement de loyer.
     */
    public function storePaiement(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $bail = CrmBail::findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à ce bail.');
        }

        $validated = $request->validate([
            'montant' => 'required|numeric|min:0',
            'date_paiement' => 'required|date',
            'mois_concerne' => 'required|date_format:Y-m',
            'mode_paiement' => 'required|in:especes,cheque,virement,carte,autre',
            'reference_cheque' => 'nullable|string|max:50',
            'observations' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $paiement = $bail->paiements()->create([
                'montant' => $validated['montant'],
                'date_paiement' => $validated['date_paiement'],
                'mois_concerne' => $validated['mois_concerne'] . '-01',
                'mode_paiement' => $validated['mode_paiement'],
                'reference_cheque' => $validated['reference_cheque'],
                'observations' => $validated['observations'],
                'statut' => 'valide',
            ]);

            $moisConcerne = date('Y-m', strtotime($validated['mois_concerne'] . '-01'));
            $echeances = $bail->echeances()
                ->where('date_echeance', 'like', $moisConcerne . '%')
                ->where('statut', 'impaye')
                ->get();

            foreach ($echeances as $echeance) {
                $echeance->update(['statut' => 'paye']);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Paiement enregistré avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de l\'enregistrement du paiement : ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Renouveler un bail.
     */
    public function renouveler(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        if (!$crmUser->isHuissier() && !$crmUser->isSenior() && !$crmUser->isGestionnaireBaux()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour cette action.');
        }

        $bail = CrmBail::findOrFail($id);

        if (!$this->canAccessBail($crmUser, $bail)) {
            abort(403, 'Accès non autorisé à ce bail.');
        }

        $validated = $request->validate([
            'nouvelle_date_debut' => 'required|date|after:' . $bail->date_debut->format('Y-m-d'),
            'nouvelle_date_fin' => 'nullable|date|after:nouvelle_date_debut',
        ]);

        try {
            DB::beginTransaction();

            $dateFinAncienBail = Carbon::parse($validated['nouvelle_date_debut'])->subDay();

            $nouveauBail = $bail->replicate();
            $nouveauBail->date_debut = $validated['nouvelle_date_debut'];
            $nouveauBail->date_fin = $validated['nouvelle_date_fin'] ?? null;
            $nouveauBail->statut = 'actif';
            $nouveauBail->reference = $bail->reference . '-R' . now()->format('Ymd');
            $nouveauBail->save();

            $nouveauBail->genererEcheances();

            $bail->update([
                'statut' => 'termine',
                'date_fin' => $dateFinAncienBail,
            ]);

            DB::commit();

            return redirect()->route('crm.baux.show', $nouveauBail->id)
                ->with('success', 'Bail renouvelé avec succès. Nouveau bail créé.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors du renouvellement du bail : ' . $e->getMessage())
                ->withInput();
        }
    }
}