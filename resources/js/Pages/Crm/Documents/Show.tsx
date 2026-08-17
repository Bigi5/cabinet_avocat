// resources/js/Pages/Crm/Documents/Show.tsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Folder, 
  User, 
  Calendar, 
  Download, 
  HardDrive,
  Eye,
  Share2,
  File,
  Image,
  FileArchive,
  FileSpreadsheet
} from 'lucide-react';

interface Document {
  id: number;
  nom_fichier: string;
  type_document: string;
  type_document_label: string;
  extension: string;
  taille: number;
  taille_formatted: string;
  version: number;
  icone: string;
  couleur: string;
  chemin: string;
  url: string;
  fichier_existe: boolean;
  dossier: {
    id: number;
    reference: string;
    type_mission: string;
  } | null;
  user: {
    id: number;
    nom: string;
  } | null;
  date: string;
  created_at: string;
}

interface ShowProps {
  auth: {
    user: any;
  };
  document: Document;
}

const Show = ({ auth, document }: ShowProps) => {
  // Fonction pour obtenir l'icône selon l'extension
  const getFileIcon = () => {
    const ext = document.extension?.toLowerCase();
    switch(ext) {
      case 'pdf': return <FileText className="h-16 w-16 text-red-500" />;
      case 'doc':
      case 'docx': return <FileText className="h-16 w-16 text-blue-500" />;
      case 'xls':
      case 'xlsx': return <FileSpreadsheet className="h-16 w-16 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <Image className="h-16 w-16 text-purple-500" />;
      case 'zip':
      case 'rar': return <FileArchive className="h-16 w-16 text-amber-500" />;
      default: return <File className="h-16 w-16 text-gray-500" />;
    }
  };

  return (
    <CrmLayout title={`Document - ${document.nom_fichier}`}>
      <Head title={`Document - ${document.nom_fichier}`} />

      {/* En-tête avec navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/crm/documents" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight line-clamp-1">{document.nom_fichier}</h1>
              <p className="text-gray-500 font-light">Document {document.type_document_label}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <a
              href={document.url}
              download={document.nom_fichier}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </a>
            <Link
              href={`/crm/documents/${document.id}/edit`}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
                  router.delete(`/crm/documents/${document.id}`, {
                    preserveScroll: true,
                    onSuccess: () => router.visit('/crm/documents'),
                  });
                }
              }}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Aperçu et infos */}
        <div className="space-y-6">
          {/* Aperçu du fichier */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
            <div className="flex justify-center mb-4">
              {getFileIcon()}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">{document.nom_fichier}</h3>
            <p className="text-sm text-gray-500 mb-4">.{document.extension} • v{document.version}</p>
            
            {document.fichier_existe ? (
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-[#B08D57] text-white rounded-lg font-medium hover:bg-[#9c7a4a] transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualiser
              </a>
            ) : (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                Fichier introuvable sur le serveur
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900">{document.type_document_label}</p>
                </div>
              </div>

              <div className="flex items-center">
                <HardDrive className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Taille</p>
                  <p className="text-sm font-medium text-gray-900">{document.taille_formatted}</p>
                </div>
              </div>

              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Ajouté par</p>
                  <p className="text-sm font-medium text-gray-900">{document.user?.nom || 'Inconnu'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date d'ajout</p>
                  <p className="text-sm font-medium text-gray-900">{document.date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite - Dossier et actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dossier associé */}
          {document.dossier && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dossier associé</h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Folder className="h-10 w-10 text-[#B08D57] mr-4" />
                  <div>
                    <Link 
                      href={`/crm/dossiers/${document.dossier.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-[#B08D57]"
                    >
                      {document.dossier.reference}
                    </Link>
                    <p className="text-sm text-gray-600">{document.dossier.type_mission}</p>
                  </div>
                </div>
                <Link
                  href={`/crm/dossiers/${document.dossier.id}`}
                  className="text-[#B08D57] hover:text-[#9c7a4a] font-medium text-sm"
                >
                  Voir le dossier →
                </Link>
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href={document.url}
                download={document.nom_fichier}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <Download className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Télécharger</span>
              </a>
              
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <Eye className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Visualiser</span>
              </a>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Lien copié dans le presse-papier');
                }}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <Share2 className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Partager</span>
              </button>
            </div>

            {/* Versionnage */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Version actuelle</p>
                  <p className="text-lg font-semibold text-gray-900">v{document.version}</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Nouvelle version
                </button>
              </div>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">ID</p>
                <p className="font-medium text-gray-900">{document.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Extension</p>
                <p className="font-medium text-gray-900">.{document.extension}</p>
              </div>
              <div>
                <p className="text-gray-500">Chemin</p>
                <p className="font-medium text-gray-900 truncate">{document.chemin}</p>
              </div>
              <div>
                <p className="text-gray-500">Créé le</p>
                <p className="font-medium text-gray-900">{document.created_at}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  );
};

export default Show;