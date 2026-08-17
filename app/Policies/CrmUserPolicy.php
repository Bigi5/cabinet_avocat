<?php

namespace App\Policies;

use App\Models\CrmUser;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CrmUserPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser && ($crmUser->isHuissier() || $crmUser->isSenior());
    }

    public function view(User $user, CrmUser $target): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser
            && ($crmUser->isHuissier() || $crmUser->isSenior() || $crmUser->id === $target->id);
    }

    public function create(User $user): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser && $crmUser->isHuissier();
    }

    public function update(User $user, CrmUser $target): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser
            && ($crmUser->isHuissier() || $crmUser->id === $target->id);
    }

    public function delete(User $user, CrmUser $target): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser && $crmUser->isHuissier() && $crmUser->id !== $target->id;
    }

    public function activate(User $user, CrmUser $target): bool
    {
        return $this->delete($user, $target);
    }

    public function deactivate(User $user, CrmUser $target): bool
    {
        return $this->delete($user, $target);
    }

    public function resetPassword(User $user, CrmUser $target): bool
    {
        $crmUser = $this->activeCrmUser($user);

        return $crmUser
            && ($crmUser->isHuissier() || $crmUser->id === $target->id);
    }

    private function activeCrmUser(User $user): ?CrmUser
    {
        return $user->crmUser()->where('statut', CrmUser::STATUT_ACTIF)->first();
    }
}
