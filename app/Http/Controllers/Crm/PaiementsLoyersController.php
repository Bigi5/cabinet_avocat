<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmPaiementLoyer;
use App\Models\CrmBail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\CrmQuittance;
use App\Services\ActivityLogService;

class PaiementsLoyersController extends Controller
{
    public function store(Request $request, $bailId)
    {
        $user = Auth::user();
        $crmUser = $request->get('crm_user');

        if (!$user) {
            return redirect()->route('login');
        }

        if (!$crmUser || !$crmUser->est_actif) {
            return redirect()->back()->with('error', 'Utilisateur CRM non trouvé ou inactif.');
        }

        if (!$crmUser->isHuissier() && !$crmUser->isSenior()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à cette action.');
        }

        $bail = CrmBail::findOrFail($bailId);

        $validated = $request->validate([
            'montant' => 'required|numeric|min:0',
            'date_paiement' => 'required|date',
            'mois_concerne' => 'required|date_format:Y-m',
            'mode_paiement' => 'required|in:especes,cheque,virement,carte',
            'reference_cheque' => 'nullable|string|max:50',
            'observations' => 'nullable|string',
        ]);

        $paiement = CrmPaiementLoyer::create([
            'bail_id' => $bail->id,
            'montant' => $validated['montant'],
            'date_paiement' => $validated['date_paiement'],
            'mois_concerne' => $validated['mois_concerne'] . '-01',
            'mode_paiement' => $validated['mode_paiement'],
            'statut' => $validated['montant'] >= $bail->montant_loyer ? 'paye' : 'partiel',
            'reference_cheque' => $validated['reference_cheque'],
            'observations' => $validated['observations'],
            'user_id' => $crmUser->id ?? null,
        ]);

        ActivityLogService::log(
            action: 'paiement_loyer_created',
            model: $paiement,
            newData: $paiement->toArray()
        );
        CrmQuittance::create([
    'paiement_id'     => $paiement->id,
    'bail_id'         => $bail->id,
    'numero'          => CrmQuittance::genererNumero(),
    'date_quittance'  => now(),
    'montant'         => $paiement->montant,
    'mois'            => $paiement->mois_concerne,
]);

        // Mettre à jour l'échéance correspondante si elle existe
        $echeance = $bail->echeances()
            ->where('date_echeance', '>=', $validated['mois_concerne'] . '-01')
            ->where('date_echeance', '<=', $validated['mois_concerne'] . '-31')
            ->first();

        if ($echeance) {
            $echeance->update([
                'statut' => $paiement->statut,
                'paiement_id' => $paiement->id,
            ]);
        }

        return redirect()->back()->with('success', 'Paiement enregistré avec succès.');
    }

    public function update(Request $request, $id)
    {
        $crmUser = $request->get('crm_user');

        if (!$crmUser || !$crmUser->est_actif) {
            return redirect()->back()->with('error', 'Utilisateur CRM non trouvé ou inactif.');
        }

        if (!$crmUser->isHuissier() && !$crmUser->isSenior()) {
            return redirect()->back()->with('error', 'Vous n\'avez pas accès à cette action.');
        }

        $paiement = CrmPaiementLoyer::findOrFail($id);
        $oldData = $paiement->toArray();

        $validated = $request->validate([
            'cheque_encaisse' => 'nullable|boolean',
        ]);

        $paiement->update(['cheque_encaisse' => $validated['cheque_encaisse'] ?? false]);

        ActivityLogService::log(
            action: 'paiement_loyer_updated',
            model: $paiement,
            oldData: $oldData,
            newData: $paiement->fresh()->toArray()
        );

        return redirect()->back()->with('success', 'Paiement mis à jour.');
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

        $paiement = CrmPaiementLoyer::findOrFail($id);
        $oldData = $paiement->toArray();
        $paiement->delete();

        ActivityLogService::log(
            action: 'paiement_loyer_deleted',
            model: $paiement,
            oldData: $oldData
        );

        return redirect()->back()->with('success', 'Paiement supprimé.');
    }
}
