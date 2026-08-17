<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileAvatarRequest;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ProfileController extends Controller
{
    public function show(): Response
    {
        $user = Auth::user();

        return Inertia::render('Profile/Show', [
            'user' => $this->profileData($user),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        try {
            $user->update($request->validated());
        } catch (Throwable $exception) {
            Log::error('Échec de la mise à jour du profil.', [
                'user_id' => $user->id,
                'exception' => $exception,
            ]);

            return back()->with('error', 'La mise à jour du profil a échoué. Veuillez réessayer.');
        }

        return redirect()->route('profile.edit')->with('message', 'Profil mis à jour avec succès.');
    }

    public function storeAvatar(ProfileAvatarRequest $request): RedirectResponse
    {
        $user = $request->user();
        $avatar = $request->file('avatar');
        $filename = Str::uuid().'.'.$avatar->extension();
        $path = $avatar->storeAs("avatars/{$user->id}", $filename, 'local');
        $previousAvatar = $user->avatar;

        try {
            DB::transaction(function () use ($user, $path): void {
                $user->update(['avatar' => $path]);
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            Log::error("Échec de l'enregistrement de l'avatar.", [
                'user_id' => $user->id,
                'exception' => $exception,
            ]);

            return back()->with('error', "L'avatar n'a pas pu être enregistré. Veuillez réessayer.");
        }

        $this->deleteAvatarFile($user->id, $previousAvatar);

        return redirect()->route('profile.edit')->with('message', 'Avatar mis à jour avec succès.');
    }

    public function destroyAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();
        $avatar = $user->avatar;

        if (!$avatar) {
            return redirect()->route('profile.edit')->with('message', "Aucun avatar n'est associé à ce profil.");
        }

        try {
            DB::transaction(function () use ($user): void {
                $user->update(['avatar' => null]);
            });
        } catch (Throwable $exception) {
            Log::error("Échec de la suppression de l'avatar.", [
                'user_id' => $user->id,
                'exception' => $exception,
            ]);

            return back()->with('error', "L'avatar n'a pas pu être supprimé. Veuillez réessayer.");
        }

        $this->deleteAvatarFile($user->id, $avatar);

        return redirect()->route('profile.edit')->with('message', 'Avatar supprimé avec succès.');
    }

    public function showAvatar(Request $request): StreamedResponse
    {
        $user = $request->user();

        abort_unless(
            $user->avatar && $this->isUserAvatarPath($user->id, $user->avatar) && Storage::disk('local')->exists($user->avatar),
            404,
        );

        return Storage::disk('local')->response($user->avatar, null, [
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ], [
            'password.required' => 'Veuillez confirmer votre mot de passe.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return back()->withErrors(['password' => 'Le mot de passe est incorrect.']);
        }

        $avatar = $user->avatar;

        try {
            DB::transaction(function () use ($user): void {
                $user->delete();
            });
        } catch (Throwable $exception) {
            Log::error('Échec de la suppression du compte.', [
                'user_id' => $user->id,
                'exception' => $exception,
            ]);

            return back()->with('error', 'La suppression du compte a échoué. Veuillez réessayer.');
        }

        $this->deleteAvatarFile($user->id, $avatar);
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function profileData($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'adresse' => $user->adresse,
            'type' => $user->type,
            'type_label' => $user->type_label,
            'avatar_url' => $user->avatar_url,
            'created_at' => $user->created_at?->format('d/m/Y'),
        ];
    }

    private function deleteAvatarFile(int $userId, ?string $path): void
    {
        if (!$path || !$this->isUserAvatarPath($userId, $path)) {
            return;
        }

        try {
            Storage::disk('local')->delete($path);
        } catch (Throwable $exception) {
            Log::warning("Impossible de supprimer le fichier avatar.", [
                'user_id' => $userId,
                'avatar' => $path,
                'exception' => $exception,
            ]);
        }
    }

    private function isUserAvatarPath(int $userId, string $path): bool
    {
        return Str::startsWith($path, "avatars/{$userId}/");
    }
}
