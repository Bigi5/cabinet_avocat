<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CrmBail extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'crm_baux';

    protected $fillable = [
        'reference',
        'locataire_id',
        'bailleur_id',
        'dossier_id',
        'montant_loyer',
        'frequence',
        'date_debut',
        'date_fin',
        'jour_echeance',
        'caution',
        'description',
        'adresse_bien',
        'reference_cadastrale',
        'statut',
    ];

    protected $casts = [
        'montant_loyer' => 'decimal:2',
        'caution' => 'decimal:2',
        'date_debut' => 'date',
        'date_fin' => 'date',
        'jour_echeance' => 'integer',
    ];

    // ============================================
    // RELATIONS
    // ============================================

    public function locataire()
    {
        return $this->belongsTo(CrmClient::class, 'locataire_id');
    }

    public function bailleur()
    {
        return $this->belongsTo(CrmClient::class, 'bailleur_id');
    }

    public function dossier()
    {
        return $this->belongsTo(CrmDossier::class, 'dossier_id');
    }

    public function paiements()
    {
        return $this->hasMany(CrmPaiementLoyer::class, 'bail_id');
    }

    public function echeances()
    {
        return $this->hasMany(CrmEcheanceLoyer::class, 'bail_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeActifs($query)
    {
        return $query->where('statut', 'actif');
    }

    public function scopeTermines($query)
    {
        return $query->where('statut', 'termine');
    }

    public function scopeAvecImpayes($query)
    {
        return $query->whereHas('echeances', function ($q) {
            $q->where('statut', 'impaye');
        });
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getReferenceFormattedAttribute(): string
    {
        return 'BAIL-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    public function getStatutLabelAttribute(): string
    {
        return [
            'actif' => 'Actif',
            'termine' => 'Terminé',
            'resilie' => 'Résilié',
        ][$this->statut] ?? $this->statut;
    }

    public function getFrequenceLabelAttribute(): string
    {
        return [
            'mensuel' => 'Mensuel',
            'trimestriel' => 'Trimestriel',
            'semestriel' => 'Semestriel',
            'annuel' => 'Annuel',
        ][$this->frequence] ?? $this->frequence;
    }

    public function getMontantLoyerFormattedAttribute(): string
    {
        return number_format($this->montant_loyer, 0, ',', ' ') . ' FCFA';
    }

    public function getMontantTotalImpayeAttribute(): float
    {
        return $this->echeances()->where('statut', 'impaye')->sum('montant');
    }

    public function getDureeAttribute(): string
    {
        $debut = $this->date_debut;
        $fin = $this->date_fin ?? now();
        $diff = $debut->diffInMonths($fin);
        
        if ($diff < 12) {
            return $diff . ' mois';
        }
        
        $annees = floor($diff / 12);
        $mois = $diff % 12;
        
        return $annees . ' an' . ($annees > 1 ? 's' : '') . ($mois > 0 ? ' et ' . $mois . ' mois' : '');
    }

    // ============================================
    // MÉTHODES D'AIDE
    // ============================================

    public function genererEcheances(): void
    {
        // Supprimer les anciennes échéances non payées
        $this->echeances()->where('statut', 'a_venir')->delete();
        
        $date = $this->date_debut->copy();
        $dateFin = $this->date_fin ?? now()->addYears(10);
        
        while ($date <= $dateFin) {
            // Créer l'échéance
            CrmEcheanceLoyer::create([
                'bail_id' => $this->id,
                'date_echeance' => $date,
                'montant' => $this->montant_loyer,
                'statut' => 'a_venir',
            ]);
            
            // Passer au mois suivant selon la fréquence
            switch ($this->frequence) {
                case 'mensuel':
                    $date->addMonth();
                    break;
                case 'trimestriel':
                    $date->addMonths(3);
                    break;
                case 'semestriel':
                    $date->addMonths(6);
                    break;
                case 'annuel':
                    $date->addYear();
                    break;
            }
        }
    }

    public function estActif(): bool
    {
        return $this->statut === 'actif';
    }
    /**
 * Étape 3 - Générer un PDF du bail.
 */
public function pdf(Request $request, $id)
{
    $user = Auth::user();

    if (!$user) {
        return redirect()->route('login');
    }

    $bail = CrmBail::with([
        'locataire',
        'bailleur',
        'dossier',
        'echeances'
    ])->findOrFail($id);

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView(
        'pdf.bail',
        compact('bail')
    );

    return $pdf->stream(
        'Bail-' . $bail->reference . '.pdf'
    );
}
public function quittances()
{
    return $this->hasMany(CrmQuittance::class, 'bail_id');
}
}