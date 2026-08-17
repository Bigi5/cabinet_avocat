<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmPaiement extends Model
{
    use HasFactory;

    protected $table = 'crm_paiements';

    protected $fillable = [
        'facture_id',
        'dossier_id',
        'client_id',
        'montant',
        'date_paiement',
        'mode',
        'reference_cheque',
        'cheque_encaisse',
        'observations',
        'user_id',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_paiement' => 'date',
        'cheque_encaisse' => 'boolean',
    ];

    public function facture()
    {
        return $this->belongsTo(CrmFacture::class, 'facture_id');
    }

    public function dossier()
    {
        return $this->belongsTo(CrmDossier::class, 'dossier_id');
    }

    public function client()
    {
        return $this->belongsTo(CrmClient::class, 'client_id');
    }

    public function user()
    {
        return $this->belongsTo(CrmUser::class, 'user_id');
    }

    public function getMontantFormattedAttribute()
    {
        return number_format($this->montant, 0, ',', ' ') . ' FCFA';
    }

    public function getModeLabelAttribute()
    {
        return [
            'especes' => 'Espèces',
            'cheque' => 'Chèque',
            'virement' => 'Virement',
            'carte' => 'Carte bancaire',
        ][$this->mode] ?? $this->mode;
    }
}