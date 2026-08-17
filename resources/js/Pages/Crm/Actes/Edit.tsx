// resources/js/Pages/Crm/Actes/Edit.tsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { ArrowLeft, Save, FileText, Folder } from 'lucide-react';

interface Acte {
  id: number;
  dossier_id: string;
  type_acte: string;
  description: string | null;
}

interface Option {
  id: string;
  reference: string;
  client: string;
}

interface EditProps {
  auth: {
    user: any;
  };
  acte: Acte;
  options: {
    dossiers: Option[];
    types_actes: Array<{ value: string; label: string }>;
  };
}

const Edit = ({ auth, acte, options }: EditProps) => {
  const { data, setData, put, processing, errors } = useForm({
    dossier_id: acte.dossier_id,
    type_acte: acte.type_acte,
    description: acte.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/crm/actes/${acte.id}`);
  };

  return (
    <CrmLayout title="Modifier acte">
      <Head title="Modifier acte" />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/crm/actes" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Modifier acte</h1>
              <p className="text-gray-500 font-light">Modifiez les informations de l'acte</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          {/* Dossier */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Folder className="inline h-4 w-4 mr-1" />
              Dossier
            </label>
            <select
              value={data.dossier_id}
              onChange={(e) => setData('dossier_id', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
            >
              <option value="">Sélectionner un dossier</option>
              {options.dossiers.map((dossier) => (
                <option key={dossier.id} value={dossier.id}>
                  {dossier.reference} - {dossier.client}
                </option>
              ))}
            </select>
            {errors.dossier_id && <p className="mt-1 text-sm text-red-600">{errors.dossier_id}</p>}
          </div>

          {/* Type d'acte */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Type d'acte
            </label>
            <select
              value={data.type_acte}
              onChange={(e) => setData('type_acte', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
            >
              <option value="">Sélectionner un type</option>
              {options.types_actes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.type_acte && <p className="mt-1 text-sm text-red-600">{errors.type_acte}</p>}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
              placeholder="Contenu de l'acte..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/crm/actes"
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