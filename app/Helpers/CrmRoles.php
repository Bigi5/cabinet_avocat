<?php
namespace App\Helpers;

class CrmRoles
{
    const ROLES = [
        'huissier' => [
            'name' => 'Huissier',
            'permissions' => ['all']
        ],
        'senior' => [
            'name' => 'Senior',
            'permissions' => ['view_all', 'edit_assigned', 'create_actes']
        ],
        'junior' => [
            'name' => 'Junior',
            'permissions' => ['view_assigned', 'upload_docs']
        ],
        'assistant' => [
            'name' => 'Assistant',
            'permissions' => ['view_assigned', 'add_notes']
        ]
    ];
    
    public static function hasPermission($role, $permission)
    {
        if (!isset(self::ROLES[$role])) {
            return false;
        }
        
        return in_array($permission, self::ROLES[$role]['permissions']) || 
               in_array('all', self::ROLES[$role]['permissions']);
    }
}