<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmDecharge extends Model
{
    use HasFactory;

    protected $table = 'crm_decharges';

    protected $fillable = [
        'transmission_id',
        'signataire_nom',
        'signataire_fonction',
        'date_decharge',
        'signature_chemin',
        'document_chemin',
        'statut',
        'observations',
        'user_id',
    ];

    protected $casts = [
        'date_decharge' => 'date',
    ];

    public function transmission()
    {
        return $this->belongsTo(CrmTransmission::class, 'transmission_id');
    }

    public function user()
    {
        return $this->belongsTo(CrmUser::class, 'user_id');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeSignes($query)
    {
        return $query->where('statut', 'signe');
    }

    public function getStatutLabelAttribute()
    {
        return [
            'en_attente' => 'En attente de signature',
            'signe' => 'Signé',
            'refuse' => 'Refusé',
        ][$this->statut] ?? $this->statut;
    }

    public function getStatutColorAttribute()
    {
        return [
            'en_attente' => 'bg-yellow-100 text-yellow-800',
            'signe' => 'bg-green-100 text-green-800',
            'refuse' => 'bg-red-100 text-red-800',
        ][$this->statut] ?? 'bg-gray-100 text-gray-600';
    }
}