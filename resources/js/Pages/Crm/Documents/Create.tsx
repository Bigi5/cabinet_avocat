// resources/js/Pages/Crm/Documents/Create.tsx
import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { ArrowLeft, Save, Upload, Folder, FileText, X } from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Option {
  id: string;
  reference: string;
  client: string;
}

interface TypeDocumentOption {
  value: string;
  label: string;
}

interface CreateProps {
  auth: {
    user: AuthUser;
  };
  options: {
    dossiers: Option[];
    types_document: TypeDocumentOption[];
  };
  preselected?: {
    dossier_id?: string;
  };
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const Create = ({ auth, options, preselected }: CreateProps) => {
  const { data, setData, post, processing, errors } = useForm({
    dossier_id: preselected?.dossier_id || '',
    type_document: '',
    fichier: null as File | null,
  });

  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatage de la taille du fichier
  const formatFileSize = (size: number) => {
    if (size >= 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + ' Mo';
    }
    return (size / 1024).toFixed(2) + ' Ko';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('crm.documents.store'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {},
      onError: () => {},
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('fichier', file);
      setFileName(file.name);
    }
  };

  const removeFile = () => {
    setData('fichier', null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <CrmLayout title="Ajouter un document">
      <Head title="Ajouter un document" />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/crm/documents"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">
                Ajouter un document
              </h1>
              <p className="text-gray-500 font-light">
                Téléchargez un nouveau document
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} encType="multipart/form-data" autoComplete="off">
          {/* Dossier */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Folder className="inline h-4 w-4 mr-1" />
              Dossier <span className="text-red-500">*</span>
            </label>
            <select
              value={data.dossier_id}
              onChange={(e) => setData('dossier_id', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
              required
            >
              <option value="">Sélectionner un dossier</option>
              {options.dossiers.map((dossier) => (
                <option key={dossier.id} value={dossier.id}>
                  {dossier.reference} - {dossier.client}
                </option>
              ))}
            </select>
            {errors.dossier_id && (
              <p className="mt-1 text-sm text-red-600">{errors.dossier_id}</p>
            )}
          </div>

          {/* Type de document */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Type de document <span className="text-red-500">*</span>
            </label>
            <select
              value={data.type_document}
              onChange={(e) => setData('type_document', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
              required
            >
              <option value="">Sélectionner un type</option>
              {options.types_document.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type_document && (
              <p className="mt-1 text-sm text-red-600">{errors.type_document}</p>
            )}
          </div>

          {/* Upload de fichier */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="inline h-4 w-4 mr-1" />
              Fichier <span className="text-red-500">*</span>
            </label>

            {!data.fichier ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#B08D57] transition-colors">
                <input
                  type="file"
                  id="fichier"
                  name="fichier"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  required
                />
                <label
                  htmlFor="fichier"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-sm font-medium text-gray-900 mb-1">
                    Cliquez pour sélectionner un fichier
                  </span>
                  <span className="text-xs text-gray-500">
                    PDF, DOC, XLS, JPG (max. 10 Mo)
                  </span>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-[#B08D57] mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fileName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(data.fichier.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            {errors.fichier && (
              <p className="mt-1 text-sm text-red-600">{errors.fichier}</p>
            )}
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
              disabled={processing || !data.fichier}
              className="px-6 py-2.5 bg-[#B08D57] text-white rounded-lg font-medium hover:bg-[#9c7a4a] transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4 mr-2" />
              {processing ? 'Envoi...' : 'Uploader le document'}
            </button>
          </div>
        </form>
      </div>
    </CrmLayout>
  );
};

export default Create;