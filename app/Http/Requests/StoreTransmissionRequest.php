<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransmissionRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation.
     */
    public function rules(): array
    {
        return [
            // Dossier et document
            'dossier_id' => 'nullable|exists:crm_dossiers,id',
            'document_id' => 'nullable|exists:crm_documents,id',

            // Type et statut
            'type' => 'required|in:remise,transmission,notification,signification,retour_dossier,courrier,convocation,decision',
            'statut' => 'nullable|in:brouillon,en_attente,envoye,recu,signe,archive,annule,refuse',

            // Destinataire
            'destinataire_nom' => 'required|string|max:255',
            'destinataire_email' => 'nullable|email|max:255',
            'destinataire_telephone' => 'nullable|string|max:30',
            'destinataire_fonction' => 'nullable|string|max:255',
            'destinataire_organisation' => 'nullable|string|max:255',
            'destinataire_adresse' => 'nullable|string|max:500',

            // Contenu
            'objet' => 'required|string|max:255',
            'message' => 'nullable|string',

            // Dates
            'date_transmission' => 'required|date',

            // Notes et options
            'notes' => 'nullable|string',
            'generer_decharge' => 'nullable|boolean',

            // Preuve (fichier)
            'preuve' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5 Mo max
        ];
    }

    /**
     * Messages d'erreur personnalisés.
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Veuillez sélectionner un type de transmission.',
            'type.in' => 'Le type de transmission sélectionné est invalide.',

            'statut.in' => 'Le statut sélectionné est invalide.',

            'destinataire_nom.required' => 'Le nom du destinataire est obligatoire.',
            'destinataire_nom.max' => 'Le nom du destinataire ne doit pas dépasser 255 caractères.',
            'destinataire_email.email' => 'Veuillez saisir une adresse email valide.',
            'destinataire_email.max' => 'L\'email ne doit pas dépasser 255 caractères.',
            'destinataire_telephone.max' => 'Le téléphone ne doit pas dépasser 30 caractères.',
            'destinataire_fonction.max' => 'La fonction ne doit pas dépasser 255 caractères.',
            'destinataire_organisation.max' => 'L\'organisation ne doit pas dépasser 255 caractères.',
            'destinataire_adresse.max' => 'L\'adresse ne doit pas dépasser 500 caractères.',

            'objet.required' => 'L\'objet de la transmission est obligatoire.',
            'objet.max' => 'L\'objet ne doit pas dépasser 255 caractères.',

            'date_transmission.required' => 'La date de transmission est obligatoire.',
            'date_transmission.date' => 'Veuillez saisir une date valide.',

            'dossier_id.exists' => 'Le dossier sélectionné n\'existe pas.',
            'document_id.exists' => 'Le document sélectionné n\'existe pas.',

            'preuve.file' => 'Le fichier fourni est invalide.',
            'preuve.mimes' => 'La preuve doit être un fichier de type : PDF, JPG, JPEG ou PNG.',
            'preuve.max' => 'La preuve ne doit pas dépasser 5 Mo.',

            'generer_decharge.boolean' => 'La valeur du champ "Générer une décharge" doit être vrai ou faux.',
        ];
    }

    /**
     * Préparer les données avant la validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'generer_decharge' => $this->has('generer_decharge') ? (bool) $this->generer_decharge : false,
            'statut' => $this->statut ?? 'envoye',
        ]);
    }
}