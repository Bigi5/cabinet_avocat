<?php

namespace App\Services;

use App\Models\CrmArchive;
use App\Models\CrmArchiveHistorique;
use App\Models\CrmArchiveDocument;
use App\Models\CrmDossier;
use App\Models\CrmUser;
use Illuminate\Support\Facades\DB;

class ArchiveService
{
    /**
     * Archive automatiquement un dossier clôturé.
     */
    public function archiverDossier(CrmDossier $dossier, CrmUser $user): CrmArchive
    {
        return DB::transaction(function () use ($dossier, $user) {

            // Empêche un double archivage
            $archiveExistante = CrmArchive::where('type', 'dossier')
                ->where('original_id', $dossier->id)
                ->first();

            if ($archiveExistante) {
                return $archiveExistante;
            }

            // Génération de la référence
        $reference = $this->genererReference();
        logger('ArchiveService appelé', [
    'dossier_id' => $dossier->id,
    'reference' => $dossier->reference_unique,
]);
            // Création de l'archive
            $archive = CrmArchive::create([
                'reference' => $reference,

                'type' => 'dossier',
                'type_label' => 'Dossier',

                'source' => 'dossier',

                'original_id' => $dossier->id,
                'original_reference' => $dossier->reference_unique,

                'titre' => $dossier->reference_unique,

                'categorie' => $dossier->type_mission_label,

                'description' => $dossier->description,

                'date_archivage' => now(),

                'motif' => 'cloture',

                'motif_label' => 'Dossier clôturé',

                'archive_par' => $user->id,

                'statut' => 'archive',
            ]);

            /*
             * La copie des documents
             * sera ajoutée à l'étape suivante.
             */

            CrmArchiveHistorique::create([
                'archive_id' => $archive->id,
                'action' => 'archivage',
                'action_label' => 'Archivage automatique',
                'description' => 'Archivage du dossier après clôture.',
                'user_id' => $user->id,
            ]);

            return $archive;
        });
    }

    /**
     * Génération de la référence ARCH-...
     */
    private function genererReference(): string
    {
        $numero = CrmArchive::count() + 1;

        return sprintf(
            'ARCH-DOS-%s-%04d',
            now()->format('Ymd'),
            $numero
        );
    }
}   