<?php

namespace App\Enums;

enum UserType: string
{
    case ADMIN = 'admin';
    case AVOCAT = 'avocat';
    case COLLABORATEUR = 'collaborateur';
    case CLIENT = 'client';
    
    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'Administrateur',
            self::AVOCAT => 'Avocat',
            self::COLLABORATEUR => 'Collaborateur',
            self::CLIENT => 'Client',
        };
    }
    
    public static function toArray(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }
    
    public static function labels(): array
    {
        return [
            self::ADMIN->value => self::ADMIN->label(),
            self::AVOCAT->value => self::AVOCAT->label(),
            self::COLLABORATEUR->value => self::COLLABORATEUR->label(),
            self::CLIENT->value => self::CLIENT->label(),
        ];
    }
}