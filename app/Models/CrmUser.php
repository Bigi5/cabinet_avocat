<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\CrmRole;
use App\Services\Crm\CrmAuthorization;
use App\Traits\LogsActivities;
use Illuminate\Notifications\Notifiable;

class CrmUser extends Model
{
    use HasFactory;
    use LogsActivities;
        use Notifiable;

    /**
     * La table associée au modèle.
     *
     * @var string
     */
    protected $table = 'crm_users';

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
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ============================================
    // CONSTANTES
    // ============================================

    const ROLE_HUISSIER = 'huissier';
    const ROLE_SENIOR = 'senior';
    const ROLE_SECRETAIRE = 'secretaire';
    const ROLE_ASSISTANTE = 'assistante';
    const ROLE_ASSISTANT = self::ROLE_ASSISTANTE;
    const ROLE_GESTIONNAIRE_BAUX = 'gestionnaire_baux';
    const ROLE_CLIENT = 'client';

    const ROLES = [
        self::ROLE_HUISSIER => 'Huissier',
        self::ROLE_SENIOR => 'Senior',
        self::ROLE_SECRETAIRE => 'Secrétaire',
        self::ROLE_ASSISTANTE => 'Assistante',
        self::ROLE_GESTIONNAIRE_BAUX => 'Gestionnaire de baux',
        self::ROLE_CLIENT => 'Client',
    ];

    const STATUT_ACTIF = 'actif';
    const STATUT_INACTIF = 'inactif';

    const STATUTS = [
        self::STATUT_ACTIF => 'Actif',
        self::STATUT_INACTIF => 'Inactif',
    ];

    // ============================================
    // RELATIONS EXISTANTES
    // ============================================

    /**
     * Relation avec les dossiers dont il est responsable principal.
     */
    public function dossiers()
    {
        return $this->hasMany(CrmDossier::class, 'responsable_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // ============================================
    // NOUVELLES RELATIONS
    // ============================================

    /**
     * Relation avec les actes qu'il a créés.
     */
    public function actes()
    {
        return $this->hasMany(CrmActe::class, 'user_id');
    }

    /**
     * Relation avec les documents qu'il a uploadés.
     */
    public function documents()
    {
        return $this->hasMany(CrmDocument::class, 'user_id');
    }

    /**
     * Relation avec les échéances qui lui sont assignées.
     */
    public function echeances()
    {
        return $this->hasMany(CrmEcheance::class, 'user_id');
    }

    /**
     * Relation avec les dossiers où il est collaborateur (via table pivot).
     */
    public function dossiersCollaboration()
    {
        return $this->belongsToMany(CrmDossier::class, 'crm_dossier_collaborateurs', 'user_id', 'dossier_id')
                    ->withPivot('role_assignation')
                    ->withTimestamps();
    }

    /**
     * Relation avec les dossiers où il est collaborateur principal.
     */
    public function dossiersCollaborationPrincipale()
    {
        return $this->belongsToMany(CrmDossier::class, 'crm_dossier_collaborateurs', 'user_id', 'dossier_id')
                    ->wherePivot('role_assignation', 'principal')
                    ->withPivot('role_assignation');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope pour les utilisateurs actifs.
     */
    public function scopeActifs($query)
    {
        return $query->where('statut', self::STATUT_ACTIF);
    }

    /**
     * Scope pour les huissiers.
     */
    public function scopeHuissiers($query)
    {
        return $query->where('role', self::ROLE_HUISSIER);
    }

    /**
     * Scope pour les avocats (huissier + senior).
     */
    public function scopeAvocats($query)
    {
        return $query->whereIn('role', [
            self::ROLE_HUISSIER,
            self::ROLE_SENIOR,
        ]);
    }

    /**
     * Scope pour les avocats seniors.
     */
    public function scopeSeniors($query)
    {
        return $query->where('role', self::ROLE_SENIOR);
    }

    /**
     * Scope pour les secrétaires.
     */
    public function scopeSecretaires($query)
    {
        return $query->where('role', self::ROLE_SECRETAIRE);
    }

    /**
     * Scope pour les assistantes.
     */
    public function scopeAssistantes($query)
    {
        return $query->where('role', self::ROLE_ASSISTANTE);
    }

    /**
     * Scope pour les juniors / assistantes héritées.
     */
    public function scopeJuniors($query)
    {
        return $query->whereIn('role', [
            self::ROLE_ASSISTANTE,
            'junior',
            'collaborateur',
        ]);
    }

    /**
     * Scope pour les gestionnaires de baux.
     */
    public function scopeGestionnairesBaux($query)
    {
        return $query->where('role', self::ROLE_GESTIONNAIRE_BAUX);
    }

    /**
     * Scope pour filtrer par rôle.
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope pour rechercher par nom ou email.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nom', 'like', "%{$search}%")
              ->orWhere('prenom', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('telephone', 'like', "%{$search}%");
        });
    }

    // ============================================
    // PERMISSIONS (celles que tu avais déjà)
    // ============================================

    public function roleEnum(): ?CrmRole
    {
        return CrmRole::tryFromNormalized($this->role);
    }

    public function hasPermission(string $permission): bool
    {
        return CrmAuthorization::userHasPermission($this, $permission);
    }

    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    public function isHuissier(): bool
    {
        return $this->roleEnum() === CrmRole::HUISSIER;
    }

    public function isSenior(): bool
    {
        return $this->roleEnum() === CrmRole::SENIOR;
    }

    public function isSecretaire(): bool
    {
        return $this->roleEnum() === CrmRole::SECRETAIRE;
    }

    public function isAssistante(): bool
    {
        return $this->roleEnum() === CrmRole::ASSISTANTE;
    }

    public function isGestionnaireBaux(): bool
    {
        return $this->roleEnum() === CrmRole::GESTIONNAIRE_BAUX;
    }

    public function isClient(): bool
    {
        return $this->roleEnum() === CrmRole::CLIENT;
    }

    public function isAvocat(): bool
    {
        return in_array($this->roleEnum(), [CrmRole::HUISSIER, CrmRole::SENIOR], true);
    }

    public function canViewAllDossiers(): bool
    {
        return $this->isAvocat();
    }

    public function canEditDossiers(): bool
    {
        return $this->isAvocat();
    }

    // ============================================
    // NOUVELLES MÉTHODES DE PERMISSIONS
    // ============================================

    public function canManageUsers(): bool
    {
        return $this->isHuissier();
    }

    public function canDeleteDossiers(): bool
    {
        return $this->isHuissier();
    }

    public function canAssignDossiers(): bool
    {
        return $this->isAvocat();
    }

    public function canValidateActes(): bool
    {
        return $this->isAvocat();
    }

    // ============================================
    // ACCESSORS
    // ============================================

    /**
     * Obtenir le libellé du rôle.
     */
    public function getRoleLabelAttribute(): string
    {
        return $this->roleEnum()?->label() ?? self::ROLES[$this->role] ?? $this->role;
    }

    /**
     * Obtenir le libellé du statut.
     */
    public function getStatutLabelAttribute(): string
    {
        return self::STATUTS[$this->statut] ?? $this->statut;
    }

    /**
     * Obtenir le nom complet.
     */
    public function getNomCompletAttribute(): string
    {
        return trim($this->prenom . ' ' . $this->nom);
    }

    /**
     * Obtenir les initiales.
     */
    public function getInitialesAttribute(): string
    {
        $prenomInitial = $this->prenom ? mb_substr($this->prenom, 0, 1) : '';
        $nomInitial = $this->nom ? mb_substr($this->nom, 0, 1) : '';
        
        return strtoupper($prenomInitial . $nomInitial);
    }

    /**
     * Obtenir la couleur du rôle pour l'affichage.
     */
    public function getRoleColorAttribute(): string
    {
        return $this->roleEnum()?->color() ?? 'bg-gray-100 text-gray-800';
    }

    /**
     * Obtenir la couleur du statut.
     */
    public function getStatutColorAttribute(): string
    {
        return $this->statut === self::STATUT_ACTIF 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
    }

    /**
     * Vérifier si l'utilisateur est actif.
     */
    public function getEstActifAttribute(): bool
    {
        return $this->statut === self::STATUT_ACTIF;
    }

    /**
     * Obtenir le nombre de dossiers en cours.
     */
    public function getDossiersEnCoursAttribute(): int
    {
        return $this->dossiers()->enCours()->count();
    }

    /**
     * Obtenir le nombre total de dossiers (responsable).
     */
    public function getTotalDossiersAttribute(): int
    {
        return $this->dossiers()->count();
    }

    /**
     * Obtenir le nombre de dossiers en collaboration.
     */
    public function getDossiersCollaborationCountAttribute(): int
    {
        return $this->dossiersCollaboration()->count();
    }

    /**
     * Obtenir le nombre d'échéances urgentes.
     */
    public function getEcheancesUrgentesAttribute(): int
    {
        return $this->echeances()->urgent()->count();
    }

    /**
     * Obtenir le nombre d'actes créés ce mois.
     */
    public function getActesCeMoisAttribute(): int
    {
        return $this->actes()
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count();
    }

    /**
     * Obtenir le nombre de documents uploadés ce mois.
     */
    public function getDocumentsCeMoisAttribute(): int
    {
        return $this->documents()
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count();
    }

    // ============================================
    // MÉTHODES D'AIDE
    // ============================================

    /**
     * Vérifier si l'utilisateur a accès à un dossier spécifique.
     */
    public function peutAccederDossier($dossierId): bool
    {
        // Huissiers et seniors voient tout
        if ($this->canViewAllDossiers()) {
            return true;
        }

        // Vérifier s'il est responsable
        if ($this->dossiers()->where('id', $dossierId)->exists()) {
            return true;
        }

        // Vérifier s'il est collaborateur
        if ($this->dossiersCollaboration()->where('dossier_id', $dossierId)->exists()) {
            return true;
        }

        return false;
    }

    /**
     * Vérifier si l'utilisateur peut modifier un dossier.
     */
    public function peutModifierDossier($dossierId): bool
    {
        if ($this->canEditDossiers()) {
            return true;
        }

        // Les responsables peuvent modifier leur dossier
        return $this->dossiers()->where('id', $dossierId)->exists();
    }

    /**
     * Obtenir la liste des dossiers accessibles.
     */
    public function getDossiersAccessibles()
    {
        if ($this->canViewAllDossiers()) {
            return CrmDossier::query();
        }

        $dossierIds = $this->dossiers()->pluck('id')
            ->merge($this->dossiersCollaboration()->pluck('crm_dossiers.id'))
            ->unique();

        return CrmDossier::whereIn('id', $dossierIds);
    }

    /**
     * Obtenir le rôle sur un dossier spécifique.
     */
    public function getRoleSurDossier($dossierId): ?string
    {
        // Responsable principal ?
        if ($this->dossiers()->where('id', $dossierId)->exists()) {
            return 'responsable';
        }

        // Collaborateur ?
        $collaboration = $this->dossiersCollaboration()
                              ->where('dossier_id', $dossierId)
                              ->first();

        return $collaboration?->pivot->role_assignation;
    }

    // ============================================
    // BOOT
    // ============================================

    /**
     * Définir les valeurs par défaut.
     */
    protected static function booted()
    {
        static::creating(function ($user) {
            if (!$user->statut) {
                $user->statut = self::STATUT_ACTIF;
            }
        });
    }
}