<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmFacture;
use App\Models\CrmClient;
use App\Models\CrmDossier;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Requests\SendFactureEmailRequest;
use App\Http\Requests\StoreFactureRequest;
use App\Http\Requests\UpdateFactureRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use App\Mail\FactureMail;
use Illuminate\Support\Facades\Storage;
use App\Models\CrmDocument;
use Illuminate\Support\Str;

class FacturesController extends Controller
{
    private const DATE_FORMAT = 'd/m/Y';

    public function index(Request $request)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user) {
            return redirect()->route('login');
        }

        $canViewAll = $crmUser->isHuissier() || $crmUser->isSenior();

        $query = CrmFacture::with(['client', 'dossier', 'user']);

        if (!$canViewAll) {
            $query->where(function ($q) use ($crmUser) {
                $q->where('user_id', $crmUser->id)
                  ->orWhereHas('dossier', function ($dq) use ($crmUser) {
                      $dq->where('responsable_id', $crmUser->id);
                  });
            });
        }

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($cq) use ($search) {
                      $cq->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('raison_sociale', 'like', "%{$search}%");
                  });
            });
        }

        // Filtre par statut
        if ($request->filled('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        // Filtre par type
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filtre par client
        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        $allowedOrderBy = ['reference', 'date_emission', 'date_echeance', 'montant_ttc', 'statut', 'type', 'created_at'];
        $orderBy = in_array($request->get('order_by'), $allowedOrderBy, true)
            ? $request->get('order_by')
            : 'created_at';
        $orderDir = $request->get('order_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($orderBy, $orderDir);

        $perPage = min((int) $request->get('per_page', 15), 100);
        $factures = $query->paginate($perPage);

        $factures->getCollection()->transform(function ($facture) {
            return [
                'id' => $facture->id,
                'reference' => $facture->reference,
                'client' => $facture->client ? [
                    'id' => $facture->client->id,
                    'nom' => $facture->client->nom_complet,
                ] : null,
                'dossier' => $facture->dossier ? [
                    'id' => $facture->dossier->id,
                    'reference' => $facture->dossier->reference_unique,
                ] : null,
                'date_emission' => $facture->date_emission->format(self::DATE_FORMAT),
                'date_echeance' => $facture->date_echeance->format(self::DATE_FORMAT),
                'montant_ht' => $facture->montant_ht,
                'montant_ht_formatted' => $facture->montant_ht_formatted,
                'montant_ttc' => $facture->montant_ttc,
                'montant_ttc_formatted' => $facture->montant_ttc_formatted,
                'statut' => $facture->statut,
                'statut_label' => $facture->statut_label,
                'statut_color' => $facture->statut_color,
                'type' => $facture->type,
                'solde' => $facture->solde,
                'est_payee' => $facture->est_payee,
                'created_at' => $facture->created_at->format(self::DATE_FORMAT),
            ];
        });

        $stats = [
            'total' => CrmFacture::count(),
            'brouillons' => CrmFacture::where('statut', 'brouillon')->count(),
            'envoyees' => CrmFacture::where('statut', 'envoyee')->count(),
            'payees' => CrmFacture::where('statut', 'payee')->count(),
            'impayees' => CrmFacture::where('statut', 'impayee')->count(),
            'montant_total' => CrmFacture::sum('montant_ttc'),
            'montant_impaye' => CrmFacture::where('statut', 'impayee')->sum('montant_ttc'),
        ];

        $clients = CrmClient::actifs()->get()->map(fn($c) => [
            'id' => $c->id,
            'nom' => $c->nom_complet,
        ]);

        return Inertia::render('Crm/Factures/Index', [
            'auth' => ['user' => $user],
            'factures' => $factures,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'statut' => $request->get('statut', 'all'),
                'type' => $request->get('type', 'all'),
                'client_id' => $request->get('client_id', ''),
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
            'options' => [
                'clients' => $clients,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $this->authorize('create', CrmFacture::class);

        $crmUser = $request->get('crm_user');

        if (!$crmUser) {
            return redirect()->route('dashboard')->with('error', 'Utilisateur CRM non trouvé');
        }

        // ✅ Récupérer les dossiers accessibles avec leurs clients
        $dossiers = CrmDossier::with('client')
            ->where(function ($q) use ($crmUser) {
                if (!$crmUser->isHuissier() && !$crmUser->isSenior()) {
                    $q->where('responsable_id', $crmUser->id)
                      ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                          $cq->where('user_id', $crmUser->id);
                      });
                }
            })
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->map(function ($dossier) {
                return [
                    'id' => (string) $dossier->id,
                    'reference' => $dossier->reference_unique,
                    'client' => $dossier->client ? $dossier->client->nom_complet : 'Client inconnu',
                    'client_id' => $dossier->client_id ? (string) $dossier->client_id : null,
                ];
            })
            ->toArray();

        // Types de facture
        $types = [
            ['value' => 'honoraire', 'label' => 'Honoraire'],
            ['value' => 'frais', 'label' => 'Frais'],
            ['value' => 'avance', 'label' => 'Avance'],
            ['value' => 'autre', 'label' => 'Autre'],
        ];

        return Inertia::render('Crm/Factures/Create', [
            'auth' => ['user' => $user],
            'options' => [
                'dossiers' => $dossiers,
                'types' => $types,
            ],
        ]);
    }

    public function store(StoreFactureRequest $request)
    {
        $this->authorize('create', CrmFacture::class);

        $crmUser = $request->get('crm_user');

        $validated = $request->validated();

        $montantHt = 0;
        $montantTtc = 0;
        $lignesData = [];

        foreach ($validated['lignes'] as $ligne) {
            $tva = $ligne['tva'] ?? 0;
            $montantLigneHt = $ligne['quantite'] * $ligne['prix_unitaire'];
            $montantLigneTtc = $montantLigneHt * (1 + $tva / 100);
            
            $montantHt += $montantLigneHt;
            $montantTtc += $montantLigneTtc;
            
            $lignesData[] = [
                'description' => $ligne['description'],
                'quantite' => $ligne['quantite'],
                'prix_unitaire' => $ligne['prix_unitaire'],
                'montant_ht' => $montantLigneHt,
                'tva' => $tva,
                'montant_ttc' => $montantLigneTtc,
            ];
        }

        $reference = $this->generateReference();

        $facture = CrmFacture::create([
            'reference' => $reference,
            'dossier_id' => $validated['dossier_id'],
            'client_id' => $validated['client_id'],
            'date_emission' => $validated['date_emission'],
            'date_echeance' => $validated['date_echeance'],
            'montant_ht' => $montantHt,
            'tva' => $montantTtc - $montantHt,
            'montant_ttc' => $montantTtc,
            'statut' => 'brouillon',
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'user_id' => $crmUser->id,
        ]);

        foreach ($lignesData as $ligne) {
            $facture->lignes()->create($ligne);
        }

        return redirect()->route('crm.factures.show', $facture->id)
            ->with('success', 'Facture créée avec succès.');
    }

    public function show($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $facture = CrmFacture::with(['client', 'dossier', 'lignes', 'paiements', 'user'])
            ->findOrFail($id);

        $this->authorize('view', $facture);

        // ✅ Récupérer le montant HT pour le résumé
        $montantHt = $facture->montant_ht;

        return Inertia::render('Crm/Factures/Show', [
            'auth' => ['user' => $user],
            'facture' => [
                'id' => $facture->id,
                'reference' => $facture->reference,
                'client' => $facture->client ? [
                    'id' => $facture->client->id,
                    'nom' => $facture->client->nom_complet,
                    'email' => $facture->client->email,
                    'telephone' => $facture->client->telephone,
                ] : null,
                'dossier' => $facture->dossier ? [
                    'id' => $facture->dossier->id,
                    'reference' => $facture->dossier->reference_unique,
                ] : null,
                'date_emission' => $facture->date_emission->format(self::DATE_FORMAT),
                'date_echeance' => $facture->date_echeance->format(self::DATE_FORMAT),
                'montant_ht' => $montantHt,
                'montant_ht_formatted' => $facture->montant_ht_formatted,
                'montant_ttc' => $facture->montant_ttc,
                'montant_ttc_formatted' => $facture->montant_ttc_formatted,
                'statut' => $facture->statut,
                'statut_label' => $facture->statut_label,
                'statut_color' => $facture->statut_color,
                'type' => $facture->type,
                'description' => $facture->description,
                'notes' => $facture->notes,
                'solde' => $facture->solde,
                'solde_formatted' => number_format($facture->solde, 0, ',', ' ') . ' FCFA',
                'est_payee' => $facture->est_payee,
                'user' => $facture->user ? $facture->user->nom_complet : null,
                'created_at' => $facture->created_at->format(self::DATE_FORMAT),
            ],
            'lignes' => $facture->lignes->map(fn($l) => [
                'id' => $l->id,
                'description' => $l->description,
                'quantite' => $l->quantite,
                'prix_unitaire' => $l->prix_unitaire,
                'montant_ht' => $l->montant_ht,
                'montant_ht_formatted' => $l->montant_ht_formatted,
                'tva' => $l->tva,
                'montant_ttc' => $l->montant_ttc,
                'montant_ttc_formatted' => $l->montant_ttc_formatted,
            ]),
            'paiements' => $facture->paiements->map(fn($p) => [
                'id' => $p->id,
                'montant' => $p->montant,
                'montant_formatted' => $p->montant_formatted,
                'date_paiement' => $p->date_paiement->format(self::DATE_FORMAT),
                'mode' => $p->mode,
                'mode_label' => $p->mode_label,
                'reference_cheque' => $p->reference_cheque,
                'observations' => $p->observations,
            ]),
        ]);
    }

    public function edit($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $facture = CrmFacture::with('lignes')->findOrFail($id);

        $this->authorize('update', $facture);
        
        if ($facture->statut !== 'brouillon') {
            return redirect()->back()->with('error', 'Seules les factures en brouillon peuvent être modifiées.');
        }

        $dossiers = CrmDossier::with('client')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->map(fn($d) => [
                'id' => (string) $d->id,
                'reference' => $d->reference_unique,
                'client' => $d->client ? $d->client->nom_complet : 'Client inconnu',
                'client_id' => $d->client_id ? (string) $d->client_id : null,
            ])
            ->toArray();

        $types = [
            ['value' => 'honoraire', 'label' => 'Honoraire'],
            ['value' => 'frais', 'label' => 'Frais'],
            ['value' => 'avance', 'label' => 'Avance'],
            ['value' => 'autre', 'label' => 'Autre'],
        ];

        return Inertia::render('Crm/Factures/Edit', [
            'auth' => ['user' => $user],
            'facture' => [
                'id' => $facture->id,
                'dossier_id' => $facture->dossier_id,
                'client_id' => $facture->client_id,
                'date_emission' => $facture->date_emission->format('Y-m-d'),
                'date_echeance' => $facture->date_echeance->format('Y-m-d'),
                'type' => $facture->type,
                'description' => $facture->description,
                'notes' => $facture->notes,
                'lignes' => $facture->lignes->map(fn($l) => [
                    'id' => $l->id,
                    'description' => $l->description,
                    'quantite' => $l->quantite,
                    'prix_unitaire' => $l->prix_unitaire,
                    'tva' => $l->tva,
                ]),
            ],
            'options' => [
                'dossiers' => $dossiers,
                'types' => $types,
            ],
        ]);
    }

    public function update(UpdateFactureRequest $request, $id)
    {
        $facture = CrmFacture::findOrFail($id);

        $this->authorize('update', $facture);
        
        if ($facture->statut !== 'brouillon') {
            return redirect()->back()->with('error', 'Seules les factures en brouillon peuvent être modifiées.');
        }

        $validated = $request->validated();

        $montantHt = 0;
        $montantTtc = 0;
        $lignesToKeep = [];

        foreach ($validated['lignes'] as $ligne) {
            $tva = $ligne['tva'] ?? 0;
            $montantLigneHt = $ligne['quantite'] * $ligne['prix_unitaire'];
            $montantLigneTtc = $montantLigneHt * (1 + $tva / 100);
            
            $montantHt += $montantLigneHt;
            $montantTtc += $montantLigneTtc;
            
            $lignesToKeep[] = $ligne['id'] ?? null;
        }

        $facture->update([
            'dossier_id' => $validated['dossier_id'],
            'client_id' => $validated['client_id'],
            'date_emission' => $validated['date_emission'],
            'date_echeance' => $validated['date_echeance'],
            'montant_ht' => $montantHt,
            'tva' => $montantTtc - $montantHt,
            'montant_ttc' => $montantTtc,
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        $facture->lignes()->whereNotIn('id', array_filter($lignesToKeep))->delete();

        foreach ($validated['lignes'] as $ligne) {
            $tva = $ligne['tva'] ?? 0;
            $montantLigneHt = $ligne['quantite'] * $ligne['prix_unitaire'];
            $montantLigneTtc = $montantLigneHt * (1 + $tva / 100);
            
            $data = [
                'description' => $ligne['description'],
                'quantite' => $ligne['quantite'],
                'prix_unitaire' => $ligne['prix_unitaire'],
                'montant_ht' => $montantLigneHt,
                'tva' => $tva,
                'montant_ttc' => $montantLigneTtc,
            ];
            
            if (isset($ligne['id']) && $ligne['id']) {
                $facture->lignes()->where('id', $ligne['id'])->update($data);
            } else {
                $facture->lignes()->create($data);
            }
        }

        return redirect()->route('crm.factures.show', $facture->id)
            ->with('success', 'Facture mise à jour avec succès.');
    }

    public function destroy($id)
    {
        $facture = CrmFacture::findOrFail($id);

        $this->authorize('delete', $facture);
        
        if ($facture->statut !== 'brouillon') {
            return redirect()->back()->with('error', 'Seules les factures en brouillon peuvent être supprimées.');
        }
        
        if ($facture->paiements()->count() > 0) {
            return redirect()->back()->with('error', 'Impossible de supprimer une facture qui a des paiements.');
        }
        
        $facture->delete();
        
        return redirect()->route('crm.factures.index')
            ->with('success', 'Facture supprimée avec succès.');
    }

    public function validateFacture($id)
    {
        $facture = CrmFacture::findOrFail($id);

        $this->authorize('update', $facture);
        
        if ($facture->statut !== 'brouillon') {
            return redirect()->back()->with('error', 'Cette facture ne peut pas être validée.');
        }
        
        $facture->update(['statut' => 'envoyee']);
        
        return redirect()->back()->with('success', 'Facture validée et envoyée.');
    }

    public function markAsPaid($id)
    {
        $facture = CrmFacture::findOrFail($id);

        $this->authorize('markAsPaid', $facture);
        
        if ($facture->statut === 'payee') {
            return redirect()->back()->with('error', 'Cette facture est déjà payée.');
        }
        
        $facture->update(['statut' => 'payee']);
        
        return redirect()->back()->with('success', 'Facture marquée comme payée.');
    }

    public function pdf($id)
    {
        $facture = CrmFacture::with(['client', 'dossier', 'lignes', 'paiements', 'user'])->findOrFail($id);

        $this->authorize('view', $facture);

        if (!class_exists('Barryvdh\\DomPDF\\Facade\\Pdf')) {
            return redirect()->back()->with('error', 'Le package de génération PDF (barryvdh/laravel-dompdf) n\'est pas installé.');
        }

        $pdf = Pdf::loadView('pdf.facture', [
            'facture' => $facture,
            'lignes' => $facture->lignes,
        ]);

        $filename = 'facture-' . ($facture->reference ?? $facture->id) . '.pdf';

        return $pdf->download($filename);
    }

    public function sendEmail(SendFactureEmailRequest $request, $id)
    {
        $facture = CrmFacture::with(['client', 'dossier', 'lignes', 'paiements', 'user'])->findOrFail($id);

        $this->authorize('sendEmail', $facture);

        $email = $facture->client->email ?? $request->input('email');
        if (!$email) {
            return redirect()->back()->with('error', 'Aucun email destinataire trouvé pour cette facture.');
        }

        $filename = 'facture-' . ($facture->reference ?? $facture->id) . '.pdf';

        if (!class_exists('Barryvdh\\DomPDF\\Facade\\Pdf')) {
            return redirect()->back()->with('error', 'Le package de génération PDF (barryvdh/laravel-dompdf) n\'est pas installé. La facture n\'a pas été envoyée.');
        }

        $pdf = Pdf::loadView('pdf.facture', [
            'facture' => $facture,
            'lignes' => $facture->lignes,
        ]);

        $pdfData = $pdf->output();

        $path = 'factures/' . $facture->id . '/' . $filename;
        Storage::disk('local')->put($path, $pdfData);

        $version = CrmDocument::where('dossier_id', $facture->dossier_id)
            ->where('nom_fichier', $filename)
            ->max('version') ?? 0;

        CrmDocument::create([
            'dossier_id' => $facture->dossier_id,
            'user_id' => $facture->user_id,
            'type_document' => CrmDocument::TYPE_PRODUIT,
            'nom_fichier' => $filename,
            'chemin' => 'public/' . $path,
            'extension' => pathinfo($filename, PATHINFO_EXTENSION),
            'taille' => strlen($pdfData),
            'version' => $version + 1,
        ]);

        Mail::to($email)->queue(new FactureMail($facture, $pdfData));

        return redirect()->back()->with('success', 'Facture envoyée par email.');
    }

    private function generateReference(): string
{
    $count = CrmFacture::whereDate('created_at', now()->toDateString())->count() + 1;

    return 'FAC-' . now()->format('Ymd') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
}
}
