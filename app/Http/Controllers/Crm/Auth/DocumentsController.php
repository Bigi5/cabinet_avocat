<?php

namespace App\Http\Controllers\Crm\Auth;

use App\Http\Controllers\Controller;
use App\Models\CrmDocument;
use App\Models\CrmDossier;
use App\Models\CrmUser;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class DocumentsController extends Controller
{
    /**
     * Affiche la liste des documents.
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
        $canViewAll = $this->canViewAllDocuments($crmUser);
        
        // Construction de la requête de base avec relations
        $query = CrmDocument::with(['dossier', 'user']);

        // Filtrage par permissions
        if (!$canViewAll) {
            // Si l'utilisateur ne peut pas tout voir, filtrer ses documents
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

        // Filtre pour les archives
        if ($request->has('archives') && $request->archives === 'true') {
            // À implémenter si tu as un champ 'est_archive'
        }

        // Recherche
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('nom_fichier', 'like', "%{$request->search}%")
                  ->orWhereHas('dossier', function ($dq) use ($request) {
                      $dq->where('reference_unique', 'like', "%{$request->search}%");
                  });
            });
        }

        // Filtre par dossier
        if ($request->has('dossier_id') && !empty($request->dossier_id)) {
            $query->where('dossier_id', $request->dossier_id);
        }

        // Filtre par type de document
        if ($request->has('type_document') && $request->type_document !== 'all') {
            $query->where('type_document', $request->type_document);
        }

        // Filtre par extension
        if ($request->has('extension') && $request->extension !== 'all') {
            $query->where('extension', $request->extension);
        }

        // Filtre par utilisateur
        if ($request->has('user_id') && !empty($request->user_id)) {
            $query->where('user_id', $request->user_id);
        }

        // Filtre par date
        if ($request->has('date_debut') && !empty($request->date_debut)) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }
        if ($request->has('date_fin') && !empty($request->date_fin)) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        // Tri
        $orderBy = $request->get('order_by', 'created_at');
        $orderDir = $request->get('order_dir', 'desc');
        $query->orderBy($orderBy, $orderDir);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $documents = $query->paginate($perPage);

        // Statistiques pour les cartes
        $stats = $this->getStats($crmUser, $canViewAll);

        // Options pour les filtres
        $typesDocument = $this->getTypesDocument();
        $extensions = $this->getExtensions();
        $dossiers = $this->getDossiersList();
        $users = $this->getUsersList();

        return Inertia::render('Crm/Documents', [
            'auth' => [
                'user' => $user
            ],
            'documents' => $documents,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search', ''),
                'dossier_id' => $request->get('dossier_id', ''),
                'type_document' => $request->get('type_document', 'all'),
                'extension' => $request->get('extension', 'all'),
                'user_id' => $request->get('user_id', ''),
                'date_debut' => $request->get('date_debut', ''),
                'date_fin' => $request->get('date_fin', ''),
                'order_by' => $orderBy,
                'order_dir' => $orderDir,
                'archives' => $request->get('archives', 'false'),
            ],
            'options' => [
                'types_document' => $typesDocument,
                'extensions' => $extensions,
                'dossiers' => $dossiers,
                'users' => $users,
            ],
        ]);
    }

    /**
     * Affiche les détails d'un document.
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $document = CrmDocument::with(['dossier', 'user'])->findOrFail($id);

        // Vérifier les permissions d'accès
        if (!$this->canAccessDocument($crmUser, $document)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à ce document.');
        }

        return Inertia::render('Crm/Documents/Show', [
            'auth' => [
                'user' => $user
            ],
            'document' => [
                'id' => $document->id,
                'nom_fichier' => $document->nom_fichier,
                'type_document' => $document->type_document,
                'type_document_label' => $document->type_document_label,
                'extension' => $document->extension,
                'taille' => $document->taille,
                'taille_formatted' => $document->taille_formatted,
                'version' => $document->version,
                'icone' => $document->icone,
                'couleur' => $document->couleur,
                'chemin' => $document->chemin,
                'url' => $document->url,
                'fichier_existe' => $document->fichier_existe,
                'dossier' => $document->dossier ? [
                    'id' => $document->dossier->id,
                    'reference' => $document->dossier->reference_unique,
                    'type_mission' => $document->dossier->type_mission_label,
                ] : null,
                'user' => $document->user ? [
                    'id' => $document->user->id,
                    'nom' => $document->user->nom_complet,
                ] : null,
                'date' => $document->date_formatted,
                'created_at' => $document->created_at->format('d/m/Y H:i'),
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

        return Inertia::render('Crm/Documents/Create', [
            'auth' => [
                'user' => $user
            ],
            'options' => [
                'dossiers' => $dossiers,
                'types_document' => $this->getTypesDocument(),
            ],
            'preselected' => [
                'dossier_id' => $dossierId,
            ],
        ]);
    }

    /**
     * Enregistre un nouveau document.
     */
    public function store(Request $request)
    {
      $validated = $request->validate([
    'dossier_id' => 'required|exists:crm_dossiers,id',
    'type_document' => 'required|in:' . implode(',', array_keys(CrmDocument::TYPES)),
    'fichier' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
]);
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');

        $validated = $request->validate([
            'dossier_id' => 'required|exists:crm_dossiers,id',
            'type_document' => 'required|in:' . implode(',', array_keys(CrmDocument::TYPES)),
            'fichier' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240', // 10MB max
        ]);

        // Vérifier que l'utilisateur a accès au dossier
        $dossier = CrmDossier::find($validated['dossier_id']);
        if (!$this->canAccessDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à ce dossier.');
        }

        // Upload du fichier
        $file = $request->file('fichier');
        $path = $file->store('documents/' . $validated['dossier_id'], 'local');
        
        // Créer le document
        $document = CrmDocument::create([
            'dossier_id' => $validated['dossier_id'],
            'user_id' => $crmUser->id,
            'type_document' => $validated['type_document'],
            'nom_fichier' => $file->getClientOriginalName(),
            'chemin' => $path,
            'extension' => $file->getClientOriginalExtension(),
            'taille' => $file->getSize(),
            'version' => $this->getNextVersion($validated['dossier_id'], $file->getClientOriginalName()),
        ]);

        return redirect()->route('crm.documents.show', $document->id)
            ->with('success', 'Document uploadé avec succès.');
    }

    /**
     * Télécharge un document.
     */
    public function download(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $document = CrmDocument::findOrFail($id);

        if (!$this->canAccessDocument($crmUser, $document)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à ce document.');
        }

        if (!Storage::disk('local')->exists($document->chemin)) {
            return redirect()->back()->with('error', 'Le fichier n\'existe pas sur le serveur.');
        }

        return response()->download(Storage::disk('local')->path($document->chemin), $document->nom_fichier);
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
        $document = CrmDocument::findOrFail($id);

        if (!$this->canEditDocument($crmUser, $document)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier ce document.');
        }

        $dossiers = $this->getDossiersAccessibles($crmUser);

        return Inertia::render('Crm/Documents/Edit', [
            'auth' => [
                'user' => $user
            ],
            'document' => [
                'id' => $document->id,
                'dossier_id' => $document->dossier_id,
                'type_document' => $document->type_document,
                'nom_fichier' => $document->nom_fichier,
            ],
            'options' => [
                'dossiers' => $dossiers,
                'types_document' => $this->getTypesDocument(),
            ],
        ]);
    }

    /**
     * Met à jour un document.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $document = CrmDocument::findOrFail($id);

        if (!$this->canEditDocument($crmUser, $document)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier ce document.');
        }

        $validated = $request->validate([
            'dossier_id' => 'required|exists:crm_dossiers,id',
            'type_document' => 'required|in:' . implode(',', array_keys(CrmDocument::TYPES)),
        ]);

        // Vérifier que l'utilisateur a accès au nouveau dossier
        $dossier = CrmDossier::find($validated['dossier_id']);
        if (!$this->canAccessDossier($crmUser, $dossier)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à ce dossier.');
        }

        $document->update([
            'dossier_id' => $validated['dossier_id'],
            'type_document' => $validated['type_document'],
        ]);

        return redirect()->route('crm.documents.show', $document->id)
            ->with('success', 'Document mis à jour avec succès.');
    }

    /**
     * Supprime un document.
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $document = CrmDocument::findOrFail($id);

        if (!$this->canDeleteDocument($crmUser, $document)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour supprimer ce document.');
        }

        // Le fichier physique est supprimé automatiquement dans le boot du modèle
        $document->delete();

        return redirect()->route('crm.documents.index')
            ->with('success', 'Document supprimé avec succès.');
    }

    /**
     * Met à jour la version d'un document.
     */
    public function updateVersion(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $crmUser = $request->get('crm_user');
        $document = CrmDocument::findOrFail($id);

        if (!$this->canEditDocument($crmUser, $document)) {
            return redirect()->back()->with('error', 'Vous n\'avez pas les droits pour modifier ce document.');
        }

        $validated = $request->validate([
            'fichier' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
        ]);

        // Upload de la nouvelle version
        $file = $request->file('fichier');
        $path = $file->store('documents/' . $document->dossier_id, 'local');

        // Créer une nouvelle version
        $newDocument = CrmDocument::create([
            'dossier_id' => $document->dossier_id,
            'user_id' => $crmUser->id,
            'type_document' => $document->type_document,
            'nom_fichier' => $file->getClientOriginalName(),
            'chemin' => $path,
            'extension' => $file->getClientOriginalExtension(),
            'taille' => $file->getSize(),
            'version' => $document->version + 1,
        ]);

        return redirect()->route('crm.documents.show', $newDocument->id)
            ->with('success', 'Nouvelle version créée avec succès.');
    }

    // ============================================
    // MÉTHODES PRIVÉES
    // ============================================

    /**
     * Vérifie si l'utilisateur peut voir tous les documents.
     */
    private function canViewAllDocuments($crmUser): bool
    {
        return $crmUser->isHuissier() || $crmUser->isSenior();
    }

    /**
     * Vérifie si l'utilisateur peut accéder à un document spécifique.
     */
    private function canAccessDocument($crmUser, $document): bool
    {
        if ($this->canViewAllDocuments($crmUser)) {
            return true;
        }

        // S'il a uploadé le document
        if ($document->user_id === $crmUser->id) {
            return true;
        }

        // S'il est responsable du dossier
        if ($document->dossier && $document->dossier->responsable_id === $crmUser->id) {
            return true;
        }

        // S'il est collaborateur sur le dossier
        if ($document->dossier && $document->dossier->collaborateurs()
                ->where('user_id', $crmUser->id)
                ->exists()) {
            return true;
        }

        return false;
    }

    /**
     * Vérifie si l'utilisateur peut modifier un document.
     */
    private function canEditDocument($crmUser, $document): bool
    {
        // Les huissiers et seniors peuvent tout modifier
        if ($crmUser->isHuissier() || $crmUser->isSenior()) {
            return true;
        }

        // Le créateur peut modifier son document
        return $document->user_id === $crmUser->id;
    }

    /**
     * Vérifie si l'utilisateur peut supprimer un document.
     */
    private function canDeleteDocument($crmUser, $document): bool
    {
        return $crmUser->isHuissier() || $document->user_id === $crmUser->id;
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
            $total = CrmDocument::count();
            $totalTaille = CrmDocument::sum('taille');
            $entrants = CrmDocument::where('type_document', 'entrant')->count();
            $produits = CrmDocument::where('type_document', 'produit')->count();
            $transmis = CrmDocument::where('type_document', 'transmis')->count();
            $pdfs = CrmDocument::where('extension', 'pdf')->count();
            $images = CrmDocument::whereIn('extension', ['jpg', 'jpeg', 'png', 'gif'])->count();
        } else {
            $documentIds = CrmDocument::where(function ($q) use ($crmUser) {
                $q->where('user_id', $crmUser->id)
                  ->orWhereHas('dossier', function ($dq) use ($crmUser) {
                      $dq->where('responsable_id', $crmUser->id)
                         ->orWhereHas('collaborateurs', function ($cq) use ($crmUser) {
                             $cq->where('user_id', $crmUser->id);
                         });
                  });
            })->pluck('id');

            $total = $documentIds->count();
            $totalTaille = CrmDocument::whereIn('id', $documentIds)->sum('taille');
            $entrants = CrmDocument::whereIn('id', $documentIds)->where('type_document', 'entrant')->count();
            $produits = CrmDocument::whereIn('id', $documentIds)->where('type_document', 'produit')->count();
            $transmis = CrmDocument::whereIn('id', $documentIds)->where('type_document', 'transmis')->count();
            $pdfs = CrmDocument::whereIn('id', $documentIds)->where('extension', 'pdf')->count();
            $images = CrmDocument::whereIn('id', $documentIds)->whereIn('extension', ['jpg', 'jpeg', 'png', 'gif'])->count();
        }

        return [
            'total' => $total,
            'total_taille' => $totalTaille,
            'entrants' => $entrants,
            'produits' => $produits,
            'transmis' => $transmis,
            'pdfs' => $pdfs,
            'images' => $images,
            'evolution' => 10,
        ];
    }

    /**
     * Récupère la liste des types de documents.
     */
    private function getTypesDocument(): array
    {
        return collect(CrmDocument::TYPES)->map(function ($label, $value) {
            return [
                'value' => $value,
                'label' => $label,
            ];
        })->values()->toArray();
    }

    /**
     * Récupère la liste des extensions disponibles.
     */
    private function getExtensions(): array
    {
        $extensions = CrmDocument::distinct()
            ->whereNotNull('extension')
            ->orderBy('extension')
            ->pluck('extension')
            ->toArray();

        return collect($extensions)->map(function ($ext) {
            return [
                'value' => $ext,
                'label' => strtoupper($ext),
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
            ];
        })->toArray();
    }

    /**
     * Détermine la prochaine version pour un fichier.
     */
    private function getNextVersion($dossierId, $nomFichier): int
    {
        $lastVersion = CrmDocument::where('dossier_id', $dossierId)
            ->where('nom_fichier', 'like', "%{$nomFichier}%")
            ->max('version');

        return ($lastVersion ?? 0) + 1;
    }
}
