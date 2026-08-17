<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmArchiveHistorique extends Model
{
    use HasFactory;

    protected $table = 'crm_archive_historiques';

    protected $fillable = [
        'archive_id',
        'utilisateur_id',
        'action',
        'description',
        'ip_adresse',
        'user_agent',
    ];

    /**
     * ✅ Casts pour les dates
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * ✅ Relation avec l'archive
     */
    public function archive()
    {
        return $this->belongsTo(CrmArchive::class, 'archive_id');
    }

    /**
     * ✅ Relation avec l'utilisateur
     */
    public function utilisateur()
    {
        return $this->belongsTo(CrmUser::class, 'utilisateur_id');
    }

    /**
     * ✅ Scope - Historique du plus récent au plus ancien
     */
    public function scopeRecents($query)
    {
        return $query->latest();
    }

    /**
     * ✅ Scope - Filtrer par action
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * ✅ Scope - Filtrer par utilisateur
     */
    public function scopeParUtilisateur($query, int $userId)
    {
        return $query->where('utilisateur_id', $userId);
    }

    /**
     * ✅ Scope - Filtrer par archive
     */
    public function scopeParArchive($query, int $archiveId)
    {
        return $query->where('archive_id', $archiveId);
    }

    /**
     * ✅ Scope - Période
     */
    public function scopePeriode($query, $debut, $fin)
    {
        return $query->whereBetween('created_at', [$debut, $fin]);
    }
}