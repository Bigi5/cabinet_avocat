<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_updates_the_actual_user_columns(): void
    {
        $user = User::factory()->create([
            'telephone' => null,
            'adresse' => null,
        ]);

        $response = $this->actingAs($user)->patch(route('profile.update'), [
            'name' => 'Marie Dupont',
            'email' => 'marie.dupont@example.test',
            'telephone' => '+229 01 23 45 67 89',
            'adresse' => 'Cotonou, Bénin',
        ]);

        $response->assertRedirect(route('profile.edit'));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Marie Dupont',
            'email' => 'marie.dupont@example.test',
            'telephone' => '+229 01 23 45 67 89',
            'adresse' => 'Cotonou, Bénin',
        ]);
    }

    public function test_profile_avatar_is_stored_privately_and_served_only_to_the_authenticated_user(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('avatar.png', 120, 120),
        ]);

        $response->assertRedirect(route('profile.edit'));
        $avatar = $user->fresh()->avatar;

        $this->assertNotNull($avatar);
        $this->assertStringStartsWith("avatars/{$user->id}/", $avatar);
        Storage::disk('local')->assertExists($avatar);
        $this->actingAs($user)->get(route('profile.avatar.show'))->assertOk();
        $this->actingAs(User::factory()->create())->get(route('profile.avatar.show'))->assertNotFound();
    }

    public function test_profile_avatar_rejects_invalid_files(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from(route('profile.edit'))
            ->post(route('profile.avatar.store'), [
                'avatar' => UploadedFile::fake()->create('avatar.pdf', 100, 'application/pdf'),
            ])
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHasErrors('avatar');
    }
}
