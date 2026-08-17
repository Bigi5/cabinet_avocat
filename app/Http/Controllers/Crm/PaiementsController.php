<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmFacture;
use App\Models\CrmPaiement;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaiementsController extends Controller
{
    public function store(Request $request, $factureId)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$crmUser || !$crmUser->est_actif) {
            return redirect()->back()->with('error', 'Utilisateur CRM non trouvé ou inactif.');
        }

        if (!$crmUser->isHuissier() && !$crmUser->isSenior()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à cette action.');
        }

        $facture = CrmFacture::findOrFail($factureId);

        $validated = $request->validate([
            'montant' => 'required|numeric|min:0',
            'date_paiement' => 'required|date',
            'mode' => 'required|in:especes,cheque,virement,carte',
            'reference_cheque' => 'nullable|string|max:50',
            'observations' => 'nullable|string',
        ]);

        $paiement = CrmPaiement::create([
            'facture_id' => $facture->id,
            'dossier_id' => $facture->dossier_id,
            'client_id' => $facture->client_id,
            'montant' => $validated['montant'],
            'date_paiement' => $validated['date_paiement'],
            'mode' => $validated['mode'],
            'reference_cheque' => $validated['reference_cheque'],
            'observations' => $validated['observations'],
            'user_id' => $crmUser->id ?? null,
        ]);

        ActivityLogService::log(
            action: 'paiement_created',
            model: $paiement,
            newData: $paiement->toArray()
        );

        // Mettre à jour le statut de la facture
        $totalPaye = $facture->paiements()->sum('montant');
        if ($totalPaye >= $facture->montant_ttc) {
            $facture->update(['statut' => 'payee']);
        } elseif ($totalPaye > 0) {
            $facture->update(['statut' => 'envoyee']);
        }

        return redirect()->back()->with('success', 'Paiement enregistré avec succès.');
    }

    public function destroy($id)
    {
        $crmUser = request()->get('crm_user');

        if (!$crmUser || !$crmUser->est_actif) {
            return redirect()->back()->with('error', 'Utilisateur CRM non trouvé ou inactif.');
        }

        if (!$crmUser->isHuissier() && !$crmUser->isSenior()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à cette action.');
        }

        $paiement = CrmPaiement::findOrFail($id);
        $facture = $paiement->facture;
        $oldData = $paiement->toArray();

        $paiement->delete();

        // Recalculer le statut de la facture
        $totalPaye = $facture->paiements()->sum('montant');
        if ($totalPaye >= $facture->montant_ttc) {
            $facture->update(['statut' => 'payee']);
        } elseif ($totalPaye > 0) {
            $facture->update(['statut' => 'envoyee']);
        } else {
            $facture->update(['statut' => 'envoyee']);
        }

        ActivityLogService::log(
            action: 'paiement_deleted',
            model: $facture,
            oldData: $oldData
        );

        return redirect()->back()->with('success', 'Paiement supprimé.');
    }
}
