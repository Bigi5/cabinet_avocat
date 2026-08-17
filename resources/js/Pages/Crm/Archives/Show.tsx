import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  ArrowLeft,
  Archive,
  RefreshCw,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  FileText,
  Folder,
  Home,
  CreditCard,
  FileCheck,
  AlertCircle,
  Trash2,
  Printer,
  Download,
  File,
  Image,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileJson,
  FileType,
  History,
  Package,
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// ✅ Interfaces TypeScript avec typage précis
interface ArchiveDocument {
  id: number;
  nom_original: string;
  nom_stockage: string;
  chemin: string;
  taille: number;
  taille_lisible: string;
  extension: string;
  mime_type: string;
  version: number;
  ordre: number;
  est_principal: boolean;
  description: string | null;
  url: string;
  icone: string;
  est_image: boolean;
  est_pdf: boolean;
  est_office: boolean;
  est_archive: boolean;
  created_at: string;
}

interface ArchiveHistorique {
  id: number;
  action: string;
  description: string;
  utilisateur: {
    id: number;
    nom_complet: string;
    email: string;
  } | null;
  ip_adresse: string | null;
  user_agent: string | null;
  created_at: string;
}

interface Archive {
  id: number;
  reference: string;
  type: string;
  type_label: string;
  titre: string;
  description: string | null;
  original_reference: string | null;
  date_archivage: string;
  motif: string;
  motif_label: string;
  motif_commentaire: string | null;
  statut: string;
  emplacement: {
    id: number;
    code: string;
    code_complet: string;
    type: string;
  } | null;
  emplacement_detail: string | null;
  duree_conservation_mois: number | null;
  date_destruction: string | null;
  notes: string | null;
  metadonnees: Record<string, string | number | boolean | null>;
  archive_par: string | null;
  restaure_par: string | null;
  date_restauration: string | null;
  created_at: string;
  documents: ArchiveDocument[];
  historiques: ArchiveHistorique[];
}

interface ShowProps {
  auth: { user: any };
  archive: Archive;
}

// ✅ Fonction de formatage de date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
};

// ✅ Fonction de formatage de date courte
const formatDateShort = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

const Show = ({ auth, archive }: ShowProps) => {
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showHistorique, setShowHistorique] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    fichier: null as File | null,
    description: '',
  });

  const getTypeIcon = () => {
    const icons: Record<string, React.ReactNode> = {
      dossier: <Folder className="h-12 w-12" />,
      document: <FileText className="h-12 w-12" />,
      acte: <FileCheck className="h-12 w-12" />,
      facture: <CreditCard className="h-12 w-12" />,
      bail: <Home className="h-12 w-12" />,
    };
    return icons[archive.type] || <Archive className="h-12 w-12" />;
  };

  const getTypeColor = () => {
    const colors: Record<string, string> = {
      dossier: 'bg-blue-100 text-blue-600',
      document: 'bg-purple-100 text-purple-600',
      acte: 'bg-green-100 text-green-600',
      facture: 'bg-red-100 text-red-600',
      bail: 'bg-amber-100 text-amber-600',
    };
    return colors[archive.type] || 'bg-gray-100 text-gray-600';
  };

  const getStatutInfo = () => {
    const statuts: Record<string, { label: string; color: string; icon: any }> = {
      archive: { label: 'Archivé', color: 'bg-gray-100 text-gray-600', icon: Archive },
      en_cours_de_restauration: { label: 'En cours de restauration', color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
      restaure: { label: 'Restauré', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      supprime: { label: 'Supprimé', color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    return statuts[archive.statut] || statuts.archive;
  };

  const getFileIcon = (doc: ArchiveDocument) => {
    const iconMap: Record<string, React.ReactNode> = {
      'file-pdf': <FileText className="h-5 w-5 text-red-500" />,
      'file-word': <FileText className="h-5 w-5 text-blue-500" />,
      'file-excel': <FileSpreadsheet className="h-5 w-5 text-green-500" />,
      'file-powerpoint': <FileCode className="h-5 w-5 text-orange-500" />,
      'file-image': <Image className="h-5 w-5 text-purple-500" />,
      'file-archive': <FileArchive className="h-5 w-5 text-yellow-500" />,
      'file-text': <FileType className="h-5 w-5 text-gray-500" />,
      'file-code': <FileJson className="h-5 w-5 text-indigo-500" />,
    };
    return iconMap[doc.icone] || <File className="h-5 w-5 text-gray-400" />;
  };

  const statutInfo = getStatutInfo();
  const StatutIcon = statutInfo.icon;
  const TypeIcon = getTypeIcon();
  const typeColor = getTypeColor();

  // ✅ Routes corrigées avec préfixe crm.archives.*
  const handleRestore = () => {
    post(route('crm.archives.restaurer', archive.id), {
      onSuccess: () => {
        setShowRestoreConfirm(false);
        router.reload({ only: ['archive'] });
      },
    });
  };

  const handleConfirmRestore = () => {
    post(route('crm.archives.confirmer-restauration', archive.id), {
      onSuccess: () => {
        setShowRestoreConfirm(false);
        router.reload({ only: ['archive'] });
      },
    });
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    post(route('crm.archives.documents.store', archive.id), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowAddDocument(false);
        setUploading(false);
        router.reload({ only: ['archive'] });
      },
      onError: () => {
        setUploading(false);
      },
    });
  };

  // ✅ Utilisation de window.location pour les téléchargements
  const handleDownloadDocument = (documentId: number) => {
    window.location.href = route('crm.archives.documents.download', { 
      archive: archive.id, 
      document: documentId 
    });
  };

  const handleDeleteDocument = (documentId: number) => {
    setDocumentToDelete(documentId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      router.delete(route('crm.archives.documents.destroy', documentToDelete), {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          setDocumentToDelete(null);
          router.reload({ only: ['archive'] });
        },
      });
    }
  };

  // ✅ Utilisation de window.location pour le téléchargement ZIP
  const handleDownloadZip = () => {
    window.location.href = route('crm.archives.telecharger-zip', archive.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('fichier', file);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      archivage: '📦 Archivage',
      restauration: '🔄 Restauration',
      consultation: '👁️ Consultation',
      telechargement: '⬇️ Téléchargement',
      telechargement_zip: '📦 Téléchargement ZIP',
      ajout_document: '📄 Ajout document',
      suppression_document: '🗑️ Suppression document',
    };
    return labels[action] || action;
  };

  const getUserName = (utilisateur: ArchiveHistorique['utilisateur']) => {
    if (!utilisateur) return 'Système';
    return utilisateur.nom_complet || utilisateur.email || 'Utilisateur';
  };

  return (
    <CrmLayout title={`Archive ${archive.reference}`}>
      <Head title={`Archive ${archive.reference}`} />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={route('crm.archives.index')} className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Archive {archive.reference}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${statutInfo.color} inline-flex items-center gap-1`}>
                  <StatutIcon className="h-3 w-3" /> {statutInfo.label}
                </span>
                <span className="text-sm text-gray-500">Créée le {formatDate(archive.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {archive.statut === 'archive' && (
              <button
                onClick={() => setShowRestoreConfirm(true)}
                className="px-4 py-2 border border-yellow-200 text-yellow-700 rounded-xl hover:bg-yellow-50 transition-all flex items-center text-sm bg-white shadow-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restaurer
              </button>
            )}
            {archive.documents && archive.documents.length > 0 && (
              <button
                onClick={handleDownloadZip}
                className="px-4 py-2 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-all flex items-center text-sm bg-white shadow-sm"
              >
                <Package className="h-4 w-4 mr-2" />
                Télécharger ZIP
              </button>
            )}
            <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center text-sm bg-white shadow-sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Confirmation de restauration */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurer l'archive</h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir restaurer cette archive ? L'élément original sera remis dans le système actif.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowRestoreConfirm(false)} className="px-4 py-2 border rounded-lg">
                Annuler
              </button>
              <button onClick={handleConfirmRestore} disabled={processing} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                {processing ? 'Traitement...' : 'Confirmer la restauration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer le document</h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-lg">
                Annuler
              </button>
              <button onClick={confirmDeleteDocument} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Ajouter un document */}
      {showAddDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un document</h3>
              <button onClick={() => setShowAddDocument(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddDocument}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fichier *</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  {errors.fichier && <p className="text-xs text-red-500 mt-1">{errors.fichier}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Description du document..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddDocument(false)} className="px-4 py-2 border rounded-lg">
                    Annuler
                  </button>
                  <button type="submit" disabled={uploading || !data.fichier} className="px-4 py-2 bg-[#B08D57] text-white rounded-lg hover:bg-[#9a7a4a] disabled:opacity-50">
                    {uploading ? 'Upload en cours...' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte d'identité */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className={`h-16 w-16 rounded-full ${typeColor} flex items-center justify-center`}>
                {TypeIcon}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">{archive.titre}</h2>
                <p className="text-sm text-gray-500 mt-1">{archive.type_label}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Référence archive</p>
                <p className="text-sm font-medium text-gray-900 font-mono">{archive.reference}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Référence originale</p>
                <p className="text-sm font-medium text-gray-900">{archive.original_reference || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date d'archivage</p>
                <p className="text-sm font-medium text-gray-900">{formatDateShort(archive.date_archivage)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Archivé par</p>
                <p className="text-sm font-medium text-gray-900">{archive.archive_par || '-'}</p>
              </div>
            </div>

            {archive.description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-gray-700 mt-1">{archive.description}</p>
              </div>
            )}
          </div>

          {/* Documents archivés */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#B08D57]" />
                Documents archivés ({archive.documents?.length || 0})
              </h3>
              <button
                onClick={() => setShowAddDocument(true)}
                className="px-3 py-1.5 bg-[#B08D57] text-white text-sm rounded-lg hover:bg-[#9a7a4a] transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </button>
            </div>

            {archive.documents && archive.documents.length > 0 ? (
              <div className="space-y-3">
                {archive.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center flex-1">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                        {getFileIcon(doc)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.nom_original}</p>
                          {doc.est_principal && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">Principal</span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 space-x-3 mt-0.5">
                          <span>{doc.extension.toUpperCase()}</span>
                          <span>•</span>
                          <span>{doc.taille_lisible}</span>
                          {doc.version > 1 && (
                            <>
                              <span>•</span>
                              <span>v{doc.version}</span>
                            </>
                          )}
                          {doc.description && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[150px]">{doc.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => handleDownloadDocument(doc.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun document dans cette archive</p>
                <button
                  onClick={() => setShowAddDocument(true)}
                  className="mt-2 text-sm text-[#B08D57] hover:underline"
                >
                  Ajouter un document
                </button>
              </div>
            )}
          </div>

          {/* Emplacement physique */}
          {archive.emplacement && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-[#B08D57]" />
                Emplacement physique
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Code emplacement</p>
                  <p className="text-sm font-medium text-gray-900">{archive.emplacement.code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Emplacement complet</p>
                  <p className="text-sm font-medium text-gray-900">{archive.emplacement.code_complet}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{archive.emplacement.type}</p>
                </div>
                {archive.emplacement_detail && (
                  <div>
                    <p className="text-xs text-gray-500">Détail</p>
                    <p className="text-sm font-medium text-gray-900">{archive.emplacement_detail}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Métadonnées */}
          {archive.metadonnees && Object.keys(archive.metadonnees).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#B08D57]" />
                Métadonnées
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(archive.metadonnees).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm font-medium text-gray-900">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historique */}
          {archive.historiques && archive.historiques.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <button
                onClick={() => setShowHistorique(!showHistorique)}
                className="w-full flex justify-between items-center"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <History className="h-5 w-5 mr-2 text-[#B08D57]" />
                  Historique ({archive.historiques.length})
                </h3>
                {showHistorique ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {showHistorique && (
                <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                  {archive.historiques.map((hist, index) => (
                    <div key={hist.id} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-0 last:pb-0">
                      <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-[#B08D57]"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getActionLabel(hist.action)}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{hist.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            <User className="h-3 w-3 inline mr-1" />
                            {getUserName(hist.utilisateur)}
                            {hist.ip_adresse && ` • ${hist.ip_adresse}`}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                          {formatDate(hist.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Colonne droite - Statut et actions */}
        <div className="space-y-6">
          {/* Motif d'archivage */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-[#B08D57]" />
              Motif d'archivage
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Motif</p>
                <p className="text-sm font-medium text-gray-900">{archive.motif_label}</p>
              </div>
              {archive.motif_commentaire && (
                <div>
                  <p className="text-xs text-gray-500">Commentaire</p>
                  <p className="text-sm text-gray-700">{archive.motif_commentaire}</p>
                </div>
              )}
            </div>
          </div>

          {/* Conservation */}
          {(archive.duree_conservation_mois || archive.date_destruction) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-[#B08D57]" />
                Conservation
              </h3>
              <div className="space-y-3">
                {archive.duree_conservation_mois && (
                  <div>
                    <p className="text-xs text-gray-500">Durée de conservation</p>
                    <p className="text-sm font-medium text-gray-900">{archive.duree_conservation_mois} mois</p>
                  </div>
                )}
                {archive.date_destruction && (
                  <div>
                    <p className="text-xs text-gray-500">Date prévue de destruction</p>
                    <p className="text-sm font-medium text-red-600">{formatDateShort(archive.date_destruction)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Historique de restauration */}
          {archive.statut === 'restaure' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-green-600" />
                Historique de restauration
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Restauré le</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(archive.date_restauration)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Restauré par</p>
                  <p className="text-sm font-medium text-gray-900">{archive.restaure_par || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-2">
              {archive.statut === 'archive' && (
                <button
                  onClick={() => setShowRestoreConfirm(true)}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-3 text-yellow-600" />
                  <span className="text-sm">Restaurer l'archive</span>
                </button>
              )}
              {archive.documents && archive.documents.length > 0 && (
                <button
                  onClick={handleDownloadZip}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Package className="h-4 w-4 mr-3 text-blue-600" />
                  <span className="text-sm">Télécharger tous les documents (ZIP)</span>
                </button>
              )}
              <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4 mr-3 text-gray-400" />
                <span className="text-sm">Télécharger les métadonnées</span>
              </button>
              <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Printer className="h-4 w-4 mr-3 text-gray-400" />
                <span className="text-sm">Imprimer la fiche</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          {archive.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{archive.notes}</p>
            </div>
          )}
        </div>
      </div>
    </CrmLayout>
  );
};

export default Show;