<?php

namespace App\Traits;

use App\Models\CrmLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivities
{
    protected static function bootLogsActivities()
    {
        static::created(function ($model) {
            static::logActivity('create', $model, null, $model->toArray());
        });

        static::updated(function ($model) {
            $oldData = $model->getOriginal();
            $newData = $model->getChanges();
            static::logActivity('update', $model, $oldData, $newData);
        });

        static::deleted(function ($model) {
            static::logActivity('delete', $model, $model->toArray(), null);
        });
    }

    protected static function logActivity($action, $model, $oldData = null, $newData = null)
    {
        $user = Auth::user();
        
        // Chercher l'utilisateur CRM correspondant
        $crmUser = null;
        if ($user) {
            $crmUser = \App\Models\CrmUser::where('email', $user->email)->first();
        }

        CrmLog::create([
            'user_id' => $crmUser->id ?? null,
            'action' => $action,
            'model_type' => static::getModelType($model),
            'model_id' => $model->id,
            'old_data' => $oldData,
            'new_data' => $newData,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    protected static function getModelType($model)
    {
        $className = class_basename($model);
        
        return match ($className) {
            'CrmClient' => 'client',
            'CrmDossier' => 'dossier',
            'CrmActe' => 'acte',
            'CrmDocument' => 'document',
            'CrmEcheance' => 'echeance',
            'CrmUser' => 'utilisateur',
            default => strtolower($className),
        };
    }

    public function logs()
    {
        return $this->morphMany(CrmLog::class, 'model');
    }

    public function logView()
    {
        $user = Auth::user();
        $crmUser = $user ? \App\Models\CrmUser::where('email', $user->email)->first() : null;

        CrmLog::create([
            'user_id' => $crmUser->id ?? null,
            'action' => 'view',
            'model_type' => static::getModelType($this),
            'model_id' => $this->id,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}