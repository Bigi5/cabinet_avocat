<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )

    ->withSchedule(function (Schedule $schedule): void {

        // Nettoyage automatique des journaux CRM (tous les jours à minuit)
        $schedule->command('crm:clean-logs --days=90')
            ->daily()
            ->withoutOverlapping();

        // Envoi automatique des rappels d'échéances (toutes les heures)
        $schedule->command('crm:send-echeance-rappels')
            ->hourly()
            ->withoutOverlapping()
            ->runInBackground();

    })

    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

        $middleware->alias([
            'crm.auth' => \App\Http\Middleware\CrmAuth::class,
            'crm.permission' => \App\Http\Middleware\CrmPermission::class,
        ]);

        // Optionnel : groupe de middleware CRM
        // $middleware->group('crm', [
        //     \App\Http\Middleware\CrmAuth::class,
        // ]);
    })

    ->withExceptions(function (): void {
        //
    })

    ->create();