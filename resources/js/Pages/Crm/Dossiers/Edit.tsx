// resources/js/Pages/Crm/Dossiers/Edit.tsx
import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { ArrowLeft, Save, Folder, User, Building, FileText, Users } from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Dossier {
  id: number;
  type_mission: string;
  client_id: string;
  responsable_id: string;
  montant: number | null;
  description: string | null;
  statut: string;
  collaborateurs: string[];
}

interface Option {
  id: string;
  nom: string;
  type?: string;
  role?: string;
}

interface TypeMissionOption {
  value: string;
  label: string;
}

interface StatutOption {
  value: string;
  label: string;
}

interface EditProps {
  auth: {
    user: AuthUser;
  };
  dossier: Dossier;
  options: {
    clients: Option[];
    responsables: Option[];
    type_missions: TypeMissionOption[];
    statuts: StatutOption[];
  };
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const Edit = ({ auth, dossier, options }: EditProps) => {
  const { data, setData, put, processing, errors } = useForm({
    type_mission: dossier.type_mission,
    client_id: dossier.client_id,
    responsable_id: dossier.responsable_id,
    statut: dossier.statut,
    montant: dossier.montant?.toString() || '',
    description: dossier.description || '',
    collaborateurs: dossier.collaborateurs || [],
  });

  const [collaborateursInput, setCollaborateursInput] = useState('');

  // Filtrer les collaborateurs disponibles (exclure le responsable)
  const availableCollaborateurs = options.responsables.filter(
    (r) => r.id !== data.responsable_id && !data.collaborateurs.includes(r.id)
  );

  // Ajouter un collaborateur
  const addCollaborateur = () => {
    if (!collaborateursInput) {
      return;
    }

    if (data.collaborateurs.includes(collaborateursInput)) {
      alert('Ce collaborateur est déjà ajouté.');
      return;
    }

    if (collaborateursInput === data.responsable_id) {
      alert('Le responsable ne peut pas être collaborateur.');
      return;
    }

    setData('collaborateurs', [...data.collaborateurs, collaborateursInput]);
    setCollaborateursInput('');
  };

  // Retirer un collaborateur
  const removeCollaborateur = (id: string) => {
    setData('collaborateurs', data.collaborateurs.filter((c) => c !== id));
  };

  // Quand le responsable change, le retirer des collaborateurs
  useEffect(() => {
    if (data.responsable_id && data.collaborateurs.includes(data.responsable_id)) {
      setData(
        'collaborateurs',
        data.collaborateurs.filter((c) => c !== data.responsable_id)
      );
    }
  }, [data.responsable_id]);

  // Validation avant soumission
  const validateForm = (): boolean => {
    if (!data.type_mission) {
      alert('Veuillez sélectionner un type de mission.');
      return false;
    }

    if (!data.client_id) {
      alert('Veuillez sélectionner un client.');
      return false;
    }

    if (!data.responsable_id) {
      alert('Veuillez sélectionner un responsable.');
      return false;
    }

    // Vérifier qu'aucun collaborateur n'est le responsable
    if (data.collaborateurs.includes(data.responsable_id)) {
      alert('Le responsable ne peut pas être collaborateur.');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    put(`/crm/dossiers/${dossier.id}`);
  };

  return (
    <CrmLayout title="Modifier dossier">
      <Head title="Modifier dossier" />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/crm/dossiers"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">
                Modifier dossier
              </h1>
              <p className="text-gray-500 font-light">
                Modifiez les informations du dossier
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Type de mission */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Folder className="inline h-4 w-4 mr-1" />
              Type de mission <span className="text-red-500">*</span>
            </label>
            <select
              value={data.type_mission}
              onChange={(e) => setData('type_mission', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
              required
            >
              <option value="">Sélectionner un type</option>
              {options.type_missions.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type_mission && (
              <p className="mt-1 text-sm text-red-600">{errors.type_mission}</p>
            )}
          </div>

          {/* Client */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline h-4 w-4 mr-1" />
              Client <span className="text-red-500">*</span>
            </label>
            <select
              value={data.client_id}
              onChange={(e) => setData('client_id', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
              required
            >
              <option value="">Sélectionner un client</option>
              {options.clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nom}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
            )}
          </div>

          {/* Responsable principal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Responsable principal <span className="text-red-500">*</span>
            </label>
            <select
              value={data.responsable_id}
              onChange={(e) => setData('responsable_id', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
              required
            >
              <option value="">Sélectionner un responsable</option>
              {options.responsables.map((resp) => (
                <option key={resp.id} value={resp.id}>
                  {resp.nom}
                </option>
              ))}
            </select>
            {errors.responsable_id && (
              <p className="mt-1 text-sm text-red-600">{errors.responsable_id}</p>
            )}
          </div>

          {/* Statut */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Folder className="inline h-4 w-4 mr-1" />
              Statut
            </label>
            <select
              value={data.statut}
              onChange={(e) => setData('statut', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
            >
              {options.statuts.map((statut) => (
                <option key={statut.value} value={statut.value}>
                  {statut.label}
                </option>
              ))}
            </select>
            {errors.statut && (
              <p className="mt-1 text-sm text-red-600">{errors.statut}</p>
            )}
          </div>

          {/* Collaborateurs */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Collaborateurs
            </label>
            <div className="flex space-x-2">
              <select
                value={collaborateursInput}
                onChange={(e) => setCollaborateursInput(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
              >
                <option value="">Sélectionner un collaborateur</option>
                {availableCollaborateurs.map((resp) => (
                  <option key={resp.id} value={resp.id}>
                    {resp.nom}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCollaborateur}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Ajouter
              </button>
            </div>

            {/* Liste des collaborateurs sélectionnés */}
            {data.collaborateurs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {data.collaborateurs.map((id) => {
                  const collab = options.responsables.find((r) => r.id === id);
                  return collab ? (
                    <span
                      key={id}
                      className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {collab.nom}
                      <button
                        type="button"
                        onClick={() => removeCollaborateur(id)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Montant */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (FCFA)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.montant}
              onChange={(e) => setData('montant', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
              placeholder="0.00"
            />
            {errors.montant && (
              <p className="mt-1 text-sm text-red-600">{errors.montant}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={4}
              maxLength={5000}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
              placeholder="Détails du dossier..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/crm/dossiers"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-[#B08D57] text-white rounded-lg font-medium hover:bg-[#9c7a4a] transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </CrmLayout>
  );
};

export default Edit;