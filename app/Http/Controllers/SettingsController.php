<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function show()
    {
        return Inertia::render('Settings/Show', [
            'settings' => [
                'notifications' => [
                    'email' => true,
                    'sms' => false,
                    'push' => true,
                ],
                'privacy' => [
                    'profile_visibility' => 'private',
                    'data_sharing' => false,
                ],
                'appearance' => [
                    'theme' => 'light',
                    'language' => 'fr',
                ],
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'notifications.email' => 'boolean',
            'notifications.sms' => 'boolean',
            'notifications.push' => 'boolean',
            'privacy.profile_visibility' => 'in:public,private,contacts_only',
            'privacy.data_sharing' => 'boolean',
            'appearance.theme' => 'in:light,dark,system',
            'appearance.language' => 'in:fr,en',
        ]);
        
        // Ici vous stockeriez ces préférences dans la base de données
        // Pour l'instant, on retourne juste un succès
        
        return redirect()->route('settings')->with('success', 'Paramètres mis à jour avec succès.');
    }
}