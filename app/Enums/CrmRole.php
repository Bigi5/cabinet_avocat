<?php

namespace App\Enums;

enum CrmRole: string
{
    case HUISSIER = 'huissier';
    case SENIOR = 'senior';
    case SECRETAIRE = 'secretaire';
    case ASSISTANTE = 'assistante';
    case GESTIONNAIRE_BAUX = 'gestionnaire_baux';
    case CLIENT = 'client';

    public function label(): string
    {
        return match ($this) {
            self::HUISSIER => 'Huissier',
            self::SENIOR => 'Senior',
            self::SECRETAIRE => 'Secrétaire',
            self::ASSISTANTE => 'Assistante',
            self::GESTIONNAIRE_BAUX => 'Gestionnaire de baux',
            self::CLIENT => 'Client',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::HUISSIER => 'bg-purple-100 text-purple-800',
            self::SENIOR => 'bg-blue-100 text-blue-800',
            self::SECRETAIRE => 'bg-emerald-100 text-emerald-800',
            self::ASSISTANTE => 'bg-amber-100 text-amber-800',
            self::GESTIONNAIRE_BAUX => 'bg-indigo-100 text-indigo-800',
            self::CLIENT => 'bg-slate-100 text-slate-800',
        };
    }

    public function permissions(): array
    {
        return match ($this) {
            self::HUISSIER => ['all'],
            self::SENIOR => [
                'crm.dashboard',
                'crm.clients',
                'crm.dossiers',
                'crm.actes',
                'crm.documents',
                'crm.echeances',
                'crm.baux',
                'crm.factures',
                'crm.transmissions',
                'crm.archives',
                'crm.logs',
                'crm.statistiques',
                'crm.notifications',
                'crm.utilisateurs',
            ],
            self::SECRETAIRE => [
                'crm.dashboard',
                'crm.clients',
                'crm.dossiers',
                'crm.documents',
                'crm.echeances',
                'crm.factures',
                'crm.transmissions',
                'crm.archives',
                'crm.notifications',
            ],
            self::ASSISTANTE => [
                'crm.dashboard',
                'crm.clients',
                'crm.documents',
                'crm.echeances',
                'crm.factures',
                'crm.transmissions',
                'crm.notifications',
            ],
            self::GESTIONNAIRE_BAUX => [
                'crm.dashboard',
                'crm.baux',
                'crm.loyers',
                'crm.paiements',
                'crm.quittances',
                'crm.notifications',
            ],
            self::CLIENT => ['crm.client.dashboard'],
        };
    }

    public static function normalize(string $role): string
    {
        return match (strtolower($role)) {
            'avocat_principal', 'admin' => self::HUISSIER->value,
            'junior', 'collaborateur', 'assistant' => self::ASSISTANTE->value,
            default => $role,
        };
    }

    public static function tryFromNormalized(string $role): ?self
    {
        return self::tryFrom(self::normalize($role));
    }
}
