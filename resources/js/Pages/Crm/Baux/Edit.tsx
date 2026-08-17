// resources/js/Pages/Crm/Baux/Edit.tsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  ArrowLeft,
  Save,
  User,
  Building,
  Home,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  HelpCircle
} from 'lucide-react';

interface Client {
  id: string;
  nom: string;
  type: string;
}

interface Bail {
  id: number;
  reference: string;
  locataire_id: string;
  bailleur_id: string;
  dossier_id: string | null;
  montant_loyer: number;
  frequence: string;
  date_debut: string;
  date_fin: string | null;
  jour_echeance: number;
  caution: number | null;
  description: string | null;
  adresse_bien: string | null;
  reference_cadastrale: string | null;
  statut: string;
}

interface EditProps {
  auth: {
    user: any;
  };
  bail: Bail;
  options: {
    bailleurs: Client[];
    locataires: Client[];
  };
}

const Edit = ({ auth, bail, options }: EditProps) => {
  const { data, setData, put, processing, errors } = useForm({
    reference: bail.reference,
    locataire_id: bail.locataire_id,
    bailleur_id: bail.bailleur_id,
    dossier_id: bail.dossier_id,
    montant_loyer: bail.montant_loyer.toString(),
    frequence: bail.frequence,
    date_debut: bail.date_debut,
    date_fin: bail.date_fin || '',
    jour_echeance: bail.jour_echeance,
    caution: bail.caution?.toString() || '',
    description: bail.description || '',
    adresse_bien: bail.adresse_bien || '',
    reference_cadastrale: bail.reference_cadastrale || '',
    statut: bail.statut,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/crm/baux/${bail.id}`);
  };

  return (
    <CrmLayout title={`Modifier bail ${bail.reference}`}>
      <Head title={`Modifier bail ${bail.reference}`} />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/crm/baux/${bail.id}`} className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Modifier bail</h1>
              <p className="text-gray-500 font-light">Modifiez les informations du contrat de location</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Informations générales */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#B08D57]" />
              Informations générales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Référence du bail</label>
                <input
                  type="text"
                  value={data.reference}
                  onChange={(e) => setData("reference", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                />
                {errors.reference && <p className="mt-1 text-sm text-red-600">{errors.reference}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={data.statut}
                  onChange={(e) => setData("statut", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all bg-white"
                >
                  <option value="actif">Actif</option>
                  <option value="termine">Terminé</option>
                  <option value="resilie">Résilié</option>
                </select>
                {errors.statut && <p className="mt-1 text-sm text-red-600">{errors.statut}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Parties prenantes */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-[#B08D57]" />
              Parties prenantes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Locataire</label>
                <select
                  value={data.locataire_id}
                  onChange={(e) => setData("locataire_id", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all bg-white"
                >
                  <option value="">Sélectionner un locataire</option>
                  {options.locataires.map(client => (
                    <option key={client.id} value={client.id}>{client.nom}</option>
                  ))}
                </select>
                {errors.locataire_id && <p className="mt-1 text-sm text-red-600">{errors.locataire_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bailleur / Propriétaire</label>
                <select
                  value={data.bailleur_id}
                  onChange={(e) => setData("bailleur_id", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all bg-white"
                >
                  <option value="">Sélectionner un bailleur</option>
                  {options.bailleurs.map(client => (
                    <option key={client.id} value={client.id}>{client.nom}</option>
                  ))}
                </select>
                {errors.bailleur_id && <p className="mt-1 text-sm text-red-600">{errors.bailleur_id}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Adresse du bien */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="h-5 w-5 mr-2 text-[#B08D57]" />
              Adresse du bien
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Adresse complète
                </label>
                <input
                  type="text"
                  value={data.adresse_bien}
                  onChange={(e) => setData("adresse_bien", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                  placeholder="Adresse du bien immobilier"
                />
                {errors.adresse_bien && <p className="mt-1 text-sm text-red-600">{errors.adresse_bien}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Référence cadastrale</label>
                <input
                  type="text"
                  value={data.reference_cadastrale}
                  onChange={(e) => setData("reference_cadastrale", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                  placeholder="Référence cadastrale (optionnel)"
                />
                {errors.reference_cadastrale && <p className="mt-1 text-sm text-red-600">{errors.reference_cadastrale}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: Conditions financières */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-[#B08D57]" />
              Conditions financières
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant du loyer (FCFA)</label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={data.montant_loyer}
                  onChange={(e) => setData("montant_loyer", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                />
                {errors.montant_loyer && <p className="mt-1 text-sm text-red-600">{errors.montant_loyer}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence</label>
                <select
                  value={data.frequence}
                  onChange={(e) => setData("frequence", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all bg-white"
                >
                  <option value="mensuel">Mensuel</option>
                  <option value="trimestriel">Trimestriel</option>
                  <option value="semestriel">Semestriel</option>
                  <option value="annuel">Annuel</option>
                </select>
                {errors.frequence && <p className="mt-1 text-sm text-red-600">{errors.frequence}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Jour d'échéance
                </label>
                <select
                  value={data.jour_echeance}
                  onChange={(e) => setData("jour_echeance", parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all bg-white"
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Jour du mois où le loyer est dû</p>
                {errors.jour_echeance && <p className="mt-1 text-sm text-red-600">{errors.jour_echeance}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caution (FCFA)</label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={data.caution}
                  onChange={(e) => setData("caution", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                />
                {errors.caution && <p className="mt-1 text-sm text-red-600">{errors.caution}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                <input
                  type="date"
                  value={data.date_debut}
                  onChange={(e) => setData("date_debut", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                />
                {errors.date_debut && <p className="mt-1 text-sm text-red-600">{errors.date_debut}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin (optionnel)</label>
                <input
                  type="date"
                  value={data.date_fin}
                  onChange={(e) => setData("date_fin", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                />
                {errors.date_fin && <p className="mt-1 text-sm text-red-600">{errors.date_fin}</p>}
              </div>
            </div>
          </div>

          {/* Section 5: Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#B08D57]" />
              Informations complémentaires
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description / Clauses particulières</label>
              <textarea
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
                placeholder="Informations complémentaires, clauses particulières..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href={`/crm/baux/${bail.id}`}
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