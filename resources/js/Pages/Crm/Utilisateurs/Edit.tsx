// resources/js/Pages/Crm/Utilisateurs/Edit.tsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { ArrowLeft, Save, User, Mail, Phone, Lock, Shield } from 'lucide-react';

interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  statut: string;
  telephone: string | null;
}

interface Option {
  value: string;
  label: string;
}

interface EditProps {
  auth: {
    user: any;
  };
  utilisateur: Utilisateur;
  options: {
    roles: Option[];
    statuts: Option[];
  };
}

const Edit = ({ auth, utilisateur, options }: EditProps) => {
  const { data, setData, put, processing, errors } = useForm({
    email: utilisateur.email,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    role: utilisateur.role,
    statut: utilisateur.statut,
    telephone: utilisateur.telephone || '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/crm/utilisateurs/${utilisateur.id}`);
  };

  return (
    <CrmLayout title="Modifier utilisateur">
      <Head title="Modifier utilisateur" />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/crm/utilisateurs" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Modifier utilisateur</h1>
              <p className="text-gray-500 font-light">Modifiez les informations de l'utilisateur</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          {/* Identité */}
          <h3 className="text-lg font-medium text-gray-900 mb-4">Identité</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Nom
              </label>
              <input
                type="text"
                value={data.nom}
                onChange={(e) => setData('nom', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                placeholder="Nom"
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
              />
              {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
            </div>
          </div>

          {/* Coordonnées */}
          <h3 className="text-lg font-medium text-gray-900 mb-4">Coordonnées</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                placeholder="utilisateur@cabinet.com"
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
              />
              {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
            </div>
          </div>

          {/* Mot de passe (optionnel) */}
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <Lock className="inline h-5 w-5 mr-2 text-gray-400" />
            Changer le mot de passe (optionnel)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                placeholder="Laisser vide pour ne pas changer"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer</label>
              <input
                type="password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                placeholder="Confirmer le nouveau mot de passe"
              />
            </div>
          </div>

          {/* Rôle et statut */}
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <Shield className="inline h-5 w-5 mr-2 text-gray-400" />
            Rôle et permissions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select
                value={data.role}
                onChange={(e) => setData('role', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
                disabled={!auth.user.isHuissier} // Seul un huissier peut changer le rôle
              >
                {options.roles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={data.statut}
                onChange={(e) => setData('statut', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
                disabled={!auth.user.isHuissier} // Seul un huissier peut changer le statut
              >
                {options.statuts.map((statut) => (
                  <option key={statut.value} value={statut.value}>{statut.label}</option>
                ))}
              </select>
              {errors.statut && <p className="mt-1 text-sm text-red-600">{errors.statut}</p>}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/crm/utilisateurs"
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