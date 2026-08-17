// resources/js/Pages/Crm/Utilisateurs.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Search,
  Filter,
  Plus,
  User,
  Users,
  Shield,
  Mail,
  Phone,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Lock,
  LogOut,
  Key,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Briefcase,
  Award,
  Star,
  Activity,
  Settings,
  Download,
  Printer,
  RefreshCw,
  AlertCircle,
  Shield as ShieldIcon,
  UserCog,
  UserPlus,
  UserMinus,
  Grid,
  List
} from 'lucide-react';

// Types TypeScript
interface Utilisateur {
  id: string;
  reference: string;
  email: string;
  nom: string;
  prenom: string;
  nom_complet: string;
  initiales: string;
  role: string;
  role_label: string;
  role_color: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  telephone: string | null;
  total_dossiers: number;
  dossiers_en_cours: number;
  echeances_urgentes: number;
  actes_ce_mois: number;
  documents_ce_mois: number;
  created_at: string;
  updated_at: string;
}

interface UtilisateursProps {
  utilisateurs: {
    data: Utilisateur[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  stats: {
    total: number;
    actifs: number;
    huissiers: number;
    seniors: number;
    juniors: number;
    assistants: number;
    en_ligne: number;
    evolution: number;
  };
  filters: {
    search: string;
    role: string;
    statut: string;
    order_by: string;
    order_dir: string;
  };
  options: {
    roles: Array<{ value: string; label: string }>;
    statuts: Array<{ value: string; label: string }>;
  };
}

const Utilisateurs = ({ utilisateurs, stats, filters, options }: UtilisateursProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
  const [selectedStatus, setSelectedStatus] = useState(filters.statut || 'all');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'grid'>('table');

  // Filtrage des utilisateurs
  const filteredUtilisateurs = utilisateurs.data.filter(user => {
    const matchesSearch = 
      user.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.telephone && user.telephone.includes(searchTerm));
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.statut === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
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

  return (
    <CrmLayout title="Utilisateurs">
      {/* En-tête de page */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Utilisateurs</h1>
            <p className="text-gray-500 font-light">Gérez les utilisateurs, rôles et permissions</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/crm/utilisateurs/export?search=${searchTerm}&role=${selectedRole}&statut=${selectedStatus}`}
              method="get"
              as="button"
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Link>
            <Link
              href="/crm/utilisateurs/create"
              className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all duration-200 flex items-center text-sm shadow-md shadow-[#B08D57]/20"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter utilisateur
            </Link>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <span className="text-green-500 font-medium">+{stats.evolution}%</span> ce mois
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Actifs</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.actifs}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {Math.round((stats.actifs/stats.total)*100)}% du total
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Huissiers</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.huissiers}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Administrateurs</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Seniors</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.seniors}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Award className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Avocats expérimentés</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Juniors</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.juniors}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Avocats juniors</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Assistants</p>
              <p className="text-2xl font-light text-gray-900 mt-1">{stats.assistants}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
              <User className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">Support</div>
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
              placeholder="Rechercher un utilisateur..."
              className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-gray-50/50 hover:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle vues */}
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
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 border-l border-gray-200 ${
                  viewMode === 'cards' 
                    ? 'bg-[#B08D57] text-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cartes
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 border-l border-gray-200 ${
                  viewMode === 'grid' 
                    ? 'bg-[#B08D57] text-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Filtre par rôle */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">Tous rôles</option>
                {options.roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtre par statut */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tous statuts</option>
                {options.statuts.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Résultats */}
            <div className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-xl">
              {filteredUtilisateurs.length} utilisateur{filteredUtilisateurs.length > 1 ? 's' : ''}
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
                    Utilisateur
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Activité
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date inscription
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUtilisateurs.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#B08D57]/5 flex items-center justify-center">
                          <span className="text-[#B08D57] font-bold text-sm">
                            {user.initiales}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.nom_complet}</div>
                          <div className="text-xs text-gray-400">{user.reference}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 mr-2 text-gray-300" />
                          <span className="text-xs">{user.email}</span>
                        </div>
                        {user.telephone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5 mr-2 text-gray-300" />
                            <span className="text-xs">{user.telephone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${user.role_color}`}>
                        {user.role_label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${user.statut_color}`}>
                          {user.statut_label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-lg" title="Dossiers">
                          <Briefcase className="h-3 w-3 inline mr-1" />
                          {user.total_dossiers}
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-lg" title="En cours">
                          <Activity className="h-3 w-3 inline mr-1" />
                          {user.dossiers_en_cours}
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-lg" title="Urgentes">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          {user.echeances_urgentes}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1 text-gray-300" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/crm/utilisateurs/${user.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/crm/utilisateurs/${user.id}/edit`}
                          className="p-2 text-gray-400 hover:text-[#B08D57] hover:bg-amber-50 rounded-lg"
                          title="Éditer"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Permissions">
                          <ShieldIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Plus">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {utilisateurs.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Affichage de <span className="font-medium text-gray-600">{utilisateurs.from}</span> à{' '}
                  <span className="font-medium text-gray-600">{utilisateurs.to}</span> sur{' '}
                  <span className="font-medium text-gray-600">{utilisateurs.total}</span> utilisateurs
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    disabled={utilisateurs.current_page === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    Précédent
                  </button>
                  <button className="px-3 py-1.5 bg-[#B08D57] text-white rounded-lg text-xs font-medium hover:bg-[#9c7a4a] transition-all shadow-sm">
                    {utilisateurs.current_page}
                  </button>
                  {utilisateurs.current_page < utilisateurs.last_page && (
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-all bg-white">
                      {utilisateurs.current_page + 1}
                    </button>
                  )}
                  <button 
                    disabled={utilisateurs.current_page === utilisateurs.last_page}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUtilisateurs.map((user) => (
            <div key={user.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#B08D57]/5 flex items-center justify-center">
                    <span className="text-[#B08D57] font-bold text-lg">
                      {user.initiales}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">{user.nom_complet}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{user.reference}</p>
                  </div>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${user.statut === 'actif' ? 'bg-green-500' : 'bg-red-400'}`}></div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600 text-sm">{user.email}</span>
                </div>
                {user.telephone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600 text-sm">{user.telephone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Dossiers</p>
                  <p className="text-sm font-semibold text-gray-900">{user.total_dossiers}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">En cours</p>
                  <p className="text-sm font-semibold text-gray-900">{user.dossiers_en_cours}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Urgentes</p>
                  <p className="text-sm font-semibold text-gray-900">{user.echeances_urgentes}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${user.role_color}`}>
                    {user.role_label}
                  </span>
                  <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${user.statut_color}`}>
                    {user.statut_label}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Link
                    href={`/crm/utilisateurs/${user.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/crm/utilisateurs/${user.id}/edit`}
                    className="p-2 text-gray-400 hover:text-[#B08D57] hover:bg-amber-50 rounded-lg transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue Grille */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUtilisateurs.map((user) => (
            <div key={user.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#B08D57]/5 flex items-center justify-center">
                  <span className="text-[#B08D57] font-bold text-sm">
                    {user.initiales}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.nom_complet}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <div className={`h-2 w-2 rounded-full ${user.statut === 'actif' ? 'bg-green-500' : 'bg-red-400'}`}></div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-lg ${user.role_color}`}>
                    {user.role_label}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Link
                    href={`/crm/utilisateurs/${user.id}`}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/crm/utilisateurs/${user.id}/edit`}
                    className="p-1 text-gray-400 hover:text-[#B08D57]"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Link>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun utilisateur */}
      {filteredUtilisateurs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-gray-500 mb-6">
            Aucun utilisateur ne correspond à vos critères de recherche.
          </p>
          <Link
            href="/crm/utilisateurs/create"
            className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all inline-flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </Link>
        </div>
      )}
    </CrmLayout>
  );
};

export default Utilisateurs;