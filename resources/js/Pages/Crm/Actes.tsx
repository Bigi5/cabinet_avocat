// resources/js/Pages/Crm/Actes.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Search,
  Filter,
  Plus,
  FileText,
  Clock,
  Send,
  Edit,
  MoreVertical,
  Eye,
  Download,
  Printer,
  Copy,
  CheckCircle,
  AlertCircle,
  FilePlus,
  XCircle,
  Calendar,
  Folder,
  User,
  ChevronRight,
  FileCheck,
  PenTool
} from 'lucide-react';

// Types TypeScript
interface Acte {
  id: string;
  type_acte: string;
  type_acte_label: string;
  description: string | null;
  horodatage: string;
  date: string;
  heure: string;
  dossier: {
    id: string;
    reference: string;
  } | null;
  user: {
    id: string;
    nom: string;
  } | null;
  created_at: string;
}

interface ActesProps {
  actes: {
    data: Acte[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  stats: {
    total: number;
    aujourdhui: number;
    cette_semaine: number;
    ce_mois: number;
    evolution: number;
  };
  filters: {
    search: string;
    dossier_id: string;
    user_id: string;
    type_acte: string;
    date_debut: string;
    date_fin: string;
    order_by: string;
    order_dir: string;
  };
  options: {
    types_actes: Array<{ value: string; label: string }>;
    dossiers: Array<{ id: string; reference: string; client: string }>;
    users: Array<{ id: string; nom: string; role: string }>;
  };
}

const Actes = ({ actes, stats, filters, options }: ActesProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type_acte || 'all');
  const [selectedDossier, setSelectedDossier] = useState(filters.dossier_id || '');
  const [selectedUser, setSelectedUser] = useState(filters.user_id || '');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filtrage des actes
  const filteredActes = actes.data.filter(acte => {
    const matchesSearch = 
      acte.type_acte_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acte.description && acte.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (acte.dossier && acte.dossier.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || acte.type_acte === selectedType;
    const matchesDossier = !selectedDossier || (acte.dossier && acte.dossier.id === selectedDossier);
    const matchesUser = !selectedUser || (acte.user && acte.user.id === selectedUser);
    
    return matchesSearch && matchesType && matchesDossier && matchesUser;
  });

  // Formatage de date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Obtenir l'icône selon le type d'acte
  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      assignation: FileText,
      conclusion: PenTool,
      requete: FileCheck,
      appel: FileText,
      contrat: FileText,
      testament: FileText,
      donation: FileText,
      signification: Send,
      commandement: AlertCircle,
    };
    return icons[type.toLowerCase()] || FileText;
  };

  // Obtenir la couleur selon le type d'acte
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      assignation: 'bg-purple-100 text-purple-600',
      conclusion: 'bg-blue-100 text-blue-600',
      requete: 'bg-green-100 text-green-600',
      appel: 'bg-amber-100 text-amber-600',
      contrat: 'bg-indigo-100 text-indigo-600',
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-600';
  };

  return (
    <CrmLayout title="Actes / Procédures">
      {/* En-tête de page */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Actes / Procédures</h1>
            <p className="text-gray-500 font-light">Gérez tous vos actes juridiques et procédures</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/crm/actes/export?search=${searchTerm}&type_acte=${selectedType}&dossier_id=${selectedDossier}&user_id=${selectedUser}`}
              method="get"
              as="button"
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Link>
            <Link
              href="/crm/actes/create"
              className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all duration-200 flex items-center text-sm shadow-md shadow-[#B08D57]/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel acte
            </Link>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total actes</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <span className={`${stats.evolution > 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
              {stats.evolution > 0 ? '+' : ''}{stats.evolution}%
            </span> vs mois dernier
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Aujourd'hui</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.aujourdhui}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Actes créés aujourd'hui
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cette semaine</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.cette_semaine}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Actes créés
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ce mois</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.ce_mois}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Actes créés
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
              placeholder="Rechercher un acte..."
              className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-gray-50/50 hover:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3">
            {/* Toggle vue Tableau/Cartes */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-[#B08D57] text-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tableau
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'cards' 
                    ? 'bg-[#B08D57] text-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cartes
              </button>
            </div>

            {/* Filtre par type */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Tous types</option>
                {options.types_actes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtre par dossier */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
                value={selectedDossier}
                onChange={(e) => setSelectedDossier(e.target.value)}
              >
                <option value="">Tous dossiers</option>
                {options.dossiers.map(dossier => (
                  <option key={dossier.id} value={dossier.id}>{dossier.reference}</option>
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

            {/* Résultats */}
            <div className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-xl">
              {filteredActes.length} acte{filteredActes.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Vue Tableau */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acte
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Dossier
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredActes.map((acte) => {
                  const TypeIcon = getTypeIcon(acte.type_acte);
                  const typeColor = getTypeColor(acte.type_acte);
                  
                  return (
                    <tr key={acte.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${typeColor} flex items-center justify-center`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{acte.type_acte_label}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {acte.dossier ? (
                          <div className="flex items-center">
                            <Folder className="h-4 w-4 mr-2 text-gray-300" />
                            <Link 
                              href={`/crm/dossiers/${acte.dossier.id}`}
                              className="text-sm text-gray-700 hover:text-[#B08D57]"
                            >
                              {acte.dossier.reference}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${typeColor}`}>
                          {acte.type_acte}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="h-4 w-4 mr-2 text-gray-300" />
                          <span>{acte.date}</span>
                          <span className="mx-1 text-gray-300">•</span>
                          <Clock className="h-4 w-4 mr-1 text-gray-300" />
                          <span>{acte.heure}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {acte.user ? (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-300" />
                            <span className="text-sm text-gray-700">{acte.user.nom}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{acte.description || '-'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/crm/actes/${acte.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/crm/actes/${acte.id}/edit`}
                            className="p-2 text-gray-400 hover:text-[#B08D57] hover:bg-amber-50 rounded-lg"
                            title="Éditer"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Télécharger">
                            <Download className="h-4 w-4" />
                          </button>
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

          {/* Pagination */}
          {actes.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Affichage de <span className="font-medium text-gray-600">{actes.from}</span> à{' '}
                  <span className="font-medium text-gray-600">{actes.to}</span> sur{' '}
                  <span className="font-medium text-gray-600">{actes.total}</span> actes
                </div>
                <div className="flex space-x-2">
                  <button 
                    disabled={actes.current_page === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    Précédent
                  </button>
                  <button className="px-3 py-1.5 bg-[#B08D57] text-white rounded-lg text-xs font-medium hover:bg-[#9c7a4a] transition-all shadow-sm">
                    {actes.current_page}
                  </button>
                  {actes.current_page < actes.last_page && (
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-all bg-white">
                      {actes.current_page + 1}
                    </button>
                  )}
                  <button 
                    disabled={actes.current_page === actes.last_page}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Cartes */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredActes.map((acte) => {
            const TypeIcon = getTypeIcon(acte.type_acte);
            const typeColor = getTypeColor(acte.type_acte);
            
            return (
              <div key={acte.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`h-12 w-12 rounded-xl ${typeColor} flex items-center justify-center`}>
                      <TypeIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{acte.type_acte_label}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">ID: {acte.id}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {acte.dossier && (
                    <div className="flex items-center text-sm">
                      <Folder className="h-4 w-4 mr-2 text-gray-400" />
                      <Link 
                        href={`/crm/dossiers/${acte.dossier.id}`}
                        className="text-gray-700 hover:text-[#B08D57]"
                      >
                        {acte.dossier.reference}
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-700">{acte.date} à {acte.heure}</span>
                  </div>
                  {acte.user && (
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-700">{acte.user.nom}</span>
                    </div>
                  )}
                  {acte.description && (
                    <div className="flex items-start text-sm">
                      <FileText className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      <span className="text-gray-600 line-clamp-2">{acte.description}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {formatDate(acte.created_at)}
                  </span>
                  <Link
                    href={`/crm/actes/${acte.id}`}
                    className="text-[#B08D57] hover:text-[#9c7a4a] font-medium text-sm flex items-center"
                  >
                    Détails
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message si aucun acte */}
      {filteredActes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun acte trouvé</h3>
          <p className="text-gray-500 mb-6">
            Aucun acte ne correspond à vos critères de recherche.
          </p>
          <Link
            href="/crm/actes/create"
            className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un acte
          </Link>
        </div>
      )}
    </CrmLayout>
  );
};

export default Actes;