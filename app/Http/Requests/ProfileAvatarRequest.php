<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.required' => 'Veuillez sélectionner une image.',
            'avatar.image' => "Le fichier doit être une image.",
            'avatar.mimes' => "L'avatar doit être au format JPG, PNG ou WEBP.",
            'avatar.max' => "L'avatar ne doit pas dépasser 2 Mo.",
        ];
    }
}
