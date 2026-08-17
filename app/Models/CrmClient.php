<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\LogsActivities;

class CrmClient extends Model
{
    use HasFactory;
    use LogsActivities;

    /**
     * La table associée au modèle.
     *
     * @var string
     */
    protected $table = 'crm_clients';

    /**
     * Les attributs qui ne sont pas assignables massivement.
     *
     * @var array
     */
    protected $guarded = ['id'];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array
     */
    protected $casts = [
        'date_naissance' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'roles' => 'array',
    ];

    // ============================================
    // CONSTANTES - TYPES
    // ============================================

    const TYPE_PHYSIQUE = 'personne_physique';
    const TYPE_MORALE = 'personne_morale';

    const TYPES = [
        self::TYPE_PHYSIQUE => 'Personne physique',
        self::TYPE_MORALE => 'Personne morale',
    ];

    // ============================================
    // CONSTANTES - STATUTS
    // ============================================

    const STATUT_ACTIF = 'actif';
    const STATUT_INACTIF = 'inactif';

    const STATUTS = [
        self::STATUT_ACTIF => 'Actif',
        self::STATUT_INACTIF => 'Inactif',
    ];

    // ============================================
    // CONSTANTES - RÔLES
    // ============================================

    const ROLE_CLIENT = 'client';
    const ROLE_BAILLEUR = 'bailleur';
    const ROLE_LOCATAIRE = 'locataire';

    const ROLES = [
        self::ROLE_CLIENT => 'Client',
        self::ROLE_BAILLEUR => 'Bailleur',
        self::ROLE_LOCATAIRE => 'Locataire',
    ];

    // ============================================
    // RELATIONS
    // ============================================

    /**
     * Relation avec les dossiers du client.
     */
    public function dossiers()
    {
        return $this->hasMany(CrmDossier::class, 'client_id');
    }

    /**
     * Relation avec les dossiers actifs du client.
     */
    public function dossiersActifs()
    {
        return $this->hasMany(CrmDossier::class, 'client_id')
                    ->whereIn('statut', [
                        CrmDossier::STATUT_CREE,
                        CrmDossier::STATUT_EN_COURS,
                        CrmDossier::STATUT_EN_ATTENTE
                    ]);
    }

    /**
     * Relation avec les dossiers clôturés du client.
     */
    public function dossiersClotures()
    {
        return $this->hasMany(CrmDossier::class, 'client_id')
                    ->whereIn('statut', [
                        CrmDossier::STATUT_EXECUTE,
                        CrmDossier::STATUT_CLOTURE
                    ]);
    }

    /**
     * Relation avec les baux où le client est locataire.
     */
    public function bauxLocataire()
    {
        return $this->hasMany(CrmBail::class, 'locataire_id');
    }

    /**
     * Relation avec les baux où le client est bailleur.
     */
    public function bauxBailleur()
    {
        return $this->hasMany(CrmBail::class, 'bailleur_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope pour les clients actifs.
     */
    public function scopeActifs($query)
    {
        return $query->where('statut', self::STATUT_ACTIF);
    }

    /**
     * Scope pour les clients (rôle client).
     */
    public function scopeClients($query)
    {
        return $query->whereJsonContains('roles', self::ROLE_CLIENT);
    }

    /**
     * Scope pour les bailleurs.
     */
    public function scopeBailleurs($query)
    {
        return $query->whereJsonContains('roles', self::ROLE_BAILLEUR);
    }

    /**
     * Scope pour les locataires.
     */
    public function scopeLocataires($query)
    {
        return $query->whereJsonContains('roles', self::ROLE_LOCATAIRE);
    }

    /**
     * Scope pour les personnes physiques.
     */
    public function scopePhysiques($query)
    {
        return $query->where('type_client', self::TYPE_PHYSIQUE);
    }

    /**
     * Scope pour les personnes morales.
     */
    public function scopeMorales($query)
    {
        return $query->where('type_client', self::TYPE_MORALE);
    }

    /**
     * Scope pour rechercher par nom, email ou téléphone.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nom', 'like', "%{$search}%")
              ->orWhere('prenom', 'like', "%{$search}%")
              ->orWhere('raison_sociale', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('telephone', 'like', "%{$search}%")
              ->orWhere('siret', 'like', "%{$search}%");
        });
    }

    /**
     * Scope pour filtrer par ville.
     */
    public function scopeByVille($query, $ville)
    {
        return $query->where('ville', $ville);
    }

    /**
     * Scope pour les clients avec dossiers en cours.
     */
    public function scopeAvecDossiersEnCours($query)
    {
        return $query->whereHas('dossiers', function ($q) {
            $q->enCours();
        });
    }

    // ============================================
    // ACCESSORS
    // ============================================

    /**
     * Obtenir le libellé du type de client.
     */
    public function getTypeClientLabelAttribute(): string
    {
        return self::TYPES[$this->type_client] ?? $this->type_client;
    }

    /**
     * Obtenir le libellé du statut.
     */
    public function getStatutLabelAttribute(): string
    {
        return self::STATUTS[$this->statut] ?? $this->statut;
    }

    /**
     * Obtenir le nom complet du client.
     */
    public function getNomCompletAttribute(): string
    {
        if ($this->type_client === self::TYPE_PHYSIQUE) {
            return trim($this->prenom . ' ' . $this->nom);
        }
        
        return $this->raison_sociale ?? 'Client sans nom';
    }

    /**
     * Obtenir le nom court (pour affichage).
     */
    public function getNomCourtAttribute(): string
    {
        $nom = $this->nom_complet;
        return strlen($nom) > 30 ? substr($nom, 0, 27) . '...' : $nom;
    }

    /**
     * Obtenir l'adresse complète formatée.
     */
    public function getAdresseCompleteAttribute(): string
    {
        $parts = [];
        
        if ($this->adresse) {
            $parts[] = $this->adresse;
        }
        if ($this->code_postal) {
            $parts[] = $this->code_postal;
        }
        if ($this->ville) {
            $parts[] = $this->ville;
        }
        if ($this->pays && $this->pays !== 'France') {
            $parts[] = $this->pays;
        }
        
        return implode(' ', $parts);
    }

    /**
     * Obtenir la date de naissance formatée.
     */
    public function getDateNaissanceFormattedAttribute(): string
    {
        return $this->date_naissance ? $this->date_naissance->format('d/m/Y') : '';
    }

    /**
     * Obtenir l'âge du client (pour personnes physiques).
     */
    public function getAgeAttribute(): ?int
    {
        if (!$this->date_naissance || $this->type_client !== self::TYPE_PHYSIQUE) {
            return null;
        }
        
        return $this->date_naissance->age;
    }

    /**
     * Obtenir le nombre total de dossiers.
     */
    public function getTotalDossiersAttribute(): int
    {
        return $this->dossiers()->count();
    }

    /**
     * Obtenir le nombre de dossiers en cours.
     */
    public function getDossiersEnCoursAttribute(): int
    {
        return $this->dossiersActifs()->count();
    }

    /**
     * Obtenir le nombre de dossiers clôturés.
     */
    public function getDossiersCloturesAttribute(): int
    {
        return $this->dossiersClotures()->count();
    }

    /**
     * Obtenir la couleur du statut.
     */
    public function getStatutColorAttribute(): string
    {
        return $this->statut === self::STATUT_ACTIF 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
    }

    /**
     * Obtenir l'icône selon le type de client.
     */
    public function getIconeAttribute(): string
    {
        return $this->type_client === self::TYPE_PHYSIQUE ? 'user' : 'building';
    }

    /**
     * Obtenir la couleur de fond selon le type.
     */
    public function getTypeColorAttribute(): string
    {
        return $this->type_client === self::TYPE_PHYSIQUE 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800';
    }

    /**
     * Obtenir la liste des rôles.
     */
    public function getRolesListAttribute(): array
    {
        return $this->roles ?? [];
    }

    /**
     * Obtenir les libellés des rôles.
     */
    public function getRolesLabelsAttribute(): array
    {
        $roles = $this->roles ?? [];
        return array_map(function ($role) {
            return self::ROLES[$role] ?? $role;
        }, $roles);
    }

    /**
     * Obtenir les rôles sous forme de string.
     */
    public function getRolesStringAttribute(): string
    {
        return implode(', ', $this->roles_labels);
    }

    // ============================================
    // MÉTHODES D'AIDE - RÔLES
    // ============================================

    /**
     * Vérifier si le client a un rôle spécifique.
     */
    public function hasRole(string $role): bool
    {
        return in_array($role, $this->roles ?? []);
    }

    /**
     * Vérifier si le client est un client.
     */
    public function estClient(): bool
    {
        return $this->hasRole(self::ROLE_CLIENT);
    }

    /**
     * Vérifier si le client est un bailleur.
     */
    public function estBailleur(): bool
    {
        return $this->hasRole(self::ROLE_BAILLEUR);
    }

    /**
     * Vérifier si le client est un locataire.
     */
    public function estLocataire(): bool
    {
        return $this->hasRole(self::ROLE_LOCATAIRE);
    }

    // ============================================
    // MÉTHODES D'AIDE - AUTRES
    // ============================================

    /**
     * Vérifier si le client est une personne physique.
     */
    public function estPhysique(): bool
    {
        return $this->type_client === self::TYPE_PHYSIQUE;
    }

    /**
     * Vérifier si le client est une personne morale.
     */
    public function estMorale(): bool
    {
        return $this->type_client === self::TYPE_MORALE;
    }

    /**
     * Vérifier si le client est actif.
     */
    public function estActif(): bool
    {
        return $this->statut === self::STATUT_ACTIF;
    }

    /**
     * Obtenir le dernier dossier du client.
     */
    public function getDernierDossier()
    {
        return $this->dossiers()->latest()->first();
    }

    /**
     * Obtenir la dernière échéance du client.
     */
    public function getDerniereEcheance()
    {
        return CrmEcheance::whereHas('dossier', function ($q) {
            $q->where('client_id', $this->id);
        })->latest('date_echeance')->first();
    }

    /**
     * Obtenir tous les documents du client (à travers ses dossiers).
     */
    public function getDocuments()
    {
        return CrmDocument::whereHas('dossier', function ($q) {
            $q->where('client_id', $this->id);
        })->get();
    }

    /**
     * Obtenir le montant total des dossiers du client.
     */
    public function getMontantTotalAttribute(): float
    {
        return $this->dossiers()->sum('montant') ?? 0;
    }

    /**
     * Formater le téléphone.
     */
    public function getTelephoneFormattedAttribute(): string
    {
        $tel = $this->telephone;
        if (!$tel) {
            return '';
        }
        
        // Format simple : +229 XX XX XX XX
        if (strlen($tel) === 12 && substr($tel, 0, 4) === '+229') {
            return substr($tel, 0, 4) . ' ' .
                   substr($tel, 4, 2) . ' ' .
                   substr($tel, 6, 2) . ' ' .
                   substr($tel, 8, 2) . ' ' .
                   substr($tel, 10, 2);
        }
        
        return $tel;
    }

    // ============================================
    // BOOT
    // ============================================

    /**
     * Définir les valeurs par défaut.
     */
    protected static function booted()
    {
        static::creating(function ($client) {
            if (!$client->statut) {
                $client->statut = self::STATUT_ACTIF;
            }
            if (!$client->pays) {
                $client->pays = 'France';
            }
        });

        static::saving(function ($client) {
            // Nettoyer les champs selon le type
            if ($client->type_client === self::TYPE_PHYSIQUE) {
                $client->raison_sociale = null;
                $client->siret = null;
            } else {
                $client->nom = null;
                $client->prenom = null;
                $client->date_naissance = null;
            }
        });
    }
}