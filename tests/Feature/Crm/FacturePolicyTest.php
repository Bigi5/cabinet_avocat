<?php

namespace Tests\Feature\Crm;

use App\Models\CrmFacture;
use App\Models\CrmUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FacturePolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_assistant_cannot_create_factures(): void
    {
        $user = User::factory()->create([
            'email' => 'assistant@example.com',
            'type' => 'collaborateur',
        ]);

        CrmUser::create([
            'user_id' => $user->id,
            'email' => 'assistant@example.com',
            'password_hash' => bcrypt('password'),
            'nom' => 'Assistant',
            'prenom' => 'Test',
            'role' => CrmUser::ROLE_ASSISTANT,
            'statut' => CrmUser::STATUT_ACTIF,
        ]);

        $this->actingAs($user);

        $this->assertFalse($user->can('create', CrmFacture::class));
    }

    public function test_senior_can_create_factures(): void
    {
        $user = User::factory()->create([
            'email' => 'senior@example.com',
            'type' => 'avocat',
        ]);

        CrmUser::create([
            'user_id' => $user->id,
            'email' => 'senior@example.com',
            'password_hash' => bcrypt('password'),
            'nom' => 'Senior',
            'prenom' => 'Test',
            'role' => CrmUser::ROLE_SENIOR,
            'statut' => CrmUser::STATUT_ACTIF,
        ]);

        $this->actingAs($user);

        $this->assertTrue($user->can('create', CrmFacture::class));
    }
}
