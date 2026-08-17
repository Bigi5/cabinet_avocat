<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;
use App\Traits\LogsActivities;

class CrmDocument extends Model
{
    use HasFactory;
    use LogsActivities;

    /**
     * La table associée au modèle.
     *
     * @var string
     */
    protected $table = 'crm_documents';

    /**
     * Les attributs qui ne sont pas assignables massivement.
     *
     * @var array
     */
    protected $guarded = ['id'];

    /**
     * Indique si le modèle doit être timestampé.
     * La table a seulement created_at, pas updated_at
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array
     */
    protected $casts = [
        'taille' => 'integer',
        'version' => 'integer',
        'created_at' => 'datetime',
    ];

    // ============================================
    // CONSTANTES
    // ============================================

    const TYPE_ENTRANT = 'entrant';
    const TYPE_PRODUIT = 'produit';
    const TYPE_TRANSMIS = 'transmis';

    const TYPES = [
        self::TYPE_ENTRANT => 'Document entrant',
        self::TYPE_PRODUIT => 'Document produit',
        self::TYPE_TRANSMIS => 'Document transmis',
    ];

    // ============================================
    // RELATIONS
    // ============================================

    /**
     * Relation avec le dossier parent.
     */
    public function dossier()
    {
        return $this->belongsTo(CrmDossier::class, 'dossier_id');
    }

    /**
     * Relation avec l'utilisateur qui a uploadé le document.
     */
    public function user()
    {
        return $this->belongsTo(CrmUser::class, 'user_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope pour filtrer par dossier.
     */
    public function scopeByDossier($query, $dossierId)
    {
        return $query->where('dossier_id', $dossierId);
    }

    /**
     * Scope pour filtrer par type de document.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type_document', $type);
    }

    /**
     * Scope pour les documents entrants.
     */
    public function scopeEntrants($query)
    {
        return $query->where('type_document', self::TYPE_ENTRANT);
    }

    /**
     * Scope pour les documents produits.
     */
    public function scopeProduits($query)
    {
        return $query->where('type_document', self::TYPE_PRODUIT);
    }

    /**
     * Scope pour les documents transmis.
     */
    public function scopeTransmis($query)
    {
        return $query->where('type_document', self::TYPE_TRANSMIS);
    }

    /**
     * Scope pour les documents récents.
     */
    public function scopeRecents($query, $limit = 20)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    /**
     * Scope pour rechercher par nom de fichier.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('nom_fichier', 'like', "%{$search}%");
    }

    // ============================================
    // ACCESSORS
    // ============================================

    /**
     * Obtenir le libellé du type de document.
     */
    public function getTypeDocumentLabelAttribute(): string
    {
        return self::TYPES[$this->type_document] ?? $this->type_document;
    }

    /**
     * Obtenir la taille formatée (o, Ko, Mo, Go).
     */
    public function getTailleFormattedAttribute(): string
    {
        $bytes = $this->taille ?? 0;
        $units = ['o', 'Ko', 'Mo', 'Go', 'To'];

        for ($i = 0; $bytes >= 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Obtenir le chemin complet du fichier.
     */
    public function getCheminCompletAttribute(): string
    {
        return $this->chemin ? Storage::disk('local')->path($this->chemin) : '';
    }

    /**
     * Vérifier si le fichier existe.
     */
    public function getFichierExisteAttribute(): bool
    {
        return $this->chemin && Storage::disk('local')->exists($this->chemin);
    }

    /**
     * Obtenir l'URL de téléchargement.
     */
    public function getUrlAttribute(): string
    {
        return $this->chemin ? route('crm.documents.download', $this->id) : '';
    }

    /**
     * Obtenir l'icône selon l'extension.
     */
    public function getIconeAttribute(): string
    {
        $extension = strtolower($this->extension ?? '');
        
        $icons = [
            'pdf' => 'file-text',
            'doc' => 'file-text',
            'docx' => 'file-text',
            'xls' => 'file-spreadsheet',
            'xlsx' => 'file-spreadsheet',
            'jpg' => 'image',
            'jpeg' => 'image',
            'png' => 'image',
            'gif' => 'image',
            'zip' => 'archive',
            'rar' => 'archive',
        ];

        return $icons[$extension] ?? 'file';
    }

    /**
     * Obtenir la couleur selon l'extension.
     */
    public function getCouleurAttribute(): string
    {
        $extension = strtolower($this->extension ?? '');
        
        $colors = [
            'pdf' => 'text-red-600 bg-red-50',
            'doc' => 'text-blue-600 bg-blue-50',
            'docx' => 'text-blue-600 bg-blue-50',
            'xls' => 'text-green-600 bg-green-50',
            'xlsx' => 'text-green-600 bg-green-50',
            'jpg' => 'text-purple-600 bg-purple-50',
            'jpeg' => 'text-purple-600 bg-purple-50',
            'png' => 'text-purple-600 bg-purple-50',
        ];

        return $colors[$extension] ?? 'text-gray-600 bg-gray-50';
    }

    /**
     * Obtenir la date formatée.
     */
    public function getDateFormattedAttribute(): string
    {
        return $this->created_at ? $this->created_at->format('d/m/Y H:i') : '';
    }

    /**
     * Obtenir le nom court du fichier.
     */
    public function getNomCourtAttribute(): string
    {
        return substr($this->nom_fichier, 0, 30) . (strlen($this->nom_fichier) > 30 ? '...' : '');
    }

    // ============================================
    // MUTATORS
    // ============================================

    /**
     * Définir la version par défaut si non fournie.
     */
    protected static function booted()
    {
        static::creating(function ($document) {
            if (!$document->version) {
                $document->version = 1;
            }
            if (!$document->created_at) {
                $document->created_at = now();
            }
        });
    }

    /**
     * Supprimer le fichier physique quand le modèle est supprimé.
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($document) {
            if ($document->chemin && Storage::disk('local')->exists($document->chemin)) {
                Storage::disk('local')->delete($document->chemin);
            }
        });
    }
}
