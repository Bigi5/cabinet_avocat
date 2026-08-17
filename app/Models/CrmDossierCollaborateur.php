<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmDossierCollaborateur extends Pivot
{
    use HasFactory;

    /**
     * La table associée au modèle.
     *
     * @var string
     */
    protected $table = 'crm_dossier_collaborateurs';

    /**
     * Indique si le modèle doit être timestampé.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * Les attributs qui sont assignables massivement.
     *
     * @var array
     */
    protected $fillable = [
        'dossier_id',
        'user_id',
        'role_assignation',
    ];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime',
    ];

    // ============================================
    // CONSTANTES
    // ============================================

    const ROLE_PRINCIPAL = 'principal';
    const ROLE_SECONDAIRE = 'secondaire';
    const ROLE_CONSULTANT = 'consultant';

    const ROLES = [
        self::ROLE_PRINCIPAL => 'Principal',
        self::ROLE_SECONDAIRE => 'Secondaire',
        self::ROLE_CONSULTANT => 'Consultant',
    ];

    // ============================================
    // RELATIONS
    // ============================================

    /**
     * Relation avec le dossier.
     */
    public function dossier()
    {
        return $this->belongsTo(CrmDossier::class, 'dossier_id');
    }

    /**
     * Relation avec l'utilisateur (collaborateur).
     */
    public function user()
    {
        return $this->belongsTo(CrmUser::class, 'user_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope pour filtrer par rôle.
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role_assignation', $role);
    }

    /**
     * Scope pour les collaborateurs principaux.
     */
    public function scopePrincipaux($query)
    {
        return $query->where('role_assignation', self::ROLE_PRINCIPAL);
    }

    /**
     * Scope pour les collaborateurs secondaires.
     */
    public function scopeSecondaires($query)
    {
        return $query->where('role_assignation', self::ROLE_SECONDAIRE);
    }

    /**
     * Scope pour les consultants.
     */
    public function scopeConsultants($query)
    {
        return $query->where('role_assignation', self::ROLE_CONSULTANT);
    }

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

    // ============================================
    // ACCESSORS
    // ============================================

    /**
     * Obtenir le libellé du rôle.
     */
    public function getRoleLabelAttribute(): string
    {
        return self::ROLES[$this->role_assignation] ?? $this->role_assignation;
    }

    /**
     * Obtenir la couleur du rôle.
     */
    public function getRoleColorAttribute(): string
    {
        $colors = [
            self::ROLE_PRINCIPAL => 'bg-green-100 text-green-800',
            self::ROLE_SECONDAIRE => 'bg-blue-100 text-blue-800',
            self::ROLE_CONSULTANT => 'bg-purple-100 text-purple-800',
        ];

        return $colors[$this->role_assignation] ?? 'bg-gray-100 text-gray-800';
    }

    /**
     * Vérifier si c'est le rôle principal.
     */
    public function getEstPrincipalAttribute(): bool
    {
        return $this->role_assignation === self::ROLE_PRINCIPAL;
    }

    /**
     * Vérifier si c'est un rôle secondaire.
     */
    public function getEstSecondaireAttribute(): bool
    {
        return $this->role_assignation === self::ROLE_SECONDAIRE;
    }

    /**
     * Vérifier si c'est un consultant.
     */
    public function getEstConsultantAttribute(): bool
    {
        return $this->role_assignation === self::ROLE_CONSULTANT;
    }

    /**
     * Obtenir la date formatée.
     */
    public function getDateFormattedAttribute(): string
    {
        return $this->created_at ? $this->created_at->format('d/m/Y H:i') : '';
    }
}