<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmTransmission extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'crm_transmissions';

    protected $fillable = [
        'reference',
        'emetteur_id',
        'destinataire_nom',
        'destinataire_email',
        'destinataire_telephone',
        'destinataire_fonction',        // ✅ AJOUTÉ
        'destinataire_organisation',    // ✅ AJOUTÉ
        'destinataire_adresse',         // ✅ AJOUTÉ
        'dossier_id',
        'document_id',
        'type',
        'statut',
        'objet',
        'message',
        'preuve_chemin',
        'date_transmission',
        'date_reception',
        'notes',
    ];

    protected $casts = [
        'date_transmission' => 'date',
        'date_reception' => 'date',
    ];

    public function emetteur()
    {
        return $this->belongsTo(CrmUser::class, 'emetteur_id');
    }

    public function dossier()
    {
        return $this->belongsTo(CrmDossier::class, 'dossier_id');
    }

    public function document()
    {
        return $this->belongsTo(CrmDocument::class, 'document_id');
    }

    public function decharge()
    {
        return $this->hasOne(CrmDecharge::class, 'transmission_id');
    }

    public function scopeEnvoyes($query)
    {
        return $query->where('statut', 'envoye');
    }

    public function scopeRecus($query)
    {
        return $query->where('statut', 'recu');
    }

    public function scopeSignes($query)
    {
        return $query->where('statut', 'signe');
    }

    public function getReferenceFormattedAttribute()
    {
        return 'TRANS-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    public function getTypeLabelAttribute()
    {
        return [
            'remise' => 'Remise en main propre',
            'transmission' => 'Transmission',
            'notification' => 'Notification',
            'signification' => 'Signification',
            'retour_dossier' => 'Retour de dossier',
            'courrier' => 'Envoi de courrier',
            'convocation' => 'Convocation',
            'decision' => 'Décision',
        ][$this->type] ?? $this->type;
    }

    public function getStatutLabelAttribute()
    {
        return [
            'brouillon' => 'Brouillon',
            'en_attente' => 'En attente',
            'envoye' => 'Envoyé',
            'recu' => 'Reçu',
            'signe' => 'Signé',
            'archive' => 'Archivé',
            'annule' => 'Annulé',
            'refuse' => 'Refusé',
        ][$this->statut] ?? $this->statut;
    }

    public function getStatutColorAttribute()
    {
        return [
            'brouillon' => 'bg-gray-100 text-gray-600',
            'en_attente' => 'bg-yellow-100 text-yellow-800',
            'envoye' => 'bg-blue-100 text-blue-800',
            'recu' => 'bg-green-100 text-green-800',
            'signe' => 'bg-purple-100 text-purple-800',
            'archive' => 'bg-slate-100 text-slate-600',
            'annule' => 'bg-red-100 text-red-800',
            'refuse' => 'bg-red-100 text-red-800',
        ][$this->statut] ?? 'bg-gray-100 text-gray-600';
    }
}