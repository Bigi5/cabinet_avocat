// resources/js/Pages/Crm/Documents.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { Edit } from 'lucide-react';
import {
  Search,
  Filter,
  Plus,
  FileText,
  File,
  Mail,
  Folder,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  Upload,
  FileSpreadsheet,
  Calendar,
  User,
  Archive,
  Image,
  FileArchive,
  Share2,
  Copy,
  Move,
  Tag,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Grid,
  List
} from 'lucide-react';

// Types TypeScript
interface Document {
  id: string;
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
    id: string;
    reference: string;
    type_mission: string;
  } | null;
  user: {
    id: string;
    nom: string;
  } | null;
  date: string;
  created_at: string;
}

interface DocumentsProps {
  documents: {
    data: Document[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  stats: {
    total: number;
    total_taille: number;
    entrants: number;
    produits: number;
    transmis: number;
    pdfs: number;
    images: number;
    evolution: number;
  };
  filters: {
    search: string;
    dossier_id: string;
    type_document: string;
    extension: string;
    user_id: string;
    date_debut: string;
    date_fin: string;
    order_by: string;
    order_dir: string;
    archives: string;
  };
  options: {
    types_document: Array<{ value: string; label: string }>;
    extensions: Array<{ value: string; label: string }>;
    dossiers: Array<{ id: string; reference: string }>;
    users: Array<{ id: string; nom: string }>;
  };
}

const Documents = ({ documents, stats, filters, options }: DocumentsProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type_document || 'all');
  const [selectedExtension, setSelectedExtension] = useState(filters.extension || 'all');
  const [selectedDossier, setSelectedDossier] = useState(filters.dossier_id || '');
  const [selectedUser, setSelectedUser] = useState(filters.user_id || '');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showArchived, setShowArchived] = useState(filters.archives === 'true');

  // Filtrage des documents
  const filteredDocuments = documents.data.filter(doc => {
    const matchesSearch = 
      doc.nom_fichier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.dossier && doc.dossier.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || doc.type_document === selectedType;
    const matchesExtension = selectedExtension === 'all' || doc.extension === selectedExtension;
    const matchesDossier = !selectedDossier || (doc.dossier && doc.dossier.id === selectedDossier);
    const matchesUser = !selectedUser || (doc.user && doc.user.id === selectedUser);
    
    return matchesSearch && matchesType && matchesExtension && matchesDossier && matchesUser;
  });

  // Formatage de la taille
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 o';
    const k = 1024;
    const sizes = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Formatage de date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Obtenir l'icône et la couleur selon le type de fichier
  const getFileInfo = (extension: string) => {
    const types: Record<string, { icon: any; color: string; bgColor: string }> = {
      pdf: { icon: FileText, color: 'text-red-600', bgColor: 'bg-red-50' },
      doc: { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      docx: { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      xls: { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50' },
      xlsx: { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50' },
      jpg: { icon: Image, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      jpeg: { icon: Image, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      png: { icon: Image, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      zip: { icon: FileArchive, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    };
    return types[extension.toLowerCase()] || { icon: File, color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  // Obtenir la couleur de la catégorie
  const getCategoryColor = (categorie: string) => {
    const colors: Record<string, string> = {
      entrant: 'bg-green-100 text-green-700',
      produit: 'bg-amber-100 text-amber-700',
      transmis: 'bg-purple-100 text-purple-700',
    };
    return colors[categorie] || 'bg-gray-100 text-gray-700';
  };

  return (
    <CrmLayout title="Documents">
      {/* En-tête de page */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Documents</h1>
            <p className="text-gray-500 font-light">Gérez tous vos documents juridiques</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/crm/documents/export?search=${searchTerm}&type_document=${selectedType}&extension=${selectedExtension}&dossier_id=${selectedDossier}&user_id=${selectedUser}`}
              method="get"
              as="button"
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Link>
            <Link
              href="/crm/documents/create"
              className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all duration-200 flex items-center text-sm shadow-md shadow-[#B08D57]/20"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload document
            </Link>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total docs</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <span className="text-green-500 font-medium">+{stats.evolution}%</span> ce mois
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stockage</p>
              <p className="text-lg font-light text-gray-900 mt-1">{formatFileSize(stats.total_taille)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <HardDrive className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Espace utilisé</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Entrants</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.entrants}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
              <File className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Reçus</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Produits</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.produits}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Créés</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Transmis</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.transmis}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Mail className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Envoyés</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">PDFs</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.pdfs}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            +{stats.images} images
          </div>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un document..."
              className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-gray-50/50 hover:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3">
            {/* Toggle vue Liste/Grille */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-[#B08D57] text-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-[#B08D57] text-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Filtre par catégorie */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Toutes catégories</option>
                {options.types_document.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtre par extension */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
                value={selectedExtension}
                onChange={(e) => setSelectedExtension(e.target.value)}
              >
                <option value="all">Toutes extensions</option>
                {options.extensions.map(ext => (
                  <option key={ext.value} value={ext.value}>{ext.label}</option>
                ))}
              </select>
              <File className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtre par dossier */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
                value={selectedDossier}
                onChange={(e) => setSelectedDossier(e.target.value)}
              >
                <option value="">Tous dossiers</option>
                {options.dossiers.map(dos => (
                  <option key={dos.id} value={dos.id}>{dos.reference}</option>
                ))}
              </select>
              <Folder className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtre par utilisateur */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Tous utilisateurs</option>
                {options.users.map(user => (
                  <option key={user.id} value={user.id}>{user.nom}</option>
                ))}
              </select>
              <User className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Toggle archives */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center ${
                showArchived 
                  ? 'bg-[#B08D57] text-white' 
                  : 'border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'
              }`}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archives
            </button>

            {/* Résultats */}
            <div className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-xl">
              {filteredDocuments.length} doc{filteredDocuments.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Dossier
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Taille
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ajouté le
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Par
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Version
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredDocuments.map((doc) => {
                  const fileInfo = getFileInfo(doc.extension);
                  const FileIcon = fileInfo.icon;
                  
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${fileInfo.bgColor} ${fileInfo.color} flex items-center justify-center`}>
                            <FileIcon className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{doc.nom_fichier}</div>
                            <div className="flex items-center text-xs text-gray-400 mt-0.5">
                              <span className="mr-2">.{doc.extension}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {doc.dossier ? (
                          <div className="flex items-center">
                            <Folder className="h-4 w-4 mr-2 text-gray-300" />
                            <Link 
                              href={`/crm/dossiers/${doc.dossier.id}`}
                              className="text-sm text-gray-700 hover:text-[#B08D57]"
                            >
                              {doc.dossier.reference}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${getCategoryColor(doc.type_document)}`}>
                          {doc.type_document_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{doc.taille_formatted}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1 text-gray-300" />
                          {formatDate(doc.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.user ? (
                          <div className="flex items-center text-sm text-gray-700">
                            <User className="h-4 w-4 mr-2 text-gray-300" />
                            <span className="text-sm text-gray-700">{doc.user.nom}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">v{doc.version}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/crm/documents/${doc.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={doc.url}
                            download={doc.nom_fichier}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/crm/documents/${doc.id}/edit`}
                            className="p-2 text-gray-400 hover:text-[#B08D57] hover:bg-amber-50 rounded-lg"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Plus">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pied de tableau - Pagination */}
          {documents.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Affichage de <span className="font-medium text-gray-600">{documents.from}</span> à{' '}
                  <span className="font-medium text-gray-600">{documents.to}</span> sur{' '}
                  <span className="font-medium text-gray-600">{documents.total}</span> documents
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-xs text-gray-400">
                    Total: <span className="font-medium text-gray-600">{formatFileSize(stats.total_taille)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      disabled={documents.current_page === 1}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                    >
                      Précédent
                    </button>
                    <button className="px-3 py-1.5 bg-[#B08D57] text-white rounded-lg text-xs font-medium hover:bg-[#9c7a4a] transition-all shadow-sm">
                      {documents.current_page}
                    </button>
                    {documents.current_page < documents.last_page && (
                      <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-all bg-white">
                        {documents.current_page + 1}
                      </button>
                    )}
                    <button 
                      disabled={documents.current_page === documents.last_page}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Grille */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc) => {
            const fileInfo = getFileInfo(doc.extension);
            const FileIcon = fileInfo.icon;
            
            return (
              <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`h-12 w-12 rounded-xl ${fileInfo.bgColor} ${fileInfo.color} flex items-center justify-center`}>
                      <FileIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{doc.nom_fichier}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">.{doc.extension} • v{doc.version}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {doc.dossier && (
                    <div className="flex items-center text-xs">
                      <Folder className="h-3.5 w-3.5 mr-2 text-gray-300" />
                      <Link 
                        href={`/crm/dossiers/${doc.dossier.id}`}
                        className="text-gray-600 hover:text-[#B08D57]"
                      >
                        {doc.dossier.reference}
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center text-xs">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-gray-300" />
                    <span className="text-gray-600">{formatDate(doc.created_at)}</span>
                  </div>
                  {doc.user && (
                    <div className="flex items-center text-xs">
                      <User className="h-3.5 w-3.5 mr-2 text-gray-300" />
                      <span className="text-gray-600">{doc.user.nom}</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs">
                    <HardDrive className="h-3.5 w-3.5 mr-2 text-gray-300" />
                    <span className="text-gray-600">{doc.taille_formatted}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getCategoryColor(doc.type_document)}`}>
                    {doc.type_document_label}
                  </span>
                  <div className="flex space-x-1">
                    <Link
                      href={`/crm/documents/${doc.id}`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Voir"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={doc.url}
                      download={doc.nom_fichier}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/crm/documents/${doc.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-[#B08D57] hover:bg-amber-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message si aucun document */}
      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
          <p className="text-gray-500 mb-6">
            Aucun document ne correspond à vos critères de recherche.
          </p>
          <Link
            href="/crm/documents/create"
            className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all inline-flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Uploader un document
          </Link>
        </div>
      )}
    </CrmLayout>
  );
};

export default Documents;