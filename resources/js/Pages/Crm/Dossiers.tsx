// resources/js/Pages/Crm/Dossiers.tsx
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Search,
  Plus,
  Clock,
  Calendar,
  Folder,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Share2,
  Edit,
  ChevronRight,
  Building,
  Trash2
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface Client {
  id: string;
  nom: string;
  type: string;
}

interface Responsable {
  id: string;
  nom: string;
  role: string;
}

interface Collaborateur {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  role_label: string;
}

interface Dossier {
  id: string;
  reference: string;
  type_mission: string;
  type_mission_label: string;
  date_ouverture: string;
  client: Client | null;
  responsable: Responsable | null;
  statut: string;
  statut_label: string;
  statut_color: string;
  montant: number | null;
  description: string | null;
  progression: number;
  total_actes: number;
  total_documents: number;
  total_echeances: number;
  echeances_urgentes: number;
  echeances_en_retard: number;
  collaborateurs: Collaborateur[];
  created_at: string;
  updated_at: string;
}

interface OptionItem {
  value: string;
  label: string;
}

interface ClientOption {
  id: string;
  nom: string;
}

interface ResponsableOption {
  id: string;
  nom: string;
}

interface Stats {
  total: number;
  en_cours: number;
  clotures: number;
  archives: number;
  avec_echeances_urgentes: number;
  evolution: number;
}

interface Filters {
  search: string;
  type_mission: string;
  statut: string;
  client_id: string;
  responsable_id: string;
  date_debut: string;
  date_fin: string;
  order_by: string;
  order_dir: string;
}

interface Options {
  type_missions: OptionItem[];
  statuts: OptionItem[];
  clients: ClientOption[];
  responsables: ResponsableOption[];
}

interface DossiersProps {
  dossiers: {
    data: Dossier[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
  stats: Stats;
  filters: Filters;
  options: Options;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const Dossiers = ({ dossiers, stats, filters, options }: DossiersProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type_mission || 'all');
  const [selectedStatus, setSelectedStatus] = useState(filters.statut || 'all');
  const [selectedClient, setSelectedClient] = useState(filters.client_id || '');
  const [selectedResponsable, setSelectedResponsable] = useState(filters.responsable_id || '');
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, selectedType, selectedStatus, selectedClient, selectedResponsable);
  };

  const applyFilters = (
    search: string,
    type: string,
    statut: string,
    client: string,
    responsable: string
  ) => {
    router.get('/crm/dossiers', {
      search: search || '',
      type_mission: type || 'all',
      statut: statut || 'all',
      client_id: client || '',
      responsable_id: responsable || '',
      date_debut: filters.date_debut || '',
      date_fin: filters.date_fin || '',
      order_by: filters.order_by || 'created_at',
      order_dir: filters.order_dir || 'desc',
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newState = {
      search: searchTerm,
      type_mission: selectedType,
      statut: selectedStatus,
      client_id: selectedClient,
      responsable_id: selectedResponsable,
    };

    switch (key) {
      case 'type_mission':
        setSelectedType(value);
        newState.type_mission = value;
        break;
      case 'statut':
        setSelectedStatus(value);
        newState.statut = value;
        break;
      case 'client_id':
        setSelectedClient(value);
        newState.client_id = value;
        break;
      case 'responsable_id':
        setSelectedResponsable(value);
        newState.responsable_id = value;
        break;
    }

    router.get('/crm/dossiers', {
      ...newState,
      date_debut: filters.date_debut || '',
      date_fin: filters.date_fin || '',
      order_by: filters.order_by || 'created_at',
      order_dir: filters.order_dir || 'desc',
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSort = (column: string) => {
    const newOrderDir = filters.order_by === column && filters.order_dir === 'asc' ? 'desc' : 'asc';
    router.get('/crm/dossiers', {
      search: searchTerm,
      type_mission: selectedType,
      statut: selectedStatus,
      client_id: selectedClient,
      responsable_id: selectedResponsable,
      date_debut: filters.date_debut || '',
      date_fin: filters.date_fin || '',
      order_by: column,
      order_dir: newOrderDir,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handlePageChange = (url: string | null) => {
    if (url) {
      router.get(url, {}, {
        preserveState: true,
        replace: true,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible.')) {
      router.delete(`/crm/dossiers/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          // Rien à faire, la redirection est gérée par le backend
        },
        onError: () => {
          alert('Impossible de supprimer ce dossier.');
        },
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <CrmLayout title="Dossiers">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Dossiers</h1>
            <p className="text-gray-500 font-light">Suivez et gérez l'ensemble des dossiers du cabinet</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/crm/dossiers/create"
              className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all duration-200 flex items-center text-sm shadow-md shadow-[#B08D57]/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau dossier
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total dossiers</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Folder className="h-5 w-5 text-blue-500" />
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
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">En cours</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.en_cours}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {stats.total > 0 ? Math.round((stats.en_cours / stats.total) * 100) : 0}% du total
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Clôturés</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.clotures}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {stats.total > 0 ? Math.round((stats.clotures / stats.total) * 100) : 0}% du total
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Archivés</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.archives}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
              <Folder className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {stats.total > 0 ? Math.round((stats.archives / stats.total) * 100) : 0}% du total
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Éch. urgentes</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.avec_echeances_urgentes}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            À traiter en priorité
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
              placeholder="Rechercher un dossier..."
              className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-gray-50/50 hover:bg-white"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Vue Liste/Grille */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewType('list')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  viewType === 'list'
                    ? 'bg-[#B08D57] text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setViewType('grid')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  viewType === 'grid'
                    ? 'bg-[#B08D57] text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grille
              </button>
            </div>

            {/* Filtres */}
            <select
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
              value={selectedType}
              onChange={(e) => handleFilterChange('type_mission', e.target.value)}
            >
              <option value="all">Tous types</option>
              {options.type_missions.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
              value={selectedStatus}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
            >
              <option value="all">Tous statuts</option>
              {options.statuts.map((statut) => (
                <option key={statut.value} value={statut.value}>
                  {statut.label}
                </option>
              ))}
            </select>

            <select
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
              value={selectedClient}
              onChange={(e) => handleFilterChange('client_id', e.target.value)}
            >
              <option value="">Tous clients</option>
              {options.clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nom}
                </option>
              ))}
            </select>

            <select
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
              value={selectedResponsable}
              onChange={(e) => handleFilterChange('responsable_id', e.target.value)}
            >
              <option value="">Tous responsables</option>
              {options.responsables.map((resp) => (
                <option key={resp.id} value={resp.id}>
                  {resp.nom}
                </option>
              ))}
            </select>

            <div className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-xl whitespace-nowrap">
              {dossiers.total} dossier{dossiers.total > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Vue Liste */}
      {viewType === 'list' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('reference_unique')}
                  >
                    Référence
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('type_mission')}
                  >
                    Dossier
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('client_id')}
                  >
                    Client
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('responsable_id')}
                  >
                    Responsable
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('type_mission')}
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('date_ouverture')}
                  >
                    Dates
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('statut')}
                  >
                    Statut
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Progression
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {dossiers.data.map((dossier) => (
                  <tr key={dossier.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{dossier.reference}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-[#B08D57]/10 to-[#B08D57]/5 flex items-center justify-center">
                          <Folder className="h-5 w-5 text-[#B08D57]" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{dossier.type_mission_label}</div>
                          <div className="flex items-center text-xs text-gray-400 mt-0.5">
                            <FileText className="h-3 w-3 mr-1" />
                            {dossier.total_documents} doc{dossier.total_documents > 1 ? 's' : ''}
                            <span className="mx-1">•</span>
                            <Clock className="h-3 w-3 mr-1" />
                            {dossier.total_echeances} éch.
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-300" />
                        <div>
                          <div className="text-sm text-gray-700">{dossier.client?.nom || 'Client inconnu'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{dossier.responsable?.nom || 'Non assigné'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {dossier.type_mission_label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(dossier.date_ouverture)}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(dossier.updated_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${dossier.statut_color}`}>
                        {dossier.statut_label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-[#B08D57] h-2 rounded-full"
                            style={{ width: `${dossier.progression}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{dossier.progression}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/crm/dossiers/${dossier.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/crm/dossiers/${dossier.id}/edit`}
                          className="p-2 text-gray-400 hover:text-[#B08D57] hover:bg-amber-50 rounded-lg transition-all duration-200"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(dossier.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {dossiers.total > 0 && dossiers.links && dossiers.links.length > 3 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-400">
                  Affichage de <span className="font-medium text-gray-600">{dossiers.from}</span> à{' '}
                  <span className="font-medium text-gray-600">{dossiers.to}</span> sur{' '}
                  <span className="font-medium text-gray-600">{dossiers.total}</span> dossiers
                </div>
                <div className="flex space-x-2">
                  {dossiers.links.map((link, index) => {
                    if (index === 0 || index === dossiers.links.length - 1) {
                      return (
                        <button
                          key={`${link.label}-${index}`}
                          onClick={() => handlePageChange(link.url)}
                          disabled={!link.url}
                          className={`px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium transition-all ${
                            link.url
                              ? 'text-gray-500 hover:bg-white hover:text-gray-700 bg-white'
                              : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                          }`}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      );
                    }
                    return (
                      <button
                        key={`${link.label}-${index}`}
                        onClick={() => handlePageChange(link.url)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          link.active
                            ? 'bg-[#B08D57] text-white shadow-sm'
                            : 'border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 bg-white'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Grille */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dossiers.data.map((dossier) => (
            <div key={dossier.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#B08D57]/10 to-[#B08D57]/5 flex items-center justify-center mr-3">
                    <Folder className="h-6 w-6 text-[#B08D57]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dossier.reference}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{dossier.type_mission_label}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${dossier.statut_color}`}>
                  {dossier.statut_label}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">{dossier.client?.nom || 'Client inconnu'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">{dossier.responsable?.nom || 'Non assigné'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">{dossier.total_documents} documents</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">{dossier.total_echeances} échéances</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Ouvert le {formatDate(dossier.date_ouverture)}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                    <div
                      className="bg-[#B08D57] h-1.5 rounded-full"
                      style={{ width: `${dossier.progression}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{dossier.progression}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <Link
                  href={`/crm/dossiers/${dossier.id}`}
                  className="text-[#B08D57] hover:text-[#9c7a4a] font-medium text-sm flex items-center"
                >
                  Détails
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
                {dossier.echeances_urgentes > 0 && (
                  <div className="flex items-center text-xs text-red-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {dossier.echeances_urgentes} urgente{dossier.echeances_urgentes > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun dossier */}
      {dossiers.data.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun dossier trouvé</h3>
          <p className="text-gray-500 mb-6">
            Aucun dossier ne correspond à vos critères de recherche.
          </p>
          <Link
            href="/crm/dossiers/create"
            className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau dossier
          </Link>
        </div>
      )}
    </CrmLayout>
  );
};

export default Dossiers;