<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmArchive;
use App\Models\CrmArchiveDocument;
use App\Models\CrmArchiveHistorique;
use App\Models\CrmEmplacement;
use App\Models\CrmDossier;
use App\Models\CrmDocument;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Services\ArchiveService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class ArchivesController extends Controller
{
    protected ArchiveService $archiveService;

    public function __construct(ArchiveService $archiveService)
    {
        $this->archiveService = $archiveService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }

        $query = CrmArchive::with(['emplacement', 'archivePar']);

        // Recherche
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('reference', 'like', "%{$request->search}%")
                  ->orWhere('titre', 'like', "%{$request->search}%")
                  ->orWhere('original_reference', 'like', "%{$request->search}%");
            });
        }

        // Filtre par type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filtre par statut
        if ($request->has('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        // Filtre par emplacement
        if ($request->has('emplacement_id') && !empty($request->emplacement_id)) {
            $query->where('emplacement_id', $request->emplacement_id);
        }

        $allowedOrderBy = ['reference', 'type', 'titre', 'date_archivage', 'statut', 'created_at'];
        $orderBy = in_array($request->get('order_by'), $allowedOrderBy, true)
            ? $request->get('order_by')
            : 'date_archivage';
        $orderDir = $request->get('order_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($orderBy, $orderDir);

        $perPage = $request->get('per_page', 20);
        $archives = $query->paginate($perPage);

        $archives->getCollection()->transform(function ($archive) {
            return [
                'id' => $archive->id,
                'reference' => $archive->reference,
                'type' => $archive->type,
                'type_label' => $archive->type_label ?? $archive->type,
                'titre' => $archive->titre,
                'original_reference' => $archive->original_reference,
                'date_archivage' => $archive->date_archivage->format('d/m/Y'),
                'motif' => $archive->motif,
                'motif_label' => $archive->motif_label,
                'statut' => $archive->statut,
                'emplacement' => $archive->emplacement ? [
                    'id' => $archive->emplacement->id,
                    'code' => $archive->emplacement->code,
                    'code_complet' => $archive->emplacement->code_complet,
                ] : null,
                'emplacement_detail' => $archive->emplacement_detail,
                'archive_par' => $archive->archivePar ? $archive->archivePar->nom_complet : null,
                'created_at' => $archive->created_at->format('d/m/Y'),
            ];
        });

        $stats = [
            'total' => CrmArchive::count(),
            'archives' => CrmArchive::archives()->count(),
            'en_restauration' => CrmArchive::enCoursDeRestauration()->count(),
            'restaures' => CrmArchive::where('statut', 'restaure')->count(),
            'par_type' => [
                'dossier' => CrmArchive::where('type', 'dossier')->count(),
                'document' => CrmArchive::where('type', 'document')->count(),
                'acte' => CrmArchive::where('type', 'acte')->count(),
                'facture' => CrmArchive::where('type', 'facture')->count(),
                'bail' => CrmArchive::where('type', 'bail')->count(),
                'physique' => CrmArchive::where('type', 'physique')->count(),
            ],
        ];

        $emplacements = CrmEmplacement::actifs()->get()->map(fn($e) => [
            'id' => $e->id,
            'code' => $e->code,
            'code_complet' => $e->code_complet,
            'occupation' => $e->occupation_rate,
        ]);

        return Inertia::render('Crm/Archives/Index', [
            'auth' => ['user' => $user],
            'archives' => $archives,
            'stats' => $stats,
            'emplacements' => $emplacements,
            'filters' => [
                'search' => $request->get('search', ''),
                'type' => $request->get('type', 'all'),
                'statut' => $request->get('statut', 'all'),
                'emplacement_id' => $request->get('emplacement_id', ''),
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
            ],
        ]);
    }

    public function archiverDossier(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }

        $dossier = CrmDossier::findOrFail($id);

        if ($dossier->est_archive) {
            return redirect()->back()->with('error', 'Ce dossier est déjà archivé.');
        }

        $validated = $request->validate([
            'motif' => 'required|in:cloture,inactif,ancien,litige_resolu,autre',
            'motif_commentaire' => 'nullable|string',
            'emplacement_id' => 'nullable|exists:crm_emplacements,id',
            'emplacement_detail' => 'nullable|string',
            'duree_conservation_mois' => 'nullable|integer|min:1|max:1200',
        ]);

        DB::transaction(function () use ($dossier, $validated, $crmUser) {
            $reference = 'ARCH-' . date('Ymd') . '-' . str_pad($dossier->id, 5, '0', STR_PAD_LEFT);

            $archive = CrmArchive::create([
                'reference' => $reference,
                'type' => 'dossier',
                'type_label' => 'Dossier',
                'original_id' => $dossier->id,
                'original_reference' => $dossier->reference_unique,
                'titre' => $dossier->type_mission_label,
                'description' => $dossier->description,
                'date_archivage' => now(),
                'motif' => $validated['motif'],
                'motif_label' => $this->getMotifLabel($validated['motif']),
                'motif_commentaire' => $validated['motif_commentaire'],
                'emplacement_id' => $validated['emplacement_id'],
                'emplacement_detail' => $validated['emplacement_detail'],
                'duree_conservation_mois' => $validated['duree_conservation_mois'],
                'archive_par' => $crmUser->id,
                'statut' => 'archive',
                'metadonnees' => [
                    'client_id' => $dossier->client_id,
                    'responsable_id' => $dossier->responsable_id,
                    'date_ouverture' => $dossier->date_ouverture,
                    'montant' => $dossier->montant,
                ],
            ]);

            CrmArchiveHistorique::create([
                'archive_id' => $archive->id,
                'action' => 'archivage',
                'description' => 'Archivage du dossier: ' . $dossier->reference_unique,
                'utilisateur_id' => $crmUser->id,
                'ip_adresse' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $dossier->update([
                'est_archive' => true,
                'archive_le' => now(),
                'archive_par' => $crmUser->id,
                'archive_motif' => $validated['motif_commentaire'] ?? $validated['motif'],
                'archive_emplacement_id' => $validated['emplacement_id'],
                'statut' => 'archive',
            ]);

            if ($validated['emplacement_id']) {
                $emplacement = CrmEmplacement::find($validated['emplacement_id']);
                $emplacement->increment('occupation');
            }
        });

        return redirect()->back()->with('success', 'Dossier archivé avec succès.');
    }

    public function archiverDocument(Request $request, $id)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user || !$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }

        $document = CrmDocument::findOrFail($id);

        if ($document->est_archive) {
            return redirect()->back()->with('error', 'Ce document est déjà archivé.');
        }

        $validated = $request->validate([
            'motif' => 'required|in:cloture,inactif,ancien,litige_resolu,autre',
            'motif_commentaire' => 'nullable|string',
            'emplacement_id' => 'nullable|exists:crm_emplacements,id',
            'emplacement_detail' => 'nullable|string',
        ]);

        DB::transaction(function () use ($document, $validated, $crmUser) {
            $reference = 'ARCH-DOC-' . date('Ymd') . '-' . str_pad($document->id, 5, '0', STR_PAD_LEFT);

            $archive = CrmArchive::create([
                'reference' => $reference,
                'type' => 'document',
                'type_label' => 'Document',
                'original_id' => $document->id,
                'original_reference' => $document->id,
                'titre' => $document->nom_fichier,
                'description' => $document->type_document_label,
                'date_archivage' => now(),
                'motif' => $validated['motif'],
                'motif_label' => $this->getMotifLabel($validated['motif']),
                'motif_commentaire' => $validated['motif_commentaire'],
                'emplacement_id' => $validated['emplacement_id'],
                'emplacement_detail' => $validated['emplacement_detail'],
                'archive_par' => $crmUser->id,
                'statut' => 'archive',
                'metadonnees' => [
                    'dossier_id' => $document->dossier_id,
                    'type' => $document->type_document,
                    'extension' => $document->extension,
                    'taille' => $document->taille,
                ],
            ]);

            if ($document->chemin_fichier) {
                $this->createArchiveDocument($archive, $document, $crmUser);
            }

            CrmArchiveHistorique::create([
                'archive_id' => $archive->id,
                'action' => 'archivage',
                'description' => 'Archivage du document: ' . $document->nom_fichier,
                'utilisateur_id' => $crmUser->id,
                'ip_adresse' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $document->update([
                'est_archive' => true,
                'archive_le' => now(),
                'archive_par' => $crmUser->id,
                'archive_motif' => $validated['motif_commentaire'] ?? $validated['motif'],
                'archive_emplacement_id' => $validated['emplacement_id'],
            ]);

            if ($validated['emplacement_id']) {
                $emplacement = CrmEmplacement::find($validated['emplacement_id']);
                $emplacement->increment('occupation');
            }
        });

        return redirect()->back()->with('success', 'Document archivé avec succès.');
    }

    public function restaurer($id)
    {
        $user = Auth::user();
        $crmUser = request()->get('crm_user');

        if (!$user || !$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }

        $archive = CrmArchive::findOrFail($id);

        if ($archive->statut !== 'archive') {
            return redirect()->back()->with('error', 'Cette archive ne peut pas être restaurée.');
        }

        DB::transaction(function () use ($archive, $crmUser) {
            $archive->update([
                'statut' => 'en_cours_de_restauration',
            ]);

            CrmArchiveHistorique::create([
                'archive_id' => $archive->id,
                'action' => 'restauration',
                'description' => 'Demande de restauration de l\'archive: ' . $archive->reference,
                'utilisateur_id' => $crmUser->id,
                'ip_adresse' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });

        return redirect()->back()->with('success', 'Demande de restauration envoyée.');
    }

    public function confirmerRestauration($id)
    {
        $user = Auth::user();
        $crmUser = request()->get('crm_user');

        if (!$user || !$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }

        $archive = CrmArchive::findOrFail($id);

        if ($archive->statut !== 'en_cours_de_restauration') {
            return redirect()->back()->with('error', 'Cette archive n\'est pas en cours de restauration.');
        }

        DB::transaction(function () use ($archive, $crmUser) {
            $ancienEmplacementId = $archive->emplacement_id;

            if ($archive->type === 'dossier') {
                $dossier = CrmDossier::find($archive->original_id);
                if ($dossier) {
                    $dossier->update([
                        'est_archive' => false,
                        'archive_le' => null,
                        'archive_par' => null,
                        'archive_motif' => null,
                        'archive_emplacement_id' => null,
                        'statut' => 'en_cours',
                    ]);
                }
            } elseif ($archive->type === 'document') {
                $document = CrmDocument::find($archive->original_id);
                if ($document) {
                    $document->update([
                        'est_archive' => false,
                        'archive_le' => null,
                        'archive_par' => null,
                        'archive_motif' => null,
                        'archive_emplacement_id' => null,
                    ]);
                }
            }

            $archive->update([
                'statut' => 'restaure',
                'date_restauration' => now(),
                'restaure_par' => $crmUser->id,
                'emplacement_id' => null,
                'emplacement_detail' => null,
            ]);

            // ✅ Décrémenter l'occupation de l'emplacement
            if ($ancienEmplacementId) {
                $emplacement = CrmEmplacement::find($ancienEmplacementId);
                if ($emplacement && $emplacement->occupation > 0) {
                    $emplacement->decrement('occupation');
                }
            }

            CrmArchiveHistorique::create([
                'archive_id' => $archive->id,
                'action' => 'restauration',
                'description' => 'Archive restaurée avec succès: ' . $archive->reference,
                'utilisateur_id' => $crmUser->id,
                'ip_adresse' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });

        return redirect()->back()->with('success', 'Archive restaurée avec succès.');
    }

    public function show($id)
    {
        $user = Auth::user();
        $crmUser = request()->get('crm_user');

        $archive = CrmArchive::with([
            'emplacement', 
            'archivePar', 
            'restaurePar',
            'documents',
            'historiques.utilisateur'
        ])->findOrFail($id);

        if ($crmUser) {
            CrmArchiveHistorique::create([
                'archive_id' => $archive->id,
                'action' => 'consultation',
                'description' => 'Consultation de l\'archive: ' . $archive->reference,
                'utilisateur_id' => $crmUser->id,
                'ip_adresse' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return Inertia::render('Crm/Archives/Show', [
            'auth' => ['user' => $user],
            'archive' => [
                'id' => $archive->id,
                'reference' => $archive->reference,
                'type' => $archive->type,
                'type_label' => $archive->type_label,
                'titre' => $archive->titre,
                'description' => $archive->description,
                'original_reference' => $archive->original_reference,
                'date_archivage' => $archive->date_archivage->format('d/m/Y'),
                'motif' => $archive->motif,
                'motif_label' => $archive->motif_label,
                'motif_commentaire' => $archive->motif_commentaire,
                'statut' => $archive->statut,
                'emplacement' => $archive->emplacement ? [
                    'id' => $archive->emplacement->id,
                    'code' => $archive->emplacement->code,
                    'code_complet' => $archive->emplacement->code_complet,
                    'type' => $archive->emplacement->type,
                ] : null,
                'emplacement_detail' => $archive->emplacement_detail,
                'duree_conservation_mois' => $archive->duree_conservation_mois,
                'date_destruction' => $archive->date_destruction ? $archive->date_destruction->format('d/m/Y') : null,
                'notes' => $archive->notes,
                'metadonnees' => $archive->metadonnees,
                'archive_par' => $archive->archivePar ? $archive->archivePar->nom_complet : null,
                'restaure_par' => $archive->restaurePar ? $archive->restaurePar->nom_complet : null,
                'date_restauration' => $archive->date_restauration ? $archive->date_restauration->format('d/m/Y') : null,
                'created_at' => $archive->created_at->format('d/m/Y H:i'),
                'documents' => $archive->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'nom_original' => $doc->nom_original,
                        'nom_stockage' => $doc->nom_stockage,
                        'description' => $doc->description,
                        'chemin' => $doc->chemin,
                        'taille' => $doc->taille,
                        'extension' => $doc->extension,
                        'mime_type' => $doc->mime_type,
                        'version' => $doc->version,
                        'ordre' => $doc->ordre,
                        'est_principal' => $doc->est_principal,
                        'created_at' => $doc->created_at->format('d/m/Y H:i'),
                    ];
                }),
                'historiques' => $archive->historiques->map(function ($hist) {
                    return [
                        'id' => $hist->id,
                        'action' => $hist->action,
                        'description' => $hist->description,
                        'utilisateur' => $hist->utilisateur ? $hist->utilisateur->nom_complet : null,
                        'ip_adresse' => $hist->ip_adresse,
                        'user_agent' => $hist->user_agent,
                        'created_at' => $hist->created_at->format('d/m/Y H:i'),
                    ];
                }),
            ],
        ]);
    }

    public function emplacements()
    {
        $user = Auth::user();
        
        $emplacements = CrmEmplacement::withCount('archives')
            ->orderBy('code')
            ->get()
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'code' => $e->code,
                    'code_complet' => $e->code_complet,
                    'nom' => $e->nom,
                    'type' => $e->type,
                    'capacite' => $e->capacite,
                    'occupation' => $e->occupation,
                    'occupation_rate' => $e->occupation_rate,
                    'statut' => $e->statut,
                ];
            });

        return Inertia::render('Crm/Archives/Emplacements', [
            'auth' => ['user' => $user],
            'emplacements' => $emplacements,
        ]);
    }

    public function storeEmplacement(Request $request)
    {
        $crmUser = $request->get('crm_user');

        if (!$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:crm_emplacements,code',
            'nom' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'capacite' => 'required|integer|min:1',
            'statut' => 'nullable|string|max:50',
        ]);

        CrmEmplacement::create([
            ...$validated,
            'occupation' => 0,
            'statut' => $validated['statut'] ?? 'actif',
        ]);

        return redirect()->back()->with('success', 'Emplacement créé avec succès.');
    }

    public function recherche(Request $request)
    {
        $request->merge([
            'search' => $request->get('q', $request->get('search', '')),
        ]);

        return $this->index($request);
    }

    public function categories()
    {
        $categories = CrmArchive::whereNotNull('categorie')
            ->where('categorie', '!=', '')
            ->distinct()
            ->orderBy('categorie')
            ->pluck('categorie');
     
        return response()->json($categories);
    }

    public function storePhysique(Request $request)
    {
        $crmUser = $request->get('crm_user');
     
        if (!$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }
     
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'categorie' => 'required|string|max:255',
            'description' => 'nullable|string',
            'fichiers' => 'required|array|min:1',
            'fichiers.*' => 'file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,ppt,pptx,zip,rar|max:51200',
            'notes' => 'nullable|string',
        ]);

        if (!$request->hasFile('fichiers')) {
            return redirect()->back()->with('error', 'Veuillez sélectionner au moins un fichier.');
        }
     
        try {
            DB::transaction(function () use ($request, $validated, $crmUser) {
                $count = CrmArchive::whereDate('created_at', today())->count() + 1;
                $reference = 'ARCH-PHY-' . now()->format('Ymd') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
                
                $archive = CrmArchive::create([
                    'reference' => $reference,
                    'type' => 'physique',
                    'type_label' => 'Physique',
                    'source' => 'physique',
                    'original_id' => 0,
                    'original_reference' => 'PHYSIQUE-' . $reference,
                    'titre' => $validated['titre'],
                    'categorie' => $validated['categorie'],
                    'description' => $validated['description'] ?? null,
                    'date_archivage' => now(),
                    'motif' => 'archivage_physique',
                    'motif_label' => 'Archive physique',
                    'notes' => $validated['notes'] ?? null,
                    'archive_par' => $crmUser->id,
                    'statut' => 'archive',
                    'emplacement_id' => null,
                    'emplacement_detail' => null,
                    'duree_conservation_mois' => null,
                    'date_destruction' => null,
                    'metadonnees' => null,
                    'motif_commentaire' => null,
                    'date_restauration' => null,
                    'restaure_par' => null,
                ]);

                $fichiers = $request->file('fichiers');
                $fichierCount = 0;

                foreach ($fichiers as $index => $fichier) {
                    $originalName = $fichier->getClientOriginalName();
                    $extension = $fichier->getClientOriginalExtension();
                    $taille = $fichier->getSize();
                    $mimeType = $fichier->getMimeType();
                    
                    $nomStockage = Str::uuid() . '.' . $extension;
                    // ✅ Structure de dossiers uniformisée
                    $chemin = $fichier->storeAs('archives/physique/' . $archive->id, $nomStockage, 'local');
                    
                    if (!$chemin) {
                        throw new \Exception('Erreur lors du stockage du fichier: ' . $originalName);
                    }

                    CrmArchiveDocument::create([
                        'archive_id' => $archive->id,
                        'nom_original' => $originalName,
                        'nom_stockage' => $nomStockage,
                        'chemin' => $chemin,
                        'taille' => $taille,
                        'extension' => $extension,
                        'mime_type' => $mimeType,
                        'version' => 1,
                        'ordre' => $index + 1,
                        'est_principal' => ($index === 0),
                        'description' => $validated['description'] ?? 'Document de l\'archive physique',
                        'ajoute_par' => $crmUser->id,
                    ]);

                    $fichierCount++;
                }

                CrmArchiveHistorique::create([
                    'archive_id' => $archive->id,
                    'action' => 'archivage',
                    'description' => "Création d'une archive physique avec {$fichierCount} fichier(s): " . $validated['titre'],
                    'utilisateur_id' => $crmUser->id,
                    'ip_adresse' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            });
     
            return redirect()->back()->with('success', 'Archive physique créée avec succès.');
            
        } catch (\Exception $e) {
            \Log::error('Erreur création archive physique: ' . $e->getMessage(), [
                'request_data' => $request->except('fichiers'),
                'user_id' => $crmUser->id ?? null
            ]);
            
            return redirect()->back()->with('error', 'Erreur lors de la création de l\'archive: ' . $e->getMessage());
        }
    }

    public function ajouterDocument(Request $request, $archiveId)
    {
        $crmUser = $request->get('crm_user');

        if (!$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }

        $archive = CrmArchive::findOrFail($archiveId);

        $validated = $request->validate([
            'fichier' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,ppt,pptx,zip,rar|max:51200',
            'description' => 'nullable|string|max:255',
        ]);

        try {
            DB::transaction(function () use ($request, $archive, $validated, $crmUser) {
                $fichier = $request->file('fichier');
                $originalName = $fichier->getClientOriginalName();
                $extension = $fichier->getClientOriginalExtension();
                $taille = $fichier->getSize();
                $mimeType = $fichier->getMimeType();
                
                $nomStockage = Str::uuid() . '.' . $extension;
                // ✅ Structure de dossiers uniformisée selon le type
                $typeDossier = $archive->type ?? 'document';
                $chemin = $fichier->storeAs('archives/' . $typeDossier . '/' . $archive->id, $nomStockage, 'local');

                $ordreMax = CrmArchiveDocument::where('archive_id', $archive->id)->max('ordre') ?? 0;

                CrmArchiveDocument::create([
                    'archive_id' => $archive->id,
                    'nom_original' => $originalName,
                    'nom_stockage' => $nomStockage,
                    'chemin' => $chemin,
                    'taille' => $taille,
                    'extension' => $extension,
                    'mime_type' => $mimeType,
                    'version' => 1,
                    'ordre' => $ordreMax + 1,
                    'est_principal' => false,
                    'description' => $validated['description'] ?? null,
                    'ajoute_par' => $crmUser->id,
                ]);

                CrmArchiveHistorique::create([
                    'archive_id' => $archive->id,
                    'action' => 'ajout_document',
                    'description' => 'Ajout du document: ' . $originalName,
                    'utilisateur_id' => $crmUser->id,
                    'ip_adresse' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            });

            return redirect()->back()->with('success', 'Document ajouté avec succès.');
            
        } catch (\Exception $e) {
            \Log::error('Erreur ajout document: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de l\'ajout du document.');
        }
    }

    public function telechargerDocument($documentId)
    {
        $user = Auth::user();
        $crmUser = request()->get('crm_user');

        if (!$user || !$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }

        $document = CrmArchiveDocument::findOrFail($documentId);
        $archiveId = $document->archive_id;

        CrmArchiveHistorique::create([
            'archive_id' => $archiveId,
            'action' => 'telechargement',
            'description' => 'Téléchargement du document: ' . $document->nom_original,
            'utilisateur_id' => $crmUser->id,
            'ip_adresse' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        if (!Storage::disk('local')->exists($document->chemin)) {
            return redirect()->back()->with('error', 'Fichier introuvable.');
        }

        return Storage::disk('local')->download($document->chemin, $document->nom_original);
    }

    public function supprimerDocument($documentId)
    {
        $crmUser = request()->get('crm_user');

        if (!$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }

        $document = CrmArchiveDocument::findOrFail($documentId);
        $archiveId = $document->archive_id;

        try {
            DB::transaction(function () use ($document, $archiveId, $crmUser) {
                if (Storage::disk('local')->exists($document->chemin)) {
                    Storage::disk('local')->delete($document->chemin);
                }

                $document->delete();

                CrmArchiveHistorique::create([
                    'archive_id' => $archiveId,
                    'action' => 'suppression_document',
                    'description' => 'Suppression du document: ' . $document->nom_original,
                    'utilisateur_id' => $crmUser->id,
                    'ip_adresse' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            });

            return redirect()->back()->with('success', 'Document supprimé avec succès.');
            
        } catch (\Exception $e) {
            \Log::error('Erreur suppression document: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la suppression du document.');
        }
    }

    public function telechargerArchiveZip($archiveId)
    {
        $user = Auth::user();
        $crmUser = request()->get('crm_user');

        if (!$user || !$crmUser || !$crmUser->isHuissier()) {
            return redirect()->back()->with('error', 'Accès non autorisé.');
        }

        $archive = CrmArchive::with('documents')->findOrFail($archiveId);

        if ($archive->documents->isEmpty()) {
            return redirect()->back()->with('error', 'Aucun document à télécharger.');
        }

        try {
            $zipFileName = 'archive_' . $archive->reference . '_' . Str::uuid() . '.zip';
            $zipPath = storage_path('app/temp/' . $zipFileName);
            
            if (!is_dir(storage_path('app/temp'))) {
                mkdir(storage_path('app/temp'), 0755, true);
            }

            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new \Exception('Impossible de créer le fichier ZIP.');
            }

            foreach ($archive->documents as $document) {
                $filePath = Storage::disk('local')->path($document->chemin);
                if (file_exists($filePath)) {
                    $zip->addFile($filePath, $document->nom_original);
                }
            }

            $zip->close();

            CrmArchiveHistorique::create([
                'archive_id' => $archiveId,
                'action' => 'telechargement_zip',
                'description' => 'Téléchargement de tous les documents de l\'archive: ' . $archive->reference,
                'utilisateur_id' => $crmUser->id,
                'ip_adresse' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
            
        } catch (\Exception $e) {
            \Log::error('Erreur création ZIP: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la création du fichier ZIP.');
        }
    }

    /**
     * Crée un document d'archive à partir d'un document existant
     */
    private function createArchiveDocument($archive, $document, $crmUser)
    {
        $originalPath = Storage::disk('local')->path($document->chemin_fichier);
        if (!file_exists($originalPath)) {
            return;
        }

        $extension = pathinfo($document->chemin_fichier, PATHINFO_EXTENSION);
        $nomStockage = Str::uuid() . '.' . $extension;
        
        // ✅ Structure de dossiers uniformisée
        $typeDossier = $archive->type ?? 'document';
        $chemin = 'archives/' . $typeDossier . '/' . $archive->id . '/' . $nomStockage;
        
        $copied = Storage::disk('local')->put(
            $chemin,
            Storage::disk('local')->get($document->chemin_fichier)
        );

        if ($copied) {
            CrmArchiveDocument::create([
                'archive_id' => $archive->id,
                'nom_original' => $document->nom_fichier,
                'nom_stockage' => $nomStockage,
                'chemin' => $chemin,
                'taille' => $document->taille ?? 0,
                'extension' => $extension,
                // ✅ Mime_type vérifié
                'mime_type' => $document->mime_type ?? $this->getMimeTypeFromExtension($extension),
                'version' => 1,
                'ordre' => 1,
                'est_principal' => true,
                'description' => 'Document original archivé',
                'ajoute_par' => $crmUser->id,
            ]);
        }
    }

    /**
     * ✅ Détermine le type MIME à partir de l'extension
     */
    private function getMimeTypeFromExtension($extension)
    {
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'zip' => 'application/zip',
            'rar' => 'application/vnd.rar',
            'txt' => 'text/plain',
            'csv' => 'text/csv',
            'xml' => 'application/xml',
            'json' => 'application/json',
        ];
        
        return $mimeTypes[strtolower($extension)] ?? 'application/octet-stream';
    }

    private function getMotifLabel($motif)
    {
        $labels = [
            'cloture' => 'Clôture du dossier',
            'inactif' => 'Dossier inactif',
            'ancien' => 'Dossier ancien',
            'litige_resolu' => 'Litige résolu',
            'autre' => 'Autre motif',
        ];
        return $labels[$motif] ?? $motif;
    }
}
