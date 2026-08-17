<?php

namespace App\Services\Crm;

use App\Enums\CrmPermission;
use App\Enums\CrmRole;
use App\Models\CrmUser;

class CrmAuthorization
{
    public static function normalizeRole(string $role): string
    {
        return CrmRole::normalize($role);
    }

    public static function getRoleFromValue(string $role): ?CrmRole
    {
        return CrmRole::tryFromNormalized($role);
    }

    public static function getPermissionsForRole(string $role): array
    {
        $crmRole = self::getRoleFromValue($role);

        if (!$crmRole) {
            return [];
        }

        return $crmRole->permissions();
    }

    public static function userPermissions(?CrmUser $crmUser): array
    {
        if (!$crmUser) {
            return [];
        }

        return self::getPermissionsForRole($crmUser->role);
    }

    public static function userHasPermission(?CrmUser $crmUser, string $permission): bool
    {
        if (!$crmUser) {
            return false;
        }

        $permissions = self::userPermissions($crmUser);

        if (in_array('all', $permissions, true)) {
            return true;
        }

        return in_array($permission, $permissions, true);
    }

    public static function userCanAccessRouteResource(?CrmUser $crmUser, string $resource): bool
    {
        if (!$crmUser) {
            return false;
        }

        return self::userHasPermission($crmUser, $resource);
    }
}
