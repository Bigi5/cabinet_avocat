<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmEmplacement extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'crm_emplacements';

    protected $fillable = [
        'code', 'nom', 'type', 'batiment', 'etage', 'salle', 'rayon',
        'colonne', 'niveau', 'description', 'capacite', 'occupation', 'statut'
    ];

    protected $casts = [
        'capacite' => 'integer',
        'occupation' => 'integer',
    ];

    public function archives()
    {
        return $this->hasMany(CrmArchive::class, 'emplacement_id');
    }

    public function scopeActifs($query)
    {
        return $query->where('statut', 'actif');
    }

    public function getCodeCompletAttribute()
    {
        $parts = [$this->code];
        if ($this->batiment) $parts[] = $this->batiment;
        if ($this->etage) $parts[] = 'E' . $this->etage;
        if ($this->rayon) $parts[] = 'R' . $this->rayon;
        if ($this->colonne) $parts[] = 'C' . $this->colonne;
        if ($this->niveau) $parts[] = 'N' . $this->niveau;
        return implode(' - ', $parts);
    }

    public function getOccupationRateAttribute()
    {
        if (!$this->capacite) return 0;
        return round(($this->occupation / $this->capacite) * 100);
    }
}