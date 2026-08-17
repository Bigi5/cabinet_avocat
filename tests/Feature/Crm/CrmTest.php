<?php

namespace Tests\Feature\Crm;

use App\Models\CrmEmplacement;
use App\Models\CrmUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrmTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_is_accessible(): void
    {
        $this->get('/login')->assertStatus(200);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@cabinet.com',
            'password' => bcrypt('password'),
            'type' => 'avocat',
        ]);

        CrmUser::create([
            'user_id' => $user->id,
            'email' => 'test@cabinet.com',
            'password_hash' => bcrypt('password'),
            'nom' => 'Test',
            'prenom' => 'User',
            'role' => 'huissier',
            'statut' => 'actif',
        ]);

        $response = $this->post('/login', [
            'email' => 'test@cabinet.com',
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
    }

    public function test_crm_dashboard_is_protected(): void
    {
        $this->get('/crm/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_crm(): void
    {
        $user = User::factory()->create([
            'email' => 'test@cabinet.com',
            'password' => bcrypt('password'),
            'type' => 'avocat',
        ]);

        CrmUser::create([
            'user_id' => $user->id,
            'email' => 'test@cabinet.com',
            'password_hash' => bcrypt('password'),
            'nom' => 'Test',
            'prenom' => 'User',
            'role' => 'huissier',
            'statut' => 'actif',
        ]);

        $this->actingAs($user)
            ->get('/crm/dashboard')
            ->assertStatus(200);
    }

    public function test_archives_static_routes_are_resolved_before_archive_show_route(): void
    {
        $user = User::factory()->create([
            'email' => 'archives@cabinet.com',
            'type' => 'admin',
        ]);

        CrmUser::create([
            'user_id' => $user->id,
            'email' => 'archives@cabinet.com',
            'password_hash' => bcrypt('password'),
            'nom' => 'Archives',
            'prenom' => 'User',
            'role' => 'huissier',
            'statut' => 'actif',
        ]);

        CrmEmplacement::create([
            'code' => 'A-001',
            'nom' => 'Armoire A',
            'type' => 'armoire',
            'capacite' => 10,
            'occupation' => 0,
            'statut' => 'actif',
        ]);

        $this->actingAs($user);

        $this->get('/crm/archives/emplacements')->assertStatus(200);
        $this->get('/crm/archives/recherche?q=A-001')->assertStatus(200);
    }
}
