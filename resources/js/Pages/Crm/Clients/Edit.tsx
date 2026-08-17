// resources/js/Pages/Crm/Clients/Edit.tsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { ArrowLeft, Save, User, Building, Mail, Phone, MapPin, FileText, Users } from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Client {
  id: number;
  type_client: 'personne_physique' | 'personne_morale';
  nom: string | null;
  prenom: string | null;
  raison_sociale: string | null;
  email: string;
  telephone: string | null;
  adresse: string | null;
  statut: string;
  observations: string | null;
  roles: string[]; // ✅ AJOUTÉ
}

interface EditProps {
  auth: {
    user: AuthUser;
  };
  client: Client;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const Edit = ({ auth, client }: EditProps) => {
  const { data, setData, put, processing, errors } = useForm({
    type_client: client.type_client,
    nom: client.nom || '',
    prenom: client.prenom || '',
    raison_sociale: client.raison_sociale || '',
    email: client.email,
    telephone: client.telephone || '',
    adresse: client.adresse || '',
    statut: client.statut || 'actif',
    observations: client.observations || '',
    roles: client.roles || [], // ✅ AJOUTÉ
  });

  // Gestion des rôles
  const toggleRole = (role: string) => {
    const currentRoles = data.roles || [];
    if (currentRoles.includes(role)) {
      setData('roles', currentRoles.filter(r => r !== role));
    } else {
      setData('roles', [...currentRoles, role]);
    }
  };

  // Validation avant soumission
  const validateForm = (): boolean => {
    if (data.type_client === 'personne_physique') {
      if (!data.nom.trim()) {
        alert('Veuillez saisir le nom du client.');
        return false;
      }
    } else {
      if (!data.raison_sociale.trim()) {
        alert('Veuillez saisir la raison sociale.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    put(`/crm/clients/${client.id}`, {
      preserveScroll: true,
      onSuccess: () => {},
      onError: (errors) => {
        console.error('Erreurs de validation:', errors);
      },
    });
  };

  return (
    <CrmLayout title="Modifier client">
      <Head title="Modifier client" />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/crm/clients"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Modifier client</h1>
              <p className="text-gray-500 font-light">Modifiez les informations du client</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Type de client */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de client <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type_client"
                  value="personne_physique"
                  checked={data.type_client === 'personne_physique'}
                  onChange={(e) => setData('type_client', e.target.value as 'personne_physique' | 'personne_morale')}
                  className="h-4 w-4 text-[#B08D57] focus:ring-[#B08D57] border-gray-300"
                  required
                />
                <span className="ml-2 text-sm text-gray-700">Personne physique</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type_client"
                  value="personne_morale"
                  checked={data.type_client === 'personne_morale'}
                  onChange={(e) => setData('type_client', e.target.value as 'personne_physique' | 'personne_morale')}
                  className="h-4 w-4 text-[#B08D57] focus:ring-[#B08D57] border-gray-300"
                  required
                />
                <span className="ml-2 text-sm text-gray-700">Personne morale</span>
              </label>
            </div>
            {errors.type_client && <p className="mt-1 text-sm text-red-600">{errors.type_client}</p>}
          </div>

          {/* Champs pour personne physique */}
          {data.type_client === 'personne_physique' && (
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.nom}
                    onChange={(e) => setData('nom', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                    placeholder="Nom"
                    required
                    maxLength={100}
                  />
                  {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={data.prenom}
                    onChange={(e) => setData('prenom', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                    placeholder="Prénom"
                    maxLength={100}
                  />
                  {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Champs pour personne morale */}
          {data.type_client === 'personne_morale' && (
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="inline h-4 w-4 mr-1" />
                  Raison sociale <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.raison_sociale}
                  onChange={(e) => setData('raison_sociale', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                  placeholder="Raison sociale"
                  required
                  maxLength={255}
                />
                {errors.raison_sociale && <p className="mt-1 text-sm text-red-600">{errors.raison_sociale}</p>}
              </div>
            </div>
          )}

          {/* Coordonnées */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900">Coordonnées</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                  placeholder="client@exemple.com"
                  maxLength={255}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={data.telephone}
                  onChange={(e) => setData('telephone', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                  placeholder="+229 01 23 45 67"
                  maxLength={20}
                />
                {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900">Adresse</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Adresse
              </label>
              <input
                type="text"
                value={data.adresse}
                onChange={(e) => setData('adresse', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                placeholder="Adresse"
                maxLength={500}
              />
              {errors.adresse && <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>}
            </div>
          </div>

          {/* Rôles - ✅ AJOUTÉ */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900">
              <Users className="inline h-5 w-5 mr-2" />
              Rôles
            </h3>
            <p className="text-sm text-gray-500 mb-3">Sélectionnez les rôles de ce client</p>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.roles.includes('client')}
                  onChange={() => toggleRole('client')}
                  className="h-4 w-4 text-[#B08D57] focus:ring-[#B08D57] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Client</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.roles.includes('bailleur')}
                  onChange={() => toggleRole('bailleur')}
                  className="h-4 w-4 text-[#B08D57] focus:ring-[#B08D57] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Bailleur</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.roles.includes('locataire')}
                  onChange={() => toggleRole('locataire')}
                  className="h-4 w-4 text-[#B08D57] focus:ring-[#B08D57] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Locataire</span>
              </label>
            </div>
            {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles}</p>}
          </div>

          {/* Statut */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900">Informations complémentaires</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                value={data.statut}
                onChange={(e) => setData('statut', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
                required
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
              {errors.statut && <p className="mt-1 text-sm text-red-600">{errors.statut}</p>}
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900">Observations</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Notes
              </label>
              <textarea
                value={data.observations}
                onChange={(e) => setData('observations', e.target.value)}
                rows={4}
                maxLength={5000}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                placeholder="Informations complémentaires..."
              />
              {errors.observations && <p className="mt-1 text-sm text-red-600">{errors.observations}</p>}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/crm/clients"
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
              {processing ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </CrmLayout>
  );
};

export default Edit;