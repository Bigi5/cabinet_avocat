<?php

namespace Tests\Feature;

use App\Mail\FactureMail;
use App\Models\CrmClient;
use App\Models\CrmDossier;
use App\Models\CrmFacture;
use App\Models\CrmLigneFacture;
use App\Models\CrmUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FacturePdfEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_email_and_archive_facture_when_pdf_generation_is_available(): void
    {
        Mail::fake();
        Storage::fake('local');

        [$user, $facture] = $this->createFactureContext();

        $response = $this->actingAs($user)
            ->post("/crm/factures/{$facture->id}/email");

        $response->assertRedirect();

        if (!class_exists('Barryvdh\\DomPDF\\Facade\\Pdf')) {
            $response->assertSessionHas('error');
            Mail::assertNothingQueued();
            Storage::disk('local')->assertMissing("factures/{$facture->id}/facture-{$facture->reference}.pdf");

            return;
        }

        $response->assertSessionHas('success');
        Mail::assertQueued(FactureMail::class);
        Storage::disk('local')->assertExists("factures/{$facture->id}/facture-{$facture->reference}.pdf");
    }

    public function test_unlinked_laravel_user_cannot_send_facture_email(): void
    {
        [$user, $facture] = $this->createFactureContext();

        $unlinkedUser = User::factory()->create([
            'email' => 'not-crm@example.com',
            'type' => 'avocat',
        ]);

        $this->actingAs($unlinkedUser)
            ->post("/crm/factures/{$facture->id}/email")
            ->assertRedirect('/dashboard');
    }

    private function createFactureContext(): array
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'type' => 'avocat',
        ]);

        $crmUser = CrmUser::create([
            'user_id' => $user->id,
            'email' => 'user@example.com',
            'password_hash' => 'secret',
            'nom' => 'Test',
            'prenom' => 'User',
            'role' => CrmUser::ROLE_ASSISTANTE,
            'statut' => 'actif',
        ]);

        $client = CrmClient::create([
            'type_client' => 'physique',
            'nom' => 'Doe',
            'prenom' => 'John',
            'email' => 'client@example.com',
            'statut' => 'actif',
        ]);

        $dossier = CrmDossier::create([
            'reference_unique' => 'D-TEST-001',
            'type_mission' => 'autre',
            'date_ouverture' => now(),
            'client_id' => $client->id,
            'responsable_id' => $crmUser->id,
            'statut' => 'cree',
        ]);

        $facture = CrmFacture::create([
            'reference' => 'FAC-TEST',
            'dossier_id' => $dossier->id,
            'client_id' => $client->id,
            'date_emission' => now(),
            'date_echeance' => now()->addDays(30),
            'montant_ht' => 10000,
            'tva' => 1800,
            'montant_ttc' => 11800,
            'statut' => 'brouillon',
            'type' => 'honoraire',
            'description' => 'Test',
            'notes' => null,
            'user_id' => $crmUser->id,
        ]);

        CrmLigneFacture::create([
            'facture_id' => $facture->id,
            'description' => 'Service',
            'quantite' => 1,
            'prix_unitaire' => 10000,
            'montant_ht' => 10000,
            'tva' => 18,
            'montant_ttc' => 11800,
        ]);

        return [$user, $facture];
    }
}
