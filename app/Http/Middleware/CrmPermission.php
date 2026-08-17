<?php

namespace App\Http\Middleware;

use App\Enums\CrmPermission as CrmPermissionEnum;
use App\Models\CrmUser;
use App\Services\Crm\CrmAuthorization;
use Closure;
use Illuminate\Http\Request;

class CrmPermission
{
    public function handle(Request $request, Closure $next)
    {
        $routeName = $request->route()?->getName();
        if (!$routeName || !str_starts_with($routeName, 'crm.')) {
            return $next($request);
        }

        $crmUser = $request->get('crm_user');
        if (!$crmUser instanceof CrmUser || $crmUser->statut !== CrmUser::STATUT_ACTIF) {
            abort(403);
        }

        $permission = $this->permissionForRoute($routeName);
        if (!$permission) {
            abort(403);
        }

        if (!CrmAuthorization::userHasPermission($crmUser, $permission)) {
            abort(403);
        }

        return $next($request);
    }

    private function permissionForRoute(string $routeName): ?string
    {
        return match (true) {
            $routeName === 'crm.dashboard' => CrmPermissionEnum::CRM_DASHBOARD->value,
            str_starts_with($routeName, 'crm.clients') => CrmPermissionEnum::CRM_CLIENTS->value,
            str_starts_with($routeName, 'crm.dossiers') => CrmPermissionEnum::CRM_DOSSIERS->value,
            str_starts_with($routeName, 'crm.actes') => CrmPermissionEnum::CRM_ACTES->value,
            str_starts_with($routeName, 'crm.documents') => CrmPermissionEnum::CRM_DOCUMENTS->value,
            str_starts_with($routeName, 'crm.echeances') => CrmPermissionEnum::CRM_ECHEANCES->value,
            str_starts_with($routeName, 'crm.transmissions') => CrmPermissionEnum::CRM_TRANSMISSIONS->value,
            str_starts_with($routeName, 'crm.archives') => CrmPermissionEnum::CRM_ARCHIVES->value,
            str_starts_with($routeName, 'crm.logs') => CrmPermissionEnum::CRM_LOGS->value,
            str_starts_with($routeName, 'crm.statistiques') => CrmPermissionEnum::CRM_STATISTIQUES->value,
            str_starts_with($routeName, 'crm.utilisateurs') => CrmPermissionEnum::CRM_UTILISATEURS->value,
            str_starts_with($routeName, 'crm.baux') => CrmPermissionEnum::CRM_BAUX->value,
            str_starts_with($routeName, 'crm.factures') => CrmPermissionEnum::CRM_FACTURES->value,
            str_starts_with($routeName, 'crm.notifications') => CrmPermissionEnum::CRM_NOTIFICATIONS->value,
            $routeName === 'crm.search' => CrmPermissionEnum::CRM_DASHBOARD->value,
            str_starts_with($routeName, 'crm.quittances') => CrmPermissionEnum::CRM_QUITTANCES->value,
            str_starts_with($routeName, 'crm.baux.paiements') => CrmPermissionEnum::CRM_PAIEMENTS->value,
            default => null,
        };
    }
}
