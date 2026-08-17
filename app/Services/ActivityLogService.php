<?php

namespace App\Services;

use App\Models\CrmLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    public static function log(
        string $action,
        Model $model,
        ?array $oldData = null,
        ?array $newData = null
    ): void {
        CrmLog::create([
            'user_id'     => Auth::id(),
            'action'      => $action,
            'model_type'  => class_basename($model),
            'model_id'    => $model->getKey(),
            'old_data'    => $oldData,
            'new_data'    => $newData,
            'ip_address'  => request()->ip(),
            'user_agent'  => request()->userAgent(),
        ]);
    }
}