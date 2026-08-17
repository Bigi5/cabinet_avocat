<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmBail;
use App\Models\CrmQuittance;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class QuittanceController extends Controller
{
    public function pdf(Request $request, $id)
    {
        $crmUser = $request->get('crm_user');

        $quittance = CrmQuittance::with([
            'paiement',
            'bail.locataire',
            'bail.bailleur',
        ])->findOrFail($id);

        $canViewAll = $crmUser && ($crmUser->isHuissier() || $crmUser->isSenior());
        $canAccessBail = $crmUser && CrmBail::whereKey($quittance->bail_id)
            ->where(function ($query) use ($crmUser) {
                $query->whereHas('locataire', function ($locataireQuery) use ($crmUser) {
                    $locataireQuery->whereHas('dossiers', function ($dossierQuery) use ($crmUser) {
                        $dossierQuery->where('responsable_id', $crmUser->id);
                    });
                })->orWhereHas('bailleur', function ($bailleurQuery) use ($crmUser) {
                    $bailleurQuery->whereHas('dossiers', function ($dossierQuery) use ($crmUser) {
                        $dossierQuery->where('responsable_id', $crmUser->id);
                    });
                });
            })
            ->exists();

        if (!$canViewAll && !$canAccessBail) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à cette quittance.');
        }

        $pdf = Pdf::loadView(
            'pdf.quittance',
            compact('quittance')
        );

        return $pdf->stream(
            'Quittance-' . $quittance->numero . '.pdf'
        );
    }
}
