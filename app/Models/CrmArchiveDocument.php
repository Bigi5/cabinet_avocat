<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CrmArchiveDocument extends Model
{
    use HasFactory;

    /**
     * ✅ Constantes pour les extensions de fichiers
     */
    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    private const OFFICE_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    private const PDF_EXTENSIONS = ['pdf'];
    private const ARCHIVE_EXTENSIONS = ['zip', 'rar', '7z', 'tar', 'gz'];

    /**
     * ✅ Mapping des icônes par extension
     */
    private const ICON_MAP = [
        'pdf' => 'file-pdf',
        'doc' => 'file-word',
        'docx' => 'file-word',
        'xls' => 'file-excel',
        'xlsx' => 'file-excel',
        'ppt' => 'file-powerpoint',
        'pptx' => 'file-powerpoint',
        'jpg' => 'file-image',
        'jpeg' => 'file-image',
        'png' => 'file-image',
        'gif' => 'file-image',
        'bmp' => 'file-image',
        'svg' => 'file-image',
        'webp' => 'file-image',
        'zip' => 'file-archive',
        'rar' => 'file-archive',
        '7z' => 'file-archive',
        'tar' => 'file-archive',
        'gz' => 'file-archive',
        'txt' => 'file-text',
        'csv' => 'file-text',
        'json' => 'file-code',
        'xml' => 'file-code',
        'html' => 'file-code',
        'css' => 'file-code',
        'js' => 'file-code',
    ];

    protected $table = 'crm_archive_documents';

    protected $fillable = [
        'archive_id',
        'nom_original',
        'nom_stockage',
        'chemin',
        'extension',
        'mime_type',
        'taille',
        'description',
        'version',
        'ordre',
        'est_principal',
        'ajoute_par',
    ];

    protected $casts = [
        'est_principal' => 'boolean',
        'taille' => 'integer',
        'version' => 'integer',
        'ordre' => 'integer',
    ];

    /**
     * ✅ Accesseurs inclus dans les réponses JSON/API
     * Uniquement ceux utiles pour le front-end
     */
    protected $appends = [
        'taille_lisible',
        'url',
        'icone',
        'est_image',
        'est_pdf',
        'est_office',
        'est_archive',
    ];

    /**
     * ✅ Relations
     */
    public function archive()
    {
        return $this->belongsTo(CrmArchive::class, 'archive_id');
    }

    public function ajoutePar()
    {
        return $this->belongsTo(CrmUser::class, 'ajoute_par');
    }

    /**
     * ✅ Vérifie si le fichier existe sur le disque
     */
    public function existe(): bool
    {
        return Storage::disk('local')->exists($this->chemin);
    }

    /**
     * ✅ Supprime le fichier physique
     */
    public function supprimerFichier(): bool
    {
        if ($this->existe()) {
            return Storage::disk('local')->delete($this->chemin);
        }
        return false;
    }

    /**
     * ✅ Accesseurs - Taille lisible
     */
    public function getTailleLisibleAttribute(): string
    {
        $size = $this->taille;

        if ($size >= 1073741824) {
            return round($size / 1073741824, 2) . ' Go';
        }

        if ($size >= 1048576) {
            return round($size / 1048576, 2) . ' Mo';
        }

        if ($size >= 1024) {
            return round($size / 1024, 2) . ' Ko';
        }

        return $size . ' octets';
    }

    /**
     * ✅ Accesseur - URL publique
     */
    public function getUrlAttribute(): string
    {
        return route('crm.archives.documents.download', ['document' => $this->id]);
    }

    /**
     * ✅ Accesseur - Icône
     */
    public function getIconeAttribute(): string
    {
        return self::ICON_MAP[$this->extension] ?? 'file';
    }

    /**
     * ✅ Accesseurs - Types de fichiers
     */
    public function getEstImageAttribute(): bool
    {
        return in_array($this->extension, self::IMAGE_EXTENSIONS);
    }

    public function getEstPdfAttribute(): bool
    {
        return in_array($this->extension, self::PDF_EXTENSIONS);
    }

    public function getEstOfficeAttribute(): bool
    {
        return in_array($this->extension, self::OFFICE_EXTENSIONS);
    }

    public function getEstArchiveAttribute(): bool
    {
        return in_array($this->extension, self::ARCHIVE_EXTENSIONS);
    }

    /**
     * ✅ Scopes personnalisés
     */
    public function scopePrincipaux($query)
    {
        return $query->where('est_principal', true);
    }

    public function scopeOrdonnes($query)
    {
        return $query->orderBy('ordre', 'asc');
    }

    public function scopeImages($query)
    {
        return $query->whereIn('extension', self::IMAGE_EXTENSIONS);
    }

    public function scopePdfs($query)
    {
        return $query->whereIn('extension', self::PDF_EXTENSIONS);
    }

    public function scopeOffice($query)
    {
        return $query->whereIn('extension', self::OFFICE_EXTENSIONS);
    }

    public function scopeArchives($query)
    {
        return $query->whereIn('extension', self::ARCHIVE_EXTENSIONS);
    }

    public function scopeExtension($query, string $extension)
    {
        return $query->where('extension', strtolower($extension));
    }

    public function scopeAjoutePar($query, int $userId)
    {
        return $query->where('ajoute_par', $userId);
    }

    public function scopeVersion($query, int $version)
    {
        return $query->where('version', $version);
    }

    /**
     * ✅ Méthodes utilitaires statiques
     */
    public static function getExtensionsAutorisees(): array
    {
        return array_keys(self::ICON_MAP);
    }

    public static function getExtensionsPourType(string $type): array
    {
        return match ($type) {
            'image' => self::IMAGE_EXTENSIONS,
            'office' => self::OFFICE_EXTENSIONS,
            'pdf' => self::PDF_EXTENSIONS,
            'archive' => self::ARCHIVE_EXTENSIONS,
            default => [],
        };
    }
}
