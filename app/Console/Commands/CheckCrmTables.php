<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CheckCrmTables extends Command
{
    protected $signature = 'crm:check-tables';
    protected $description = 'Vérifie l\'état des tables CRM et affiche les statistiques';

    public function handle()
    {
        $this->info('🔍 VÉRIFICATION DES TABLES CRM');
        $this->line(str_repeat('-', 50));

        $tables = [
            'crm_users' => 'Utilisateurs CRM',
            'crm_clients' => 'Clients',
            'crm_dossiers' => 'Dossiers',
            'crm_actes' => 'Actes/Procédures',
            'crm_documents' => 'Documents',
            'crm_echeances' => 'Échéances',
            'crm_dossier_collaborateurs' => 'Collaborateurs par dossier',
            'crm_logs' => 'Logs d\'activité'
        ];

        $results = [];
        
        foreach ($tables as $table => $description) {
            if (Schema::hasTable($table)) {
                $count = DB::table($table)->count();
                $status = '✅ EXISTE';
                $results[] = [
                    'Table' => $table,
                    'Description' => $description,
                    'Statut' => $status,
                    'Enregistrements' => $count,
                    'Structure' => 'OK'
                ];
            } else {
                $status = '❌ MANQUANTE';
                $results[] = [
                    'Table' => $table,
                    'Description' => $description,
                    'Statut' => $status,
                    'Enregistrements' => 'N/A',
                    'Structure' => 'ABSENTE'
                ];
            }
        }

        // Affiche le tableau
        $this->table(
            ['Table', 'Description', 'Statut', 'Enregistrements', 'Structure'],
            $results
        );

        // Vérification des relations
        $this->line(str_repeat('-', 50));
        $this->info('🔗 VÉRIFICATION DES RELATIONS');

        $relations = [
            ['crm_dossiers.client_id' => 'crm_clients.id'],
            ['crm_dossiers.responsable_id' => 'crm_users.id'],
            ['crm_actes.dossier_id' => 'crm_dossiers.id'],
            ['crm_actes.user_id' => 'crm_users.id'],
            ['crm_documents.dossier_id' => 'crm_dossiers.id'],
            ['crm_echeances.dossier_id' => 'crm_dossiers.id'],
            ['crm_echeances.user_id' => 'crm_users.id'],
        ];

        foreach ($relations as $relation) {
            foreach ($relation as $foreign => $primary) {
                list($table, $column) = explode('.', $foreign);
                list($refTable, $refColumn) = explode('.', $primary);
                
                if (Schema::hasTable($table) && Schema::hasColumn($table, $column)) {
                    $this->line("✅ $foreign -> $primary");
                } else {
                    $this->error("❌ $foreign -> $primary (colonne ou table manquante)");
                }
            }
        }

        // Statistiques des rôles
        if (Schema::hasTable('crm_users')) {
            $this->line(str_repeat('-', 50));
            $this->info('👥 RÉPARTITION DES RÔLES CRM');
            
            $roles = DB::table('crm_users')
                ->select('role', DB::raw('COUNT(*) as count'))
                ->groupBy('role')
                ->get();
            
            foreach ($roles as $role) {
                $this->line("  {$role->role}: {$role->count} utilisateur(s)");
            }
        }

        $this->line(str_repeat('-', 50));
        $this->info('🎯 RECOMMANDATIONS :');
        
        $missing = array_filter($results, fn($r) => $r['Statut'] === '❌ MANQUANTE');
        
        if (count($missing) > 0) {
            $this->warn('Tables manquantes :');
            foreach ($missing as $table) {
                $this->line("  - {$table['Table']} ({$table['Description']})");
            }
            $this->line("Exécutez: php artisan migrate");
        } else {
            $this->info('✅ Toutes les tables CRM sont présentes.');
        }

        return Command::SUCCESS;
    }
}