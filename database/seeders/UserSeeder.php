<?php

namespace Database\Seeders;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. ADMINISTRATEUR (gestion complète)
        User::create([
            'name' => 'Administrateur Cabinet',
            'email' => 'admin@cabinet.com',
            'password' => Hash::make('password123'),
            'type' => UserType::ADMIN->value,
            'telephone' => '+229 0121045016',
            'adresse' => '03 BP 3805',
            'ville' => 'Cotonou',
            'code_postal' => '03',
            'pays' => 'Bénin',
            'est_actif' => true,
            'notes' => 'Administrateur principal - Accès complet',
        ]);
        
        // 2. AVOCAT (gestion des dossiers clients)
        User::create([
            'name' => 'Maître Jean Dupont',
            'email' => 'avocat@cabinet.com',
            'password' => Hash::make('password123'),
            'type' => UserType::AVOCAT->value,
            'telephone' => '+229 0121339492',
            'adresse' => '03 BP 3805',
            'ville' => 'Cotonou',
            'code_postal' => '03',
            'pays' => 'Bénin',
            'specialite' => 'Droit des affaires, Droit commercial',
            'numero_avocat' => 'A12345',
            'taux_horaire' => 350.00,
            'est_actif' => true,
            'notes' => 'Avocat senior - Accès aux dossiers clients',
            'date_embauche' => now()->subYears(5),
        ]);
        
        // 3. COLLABORATEUR (assistance avocat)
        User::create([
            'name' => 'Sophie Martin',
            'email' => 'collaborateur@cabinet.com',
            'password' => Hash::make('password123'),
            'type' => UserType::COLLABORATEUR->value,
            'telephone' => '+229 0123456789',
            'adresse' => '03 BP 3805',
            'ville' => 'Cotonou',
            'code_postal' => '03',
            'pays' => 'Bénin',
            'est_actif' => true,
            'notes' => 'Collaboratrice juridique - Accès limité',
            'date_embauche' => now()->subYears(2),
        ]);
        
        // 4. CLIENT EXEMPLE (interface client)
        User::create([
            'name' => 'Entreprise ABC SARL',
            'email' => 'client@entreprise.com',
            'password' => Hash::make('password123'),
            'type' => UserType::CLIENT->value,
            'telephone' => '+229 0123456780',
            'adresse' => 'Rue du Commerce, 123',
            'ville' => 'Cotonou',
            'code_postal' => '01',
            'pays' => 'Bénin',
            'est_actif' => true,
            'notes' => 'Client entreprise - Dossier commercial n°2024-001',
        ]);
        
        // 5. CLIENT PARTICULIER EXEMPLE
        User::create([
            'name' => 'M. Robert Durand',
            'email' => 'particulier@client.com',
            'password' => Hash::make('password123'),
            'type' => UserType::CLIENT->value,
            'telephone' => '+229 0123456781',
            'adresse' => 'Avenue de la Paix, 45',
            'ville' => 'Cotonou',
            'code_postal' => '02',
            'pays' => 'Bénin',
            'est_actif' => true,
            'notes' => 'Client particulier - Succession',
        ]);
        
        $this->command->info('✅ 5 utilisateurs créés :');
        $this->command->info('   - Admin: admin@cabinet.com / password123');
        $this->command->info('   - Avocat: avocat@cabinet.com / password123');
        $this->command->info('   - Collaborateur: collaborateur@cabinet.com / password123');
        $this->command->info('   - Client entreprise: client@entreprise.com / password123');
        $this->command->info('   - Client particulier: particulier@client.com / password123');
        $this->command->info('');
        $this->command->info('📱 Interfaces d\'accès :');
        $this->command->info('   • Admin/Avocat/Collaborateur → /dashboard (CRM complet)');
        $this->command->info('   • Clients → /dashboard (Interface client limitée)');
    }
}