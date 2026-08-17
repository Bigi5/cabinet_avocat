<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\LogsActivities;

class CrmActe extends Model
{
    use HasFactory;
    use LogsActivities;

    // ============================================
    // CONSTANTES - TYPES D'ACTES
    // ============================================

    public const TYPES_ACTES = [
        'assignation'   => 'Assignation',
        'conclusion'    => 'Conclusion',
        'requete'       => 'Requête',
        'appel'         => 'Appel',
        'contrat'       => 'Contrat',
        'testament'     => 'Testament',
        'donation'      => 'Donation',
        'signification' => 'Signification',
        'commandement'  => 'Commandement',
        'autre'         => 'Autre',
    ];

    /**
     * La table associée au modèle.
     *
     * @var string
     */
    protected $table = 'crm_actes';

    /**
     * Les attributs qui ne sont pas assignables massivement.
     *
     * @var array
     */
    protected $guarded = ['id'];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array
     */
    protected $casts = [
        'horodatage' => 'datetime',
        'created_at' => 'datetime',
    ];

    /**
     * Désactive les timestamps si la table n'a pas updated_at
     */
    public $timestamps = true; // Garde true car tu as created_at

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
     * Relation avec l'utilisateur qui a créé l'acte.
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
     * Scope pour filtrer par utilisateur.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope pour les actes récents.
     */
    public function scopeRecents($query, $limit = 10)
    {
        return $query->orderBy('horodatage', 'desc')->limit($limit);
    }

    // ============================================
    // ACCESSORS
    // ============================================

    /**
     * Obtenir le libellé du type d'acte.
     */
    public function getTypeActeLabelAttribute(): string
    {
        return self::TYPES_ACTES[$this->type_acte] ?? ucfirst($this->type_acte);
    }

    /**
     * Obtenir la date formatée.
     */
    public function getDateFormattedAttribute(): string
    {
        return $this->horodatage ? $this->horodatage->format('d/m/Y H:i') : '';
    }

    /**
     * Obtenir le nom court de l'acte.
     */
    public function getNomCourtAttribute(): string
    {
        $description = $this->description ?? '';
        return substr($description, 0, 50) . (strlen($description) > 50 ? '...' : '');
    }

    // ============================================
    // MUTATORS
    // ============================================

    /**
     * Définir l'horodatage automatiquement si non fourni.
     */
    protected static function booted()
    {
        static::creating(function ($acte) {
            if (!$acte->horodatage) {
                $acte->horodatage = now();
            }
        });
    }
}