<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmLigneFacture extends Model
{
    use HasFactory;

    protected $table = 'crm_lignes_facture';

    protected $fillable = [
        'facture_id',
        'description',
        'quantite',
        'prix_unitaire',
        'montant_ht',
        'tva',
        'montant_ttc',
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'prix_unitaire' => 'decimal:2',
        'montant_ht' => 'decimal:2',
        'tva' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
    ];

    public function facture()
    {
        return $this->belongsTo(CrmFacture::class, 'facture_id');
    }

    public function getMontantHtFormattedAttribute()
    {
        return number_format($this->montant_ht, 0, ',', ' ') . ' FCFA';
    }

    public function getMontantTtcFormattedAttribute()
    {
        return number_format($this->montant_ttc, 0, ',', ' ') . ' FCFA';
    }
}