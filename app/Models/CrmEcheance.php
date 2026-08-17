<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\LogsActivities;

class CrmEcheance extends Model
{
    use HasFactory;
     use LogsActivities;

    /**
     * La table associée au modèle.
     *
     * @var string
     */
    protected $table = 'crm_echeances';

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
        'date_echeance' => 'datetime',
        'notification_whatsapp' => 'boolean',
        'notification_sms' => 'boolean',
        'notification_email' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ============================================
    // CONSTANTES
    // ============================================

    const CRITICITE_HAUTE = 'haute';
    const CRITICITE_MOYENNE = 'moyenne';
    const CRITICITE_BASSE = 'basse';

    const STATUT_A_FAIRE = 'a_faire';
    const STATUT_EN_COURS = 'en_cours';
    const STATUT_TERMINE = 'termine';
    const STATUT_ANNULE = 'annule';

    const CRITICITES = [
        self::CRITICITE_HAUTE => 'Haute',
        self::CRITICITE_MOYENNE => 'Moyenne',
        self::CRITICITE_BASSE => 'Basse',
    ];

    const STATUTS = [
        self::STATUT_A_FAIRE => 'À faire',
        self::STATUT_EN_COURS => 'En cours',
        self::STATUT_TERMINE => 'Terminé',
        self::STATUT_ANNULE => 'Annulé',
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
     * Relation avec l'utilisateur responsable.
     */
    public function user()
    {
        return $this->belongsTo(CrmUser::class, 'user_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope pour les échéances urgentes (haute criticité et non terminées).
     */
    public function scopeUrgent($query)
    {
        return $query->where('criticite', self::CRITICITE_HAUTE)
                     ->whereIn('statut', [self::STATUT_A_FAIRE, self::STATUT_EN_COURS]);
    }

    /**
     * Scope pour les échéances d'aujourd'hui.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('date_echeance', today());
    }

    /**
     * Scope pour les échéances de demain.
     */
    public function scopeTomorrow($query)
    {
        return $query->whereDate('date_echeance', today()->addDay());
    }

    /**
     * Scope pour les échéances de cette semaine.
     */
    public function scopeThisWeek($query)
    {
        return $query->whereBetween('date_echeance', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    /**
     * Scope pour les échéances du mois.
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('date_echeance', now()->month)
                     ->whereYear('date_echeance', now()->year);
    }

    /**
     * Scope pour les échéances à venir (non terminées).
     */
    public function scopeAVenir($query)
    {
        return $query->where('date_echeance', '>=', now())
                     ->whereIn('statut', [self::STATUT_A_FAIRE, self::STATUT_EN_COURS]);
    }

    /**
     * Scope pour les échéances passées non terminées (en retard).
     */
    public function scopeEnRetard($query)
    {
        return $query->where('date_echeance', '<', now())
                     ->whereIn('statut', [self::STATUT_A_FAIRE, self::STATUT_EN_COURS]);
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

    /**
     * Scope pour filtrer par criticité.
     */
    public function scopeByCriticite($query, $criticite)
    {
        return $query->where('criticite', $criticite);
    }

    /**
     * Scope pour filtrer par statut.
     */
    public function scopeByStatut($query, $statut)
    {
        return $query->where('statut', $statut);
    }

    /**
     * Scope pour les échéances avec notifications activées.
     */
    public function scopeAvecNotifications($query)
    {
        return $query->where(function ($q) {
            $q->where('notification_email', true)
              ->orWhere('notification_sms', true)
              ->orWhere('notification_whatsapp', true);
        });
    }

    // ============================================
    // ACCESSORS
    // ============================================

    /**
     * Obtenir le libellé de la criticité.
     */
    public function getCriticiteLabelAttribute(): string
    {
        return self::CRITICITES[$this->criticite] ?? $this->criticite;
    }

    /**
     * Obtenir le libellé du statut.
     */
    public function getStatutLabelAttribute(): string
    {
        return self::STATUTS[$this->statut] ?? $this->statut;
    }

    /**
     * Vérifier si l'échéance est urgente.
     */
    public function getEstUrgentAttribute(): bool
    {
        return $this->criticite === self::CRITICITE_HAUTE 
            && in_array($this->statut, [self::STATUT_A_FAIRE, self::STATUT_EN_COURS]);
    }

    /**
     * Vérifier si l'échéance est en retard.
     */
    public function getEstEnRetardAttribute(): bool
    {
        return $this->date_echeance < now() 
            && in_array($this->statut, [self::STATUT_A_FAIRE, self::STATUT_EN_COURS]);
    }

    /**
     * Vérifier si c'est pour aujourd'hui.
     */
    public function getEstAujourdHuiAttribute(): bool
    {
        return $this->date_echeance ? $this->date_echeance->isToday() : false;
    }

    /**
     * Vérifier si c'est pour demain.
     */
    public function getEstDemainAttribute(): bool
    {
        return $this->date_echeance ? $this->date_echeance->isTomorrow() : false;
    }

    /**
     * Obtenir la date formatée.
     */
    public function getDateFormattedAttribute(): string
    {
        return $this->date_echeance ? $this->date_echeance->format('d/m/Y') : '';
    }

    /**
     * Obtenir l'heure formatée.
     */
    public function getHeureFormattedAttribute(): string
    {
        return $this->date_echeance ? $this->date_echeance->format('H:i') : '';
    }

    /**
     * Obtenir la date et heure formatées.
     */
    public function getDateTimeFormattedAttribute(): string
    {
        return $this->date_echeance ? $this->date_echeance->format('d/m/Y H:i') : '';
    }

    /**
     * Obtenir le titre court.
     */
    public function getTitreCourtAttribute(): string
    {
        return substr($this->titre, 0, 40) . (strlen($this->titre) > 40 ? '...' : '');
    }

    /**
     * Obtenir les types de notifications activées.
     */
    public function getNotificationsActivesAttribute(): array
    {
        $notifications = [];
        
        if ($this->notification_email) {
            $notifications[] = 'email';
        }
        if ($this->notification_sms) {
            $notifications[] = 'sms';
        }
        if ($this->notification_whatsapp) {
            $notifications[] = 'whatsapp';
        }
        
        return $notifications;
    }

    /**
     * Obtenir la couleur pour la criticité.
     */
    public function getCriticiteColorAttribute(): string
    {
        return [
            self::CRITICITE_HAUTE => 'text-red-600 bg-red-50 border-red-200',
            self::CRITICITE_MOYENNE => 'text-yellow-600 bg-yellow-50 border-yellow-200',
            self::CRITICITE_BASSE => 'text-green-600 bg-green-50 border-green-200',
        ][$this->criticite] ?? 'text-gray-600 bg-gray-50 border-gray-200';
    }

    /**
     * Obtenir la couleur pour le statut.
     */
    public function getStatutColorAttribute(): string
    {
        return [
            self::STATUT_A_FAIRE => 'text-gray-600 bg-gray-50 border-gray-200',
            self::STATUT_EN_COURS => 'text-blue-600 bg-blue-50 border-blue-200',
            self::STATUT_TERMINE => 'text-green-600 bg-green-50 border-green-200',
            self::STATUT_ANNULE => 'text-red-600 bg-red-50 border-red-200',
        ][$this->statut] ?? 'text-gray-600 bg-gray-50 border-gray-200';
    }

    // ============================================
    // MUTATORS
    // ============================================

    /**
     * Définir les valeurs par défaut.
     */
    protected static function booted()
    {
        static::creating(function ($echeance) {
            if (!$echeance->criticite) {
                $echeance->criticite = self::CRITICITE_MOYENNE;
            }
            if (!$echeance->statut) {
                $echeance->statut = self::STATUT_A_FAIRE;
            }
        });
    }
}