// resources/js/Pages/Crm/Echeances.tsx
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Search,
  Plus,
  Calendar,
  Eye,
  MoreVertical,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Bell,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  AlertCircle,
  CheckSquare,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  FileText,
  Folder,
  Users,
  Edit
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface Echeance {
  id: string;
  titre: string;
  titre_court: string;
  description: string | null;
  date_echeance: string;
  date: string;
  heure: string;
  date_time: string;
  criticite: string;
  criticite_label: string;
  criticite_color: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  est_urgent: boolean;
  est_en_retard: boolean;
  est_aujourd_hui: boolean;
  est_demain: boolean;
  notifications: string[];
  notification_email: boolean;
  notification_sms: boolean;
  notification_whatsapp: boolean;
  dossier: {
    id: string;
    reference: string;
  } | null;
  user: {
    id: string;
    nom: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  aujourd_hui: number;
  a_venir: number;
  urgentes: number;
  en_retard: number;
  terminees: number;
  evolution: number;
}

interface Filters {
  search: string;
  periode: string;
  dossier_id: string;
  user_id: string;
  criticite: string;
  statut: string;
  urgent: string;
  en_retard: string;
  date_debut: string;
  date_fin: string;
  order_by: string;
  order_dir: string;
}

interface OptionItem {
  value: string;
  label: string;
}

interface DossierOption {
  id: string;
  reference: string;
  client: string;
}

interface UserOption {
  id: string;
  nom: string;
  role: string;
}

interface Options {
  dossiers: DossierOption[];
  users: UserOption[];
  criticites: OptionItem[];
  statuts: OptionItem[];
}

interface EcheancesProps {
  echeances: {
    data: Echeance[];
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
const Echeances = ({ echeances, stats, filters, options }: EcheancesProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedPeriode, setSelectedPeriode] = useState(filters.periode || 'all');
  const [selectedCriticite, setSelectedCriticite] = useState(filters.criticite || 'all');
  const [selectedStatut, setSelectedStatut] = useState(filters.statut || 'all');
  const [selectedDossier, setSelectedDossier] = useState(filters.dossier_id || '');
  const [selectedUser, setSelectedUser] = useState(filters.user_id || '');
  const [showUrgent, setShowUrgent] = useState(filters.urgent === 'true');
  const [showEnRetard, setShowEnRetard] = useState(filters.en_retard === 'true');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Appliquer les filtres
  const applyFilters = () => {
    router.get('/crm/echeances', {
      search: searchTerm || '',
      periode: selectedPeriode || 'all',
      criticite: selectedCriticite || 'all',
      statut: selectedStatut || 'all',
      dossier_id: selectedDossier || '',
      user_id: selectedUser || '',
      urgent: showUrgent ? 'true' : '',
      en_retard: showEnRetard ? 'true' : '',
      date_debut: filters.date_debut || '',
      date_fin: filters.date_fin || '',
      order_by: filters.order_by || 'date_echeance',
      order_dir: filters.order_dir || 'asc',
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Gestion de la recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters();
  };

  // Gestion des changements de filtre
  const handleFilterChange = (key: string, value: string | boolean) => {
    const newState = {
      search: searchTerm,
      periode: selectedPeriode,
      criticite: selectedCriticite,
      statut: selectedStatut,
      dossier_id: selectedDossier,
      user_id: selectedUser,
      urgent: showUrgent,
      en_retard: showEnRetard,
    };

    switch (key) {
      case 'periode':
        setSelectedPeriode(value as string);
        newState.periode = value as string;
        break;
      case 'criticite':
        setSelectedCriticite(value as string);
        newState.criticite = value as string;
        break;
      case 'statut':
        setSelectedStatut(value as string);
        newState.statut = value as string;
        break;
      case 'dossier_id':
        setSelectedDossier(value as string);
        newState.dossier_id = value as string;
        break;
      case 'user_id':
        setSelectedUser(value as string);
        newState.user_id = value as string;
        break;
      case 'urgent':
        setShowUrgent(value as boolean);
        newState.urgent = value as boolean;
        break;
      case 'en_retard':
        setShowEnRetard(value as boolean);
        newState.en_retard = value as boolean;
        break;
    }

    router.get('/crm/echeances', {
      ...newState,
      date_debut: filters.date_debut || '',
      date_fin: filters.date_fin || '',
      order_by: filters.order_by || 'date_echeance',
      order_dir: filters.order_dir || 'asc',
    }, {
      preserveState: true,
      replace: true,
    });
  };

  // Pagination
  const handlePageChange = (url: string | null) => {
    if (url) {
      router.get(url, {}, {
        preserveState: true,
        replace: true,
      });
    }
  };

  // Formatage de date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtenir l'icône selon le type
  const getTypeIcon = (titre: string) => {
    const titreLower = titre.toLowerCase();
    if (titreLower.includes('audience')) return AlertTriangle;
    if (titreLower.includes('dépôt')) return FileText;
    if (titreLower.includes('rdv') || titreLower.includes('rendez')) return User;
    if (titreLower.includes('signature')) return CheckSquare;
    return Clock;
  };

  // Obtenir la couleur selon le type
  const getTypeColor = (titre: string) => {
    const titreLower = titre.toLowerCase();
    if (titreLower.includes('audience')) return 'bg-purple-100 text-purple-600';
    if (titreLower.includes('dépôt')) return 'bg-red-100 text-red-600';
    if (titreLower.includes('rdv') || titreLower.includes('rendez')) return 'bg-blue-100 text-blue-600';
    if (titreLower.includes('signature')) return 'bg-green-100 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <CrmLayout title="Échéances">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Échéances</h1>
            <p className="text-gray-500 font-light">Gérez tous vos audiences, délais et rendez-vous</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/crm/echeances/create"
              className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all duration-200 flex items-center text-sm shadow-md shadow-[#B08D57]/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle échéance
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-500" />
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
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.aujourd_hui}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">À traiter</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">À venir</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.a_venir}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Cette semaine</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Urgentes</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.urgentes}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Haute priorité</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">En retard</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.en_retard}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">À rattraper</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Terminées</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.terminees}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Ce mois</div>
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
              placeholder="Rechercher une échéance..."
              className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-gray-50/50 hover:bg-white"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtre rapide par date */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
              {['all', 'today', 'week', 'month'].map((periode) => (
                <button
                  key={periode}
                  onClick={() => handleFilterChange('periode', periode)}
                  className={`px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    selectedPeriode === periode
                      ? 'bg-[#B08D57] text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  } ${periode !== 'all' ? 'border-l border-gray-200' : ''}`}
                >
                  {periode === 'all' ? 'Tous' :
                   periode === 'today' ? "Aujourd'hui" :
                   periode === 'week' ? 'Cette semaine' : 'Ce mois'}
                </button>
              ))}
            </div>

            {/* Toggle vue */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-[#B08D57] text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="Vue tableau"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-all duration-200 border-l border-gray-200 ${
                  viewMode === 'grid'
                    ? 'bg-[#B08D57] text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="Vue grille"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Filtres */}
            <select
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
              value={selectedCriticite}
              onChange={(e) => handleFilterChange('criticite', e.target.value)}
            >
              <option value="all">Toutes priorités</option>
              {options.criticites.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            <select
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
              value={selectedStatut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
            >
              <option value="all">Tous statuts</option>
              {options.statuts.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <select
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
              value={selectedDossier}
              onChange={(e) => handleFilterChange('dossier_id', e.target.value)}
            >
              <option value="">Tous dossiers</option>
              {options.dossiers.map((d) => (
                <option key={d.id} value={d.id}>{d.reference}</option>
              ))}
            </select>

            <select
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
              value={selectedUser}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
            >
              <option value="">Tous utilisateurs</option>
              {options.users.map((u) => (
                <option key={u.id} value={u.id}>{u.nom}</option>
              ))}
            </select>

            {/* Filtres supplémentaires */}
            <button
              onClick={() => handleFilterChange('urgent', !showUrgent)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center ${
                showUrgent
                  ? 'bg-red-500 text-white'
                  : 'border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'
              }`}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent
            </button>

            <button
              onClick={() => handleFilterChange('en_retard', !showEnRetard)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center ${
                showEnRetard
                  ? 'bg-orange-500 text-white'
                  : 'border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'
              }`}
            >
              <Clock className="h-3 w-3 mr-1" />
              En retard
            </button>

            <div className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-xl whitespace-nowrap">
              {echeances.total} échéance{echeances.total > 1 ? 's' : ''}
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Dossier
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {echeances.data.map((echeance) => {
                  const TypeIcon = getTypeIcon(echeance.titre);
                  const typeColor = getTypeColor(echeance.titre);

                  return (
                    <tr key={echeance.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${typeColor} flex items-center justify-center`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{echeance.titre}</div>
                            {echeance.description && (
                              <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{echeance.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {echeance.dossier ? (
                          <Link
                            href={`/crm/dossiers/${echeance.dossier.id}`}
                            className="text-sm text-gray-700 hover:text-[#B08D57] flex items-center"
                          >
                            <Folder className="h-4 w-4 mr-2 text-gray-300" />
                            {echeance.dossier.reference}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-300" />
                          <span>{echeance.date}</span>
                          <span className="mx-1 text-gray-300">•</span>
                          <Clock className="h-4 w-4 mr-1 text-gray-300" />
                          <span>{echeance.heure}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${echeance.criticite_color}`}>
                          {echeance.criticite_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${echeance.statut_color}`}>
                          {echeance.statut_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {echeance.user ? (
                          <Link
                            href={`/crm/utilisateurs/${echeance.user.id}`}
                            className="text-sm text-gray-700 hover:text-[#B08D57] flex items-center"
                          >
                            <User className="h-4 w-4 mr-2 text-gray-300" />
                            {echeance.user.nom}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/crm/echeances/${echeance.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/crm/echeances/${echeance.id}/edit`}
                            className="p-2 text-gray-400 hover:text-[#B08D57] hover:bg-amber-50 rounded-lg"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Rappels">
                            <Bell className="h-4 w-4" />
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
          {echeances.total > 0 && echeances.links && echeances.links.length > 3 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-400">
                  Affichage de <span className="font-medium text-gray-600">{echeances.from}</span> à{' '}
                  <span className="font-medium text-gray-600">{echeances.to}</span> sur{' '}
                  <span className="font-medium text-gray-600">{echeances.total}</span> échéances
                </div>
                <div className="flex space-x-2">
                  {echeances.links.map((link, index) => {
                    if (index === 0 || index === echeances.links.length - 1) {
                      return (
                        <button
                          key={`${link.label}-${index}`}
                          onClick={() => handlePageChange(link.url)}
                          disabled={!link.url}
                          className={`px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium transition-all ${
                            link.url
                              ? 'text-gray-500 hover:bg-white hover:text-gray-700 bg-white'
                              : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                          } flex items-center`}
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
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {echeances.data.map((echeance) => {
            const TypeIcon = getTypeIcon(echeance.titre);
            const typeColor = getTypeColor(echeance.titre);

            return (
              <div key={echeance.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`h-12 w-12 rounded-xl ${typeColor} flex items-center justify-center`}>
                      <TypeIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{echeance.titre}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">ID: {echeance.id}</p>
                    </div>
                  </div>
                  {echeance.est_urgent && (
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  {echeance.dossier && (
                    <div className="flex items-center text-sm">
                      <Folder className="h-4 w-4 mr-2 text-gray-400" />
                      <Link
                        href={`/crm/dossiers/${echeance.dossier.id}`}
                        className="text-gray-700 hover:text-[#B08D57]"
                      >
                        {echeance.dossier.reference}
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-700">{echeance.date} à {echeance.heure}</span>
                  </div>
                  {echeance.user && (
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <Link
                        href={`/crm/utilisateurs/${echeance.user.id}`}
                        className="text-gray-700 hover:text-[#B08D57]"
                      >
                        {echeance.user.nom}
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${echeance.criticite_color}`}>
                      {echeance.criticite_label}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${echeance.statut_color}`}>
                      {echeance.statut_label}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      href={`/crm/echeances/${echeance.id}`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Voir"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/crm/echeances/${echeance.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-[#B08D57] hover:bg-amber-50 rounded-lg"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {echeance.est_en_retard && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center text-xs text-red-500">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      En retard
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Message si aucun résultat */}
      {echeances.data.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune échéance trouvée</h3>
          <p className="text-gray-500 mb-6">
            Aucune échéance ne correspond à vos critères de recherche.
          </p>
          <Link
            href="/crm/echeances/create"
            className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer une échéance
          </Link>
        </div>
      )}
    </CrmLayout>
  );
};

export default Echeances;