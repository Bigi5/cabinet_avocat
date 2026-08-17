<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmPaiementLoyer extends Model
{
    use HasFactory;

    protected $table = 'crm_paiements_loyers';

    protected $fillable = [
        'bail_id',
        'montant',
        'date_paiement',
        'mois_concerne',
        'mode_paiement',
        'statut',
        'reference_cheque',
        'cheque_encaisse',
        'observations',
        'user_id',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_paiement' => 'date',
        'mois_concerne' => 'date',
        'cheque_encaisse' => 'boolean',
    ];

    // ============================================
    // RELATIONS
    // ============================================

    public function bail()
    {
        return $this->belongsTo(CrmBail::class, 'bail_id');
    }

    public function user()
    {
        return $this->belongsTo(CrmUser::class, 'user_id');
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getMontantFormattedAttribute(): string
    {
        return number_format($this->montant, 0, ',', ' ') . ' FCFA';
    }

    public function getModePaiementLabelAttribute(): string
    {
        return [
            'especes' => 'Espèces',
            'cheque' => 'Chèque',
            'virement' => 'Virement',
            'carte' => 'Carte bancaire',
        ][$this->mode_paiement] ?? $this->mode_paiement;
    }

    public function getStatutLabelAttribute(): string
    {
        return [
            'paye' => 'Payé',
            'partiel' => 'Partiel',
            'impaye' => 'Impayé',
        ][$this->statut] ?? $this->statut;
    }

    public function getStatutColorAttribute(): string
    {
        return [
            'paye' => 'bg-green-100 text-green-800',
            'partiel' => 'bg-yellow-100 text-yellow-800',
            'impaye' => 'bg-red-100 text-red-800',
        ][$this->statut] ?? 'bg-gray-100 text-gray-800';
    }
    public function quittance()
{
    return $this->hasOne(CrmQuittance::class, 'paiement_id');
}
}