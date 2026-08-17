<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmTransmission;
use App\Models\CrmDecharge;
use App\Models\CrmDossier;
use App\Models\CrmDocument;
use App\Models\CrmUser;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Requests\StoreTransmissionRequest;
use App\Http\Requests\UpdateTransmissionRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class TransmissionsController extends Controller
{
    private const DATE_FORMAT = 'd/m/Y';

    /**
     * Affiche la liste des transmissions.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user) {
            return redirect()->route('login');
        }

        $canViewAll = $crmUser->isHuissier() || $crmUser->isSenior();

        $query = CrmTransmission::with(['emetteur', 'dossier', 'document', 'decharge']);

        if (!$canViewAll) {
            $query->where(function ($q) use ($crmUser) {
                $q->where('emetteur_id', $crmUser->id)
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
                    ->orWhere('objet', 'like', "%{$search}%")
                    ->orWhere('destinataire_nom', 'like', "%{$search}%");
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

        // Filtre par dossier
        if ($request->filled('dossier_id')) {
            $query->where('dossier_id', $request->dossier_id);
        }

        // Tri sécurisé
        $allowedSorts = ['date_transmission', 'reference', 'objet', 'statut', 'type', 'created_at'];
        $orderBy = in_array($request->get('order_by'), $allowedSorts)
            ? $request->get('order_by')
            : 'date_transmission';
        $orderDir = $request->get('order_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($orderBy, $orderDir);

        // Pagination limitée
        $perPage = min((int) $request->get('per_page', 15), 100);
        $transmissions = $query->paginate($perPage);

        $transmissions->getCollection()->transform(function ($t) {
            return [
                'id' => $t->id,
                'reference' => $t->reference,
                'objet' => $t->objet,
                'type' => $t->type,
                'type_label' => $t->type_label,
                'destinataire_nom' => $t->destinataire_nom,
                'emetteur' => $t->emetteur ? $t->emetteur->nom_complet : null,
                'dossier' => $t->dossier ? [
                    'id' => $t->dossier->id,
                    'reference' => $t->dossier->reference_unique,
                ] : null,
                'date_transmission' => $t->date_transmission->format(self::DATE_FORMAT),
                'statut' => $t->statut,
                'statut_label' => $t->statut_label,
                'statut_color' => $t->statut_color,
                'a_decharge' => $t->decharge ? true : false,
                'decharge_signe' => $t->decharge && $t->decharge->statut === 'signe',
                'created_at' => $t->created_at->format(self::DATE_FORMAT),
            ];
        });

        // Statistiques filtrées par permissions
        if ($canViewAll) {
            $stats = [
                'total' => CrmTransmission::count(),
                'brouillons' => CrmTransmission::where('statut', 'brouillon')->count(),
                'en_attente' => CrmTransmission::where('statut', 'en_attente')->count(),
                'envoyes' => CrmTransmission::where('statut', 'envoye')->count(),
                'recus' => CrmTransmission::where('statut', 'recu')->count(),
                'signes' => CrmTransmission::where('statut', 'signe')->count(),
                'archives' => CrmTransmission::where('statut', 'archive')->count(),
                'annules' => CrmTransmission::where('statut', 'annule')->count(),
                'refuses' => CrmTransmission::where('statut', 'refuse')->count(),
            ];
        } else {
            $transmissionIds = $query->pluck('id');
            $stats = [
                'total' => $transmissionIds->count(),
                'brouillons' => CrmTransmission::whereIn('id', $transmissionIds)->where('statut', 'brouillon')->count(),
                'en_attente' => CrmTransmission::whereIn('id', $transmissionIds)->where('statut', 'en_attente')->count(),
                'envoyes' => CrmTransmission::whereIn('id', $transmissionIds)->where('statut', 'envoye')->count(),
                'recus' => CrmTransmission::whereIn('id', $transmissionIds)->where('statut', 'recu')->count(),
                'signes' => CrmTransmission::whereIn('id', $transmissionIds)->where('statut', 'signe')->count(),
                'archives' => CrmTransmission::whereIn('id', $transmissionIds)->where('statut', 'archive')->count(),
                'annules' => CrmTransmission::whereIn('id', $transmissionIds)->where('statut', 'annule')->count(),
                'refuses' => CrmTransmission::whereIn('id', $transmissionIds)->where('statut', 'refuse')->count(),
            ];
        }

        $dossiers = CrmDossier::orderBy('reference_unique')->get()->map(fn($d) => [
            'id' => (string) $d->id,
            'reference' => $d->reference_unique,
        ]);

        return Inertia::render('Crm/Transmissions/Index', [
            'auth' => ['user' => $user],
            'transmissions' => $transmissions,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'statut' => $request->get('statut', 'all'),
                'type' => $request->get('type', 'all'),
                'dossier_id' => $request->get('dossier_id', ''),
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
            'options' => [
                'dossiers' => $dossiers,
            ],
        ]);
    }

    /**
     * Affiche le formulaire de création.
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        $dossiers = CrmDossier::orderBy('reference_unique')
            ->limit(100)
            ->get()
            ->map(fn($d) => [
                'id' => (string) $d->id,
                'reference' => $d->reference_unique,
                'client' => $d->client_nom,
            ]);

        $documents = CrmDocument::with('dossier')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn($d) => [
                'id' => (string) $d->id,
                'nom_fichier' => $d->nom_fichier,
                'dossier_reference' => $d->dossier ? $d->dossier->reference_unique : null,
            ]);

        return Inertia::render('Crm/Transmissions/Create', [
            'auth' => ['user' => $user],
            'options' => [
                'dossiers' => $dossiers,
                'documents' => $documents,
                'types' => [
                    ['value' => 'remise', 'label' => 'Remise en main propre'],
                    ['value' => 'transmission', 'label' => 'Transmission'],
                    ['value' => 'notification', 'label' => 'Notification'],
                    ['value' => 'signification', 'label' => 'Signification'],
                    ['value' => 'retour_dossier', 'label' => 'Retour de dossier'],
                    ['value' => 'courrier', 'label' => 'Envoi de courrier'],
                    ['value' => 'convocation', 'label' => 'Convocation'],
                    ['value' => 'decision', 'label' => 'Décision'],
                ],
                'statuts' => [
                    ['value' => 'brouillon', 'label' => 'Brouillon'],
                    ['value' => 'en_attente', 'label' => 'En attente'],
                    ['value' => 'envoye', 'label' => 'Envoyé'],
                    ['value' => 'recu', 'label' => 'Reçu'],
                    ['value' => 'signe', 'label' => 'Signé'],
                    ['value' => 'archive', 'label' => 'Archivé'],
                    ['value' => 'annule', 'label' => 'Annulé'],
                    ['value' => 'refuse', 'label' => 'Refusé'],
                ],
            ],
        ]);
    }

    /**
     * Stocke une nouvelle transmission.
     */
    public function store(StoreTransmissionRequest $request)
    {
        $crmUser = $request->get('crm_user');
        $validated = $request->validated();

        $reference = $this->generateReference();

        $data = [
            'reference' => $reference,
            'emetteur_id' => $crmUser->id,
            'dossier_id' => $validated['dossier_id'] ?? null,
            'document_id' => $validated['document_id'] ?? null,
            'type' => $validated['type'],
            'statut' => $validated['statut'] ?? 'envoye',
            'destinataire_nom' => $validated['destinataire_nom'],
            'destinataire_email' => $validated['destinataire_email'] ?? null,
            'destinataire_telephone' => $validated['destinataire_telephone'] ?? null,
            'destinataire_fonction' => $validated['destinataire_fonction'] ?? null,
            'destinataire_organisation' => $validated['destinataire_organisation'] ?? null,
            'destinataire_adresse' => $validated['destinataire_adresse'] ?? null,
            'objet' => $validated['objet'],
            'message' => $validated['message'] ?? null,
            'date_transmission' => $validated['date_transmission'],
            'notes' => $validated['notes'] ?? null,
        ];

        try {
            DB::beginTransaction();

            // Gestion de la preuve
            if ($request->hasFile('preuve')) {
                $path = $request->file('preuve')->store('transmissions/preuves', 'local');
                $data['preuve_chemin'] = $path;
            }

            $transmission = CrmTransmission::create($data);

            // Générer la décharge si demandée
            if ($request->boolean('generer_decharge')) {
                $this->createDecharge($transmission, $crmUser);
            }

            DB::commit();

            return redirect()->route('crm.transmissions.show', $transmission->id)
                ->with('success', 'Transmission créée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur création transmission: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Erreur lors de la création de la transmission : ' . $e->getMessage())
                ->withInput();
        }
    }

    private function canAccessTransmission(?CrmUser $crmUser, CrmTransmission $transmission): bool
    {
        if (!$crmUser) {
            return false;
        }

        if ($crmUser->isHuissier() || $crmUser->isSenior()) {
            return true;
        }

        if ($transmission->emetteur_id === $crmUser->id) {
            return true;
        }

        if ($transmission->dossier_id) {
            return $crmUser->peutAccederDossier($transmission->dossier_id);
        }

        return false;
    }

    /**
     * Affiche le formulaire d'édition.
     */
    public function edit(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');
        $transmission = CrmTransmission::findOrFail($id);

        if (!$this->canAccessTransmission($crmUser, $transmission)) {
            abort(403, 'Accès non autorisé à cette transmission.');
        }

        $dossiers = CrmDossier::orderBy('reference_unique')
            ->limit(100)
            ->get()
            ->map(fn($d) => [
                'id' => (string) $d->id,
                'reference' => $d->reference_unique,
                'client' => $d->client_nom,
            ]);

        $documents = CrmDocument::with('dossier')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn($d) => [
                'id' => (string) $d->id,
                'nom_fichier' => $d->nom_fichier,
                'dossier_reference' => $d->dossier ? $d->dossier->reference_unique : null,
            ]);

        return Inertia::render('Crm/Transmissions/Edit', [
            'auth' => ['user' => $user],
            'transmission' => [
                'id' => $transmission->id,
                'dossier_id' => $transmission->dossier_id,
                'document_id' => $transmission->document_id,
                'type' => $transmission->type,
                'statut' => $transmission->statut,
                'destinataire_nom' => $transmission->destinataire_nom,
                'destinataire_email' => $transmission->destinataire_email,
                'destinataire_telephone' => $transmission->destinataire_telephone,
                'destinataire_fonction' => $transmission->destinataire_fonction,
                'destinataire_organisation' => $transmission->destinataire_organisation,
                'destinataire_adresse' => $transmission->destinataire_adresse,
                'objet' => $transmission->objet,
                'message' => $transmission->message,
                'date_transmission' => $transmission->date_transmission->format('Y-m-d'),
                'notes' => $transmission->notes,
                'generer_decharge' => $transmission->decharge ? true : false,
            ],
            'options' => [
                'dossiers' => $dossiers,
                'documents' => $documents,
                'types' => [
                    ['value' => 'remise', 'label' => 'Remise en main propre'],
                    ['value' => 'transmission', 'label' => 'Transmission'],
                    ['value' => 'notification', 'label' => 'Notification'],
                    ['value' => 'signification', 'label' => 'Signification'],
                    ['value' => 'retour_dossier', 'label' => 'Retour de dossier'],
                    ['value' => 'courrier', 'label' => 'Envoi de courrier'],
                    ['value' => 'convocation', 'label' => 'Convocation'],
                    ['value' => 'decision', 'label' => 'Décision'],
                ],
                'statuts' => [
                    ['value' => 'brouillon', 'label' => 'Brouillon'],
                    ['value' => 'en_attente', 'label' => 'En attente'],
                    ['value' => 'envoye', 'label' => 'Envoyé'],
                    ['value' => 'recu', 'label' => 'Reçu'],
                    ['value' => 'signe', 'label' => 'Signé'],
                    ['value' => 'archive', 'label' => 'Archivé'],
                    ['value' => 'annule', 'label' => 'Annulé'],
                    ['value' => 'refuse', 'label' => 'Refusé'],
                ],
            ],
        ]);
    }

    /**
     * Met à jour une transmission.
     */
    public function update(UpdateTransmissionRequest $request, $id)
    {
        $crmUser = $request->get('crm_user');
        $transmission = CrmTransmission::findOrFail($id);

        if (!$this->canAccessTransmission($crmUser, $transmission)) {
            abort(403, 'Accès non autorisé à cette transmission.');
        }

        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // Gestion de la preuve
            if ($request->hasFile('preuve')) {
                // Supprimer l'ancienne preuve si elle existe
                if ($transmission->preuve_chemin) {
                    Storage::disk('local')->delete($transmission->preuve_chemin);
                }
                $path = $request->file('preuve')->store('transmissions/preuves', 'local');
                $validated['preuve_chemin'] = $path;
            }

            $transmission->update($validated);

            // Générer la décharge si demandée et qu'elle n'existe pas
            if ($request->boolean('generer_decharge') && !$transmission->decharge) {
                $this->createDecharge($transmission, $crmUser);
            }

            DB::commit();

            return redirect()->route('crm.transmissions.show', $transmission->id)
                ->with('success', 'Transmission mise à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur mise à jour transmission: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour : ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Affiche les détails d'une transmission.
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $transmission = CrmTransmission::with([
            'emetteur',
            'dossier',
            'document',
            'decharge.user',
        ])->findOrFail($id);

        if (!$this->canAccessTransmission($crmUser, $transmission)) {
            abort(403, 'Accès non autorisé à cette transmission.');
        }

        $timeline = $this->buildTimeline($transmission);

        return Inertia::render('Crm/Transmissions/Show', [
            'auth' => ['user' => $user],
            'transmission' => [
                'id' => $transmission->id,
                'reference' => $transmission->reference,
                'objet' => $transmission->objet,
                'type' => $transmission->type,
                'type_label' => $transmission->type_label,
                'message' => $transmission->message,
                'destinataire_nom' => $transmission->destinataire_nom,
                'destinataire_email' => $transmission->destinataire_email,
                'destinataire_telephone' => $transmission->destinataire_telephone,
                'destinataire_fonction' => $transmission->destinataire_fonction,
                'destinataire_organisation' => $transmission->destinataire_organisation,
                'destinataire_adresse' => $transmission->destinataire_adresse,
                'emetteur' => $transmission->emetteur ? [
                    'id' => $transmission->emetteur->id,
                    'nom' => $transmission->emetteur->nom_complet,
                ] : null,
                'dossier' => $transmission->dossier ? [
                    'id' => $transmission->dossier->id,
                    'reference' => $transmission->dossier->reference_unique,
                ] : null,
                'document' => $transmission->document ? [
                    'id' => $transmission->document->id,
                    'nom_fichier' => $transmission->document->nom_fichier,
                ] : null,
                'date_transmission' => $transmission->date_transmission->format(self::DATE_FORMAT),
                'date_reception' => $transmission->date_reception ? $transmission->date_reception->format(self::DATE_FORMAT) : null,
                'statut' => $transmission->statut,
                'statut_label' => $transmission->statut_label,
                'statut_color' => $transmission->statut_color,
                'preuve_chemin' => $transmission->preuve_chemin,
                'notes' => $transmission->notes,
                'created_at' => $transmission->created_at->format(self::DATE_FORMAT . ' H:i'),
                'timeline' => $timeline,
            ],
            'decharge' => $transmission->decharge ? [
                'id' => $transmission->decharge->id,
                'signataire_nom' => $transmission->decharge->signataire_nom,
                'signataire_fonction' => $transmission->decharge->signataire_fonction,
                'date_decharge' => $transmission->decharge->date_decharge->format(self::DATE_FORMAT),
                'signature_chemin' => $transmission->decharge->signature_chemin,
                'document_chemin' => $transmission->decharge->document_chemin,
                'statut' => $transmission->decharge->statut,
                'statut_label' => $transmission->decharge->statut_label,
                'statut_color' => $transmission->decharge->statut_color,
                'observations' => $transmission->decharge->observations,
                'user' => $transmission->decharge->user ? $transmission->decharge->user->nom_complet : null,
            ] : null,
        ]);
    }

    /**
     * Génère une décharge pour une transmission.
     */
    public function generateDecharge(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');
        $transmission = CrmTransmission::findOrFail($id);

        if (!$this->canAccessTransmission($crmUser, $transmission)) {
            abort(403, 'Accès non autorisé à cette transmission.');
        }

        if ($transmission->decharge) {
            return redirect()->back()->with('error', 'Une décharge existe déjà pour cette transmission.');
        }

        $validated = $request->validate([
            'signataire_nom' => 'required|string|max:255',
            'signataire_fonction' => 'nullable|string|max:100',
            'date_decharge' => 'required|date',
            'observations' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $this->createDecharge($transmission, $crmUser, $validated);

            DB::commit();

            return redirect()->back()->with('success', 'Décharge créée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la création de la décharge : ' . $e->getMessage());
        }
    }

    /**
     * Signe une décharge.
     */
    public function sign(Request $request, $id)
    {
        $crmUser = $request->get('crm_user');

        if (!$crmUser || (!$crmUser->isHuissier() && !$crmUser->isSenior())) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour signer cette décharge.');
        }

        $decharge = CrmDecharge::with('transmission')->where('transmission_id', $id)->firstOrFail();

        if (!$this->canAccessTransmission($crmUser, $decharge->transmission)) {
            abort(403, 'Accès non autorisé à cette transmission.');
        }

        $validated = $request->validate([
            'signature' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'document' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        try {
            DB::beginTransaction();

            $data = ['statut' => 'signe'];

            if ($request->hasFile('signature')) {
                $path = $request->file('signature')->store('decharges/signatures', 'local');
                $data['signature_chemin'] = $path;
            }

            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('decharges/documents', 'local');
                $data['document_chemin'] = $path;
            }

            $decharge->update($data);

            $decharge->transmission->update([
                'statut' => 'signe',
                'date_reception' => now()
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Décharge signée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la signature : ' . $e->getMessage());
        }
    }

    public function viewFile(Request $request, $id, string $type)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $transmission = CrmTransmission::with('decharge')->findOrFail($id);

        if (!$this->canAccessTransmission($crmUser, $transmission)) {
            abort(403, 'Accès non autorisé à ce fichier.');
        }

        $paths = [
            'preuve' => $transmission->preuve_chemin,
            'signature' => $transmission->decharge?->signature_chemin,
            'document' => $transmission->decharge?->document_chemin,
        ];

        if (!array_key_exists($type, $paths) || !$paths[$type] || !Storage::disk('local')->exists($paths[$type])) {
            abort(404);
        }

        return Storage::disk('local')->response($paths[$type], basename($paths[$type]));
    }

    /**
     * Génère un PDF de la transmission.
     */
    public function pdf(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $transmission = CrmTransmission::with(['emetteur', 'dossier', 'decharge'])->findOrFail($id);

        if (!$this->canAccessTransmission($crmUser, $transmission)) {
            abort(403, 'Accès non autorisé à cette transmission.');
        }

        if (!class_exists('Barryvdh\\DomPDF\\Facade\\Pdf')) {
            return redirect()->back()->with('error', 'Le package de génération PDF n\'est pas installé.');
        }

        $pdf = Pdf::loadView('pdf.transmission', [
            'transmission' => $transmission,
        ]);

        $filename = 'transmission-' . ($transmission->reference ?? $transmission->id) . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Génère un PDF de la décharge.
     */
    public function pdfDecharge(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser) {
            return redirect()->route('login');
        }

        $decharge = CrmDecharge::with(['transmission.emetteur'])->findOrFail($id);

        if (!$this->canAccessTransmission($crmUser, $decharge->transmission)) {
            abort(403, 'Accès non autorisé à cette décharge.');
        }

        if (!class_exists('Barryvdh\\DomPDF\\Facade\\Pdf')) {
            return redirect()->back()->with('error', 'Le package de génération PDF n\'est pas installé.');
        }

        $pdf = Pdf::loadView('pdf.decharge', [
            'decharge' => $decharge,
            'transmission' => $decharge->transmission,
        ]);

        $filename = 'decharge-' . ($decharge->transmission->reference ?? $id) . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Supprime une transmission.
     */
    public function destroy(Request $request, $id)
    {
        $crmUser = $request->get('crm_user');

        if (!$crmUser || (!$crmUser->isHuissier() && !$crmUser->isSenior())) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour supprimer cette transmission.');
        }

        $transmission = CrmTransmission::with('decharge')->findOrFail($id);

        if (!$this->canAccessTransmission($crmUser, $transmission)) {
            abort(403, 'Accès non autorisé à cette transmission.');
        }

        if ($transmission->decharge && $transmission->decharge->statut === 'signe') {
            return redirect()->back()
                ->with('error', 'Impossible de supprimer une transmission signée.');
        }

        DB::beginTransaction();

        try {
            // Suppression du fichier de preuve
            if ($transmission->preuve_chemin && Storage::disk('local')->exists($transmission->preuve_chemin)) {
                Storage::disk('local')->delete($transmission->preuve_chemin);
            }

            // Suppression de la décharge
            if ($transmission->decharge) {
                if ($transmission->decharge->signature_chemin && Storage::disk('local')->exists($transmission->decharge->signature_chemin)) {
                    Storage::disk('local')->delete($transmission->decharge->signature_chemin);
                }

                if ($transmission->decharge->document_chemin && Storage::disk('local')->exists($transmission->decharge->document_chemin)) {
                    Storage::disk('local')->delete($transmission->decharge->document_chemin);
                }

                $transmission->decharge->delete();
            }

            $transmission->delete();

            DB::commit();

            return redirect()
                ->route('crm.transmissions.index')
                ->with('success', 'Transmission supprimée avec succès.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    /**
     * Génère une référence unique.
     */
    private function generateReference(): string
    {
        $count = CrmTransmission::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count() + 1;

        return 'TRANS-' . now()->format('Ym') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Crée une décharge pour une transmission.
     */
    private function createDecharge($transmission, $crmUser, $validated = null)
    {
        $data = [
            'transmission_id' => $transmission->id,
            'signataire_nom' => $validated['signataire_nom'] ?? $transmission->destinataire_nom,
            'signataire_fonction' => $validated['signataire_fonction'] ?? $transmission->destinataire_fonction,
            'date_decharge' => $validated['date_decharge'] ?? now(),
            'statut' => 'en_attente',
            'observations' => $validated['observations'] ?? null,
            'user_id' => $crmUser->id,
        ];

        return CrmDecharge::create($data);
    }

    /**
     * Construit la timeline d'une transmission.
     */
    private function buildTimeline($transmission): array
    {
        $timeline = [];

        // Création
        $timeline[] = [
            'date' => $transmission->created_at->format(self::DATE_FORMAT . ' H:i'),
            'icon' => 'file',
            'label' => 'Transmission créée',
            'details' => 'Par ' . ($transmission->emetteur ? $transmission->emetteur->nom_complet : 'Utilisateur inconnu'),
        ];

        // Si transmise
        if (in_array($transmission->statut, ['envoye', 'recu', 'signe'])) {
            $timeline[] = [
                'date' => $transmission->date_transmission->format(self::DATE_FORMAT . ' H:i'),
                'icon' => 'send',
                'label' => 'Transmission envoyée',
                'details' => 'Vers ' . $transmission->destinataire_nom,
            ];
        }

        // Si reçue
        if (in_array($transmission->statut, ['recu', 'signe'])) {
            $timeline[] = [
                'date' => $transmission->date_reception
                    ? $transmission->date_reception->format(self::DATE_FORMAT . ' H:i')
                    : $transmission->updated_at->format(self::DATE_FORMAT . ' H:i'),
                'icon' => 'check',
                'label' => 'Transmission reçue',
                'details' => 'Par ' . $transmission->destinataire_nom,
            ];
        }

        // Si décharge générée
        if ($transmission->decharge) {
            $timeline[] = [
                'date' => $transmission->decharge->created_at->format(self::DATE_FORMAT . ' H:i'),
                'icon' => 'file',
                'label' => 'Décharge générée',
                'details' => 'Signataire : ' . $transmission->decharge->signataire_nom,
            ];

            // Si décharge signée
            if ($transmission->decharge->statut === 'signe') {
                $timeline[] = [
                    'date' => $transmission->decharge->updated_at->format(self::DATE_FORMAT . ' H:i'),
                    'icon' => 'check',
                    'label' => 'Décharge signée',
                    'details' => 'Signée par ' . $transmission->decharge->signataire_nom,
                ];
            }
        }

        // Si archivée
        if ($transmission->statut === 'archive') {
            $timeline[] = [
                'date' => $transmission->updated_at->format(self::DATE_FORMAT . ' H:i'),
                'icon' => 'archive',
                'label' => 'Transmission archivée',
                'details' => '',
            ];
        }

        // Si annulée
        if ($transmission->statut === 'annule') {
            $timeline[] = [
                'date' => $transmission->updated_at->format(self::DATE_FORMAT . ' H:i'),
                'icon' => 'x',
                'label' => 'Transmission annulée',
                'details' => '',
            ];
        }

        // Si refusée
        if ($transmission->statut === 'refuse') {
            $timeline[] = [
                'date' => $transmission->updated_at->format(self::DATE_FORMAT . ' H:i'),
                'icon' => 'x',
                'label' => 'Transmission refusée',
                'details' => '',
            ];
        }

        return $timeline;
    }
}
