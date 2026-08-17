<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\CabinetLoginController;
use App\Http\Controllers\Crm\Auth\ClientsController;
use App\Http\Controllers\Crm\Auth\DossiersController;
use App\Http\Controllers\Crm\Auth\ActesController;
use App\Http\Controllers\Crm\Auth\DocumentsController;
use App\Http\Controllers\Crm\Auth\EcheancesController;
use App\Http\Controllers\Crm\Auth\UtilisateursController;
use App\Http\Controllers\Crm\Auth\DashboardController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Crm\Auth\LogsController;
use App\Http\Controllers\Crm\BauxController;
use App\Http\Controllers\Crm\PaiementsLoyersController;
use App\Http\Controllers\Crm\FacturesController;
use App\Http\Controllers\Crm\PaiementsController;
use App\Http\Controllers\Crm\TransmissionsController;
use App\Http\Controllers\Crm\ArchivesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Crm\QuittanceController;
use App\Http\Controllers\NotificationController;


// ============================================
// PAGE D'ACCUEIL
// ============================================
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

// ============================================
// PAGES PUBLIQUES DU SITE
// ============================================
Route::get('/le-cabinet', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/services', function () {
    return Inertia::render('Services');
})->name('services');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

// Sous-pages services
Route::get('/services/particuliers', function () {
    return Inertia::render('services/Particuliers');
})->name('services.particuliers');

Route::get('/services/entreprises', function () {
    return Inertia::render('services/Entreprises');
})->name('services.entreprises');

Route::get('/services/professionnels', function () {
    return Inertia::render('services/Professionnels');
})->name('services.professionnels');

Route::get('/services/specialises', function () {
    return Inertia::render('services/Specialises');
})->name('services.specialises');

Route::get('/services/detail', function () {
    return Inertia::render('services/Detail');
})->name('services.detail');

// ============================================
// ROUTES D'AUTHENTIFICATION
// ============================================
Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

Route::post('/login', [CabinetLoginController::class, 'login'])
    ->name('login.submit')
    ->middleware('throttle:10,1');

Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
})->name('logout')->middleware('throttle:10,1');

// ============================================
// ROUTES PROTÉGÉES (tous les utilisateurs connectés)
// ============================================
Route::middleware(['auth'])->group(function () {
    
    Route::get('/dashboard', function () {
        $user = Auth::user();

        if ($user->estClient()) {
            return Inertia::render('Client/Dashboard', [
                'client' => [
                    'id' => $user->id,
                    'nom' => $user->name,
                    'prenom' => '',
                    'email' => $user->email,
                    'telephone' => $user->telephone ?? '',
                    'adresse' => $user->adresse ?? '',
                    'date_inscription' => $user->created_at->format('Y-m-d'),
                ],
                'stats' => [
                    'en_cours' => 0,
                    'resolus' => 0,
                    'documents' => 0,
                    'rendez_vous' => 0,
                    'total_dossiers' => 0,
                ],
                'ongoingCases' => [],
                'resolvedCases' => [],
                'prochainRdv' => null,
            ]);
        } else {
            return redirect()->route('crm.dashboard');
        }
    })->name('dashboard');
    
    // Routes du profil
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/avatar', [ProfileController::class, 'storeAvatar'])->name('profile.avatar.store');
    Route::delete('/profile/avatar', [ProfileController::class, 'destroyAvatar'])->name('profile.avatar.destroy');
    Route::get('/profile/avatar', [ProfileController::class, 'showAvatar'])->name('profile.avatar.show');
    
    Route::get('/settings', [SettingsController::class, 'show'])->name('settings');
    Route::put('/settings', [SettingsController::class, 'update'])->name('settings.update');
    
});

// ============================================
// ROUTES CRM (accès restreint au personnel uniquement)
// ============================================
Route::middleware(['auth', 'crm.auth', 'crm.permission'])->prefix('crm')->name('crm.')->group(function () {
    
    // Dashboard CRM
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Clients
    Route::get('/clients', [ClientsController::class, 'index'])->name('clients.index');
    Route::get('/clients/create', [ClientsController::class, 'create'])->name('clients.create');
    Route::post('/clients', [ClientsController::class, 'store'])->name('clients.store');
    Route::get('/clients/{id}', [ClientsController::class, 'show'])->name('clients.show');
    Route::get('/clients/{id}/edit', [ClientsController::class, 'edit'])->name('clients.edit');
    Route::put('/clients/{id}', [ClientsController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{id}', [ClientsController::class, 'destroy'])->name('clients.destroy');
    
    // Dossiers
    Route::get('/dossiers', [DossiersController::class, 'index'])->name('dossiers.index');
    Route::get('/dossiers/create', [DossiersController::class, 'create'])->name('dossiers.create');
    Route::post('/dossiers', [DossiersController::class, 'store'])->name('dossiers.store');
    Route::get('/dossiers/{id}', [DossiersController::class, 'show'])->name('dossiers.show');
    Route::get('/dossiers/{id}/edit', [DossiersController::class, 'edit'])->name('dossiers.edit');
    Route::put('/dossiers/{id}', [DossiersController::class, 'update'])->name('dossiers.update');
    Route::delete('/dossiers/{id}', [DossiersController::class, 'destroy'])->name('dossiers.destroy');
    Route::post('/dossiers/{id}/statut', [DossiersController::class, 'changeStatut'])->name('dossiers.statut');
    Route::post('/dossiers/{id}/collaborateurs', [DossiersController::class, 'addCollaborateur'])->name('dossiers.collaborateurs.add');
    Route::delete('/dossiers/{id}/collaborateurs/{userId}', [DossiersController::class, 'removeCollaborateur'])->name('dossiers.collaborateurs.remove');
    
    // Actes
    Route::get('/actes', [ActesController::class, 'index'])->name('actes.index');
    Route::get('/actes/create', [ActesController::class, 'create'])->name('actes.create');
    Route::post('/actes', [ActesController::class, 'store'])->name('actes.store');
    Route::get('/actes/{id}', [ActesController::class, 'show'])->name('actes.show');
    Route::get('/actes/{id}/edit', [ActesController::class, 'edit'])->name('actes.edit');
    Route::put('/actes/{id}', [ActesController::class, 'update'])->name('actes.update');
    Route::delete('/actes/{id}', [ActesController::class, 'destroy'])->name('actes.destroy');
    Route::post('/actes/export/dossier/{dossierId}', [ActesController::class, 'exportByDossier'])->name('actes.export.dossier');
    
    // Documents
    Route::get('/documents', [DocumentsController::class, 'index'])->name('documents.index');
    Route::get('/documents/create', [DocumentsController::class, 'create'])->name('documents.create');
    Route::post('/documents', [DocumentsController::class, 'store'])->name('documents.store');
    Route::get('/documents/{id}', [DocumentsController::class, 'show'])->name('documents.show');
    Route::get('/documents/{id}/edit', [DocumentsController::class, 'edit'])->name('documents.edit');
    Route::put('/documents/{id}', [DocumentsController::class, 'update'])->name('documents.update');
    Route::delete('/documents/{id}', [DocumentsController::class, 'destroy'])->name('documents.destroy');
    Route::get('/documents/{id}/download', [DocumentsController::class, 'download'])->name('documents.download');
    Route::post('/documents/{id}/version', [DocumentsController::class, 'updateVersion'])->name('documents.version');
    
    // Échéances
    Route::get('/echeances', [EcheancesController::class, 'index'])->name('echeances.index');
    Route::get('/echeances/create', [EcheancesController::class, 'create'])->name('echeances.create');
    Route::post('/echeances', [EcheancesController::class, 'store'])->name('echeances.store');
    Route::get('/echeances/{id}', [EcheancesController::class, 'show'])->name('echeances.show');
    Route::get('/echeances/{id}/edit', [EcheancesController::class, 'edit'])->name('echeances.edit');
    Route::put('/echeances/{id}', [EcheancesController::class, 'update'])->name('echeances.update');
    Route::delete('/echeances/{id}', [EcheancesController::class, 'destroy'])->name('echeances.destroy');
    Route::post('/echeances/{id}/statut', [EcheancesController::class, 'changeStatut'])->name('echeances.statut');
    Route::post('/echeances/{id}/done', [EcheancesController::class, 'markAsDone'])->name('echeances.done');
    Route::post('/echeances/{id}/reminder', [EcheancesController::class, 'reminder'])->name('echeances.reminder');
    Route::post('/echeances/{id}/report', [EcheancesController::class, 'report'])->name('echeances.report');
    
    // Utilisateurs
    Route::get('/utilisateurs', [UtilisateursController::class, 'index'])->name('utilisateurs.index');
    Route::get('/utilisateurs/create', [UtilisateursController::class, 'create'])->name('utilisateurs.create');
    Route::post('/utilisateurs', [UtilisateursController::class, 'store'])->name('utilisateurs.store');
    Route::get('/utilisateurs/{id}', [UtilisateursController::class, 'show'])->name('utilisateurs.show');
    Route::get('/utilisateurs/{id}/edit', [UtilisateursController::class, 'edit'])->name('utilisateurs.edit');
    Route::put('/utilisateurs/{id}', [UtilisateursController::class, 'update'])->name('utilisateurs.update');
    Route::delete('/utilisateurs/{id}', [UtilisateursController::class, 'destroy'])->name('utilisateurs.destroy');
    Route::post('/utilisateurs/{id}/activate', [UtilisateursController::class, 'activate'])->name('utilisateurs.activate');
    Route::post('/utilisateurs/{id}/deactivate', [UtilisateursController::class, 'deactivate'])->name('utilisateurs.deactivate');
    Route::post('/utilisateurs/{id}/reset-password', [UtilisateursController::class, 'resetPassword'])->name('utilisateurs.reset-password');
    
    // Logs
    Route::get('/logs', [LogsController::class, 'index'])->name('logs.index');
    Route::get('/logs/{id}', [LogsController::class, 'show'])->name('logs.show');
    
    // Statistiques
    Route::get('/statistiques', function () {
        return Inertia::render('Crm/Statistiques');
    })->name('statistiques');
    
    // ============================================
    // ROUTES POUR LES BAUX
    // ============================================
    Route::resource('baux', BauxController::class);
    Route::post('baux/{id}/generate-echeances', [BauxController::class, 'generateEcheances'])->name('baux.generate-echeances');
    Route::post('baux/{id}/paiements', [PaiementsLoyersController::class, 'store'])->name('baux.paiements.store');
    Route::get('baux/{id}/pdf', [BauxController::class, 'pdf'])->name('baux.pdf');
    
    // ============================================
    // ROUTES POUR LES FACTURES
    // ============================================
    Route::get('factures', [FacturesController::class, 'index'])->name('factures.index');
    Route::get('factures/create', [FacturesController::class, 'create'])->name('factures.create');
    Route::post('factures', [FacturesController::class, 'store'])->name('factures.store');
    Route::get('factures/{facture}', [FacturesController::class, 'show'])->name('factures.show');
    Route::get('factures/{facture}/edit', [FacturesController::class, 'edit'])->name('factures.edit');
    Route::put('factures/{facture}', [FacturesController::class, 'update'])->name('factures.update');
    Route::delete('factures/{facture}', [FacturesController::class, 'destroy'])->name('factures.destroy');
    Route::post('factures/{facture}/validate', [FacturesController::class, 'validateFacture'])->name('factures.validate');
    Route::post('factures/{facture}/mark-as-paid', [FacturesController::class, 'markAsPaid'])->name('factures.mark-as-paid');
    Route::post('factures/{facture}/paiements', [PaiementsController::class, 'store'])->name('factures.paiements.store');
    Route::get('factures/{facture}/pdf', [FacturesController::class, 'pdf'])->name('factures.pdf');
    Route::post('factures/{facture}/email', [FacturesController::class, 'sendEmail'])->name('factures.email')->middleware('throttle:20,1');

    // ============================================
    // ROUTES POUR LES QUITTANCES
    // ============================================
    Route::get('quittances/{id}/pdf', [QuittanceController::class, 'pdf'])->name('quittances.pdf');
    
    // ============================================
    // ROUTES POUR LES TRANSMISSIONS
    // ============================================
    Route::resource('transmissions', TransmissionsController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
    Route::post('transmissions/{id}/generate-decharge', [TransmissionsController::class, 'generateDecharge'])->name('transmissions.generate-decharge');
    Route::post('transmissions/{id}/sign', [TransmissionsController::class, 'sign'])->name('transmissions.sign');
    Route::get('transmissions/{id}/files/{type}', [TransmissionsController::class, 'viewFile'])->name('transmissions.files.show');
    Route::get('transmissions/{id}/pdf', [TransmissionsController::class, 'pdf'])->name('transmissions.pdf');

    // ============================================
    // ROUTES POUR LES ARCHIVES
    // ============================================
    Route::prefix('archives')->name('archives.')->group(function () {
        // Consultation
        Route::get('/', [ArchivesController::class, 'index'])->name('index');
        Route::get('/categories', [ArchivesController::class, 'categories'])->name('categories');
        Route::get('/emplacements', [ArchivesController::class, 'emplacements'])->name('emplacements');
        Route::get('/recherche', [ArchivesController::class, 'recherche'])->name('recherche');
        Route::get('/{id}', [ArchivesController::class, 'show'])->name('show');

        // Création
        Route::post('/emplacements', [ArchivesController::class, 'storeEmplacement'])->name('emplacements.store');
        Route::post('/physique', [ArchivesController::class, 'storePhysique'])->name('physique.store');

        // Documents
        Route::post('/{id}/documents', [ArchivesController::class, 'ajouterDocument'])->name('documents.store');
        Route::get('/documents/{document}/telecharger', [ArchivesController::class, 'telechargerDocument'])->name('documents.download');
        Route::delete('/documents/{document}', [ArchivesController::class, 'supprimerDocument'])->name('documents.destroy');
        Route::get('/{id}/telecharger-zip', [ArchivesController::class, 'telechargerArchiveZip'])->name('telecharger-zip');

        // Restauration
        Route::post('/{id}/restaurer', [ArchivesController::class, 'restaurer'])->name('restaurer');
        Route::post('/{id}/confirmer-restauration', [ArchivesController::class, 'confirmerRestauration'])->name('confirmer-restauration');
    });

    // Routes pour archiver depuis dossiers/documents (hors du groupe archives mais dans le groupe crm)
    Route::post('dossiers/{id}/archiver', [ArchivesController::class, 'archiverDossier'])->name('dossiers.archiver');
    Route::post('documents/{id}/archiver', [ArchivesController::class, 'archiverDocument'])->name('documents.archiver');
    
    // ============================================
    // ROUTE DE RECHERCHE GLOBALE
    // ============================================
    Route::get('/search', [DashboardController::class, 'search'])->name('search');
    
    // ============================================
    // ROUTES CRM PROFIL (pour le frontend)
    // ============================================
    Route::get('/profile', function () {
        return redirect()->route('profile.edit');
    })->name('profile');
    
    Route::get('/settings', function () {
        return redirect()->route('settings');
    })->name('settings');
    
Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])
    ->name('notifications.read');

Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])
    ->name('notifications.readAll');
}); // ✅ Fermeture du groupe crm

// ============================================
// IMPORTANT : CETTE LIGNE DOIT ÊTRE COMMENTÉE
// ============================================
require __DIR__.'/auth.php';
