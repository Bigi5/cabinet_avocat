import React, { useState, useEffect, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import { 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle, 
  File, 
  FileText, 
  Image, 
  FileArchive,
  FileSpreadsheet,
  FileCode,
  FileType,
  Trash2,
  Plus,
  Eye
} from 'lucide-react';
import axios from 'axios';

/**
 * Formulaire de création d'une archive à partir de fichiers physiques.
 * Supporte le multi-fichiers avec drag & drop.
 *
 * Routes utilisées :
 *   GET  crm.archives.categories
 *   POST crm.archives.physique.store
 */

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

const NouvelleArchivePhysique = ({ onClose, onSuccess }: Props) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // ✅ Types MIME autorisés
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/vnd.rar',
    'application/x-rar-compressed',
  ];

  const ALLOWED_EXTENSIONS = [
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.rar'
  ];

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 Mo par fichier
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100 Mo total

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    titre: '',
    categorie: '',
    description: '',
    fichiers: [] as File[],
    notes: '',
  });

  // ✅ Récupération des catégories
  useEffect(() => {
    axios.get(route('crm.archives.categories'))
      .then(response => {
        setCategories(response.data);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // ✅ Nettoyer les previews
  useEffect(() => {
    return () => {
      data.fichiers.forEach(file => {
        if ('preview' in file && (file as any).preview) {
          URL.revokeObjectURL((file as any).preview);
        }
      });
    };
  }, [data.fichiers]);

  const categoriesFiltrees = categories.filter(c =>
    c.toLowerCase().includes(data.categorie.toLowerCase()) && c !== data.categorie
  );

  // ✅ Obtenir l'icône en fonction du type de fichier
  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-purple-500" />;
    }
    if (type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
    if (type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    }
    if (type.includes('powerpoint') || name.endsWith('.ppt') || name.endsWith('.pptx')) {
      return <FileCode className="h-8 w-8 text-orange-500" />;
    }
    if (type.includes('zip') || type.includes('rar') || name.endsWith('.zip') || name.endsWith('.rar')) {
      return <FileArchive className="h-8 w-8 text-yellow-500" />;
    }
    return <File className="h-8 w-8 text-gray-400" />;
  };

  // ✅ Formater la taille
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ✅ Valider un fichier
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return { 
        valid: false, 
        error: `Format non supporté. Formats acceptés: ${ALLOWED_EXTENSIONS.join(', ')}` 
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: `Type MIME non supporté: ${file.type}` 
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `Le fichier dépasse ${MAX_FILE_SIZE / 1024 / 1024} Mo` 
      };
    }

    return { valid: true };
  };

  // ✅ Vérifier la taille totale
  const getTotalSize = (): number => {
    return data.fichiers.reduce((acc, file) => acc + file.size, 0);
  };

  // ✅ Gérer l'ajout de fichiers
  const handleFilesAdded = (files: File[]) => {
    setErrorMessage(null);
    setFileErrors({});

    const validFiles: File[] = [];
    const errors: { [key: string]: string } = {};

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else if (validation.error) {
        errors[file.name] = validation.error;
      }
    });

    // Vérifier la taille totale
    const currentTotal = getTotalSize();
    const newTotal = validFiles.reduce((acc, f) => acc + f.size, currentTotal);
    
    if (newTotal > MAX_TOTAL_SIZE) {
      setErrorMessage(`La taille totale des fichiers dépasse ${MAX_TOTAL_SIZE / 1024 / 1024} Mo`);
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFileErrors(errors);
    }

    if (validFiles.length > 0) {
      const currentFiles = [...data.fichiers];
      setData('fichiers', [...currentFiles, ...validFiles]);
    }
  };

  // ✅ Gestion du changement de fichier
  const handleFichierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    handleFilesAdded(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    handleFilesAdded(files);
  };

  // ✅ Supprimer un fichier
  const handleRemoveFile = (index: number) => {
    const newFiles = [...data.fichiers];
    newFiles.splice(index, 1);
    setData('fichiers', newFiles);
    
    // Nettoyer les erreurs associées
    const fileName = data.fichiers[index].name;
    if (fileErrors[fileName]) {
      const newErrors = { ...fileErrors };
      delete newErrors[fileName];
      setFileErrors(newErrors);
    }
  };

  // ✅ Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (data.fichiers.length === 0) {
      setErrorMessage('Veuillez sélectionner au moins un fichier.');
      return;
    }

    post(route('crm.archives.physique.store'), {
      forceFormData: true,
      preserveScroll: true,
      onProgress: (progress) => {
        setUploadProgress(progress?.percentage ?? 0);
      },
      onSuccess: () => {
        setSuccessMessage(`${data.fichiers.length} fichier(s) archivé(s) avec succès !`);
        setUploadProgress(0);
        
        setTimeout(() => {
          reset();
          setData('fichiers', []);
          onClose();
          if (onSuccess) onSuccess();
          router.reload({ only: ['archives', 'stats'] });
        }, 1500);
      },
      onError: (errors) => {
        setUploadProgress(0);
        setErrorMessage('Erreur lors de la création de l\'archive.');
        console.error('Erreurs de validation:', errors);
      },
    });
  };

  const handleCancel = () => {
    reset();
    setData('fichiers', []);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(0);
    setFileErrors({});
    onClose();
  };

  const totalSize = getTotalSize();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Nouvelle archive physique</h2>
          <button 
            onClick={handleCancel} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={processing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ✅ Messages de statut */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.titre}
              onChange={e => {
                setData('titre', e.target.value);
                clearErrors('titre');
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] outline-none transition ${
                errors.titre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Courrier client Dupont - juillet 2026"
              disabled={processing}
            />
            {errors.titre && <p className="text-xs text-red-500 mt-1">{errors.titre}</p>}
          </div>

          {/* Catégorie */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.categorie}
              onChange={e => {
                setData('categorie', e.target.value);
                clearErrors('categorie');
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] outline-none transition ${
                errors.categorie ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Contrats, Correspondances, Actes anciens..."
              disabled={processing}
            />
            {showSuggestions && categoriesFiltrees.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                {categoriesFiltrees.map(cat => (
                  <li
                    key={cat}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setData('categorie', cat);
                      setShowSuggestions(false);
                    }}
                    className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}
            {errors.categorie && <p className="text-xs text-red-500 mt-1">{errors.categorie}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={e => setData('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] outline-none transition"
              placeholder="Description optionnelle..."
              disabled={processing}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={data.notes}
              onChange={e => setData('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] outline-none transition"
              placeholder="Notes internes..."
              disabled={processing}
            />
          </div>

          {/* ✅ Zone de dépôt avec Drag & Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichiers <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 ml-2">
                ({data.fichiers.length} sélectionné{data.fichiers.length > 1 ? 's' : ''})
              </span>
            </label>
            
            <div
              ref={dropZoneRef}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isDragging 
                  ? 'border-[#B08D57] bg-[#B08D57]/5' 
                  : 'border-gray-300 hover:border-[#B08D57]'
              } ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="fichier-physique"
                multiple
                onChange={handleFichierChange}
                className="hidden"
                accept={ALLOWED_EXTENSIONS.join(',')}
                disabled={processing}
              />
              <label htmlFor="fichier-physique" className={`cursor-pointer flex flex-col items-center ${processing ? 'cursor-not-allowed' : ''}`}>
                <Upload className={`h-10 w-10 mb-3 ${isDragging ? 'text-[#B08D57]' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {isDragging ? 'Déposez vos fichiers ici' : 'Déposez vos fichiers ou cliquez pour parcourir'}
                </span>
                <span className="text-xs text-gray-400 mt-2">
                  {ALLOWED_EXTENSIONS.join(', ')} — {MAX_FILE_SIZE / 1024 / 1024} Mo max par fichier
                </span>
                <span className="text-xs text-gray-400">
                  Taille totale max: {MAX_TOTAL_SIZE / 1024 / 1024} Mo
                </span>
                {data.fichiers.length > 0 && (
                  <span className="text-xs text-[#B08D57] mt-2">
                    {data.fichiers.length} fichier(s) sélectionné(s) ({formatSize(totalSize)})
                  </span>
                )}
              </label>
            </div>

            {/* ✅ Erreurs par fichier */}
            {Object.keys(fileErrors).length > 0 && (
              <div className="mt-2 space-y-1">
                {Object.entries(fileErrors).map(([name, error]) => (
                  <div key={name} className="text-xs text-red-500">
                    • {name}: {error}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Liste des fichiers sélectionnés */}
          {data.fichiers.length > 0 && (
            <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50">
              {data.fichiers.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{formatSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.type || 'Type inconnu'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ✅ Barre de progression */}
          {processing && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#B08D57] h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-right">
                Envoi en cours... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {/* ✅ Boutons */}
          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-50"
              disabled={processing}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={processing || !data.titre || !data.categorie || data.fichiers.length === 0}
              className={`flex-1 py-2 bg-[#B08D57] text-white rounded-lg transition-all disabled:opacity-50 ${
                processing ? 'cursor-wait' : 'hover:bg-[#9a7a4a]'
              }`}
            >
              {processing 
                ? `Envoi de ${data.fichiers.length} fichier(s)...` 
                : `Archiver ${data.fichiers.length} fichier${data.fichiers.length > 1 ? 's' : ''}`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NouvelleArchivePhysique;
