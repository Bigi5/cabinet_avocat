<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateSensitiveFilesToLocal extends Command
{
    protected $signature = 'storage:migrate-sensitive-files {--force : Déplace effectivement les fichiers après vérification}';

    protected $description = 'Déplace les fichiers sensibles du disque public vers le disque local privé';

    private const DIRECTORIES = [
        'documents',
        'transmissions',
        'decharges',
        'archives',
        'factures',
    ];

    public function handle(): int
    {
        $source = Storage::disk('public');
        $target = Storage::disk('local');
        $force = $this->option('force');
        $migrated = 0;
        $skipped = 0;

        if (!$force) {
            $this->warn('Mode simulation : relancez avec --force pour déplacer les fichiers.');
        }

        foreach (self::DIRECTORIES as $directory) {
            foreach ($source->allFiles($directory) as $path) {
                if ($target->exists($path)) {
                    if ($source->size($path) !== $target->size($path)) {
                        $this->error("Conflit de taille, fichier ignoré : {$path}");

                        return self::FAILURE;
                    }

                    if ($force) {
                        $source->delete($path);
                    }

                    $skipped++;
                    continue;
                }

                if (!$force) {
                    $this->line("À déplacer : {$path}");
                    continue;
                }

                $stream = $source->readStream($path);

                if (!is_resource($stream)) {
                    $this->error("Lecture impossible : {$path}");

                    return self::FAILURE;
                }

                try {
                    if (!$target->writeStream($path, $stream)) {
                        $this->error("Écriture impossible : {$path}");

                        return self::FAILURE;
                    }
                } finally {
                    fclose($stream);
                }

                if ($source->size($path) !== $target->size($path)) {
                    $target->delete($path);
                    $this->error("Vérification de taille échouée : {$path}");

                    return self::FAILURE;
                }

                $source->delete($path);
                $migrated++;
            }
        }

        $this->info($force
            ? "Migration terminée : {$migrated} fichier(s) déplacé(s), {$skipped} déjà présent(s)."
            : 'Simulation terminée.');

        return self::SUCCESS;
    }
}
