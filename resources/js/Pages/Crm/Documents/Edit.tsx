// resources/js/Pages/Crm/Documents/Edit.tsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { ArrowLeft, Save, Folder, FileText } from 'lucide-react';

interface Document {
  id: number;
  dossier_id: string;
  type_document: string;
  nom_fichier: string;
}

interface Option {
  id: string;
  reference: string;
}

interface EditProps {
  auth: {
    user: any;
  };
  document: Document;
  options: {
    dossiers: Option[];
    types_document: Array<{ value: string; label: string }>;
  };
}

const Edit = ({ auth, document, options }: EditProps) => {
  const { data, setData, put, processing, errors } = useForm({
    dossier_id: document.dossier_id,
    type_document: document.type_document,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/crm/documents/${document.id}`);
  };

  return (
    <CrmLayout title="Modifier document">
      <Head title="Modifier document" />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/crm/documents" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Modifier document</h1>
              <p className="text-gray-500 font-light">Modifiez les informations du document</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          {/* Nom du fichier (lecture seule) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Nom du fichier
            </label>
            <input
              type="text"
              value={document.nom_fichier}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

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
                <option key={dossier.id} value={dossier.id}>{dossier.reference}</option>
              ))}
            </select>
            {errors.dossier_id && <p className="mt-1 text-sm text-red-600">{errors.dossier_id}</p>}
          </div>

          {/* Type de document */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Type de document
            </label>
            <select
              value={data.type_document}
              onChange={(e) => setData('type_document', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
            >
              <option value="">Sélectionner un type</option>
              {options.types_document.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.type_document && <p className="mt-1 text-sm text-red-600">{errors.type_document}</p>}
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/crm/documents"
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