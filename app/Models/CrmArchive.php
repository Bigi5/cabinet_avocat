<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmArchive extends Model
{
    use HasFactory;

    // ============================================
    // CONSTANTES - MOTIFS D'ARCHIVAGE
    // ============================================
    public const MOTIF_CLOTURE = 'cloture';
    public const MOTIF_INACTIF = 'inactif';
    public const MOTIF_ANCIEN = 'ancien';
    public const MOTIF_LITIGE_RESOLU = 'litige_resolu';
    public const MOTIF_AUTRE = 'autre';
    public const MOTIF_ARCHIVAGE_PHYSIQUE = 'archivage_physique';

    // ============================================
    // CONSTANTES - TYPES D'ARCHIVE
    // ============================================
    public const TYPE_DOSSIER = 'dossier';
    public const TYPE_DOCUMENT = 'document';
    public const TYPE_ACTE = 'acte';
    public const TYPE_FACTURE = 'facture';
    public const TYPE_BAIL = 'bail';
    public const TYPE_PHYSIQUE = 'physique';

    // ============================================
    // CONSTANTES - STATUTS
    // ============================================
    public const STATUT_ARCHIVE = 'archive';
    public const STATUT_EN_COURS_RESTAURATION = 'en_cours_de_restauration';
    public const STATUT_RESTAURE = 'restaure';
    public const STATUT_SUPPRIME = 'supprime';

    // ============================================
    // CONSTANTES - SOURCES
    // ============================================
    public const SOURCE_PHYSIQUE = 'physique';
    public const SOURCE_DOSSIER = 'dossier';
    public const SOURCE_DOCUMENT = 'document';

    protected $table = 'crm_archives';

    protected $fillable = [
        'reference',
        'type',
        'type_label',
        'source',
        'original_id',
        'original_reference',
        'titre',
        'categorie',
        'description',
        'date_archivage',
        'motif',
        'motif_label',
        'motif_commentaire',
        'statut',
        'emplacement_id',
        'emplacement_detail',
        'duree_conservation_mois',
        'date_destruction',
        'fichier_chemin',
        'fichier_nom',
        'notes',
        'metadonnees',
        'archive_par',
        'restaure_par',
        'date_restauration',
    ];

    protected $casts = [
        'date_archivage' => 'date',
        'date_restauration' => 'date',
        'date_destruction' => 'date',
        'metadonnees' => 'array',
        'duree_conservation_mois' => 'integer',
    ];

    // ============================================
    // RELATIONS
    // ============================================
    
    /**
     * Emplacement physique de l'archive
     */
    public function emplacement()
    {
        return $this->belongsTo(CrmEmplacement::class, 'emplacement_id');
    }

    /**
     * Utilisateur ayant archivé
     */
    public function archivePar()
    {
        return $this->belongsTo(CrmUser::class, 'archive_par');
    }

    /**
     * Utilisateur ayant restauré
     */
    public function restaurePar()
    {
        return $this->belongsTo(CrmUser::class, 'restaure_par');
    }

    /**
     * Documents associés à l'archive
     */
    public function documents()
    {
        return $this->hasMany(CrmArchiveDocument::class, 'archive_id')
            ->orderBy('ordre')
            ->orderBy('created_at');
    }

    /**
     * Historique des actions sur l'archive
     */
    public function historiques()
    {
        return $this->hasMany(CrmArchiveHistorique::class, 'archive_id')
            ->latest();
    }

    // ============================================
    // SCOPES
    // ============================================
    
    /**
     * Scope pour les archives actives (statut = archive)
     */
    public function scopeArchives($query)
    {
        return $query->where('statut', self::STATUT_ARCHIVE);
    }

    /**
     * Scope pour les archives en cours de restauration
     */
    public function scopeEnCoursDeRestauration($query)
    {
        return $query->where('statut', self::STATUT_EN_COURS_RESTAURATION);
    }

    /**
     * Scope pour les archives restaurées
     */
    public function scopeRestaurées($query)
    {
        return $query->where('statut', self::STATUT_RESTAURE);
    }

    /**
     * Scope pour les archives physiques
     */
    public function scopePhysiques($query)
    {
        return $query->where('type', self::TYPE_PHYSIQUE);
    }

    /**
     * Scope pour les archives par type
     */
    public function scopeDeType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope pour les archives par statut
     */
    public function scopeDeStatut($query, string $statut)
    {
        return $query->where('statut', $statut);
    }

    /**
     * Scope pour les archives par motif
     */
    public function scopeAvecMotif($query, string $motif)
    {
        return $query->where('motif', $motif);
    }

    /**
     * Scope pour les archives par catégorie
     */
    public function scopeCategorie($query, string $categorie)
    {
        return $query->where('categorie', $categorie);
    }

    /**
     * Scope pour les archives avec emplacement
     */
    public function scopeAvecEmplacement($query)
    {
        return $query->whereNotNull('emplacement_id');
    }

    /**
     * Scope pour les archives sans emplacement
     */
    public function scopeSansEmplacement($query)
    {
        return $query->whereNull('emplacement_id');
    }

    /**
     * Scope pour les archives créées après une date
     */
    public function scopeCreeApres($query, $date)
    {
        return $query->whereDate('created_at', '>=', $date);
    }

    /**
     * Scope pour les archives créées avant une date
     */
    public function scopeCreeAvant($query, $date)
    {
        return $query->whereDate('created_at', '<=', $date);
    }

    // ============================================
    // ACCESSORS
    // ============================================
    
    /**
     * Récupère le libellé du type
     */
    public function getTypeLabelAttribute(): string
    {
        $labels = [
            self::TYPE_DOSSIER => 'Dossier',
            self::TYPE_DOCUMENT => 'Document',
            self::TYPE_ACTE => 'Acte',
            self::TYPE_FACTURE => 'Facture',
            self::TYPE_BAIL => 'Bail',
            self::TYPE_PHYSIQUE => 'Physique',
        ];
        return $labels[$this->type] ?? $this->type;
    }

    /**
     * Récupère le libellé du motif
     */
    public function getMotifLabelAttribute(): string
    {
        $labels = [
            self::MOTIF_CLOTURE => 'Clôture du dossier',
            self::MOTIF_INACTIF => 'Dossier inactif',
            self::MOTIF_ANCIEN => 'Document ancien',
            self::MOTIF_LITIGE_RESOLU => 'Litige résolu',
            self::MOTIF_AUTRE => 'Autre motif',
            self::MOTIF_ARCHIVAGE_PHYSIQUE => 'Archive physique',
        ];
        return $labels[$this->motif] ?? $this->motif;
    }

    /**
     * Récupère le libellé du statut
     */
    public function getStatutLabelAttribute(): string
    {
        $labels = [
            self::STATUT_ARCHIVE => 'Archivé',
            self::STATUT_EN_COURS_RESTAURATION => 'En cours de restauration',
            self::STATUT_RESTAURE => 'Restauré',
            self::STATUT_SUPPRIME => 'Supprimé',
        ];
        return $labels[$this->statut] ?? $this->statut;
    }

    /**
     * Récupère la couleur associée au statut
     */
    public function getStatutColorAttribute(): string
    {
        $colors = [
            self::STATUT_ARCHIVE => 'gray',
            self::STATUT_EN_COURS_RESTAURATION => 'yellow',
            self::STATUT_RESTAURE => 'green',
            self::STATUT_SUPPRIME => 'red',
        ];
        return $colors[$this->statut] ?? 'gray';
    }

    /**
     * Vérifie si l'archive est active
     */
    public function getEstActiveAttribute(): bool
    {
        return $this->statut === self::STATUT_ARCHIVE;
    }

    /**
     * Vérifie si l'archive est en restauration
     */
    public function getEstEnRestaurationAttribute(): bool
    {
        return $this->statut === self::STATUT_EN_COURS_RESTAURATION;
    }

    /**
     * Vérifie si l'archive est restaurée
     */
    public function getEstRestaureeAttribute(): bool
    {
        return $this->statut === self::STATUT_RESTAURE;
    }

    /**
     * Vérifie si l'archive est supprimée
     */
    public function getEstSupprimeeAttribute(): bool
    {
        return $this->statut === self::STATUT_SUPPRIME;
    }

    /**
     * Vérifie si l'archive est physique
     */
    public function getEstPhysiqueAttribute(): bool
    {
        return $this->type === self::TYPE_PHYSIQUE;
    }

    /**
     * Vérifie si l'archive est numérique (dossier, document, acte, facture, bail)
     */
    public function getEstNumeriqueAttribute(): bool
    {
        return in_array($this->type, [
            self::TYPE_DOSSIER,
            self::TYPE_DOCUMENT,
            self::TYPE_ACTE,
            self::TYPE_FACTURE,
            self::TYPE_BAIL,
        ]);
    }

    /**
     * Récupère le nombre de documents
     */
    public function getDocumentsCountAttribute(): int
    {
        return $this->documents()->count();
    }

    /**
     * Récupère le nombre d'historiques
     */
    public function getHistoriquesCountAttribute(): int
    {
        return $this->historiques()->count();
    }

    /**
     * Récupère le chemin complet du fichier (pour les archives physiques)
     */
    public function getCheminCompletAttribute(): ?string
    {
        if (!$this->fichier_chemin) {
            return null;
        }
        return \Storage::disk('local')->path($this->fichier_chemin);
    }

    /**
     * Vérifie si le fichier existe (pour les archives physiques)
     */
    public function getFichierExisteAttribute(): bool
    {
        if (!$this->fichier_chemin) {
            return false;
        }
        return \Storage::disk('local')->exists($this->fichier_chemin);
    }

    // ============================================
    // MÉTHODES MÉTIER
    // ============================================
    
    /**
     * Marque l'archive comme restaurée
     */
    public function marquerRestaurée(int $userId): bool
    {
        return $this->update([
            'statut' => self::STATUT_RESTAURE,
            'date_restauration' => now(),
            'restaure_par' => $userId,
        ]);
    }

    /**
     * Marque l'archive comme en cours de restauration
     */
    public function marquerEnRestauration(): bool
    {
        return $this->update([
            'statut' => self::STATUT_EN_COURS_RESTAURATION,
        ]);
    }

    /**
     * Marque l'archive comme supprimée
     */
    public function marquerSupprimée(): bool
    {
        return $this->update([
            'statut' => self::STATUT_SUPPRIME,
        ]);
    }

    /**
     * Vérifie si l'archive peut être restaurée
     */
    public function peutEtreRestaurée(): bool
    {
        return $this->statut === self::STATUT_ARCHIVE;
    }

    /**
     * Vérifie si l'archive peut être supprimée
     */
    public function peutEtreSupprimée(): bool
    {
        return $this->statut !== self::STATUT_SUPPRIME;
    }

    /**
     * Vérifie si l'archive a des documents
     */
    public function aDesDocuments(): bool
    {
        return $this->documents()->exists();
    }

    /**
     * Récupère le document principal
     */
    public function getDocumentPrincipal()
    {
        return $this->documents()
            ->where('est_principal', true)
            ->first();
    }

    /**
     * Récupère les documents par type
     */
    public function getDocumentsParType(string $extension)
    {
        return $this->documents()
            ->where('extension', $extension)
            ->get();
    }

    /**
     * Récupère les images de l'archive
     */
    public function getImages()
    {
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        return $this->documents()
            ->whereIn('extension', $imageExtensions)
            ->get();
    }

    /**
     * Récupère les PDF de l'archive
     */
    public function getPdfs()
    {
        return $this->documents()
            ->where('extension', 'pdf')
            ->get();
    }

    // ============================================
    // MÉTHODES STATIQUES
    // ============================================
    
    /**
     * Génère une référence unique
     */
    public static function genererReference(string $type = 'ARCH'): string
    {
        $count = self::whereDate('created_at', today())->count() + 1;
        return $type . '-' . now()->format('Ymd') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Récupère tous les motifs disponibles
     */
    public static function getMotifs(): array
    {
        return [
            self::MOTIF_CLOTURE => 'Clôture du dossier',
            self::MOTIF_INACTIF => 'Dossier inactif',
            self::MOTIF_ANCIEN => 'Document ancien',
            self::MOTIF_LITIGE_RESOLU => 'Litige résolu',
            self::MOTIF_AUTRE => 'Autre motif',
            self::MOTIF_ARCHIVAGE_PHYSIQUE => 'Archive physique',
        ];
    }

    /**
     * Récupère tous les types disponibles
     */
    public static function getTypes(): array
    {
        return [
            self::TYPE_DOSSIER => 'Dossier',
            self::TYPE_DOCUMENT => 'Document',
            self::TYPE_ACTE => 'Acte',
            self::TYPE_FACTURE => 'Facture',
            self::TYPE_BAIL => 'Bail',
            self::TYPE_PHYSIQUE => 'Physique',
        ];
    }

    /**
     * Récupère tous les statuts disponibles
     */
    public static function getStatuts(): array
    {
        return [
            self::STATUT_ARCHIVE => 'Archivé',
            self::STATUT_EN_COURS_RESTAURATION => 'En cours de restauration',
            self::STATUT_RESTAURE => 'Restauré',
            self::STATUT_SUPPRIME => 'Supprimé',
        ];
    }

    /**
     * Récupère les couleurs par statut
     */
    public static function getStatutColors(): array
    {
        return [
            self::STATUT_ARCHIVE => 'gray',
            self::STATUT_EN_COURS_RESTAURATION => 'yellow',
            self::STATUT_RESTAURE => 'green',
            self::STATUT_SUPPRIME => 'red',
        ];
    }
}
