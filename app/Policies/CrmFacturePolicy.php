<?php

namespace App\Policies;

use App\Models\CrmFacture;
use App\Models\CrmUser;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CrmFacturePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser && ($crmUser->isHuissier() || $crmUser->isSenior());
    }

    public function view(User $user, CrmFacture $facture): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser && $this->isFactureOwnerOrManager($crmUser, $facture);
    }

    public function create(User $user): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser && ($crmUser->isHuissier() || $crmUser->isSenior());
    }

    public function update(User $user, CrmFacture $facture): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser
            && $this->isFactureOwnerOrManager($crmUser, $facture)
            && $facture->statut === 'brouillon';
    }

    public function delete(User $user, CrmFacture $facture): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser
            && $this->isFactureOwnerOrManager($crmUser, $facture)
            && $facture->statut === 'brouillon';
    }

    public function sendEmail(User $user, CrmFacture $facture): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser && $this->isFactureOwnerOrManager($crmUser, $facture);
    }

    public function markAsPaid(User $user, CrmFacture $facture): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser && $this->isFactureOwnerOrManager($crmUser, $facture);
    }

    private function activeCrmUser(User $user): ?CrmUser
    {
        $crmUser = $user->crmUser()->where('statut', CrmUser::STATUT_ACTIF)->first();

        return $crmUser ?: null;
    }

    private function isFactureOwnerOrManager(CrmUser $user, CrmFacture $facture): bool
    {
        if ($user->isHuissier() || $user->isSenior()) {
            return true;
        }

        return $user->id === $facture->user_id
            || ($facture->dossier && $facture->dossier->responsable_id === $user->id);
    }
}
