<?php

namespace App\Services\Crm;

use App\Models\CrmBail;
use App\Models\CrmTransmission;
use App\Models\CrmUser;

class CrmAccessService
{
    public static function canAccessBail(CrmUser $crmUser, CrmBail $bail): bool
    {
        if ($crmUser->isHuissier() || $crmUser->isSenior()) {
            return true;
        }

        if (!$bail->dossier_id) {
            return false;
        }

        return $crmUser->peutAccederDossier($bail->dossier_id);
    }

    public static function canAccessTransmission(CrmUser $crmUser, CrmTransmission $transmission): bool
    {
        if ($crmUser->isHuissier() || $crmUser->isSenior()) {
            return true;
        }

        if ($transmission->emetteur_id === $crmUser->id) {
            return true;
        }

        if ($transmission->dossier_id && $crmUser->peutAccederDossier($transmission->dossier_id)) {
            return true;
        }

        return false;
    }
}
