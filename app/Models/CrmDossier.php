<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\LogsActivities;

class CrmDossier extends Model
{
    use HasFactory;
    use LogsActivities;

    /**
     * La table associée au modèle.
     *
     * @var string
     */
    protected $table = 'crm_dossiers';

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
        'date_ouverture' => 'date',
        'montant' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ============================================
    // CONSTANTES
    // ============================================

    const TYPE_SIGNIFICATION = 'signification';
    const TYPE_RECOUVREMENT = 'recouvrement';
    const TYPE_EXECUTION = 'execution';
    const TYPE_INJONCTION = 'injonction';
    const TYPE_SAISIE = 'saisie';
    const TYPE_AUTRE = 'autre';

    const TYPES_MISSION = [
        self::TYPE_SIGNIFICATION => 'Signification',
        self::TYPE_RECOUVREMENT => 'Recouvrement',
        self::TYPE_EXECUTION => 'Exécution',
        self::TYPE_INJONCTION => 'Injonction de payer',
        self::TYPE_SAISIE => 'Saisie',
        self::TYPE_AUTRE => 'Autre mission',
    ];

    const STATUT_CREE = 'cree';
    const STATUT_EN_COURS = 'en_cours';
    const STATUT_EN_ATTENTE = 'en_attente';
    const STATUT_EXECUTE = 'execute';
    const STATUT_CLOTURE = 'cloture';
    const STATUT_ARCHIVE = 'archive';

    const STATUTS = [
        self::STATUT_CREE => 'Créé',
        self::STATUT_EN_COURS => 'En cours',
        self::STATUT_EN_ATTENTE => 'En attente',
        self::STATUT_EXECUTE => 'Exécuté',
        self::STATUT_CLOTURE => 'Clôturé',
        self::STATUT_ARCHIVE => 'Archivé',
    ];

    // ============================================
    // RELATIONS
    // ============================================

    public function client()
    {
        return $this->belongsTo(CrmClient::class, 'client_id');
    }

    public function responsable()
    {
        return $this->belongsTo(CrmUser::class, 'responsable_id');
    }

    public function actes()
    {
        return $this->hasMany(CrmActe::class, 'dossier_id');
    }

    public function documents()
    {
        return $this->hasMany(CrmDocument::class, 'dossier_id');
    }

    public function echeances()
    {
        return $this->hasMany(CrmEcheance::class, 'dossier_id');
    }

    public function collaborateurs()
    {
        return $this->belongsToMany(CrmUser::class, 'crm_dossier_collaborateurs', 'dossier_id', 'user_id')
                    ->withPivot('role_assignation')
                    ->withTimestamps();
    }

    public function collaborateurPrincipal()
    {
        return $this->belongsToMany(CrmUser::class, 'crm_dossier_collaborateurs', 'dossier_id', 'user_id')
                    ->wherePivot('role_assignation', 'principal')
                    ->withPivot('role_assignation');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeEnCours($query)
    {
        return $query->whereIn('statut', [
            self::STATUT_CREE,
            self::STATUT_EN_COURS,
            self::STATUT_EN_ATTENTE
        ]);
    }

    public function scopeClotures($query)
    {
        return $query->whereIn('statut', [
            self::STATUT_EXECUTE,
            self::STATUT_CLOTURE
        ]);
    }

    public function scopeArchives($query)
    {
        return $query->where('statut', self::STATUT_ARCHIVE);
    }

    public function scopeByClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeByResponsable($query, $userId)
    {
        return $query->where('responsable_id', $userId);
    }

    public function scopeByTypeMission($query, $type)
    {
        return $query->where('type_mission', $type);
    }

    public function scopeAvecEcheancesUrgentes($query)
    {
        return $query->whereHas('echeances', function ($q) {
            $q->urgent();
        });
    }

    public function scopeRecents($query, $limit = 10)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('reference_unique', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getTypeMissionLabelAttribute(): string
    {
        return self::TYPES_MISSION[$this->type_mission] ?? $this->type_mission;
    }

    public function getStatutLabelAttribute(): string
    {
        return self::STATUTS[$this->statut] ?? $this->statut;
    }

    public function getDateOuvertureFormattedAttribute(): string
    {
        return $this->date_ouverture ? $this->date_ouverture->format('d/m/Y') : '';
    }

    public function getTotalActesAttribute(): int
    {
        return $this->actes()->count();
    }

    public function getTotalDocumentsAttribute(): int
    {
        return $this->documents()->count();
    }

    public function getTotalEcheancesAttribute(): int
    {
        return $this->echeances()->count();
    }

    public function getEcheancesUrgentesAttribute(): int
    {
        return $this->echeances()->urgent()->count();
    }

    public function getEcheancesEnRetardAttribute(): int
    {
        return $this->echeances()->enRetard()->count();
    }

    public function getCollaborateursListAttribute(): array
    {
        return $this->collaborateurs->map(function ($user) {
            return [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'role' => $user->pivot->role_assignation,
                'role_label' => $this->getRoleLabel($user->pivot->role_assignation),
            ];
        })->toArray();
    }

    public function getResponsableNomAttribute(): string
    {
        return $this->responsable ? $this->responsable->nom_complet : 'Non assigné';
    }

    public function getClientNomAttribute(): string
    {
        if (!$this->client) {
            return 'Client inconnu';
        }

        if ($this->client->type_client === 'personne_physique') {
            return trim($this->client->prenom . ' ' . $this->client->nom);
        }

        return $this->client->raison_sociale ?? 'Client moral';
    }

    public function getProgressionAttribute(): int
    {
        $progression = [
            self::STATUT_CREE => 10,
            self::STATUT_EN_COURS => 40,
            self::STATUT_EN_ATTENTE => 60,
            self::STATUT_EXECUTE => 90,
            self::STATUT_CLOTURE => 100,
            self::STATUT_ARCHIVE => 100,
        ];

        return $progression[$this->statut] ?? 0;
    }

    public function getStatutColorAttribute(): string
    {
        $colors = [
            self::STATUT_CREE => 'bg-gray-100 text-gray-800',
            self::STATUT_EN_COURS => 'bg-green-100 text-green-800',
            self::STATUT_EN_ATTENTE => 'bg-yellow-100 text-yellow-800',
            self::STATUT_EXECUTE => 'bg-blue-100 text-blue-800',
            self::STATUT_CLOTURE => 'bg-purple-100 text-purple-800',
            self::STATUT_ARCHIVE => 'bg-gray-100 text-gray-600',
        ];

        return $colors[$this->statut] ?? 'bg-gray-100 text-gray-800';
    }

    // ============================================
    // MÉTHODES D'AIDE
    // ============================================

    public function estActif(): bool
    {
        return in_array($this->statut, [
            self::STATUT_CREE,
            self::STATUT_EN_COURS,
            self::STATUT_EN_ATTENTE
        ]);
    }

    public function estCloture(): bool
    {
        return in_array($this->statut, [
            self::STATUT_EXECUTE,
            self::STATUT_CLOTURE
        ]);
    }

    public function estResponsable($userId): bool
    {
        return $this->responsable_id === $userId;
    }

    public function estCollaborateur($userId): bool
    {
        return $this->collaborateurs()
                    ->where('user_id', $userId)
                    ->exists();
    }

    public function getRoleCollaborateur($userId): ?string
    {
        $collaborateur = $this->collaborateurs()
                              ->where('user_id', $userId)
                              ->first();

        return $collaborateur?->pivot->role_assignation;
    }

    protected function getRoleLabel($role): string
    {
        return [
            'principal' => 'Principal',
            'secondaire' => 'Secondaire',
            'consultant' => 'Consultant',
        ][$role] ?? $role;
    }

    // ============================================
    // BOOT
    // ============================================

    protected static function booted()
    {
        static::creating(function ($dossier) {
            if (!$dossier->reference_unique) {
                $year = date('Y');
                $month = date('m');
                $lastDossier = self::whereYear('created_at', $year)
                                    ->whereMonth('created_at', $month)
                                    ->orderBy('id', 'desc')
                                    ->first();
                
                $nextNumber = $lastDossier ? intval(substr($lastDossier->reference_unique, -3)) + 1 : 1;
                $dossier->reference_unique = sprintf('DOS-%s%s-%03d', $year, $month, $nextNumber);
            }

            if (!$dossier->date_ouverture) {
                $dossier->date_ouverture = now();
            }
        });
    }
}