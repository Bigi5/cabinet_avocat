<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CrmAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return redirect()->route('login')
                ->withErrors(['message' => 'Veuillez vous connecter pour accéder au CRM.']);
        }

        $laravelUser = Auth::user();
        $crmUser = $laravelUser->crmUser;

        if (!$crmUser) {
            return redirect('/dashboard')->withErrors([
                'message' => 'Vous n\'avez pas accès au CRM. Redirection vers votre espace client.',
            ]);
        }

        if ($crmUser->statut !== 'actif') {
            return redirect('/dashboard')->withErrors([
                'message' => 'Votre compte CRM est désactivé. Contactez l\'administrateur.',
            ]);
        }

        $request->merge([
            'crm_user' => $crmUser,
            'crm_user_id' => $crmUser->id,
            'crm_user_role' => $crmUser->role,
            'crm_user_nom' => $crmUser->nom,
        ]);

        $request->session()->put('crm_user', [
            'id' => $crmUser->id,
            'nom' => $crmUser->nom,
            'prenom' => $crmUser->prenom,
            'role' => $crmUser->role,
            'role_label' => $crmUser->role_label,
            'statut' => $crmUser->statut,
        ]);

        return $next($request);
    }
}
