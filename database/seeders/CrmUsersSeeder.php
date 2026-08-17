<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CrmUser;
use Illuminate\Support\Facades\Hash;

class CrmUsersSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'nom' => 'Maître Bernadin Boboe',
                'email' => 'bernadin.boboe@cabinet.bj',
                'password' => Hash::make('password123'),
                'role' => 'huissier',
                'statut' => 'actif',
                'telephone' => '+229 XX XX XX XX',
                'adresse' => 'Cotonou, Bénin',
                'specialite' => 'Droit des affaires, Contentieux',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Admin Cabinet',
                'email' => 'admin@cabinet.bj',
                'password' => Hash::make('admin123'),
                'role' => 'huissier',
                'statut' => 'actif',
                'telephone' => '+229 XX XX XX XX',
                'adresse' => 'Cotonou, Bénin',
                'specialite' => 'Administration',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Collaborateur 1',
                'email' => 'collab1@cabinet.bj',
                'password' => Hash::make('collab123'),
                'role' => 'assistante',
                'statut' => 'actif',
                'telephone' => '+229 XX XX XX XX',
                'adresse' => 'Cotonou, Bénin',
                'specialite' => 'Dossier client',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            CrmUser::create($user);
        }
    }
}