<?php

namespace App\Models;

use App\Enums\UserType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;


class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'type',
        'telephone',
        'adresse',
        'ville',
        'code_postal',
        'pays',
        'specialite',
        'numero_avocat',
        'taux_horaire',
        'est_actif',
        'notes',
        'date_embauche',
        'date_depart',
        'avatar',
    ];

    protected $appends = [
        'avatar_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'taux_horaire' => 'decimal:2',
        'est_actif' => 'boolean',
        'date_embauche' => 'datetime',
        'date_depart' => 'datetime',
    ];

    // Accesseurs
    public function getTypeLabelAttribute()
    {
        return UserType::tryFrom($this->attributes['type'])?->label() ?? $this->attributes['type'];
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar || !Storage::disk('local')->exists($this->avatar)) {
            return null;
        }

        return route('profile.avatar.show');
    }

    public function getIsAdminAttribute()
    {
        return $this->attributes['type'] === UserType::ADMIN->value;
    }

    public function getIsAvocatAttribute()
    {
        return $this->attributes['type'] === UserType::AVOCAT->value;
    }

    public function getIsCollaborateurAttribute()
    {
        return $this->attributes['type'] === UserType::COLLABORATEUR->value;
    }

    public function getIsClientAttribute()
    {
        return $this->attributes['type'] === UserType::CLIENT->value;
    }

    // Scopes pour filtrer par type
    public function scopeAvocats($query)
    {
        return $query->where('type', UserType::AVOCAT->value);
    }
    
    public function scopeCollaborateurs($query)
    {
        return $query->where('type', UserType::COLLABORATEUR->value);
    }
    
    public function scopeClients($query)
    {
        return $query->where('type', UserType::CLIENT->value);
    }
    
    public function scopeAdmins($query)
    {
        return $query->where('type', UserType::ADMIN->value);
    }
    
    public function scopeActifs($query)
    {
        return $query->where('est_actif', true);
    }
    
    // Méthodes d'aide
    public function estAvocat(): bool
    {
        return $this->type === UserType::AVOCAT->value;
    }
    
    public function estCollaborateur(): bool
    {
        return $this->type === UserType::COLLABORATEUR->value;
    }
    
    public function estClient(): bool
    {
        return $this->type === UserType::CLIENT->value;
    }
    
    public function estAdmin(): bool
    {
        return $this->type === UserType::ADMIN->value;
    }
    
    public function estActif(): bool
    {
        return $this->est_actif === true;
    }
    
    // Relation avec les dossiers (comme client)
    public function dossiersClient()
    {
        return $this->hasMany(\App\Models\CrmDossier::class, 'client_id');
    }

    public function crmUser()
    {
        $crmUserTable = (new \App\Models\CrmUser)->getTable();

        if (Schema::hasColumn($crmUserTable, 'user_id')) {
            return $this->hasOne(\App\Models\CrmUser::class, 'user_id');
        }

        return $this->hasOne(\App\Models\CrmUser::class, 'email', 'email');
    }
    
    // Relation avec les dossiers assignés (comme collaborateur)
    public function dossiersAssignes()
    {
        return $this->belongsToMany(\App\Models\CrmDossier::class, 'crm_dossier_collaborateurs', 'user_id', 'dossier_id')
                    ->withPivot('role')
                    ->withTimestamps();
    }
    
    // Méthode pour vérifier les permissions
    public function canAccessCrm(): bool
    {
        return in_array($this->type, [
            UserType::ADMIN->value,
            UserType::AVOCAT->value,
            UserType::COLLABORATEUR->value
        ]);
    }
    
    public function canAccessClientInterface(): bool
    {
        return $this->type === UserType::CLIENT->value;
    }
}
