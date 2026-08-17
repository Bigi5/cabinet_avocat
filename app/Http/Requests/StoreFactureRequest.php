<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFactureRequest extends FormRequest

{
    public function authorize(): bool
{
   
    return true;
}

    public function rules(): array
    {
        return [
            'dossier_id' => 'required|exists:crm_dossiers,id',
            'client_id' => 'required|exists:crm_clients,id',
            'date_emission' => 'required|date',
            'date_echeance' => 'required|date|after_or_equal:date_emission',
            'type' => 'required|in:honoraire,frais,avance',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'lignes' => 'required|array|min:1',
            'lignes.*.description' => 'required|string',
            'lignes.*.quantite' => 'required|numeric|min:0.01',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
            'lignes.*.tva' => 'nullable|numeric|min:0|max:100',
        ];
    }
}
