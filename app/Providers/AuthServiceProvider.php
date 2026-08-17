<?php

namespace App\Providers;

use App\Models\CrmFacture;
use App\Models\CrmUser;
use App\Policies\CrmFacturePolicy;
use App\Policies\CrmUserPolicy;
use App\Services\Crm\CrmAuthorization;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        CrmFacture::class => CrmFacturePolicy::class,
        CrmUser::class => CrmUserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(function ($user, string $ability) {
            if (!str_starts_with($ability, 'crm.')) {
                return null;
            }

            $crmUser = $user->crmUser;
            if (!$crmUser || $crmUser->statut !== CrmUser::STATUT_ACTIF) {
                return false;
            }

            return CrmAuthorization::userHasPermission($crmUser, $ability);
        });
    }
}
