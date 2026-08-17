<?php

namespace App\Http\Middleware;

use App\Services\Crm\CrmAuthorization;
use Illuminate\Http\Request;
use Inertia\Middleware;
// use Tightenco\Ziggy\Ziggy; // Commenté temporairement

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $crmUser = $request->session()->get('crm_user');

        $crmUserRole = is_array($crmUser) ? ($crmUser['role'] ?? null) : ($crmUser?->role ?? null);

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
                'crm_user' => $crmUser ? [
                    'id' => $crmUser['id'] ?? null,
                    'nom' => $crmUser['nom'] ?? null,
                    'prenom' => $crmUser['prenom'] ?? null,
                    'role' => $crmUser['role'] ?? null,
                    'role_label' => $crmUser['role_label'] ?? null,
                ] : null,
            ],
            'crm_user' => $crmUser,
            'crm_permissions' => $crmUserRole ? CrmAuthorization::getPermissionsForRole($crmUserRole) : [],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
            ],
            // ✅ Notifications avec dossier_id ajouté
            'notifications' => fn () => $request->user()
                ? $request->user()
                    ->unreadNotifications()
                    ->latest()
                    ->take(10)
                    ->get()
                    ->map(function ($notification) {
                        return [
                            'id' => $notification->id,
                            'title' => $notification->data['title'] ?? '',
                            'message' => $notification->data['message'] ?? '',
                            'type' => $notification->data['type'] ?? '',
                            'dossier_id' => $notification->data['dossier_id'] ?? null, // ✅ Ajouté
                            'time' => $notification->created_at->diffForHumans(),
                            'read_at' => $notification->read_at,
                            'dossier_id' => $notification->data['dossier_id'] ?? null,
                        ];
                    })
                : [],
            // COMMENTÉ TEMPORAIREMENT - Ziggy non installé
            /*
            'ziggy' => function () use ($request) {
                return array_merge((new Ziggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
            */
        ]);
    }
}