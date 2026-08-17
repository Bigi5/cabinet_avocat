<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmEcheanceLoyer extends Model
{
    use HasFactory;

    protected $table = 'crm_echeances_loyers';

    protected $fillable = [
        'bail_id',
        'date_echeance',
        'montant',
        'statut',
        'paiement_id',
    ];

    protected $casts = [
        'date_echeance' => 'date',
        'montant' => 'decimal:2',
    ];

    // ============================================
    // RELATIONS
    // ============================================

    public function bail()
    {
        return $this->belongsTo(CrmBail::class, 'bail_id');
    }

    public function paiement()
    {
        return $this->belongsTo(CrmPaiementLoyer::class, 'paiement_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeEnRetard($query)
    {
        return $query->where('date_echeance', '<', now())
                     ->whereIn('statut', ['a_venir', 'en_attente', 'impaye']);
    }

    public function scopeAUjourdHui($query)
    {
        return $query->whereDate('date_echeance', today());
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getMontantFormattedAttribute(): string
    {
        return number_format($this->montant, 0, ',', ' ') . ' FCFA';
    }

    public function getStatutLabelAttribute(): string
    {
        return [
            'a_venir' => 'À venir',
            'en_attente' => 'En attente',
            'paye' => 'Payé',
            'impaye' => 'Impayé',
            'annule' => 'Annulé',
        ][$this->statut] ?? $this->statut;
    }

    public function getStatutColorAttribute(): string
    {
        return [
            'a_venir' => 'bg-gray-100 text-gray-600',
            'en_attente' => 'bg-yellow-100 text-yellow-800',
            'paye' => 'bg-green-100 text-green-800',
            'impaye' => 'bg-red-100 text-red-800',
            'annule' => 'bg-gray-100 text-gray-500',
        ][$this->statut] ?? 'bg-gray-100 text-gray-600';
    }

    public function getEstEnRetardAttribute(): bool
    {
        return $this->date_echeance < now() && in_array($this->statut, ['a_venir', 'en_attente', 'impaye']);
    }
}