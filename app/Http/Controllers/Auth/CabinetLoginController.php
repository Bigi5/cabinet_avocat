<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class CabinetLoginController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validation
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Chercher l'utilisateur
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'Aucun compte trouvé avec cet email.',
            ])->withInput($request->only('email'));
        }

        // 3. Vérifier si actif
        if (!$user->est_actif) {
            return back()->withErrors([
                'email' => 'Votre compte est désactivé.',
            ])->withInput($request->only('email'));
        }

        // 4. Vérifier le mot de passe
        if (!Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'email' => 'Mot de passe incorrect.',
            ])->withInput($request->only('email'));
        }

        // 5. Connexion Laravel
        Auth::login($user, $request->boolean('remember'));

        // 6. Régénérer la session
        $request->session()->regenerate();

        // 7. Redirection
        return redirect()->intended('/dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}