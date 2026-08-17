<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmQuittance extends Model
{
    use HasFactory;

    protected $table = 'crm_quittances';

    protected $fillable = [
        'paiement_id',
        'bail_id',
        'numero',
        'date_quittance',
        'montant',
        'mois',
    ];

    protected $casts = [
        'date_quittance' => 'date',
        'montant' => 'decimal:2',
    ];

    /**
     * Paiement associé
     */
    public function paiement()
    {
        return $this->belongsTo(CrmPaiementLoyer::class, 'paiement_id');
    }

    /**
     * Bail associé
     */
    public function bail()
    {
        return $this->belongsTo(CrmBail::class, 'bail_id');
    }

    /**
     * Génère automatiquement un numéro de quittance
     * Exemple : QT-2026-000001
     */
    public static function genererNumero(): string
    {
        $annee = date('Y');

        $dernier = self::whereYear('created_at', $annee)
            ->latest('id')
            ->first();

        $numero = $dernier
            ? ((int) substr($dernier->numero, -6)) + 1
            : 1;

        return sprintf(
            'QT-%s-%06d',
            $annee,
            $numero
        );
    }
}