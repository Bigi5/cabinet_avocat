<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmFacture extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'crm_factures';

    protected $fillable = [
        'reference',
        'dossier_id',
        'client_id',
        'date_emission',
        'date_echeance',
        'montant_ht',
        'tva',
        'montant_ttc',
        'statut',
        'type',
        'description',
        'notes',
        'user_id',
    ];

    protected $casts = [
        'montant_ht' => 'decimal:2',
        'tva' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
        'date_emission' => 'date',
        'date_echeance' => 'date',
    ];

    public function dossier()
    {
        return $this->belongsTo(CrmDossier::class, 'dossier_id');
    }

    public function client()
    {
        return $this->belongsTo(CrmClient::class, 'client_id');
    }

    public function lignes()
    {
        return $this->hasMany(CrmLigneFacture::class, 'facture_id');
    }

    public function paiements()
    {
        return $this->hasMany(CrmPaiement::class, 'facture_id');
    }

    public function user()
    {
        return $this->belongsTo(CrmUser::class, 'user_id');
    }

    public function scopeEnvoyees($query)
    {
        return $query->where('statut', 'envoyee');
    }

    public function scopeImpayees($query)
    {
        return $query->where('statut', 'impayee');
    }

    public function scopePayees($query)
    {
        return $query->where('statut', 'payee');
    }

    public function getReferenceFormattedAttribute()
    {
        return 'FAC-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    public function getMontantHtFormattedAttribute()
    {
        return number_format($this->montant_ht, 0, ',', ' ') . ' FCFA';
    }

    public function getMontantTtcFormattedAttribute()
    {
        return number_format($this->montant_ttc, 0, ',', ' ') . ' FCFA';
    }

    public function getStatutLabelAttribute()
    {
        return [
            'brouillon' => 'Brouillon',
            'envoyee' => 'Envoyée',
            'payee' => 'Payée',
            'impayee' => 'Impayée',
            'annulee' => 'Annulée',
        ][$this->statut] ?? $this->statut;
    }

    public function getStatutColorAttribute()
    {
        return [
            'brouillon' => 'bg-gray-100 text-gray-600',
            'envoyee' => 'bg-blue-100 text-blue-800',
            'payee' => 'bg-green-100 text-green-800',
            'impayee' => 'bg-red-100 text-red-800',
            'annulee' => 'bg-gray-100 text-gray-500',
        ][$this->statut] ?? 'bg-gray-100 text-gray-600';
    }

    public function getSoldeAttribute()
    {
        $totalPaye = $this->paiements()->sum('montant');
        return $this->montant_ttc - $totalPaye;
    }

    public function getEstPayeeAttribute()
    {
        return $this->solde <= 0;
    }
}