// resources/js/Pages/Crm/Clients/Index.tsx
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Users,
  Search,
  Plus,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Building,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Download,
  Upload,
  CheckCircle,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface Client {
  id: number;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  type_client: string;
  type_client_label: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  statut: string;
  statut_label: string;
  statut_color: string;
  total_dossiers: number;
  dossiers_en_cours: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  actifs: number;
  inactifs: number;
  personnes_physiques: number;
  personnes_morales: number;
  evolution: number;
}

interface Filters {
  search: string | null;
  type_client: string | null;
  statut: string | null;
  order_by: string;
  order_dir: string;
  per_page: number;
}

interface Props {
  clients: {
    data: Client[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
  stats: Stats;
  filters: Filters;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const ClientsIndex = ({ clients, stats, filters }: Props) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type_client || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.statut || '');
  const [perPage, setPerPage] = useState(filters.per_page || 15);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    router.get('/crm/clients', {
      search: value,
      type_client: selectedType,
      statut: selectedStatus,
      order_by: filters.order_by,
      order_dir: filters.order_dir,
      per_page: perPage
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true
    });
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    router.get('/crm/clients', {
      search: searchTerm,
      type_client: value,
      statut: selectedStatus,
      order_by: filters.order_by,
      order_dir: filters.order_dir,
      per_page: perPage
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true
    });
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    router.get('/crm/clients', {
      search: searchTerm,
      type_client: selectedType,
      statut: value,
      order_by: filters.order_by,
      order_dir: filters.order_dir,
      per_page: perPage
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true
    });
  };

  const handleSort = (column: string) => {
    const newOrderDir = filters.order_by === column && filters.order_dir === 'asc' ? 'desc' : 'asc';
    router.get('/crm/clients', {
      search: searchTerm,
      type_client: selectedType,
      statut: selectedStatus,
      order_by: column,
      order_dir: newOrderDir,
      per_page: perPage
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true
    });
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    router.get('/crm/clients', {
      search: searchTerm,
      type_client: selectedType,
      statut: selectedStatus,
      order_by: filters.order_by,
      order_dir: filters.order_dir,
      per_page: value
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      router.delete(`/crm/clients/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          router.reload();
        },
        onError: () => {
          alert('Impossible de supprimer ce client.');
        }
      });
    }
  };

  // ✅ Boutons Export/Import masqués (fonctionnalités non implémentées)
  // const handleExport = () => {
  //   alert('Fonctionnalité d\'export en cours de développement.');
  // };
  //
  // const handleImport = () => {
  //   alert('Fonctionnalité d\'import en cours de développement.');
  // };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // ✅ Statuts validés (actif et inactif uniquement)
  const getStatusBadge = (statut: string) => {
    const badges: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      inactif: 'bg-gray-100 text-gray-800',
    };
    return badges[statut] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    return type === 'personne_physique' ? <UserIcon className="h-4 w-4" /> : <Building className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    return type === 'personne_physique' ? 'Physique' : 'Morale';
  };

  // Calculs sécurisés des pourcentages
  const tauxActifs = stats.total > 0 
    ? Math.round((stats.actifs / stats.total) * 100) 
    : 0;
  
  const tauxPhysiques = stats.total > 0 
    ? Math.round((stats.personnes_physiques / stats.total) * 100) 
    : 0;
  
  const tauxMorales = stats.total > 0 
    ? Math.round((stats.personnes_morales / stats.total) * 100) 
    : 0;

  return (
    <CrmLayout title="Clients">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500 mt-1">Gérez tous vos clients</p>
          </div>
          <div className="flex gap-3">
            {/* ✅ Boutons Import/Export masqués */}
            {/* 
            <button
              onClick={handleImport}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importer
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter
            </button>
            */}
            <Link
              href="/crm/clients/create"
              className="px-4 py-2 bg-[#B08D57] text-white rounded-lg text-sm font-medium hover:bg-[#9c7a4a] transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau client
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total clients"
            value={stats.total}
            icon={<Users className="h-5 w-5" />}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Clients actifs"
            value={stats.actifs}
            subtitle={`${tauxActifs}%`}
            icon={<CheckCircle className="h-5 w-5" />}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            label="Personnes physiques"
            value={stats.personnes_physiques}
            subtitle={`${tauxPhysiques}%`}
            icon={<UserIcon className="h-5 w-5" />}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            label="Personnes morales"
            value={stats.personnes_morales}
            subtitle={`${tauxMorales}%`}
            icon={<Building className="h-5 w-5" />}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Évolution"
            value={`${stats.evolution}%`}
            subtitle="vs mois dernier"
            icon={<ChevronDown className={`h-5 w-5 ${stats.evolution >= 0 ? 'text-green-500' : 'text-red-500'}`} />}
            color={stats.evolution >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}
          />
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] text-sm"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20"
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="">Tous les types</option>
                <option value="personne_physique">Personne physique</option>
                <option value="personne_morale">Personne morale</option>
              </select>

              {/* ✅ Statuts valides : actif / inactif */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20"
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20"
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
              >
                <option value="15">15 par page</option>
                <option value="25">25 par page</option>
                <option value="50">50 par page</option>
                <option value="100">100 par page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des clients */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('nom')}
                  >
                    <div className="flex items-center gap-1">
                      Client
                      {filters.order_by === 'nom' && (
                        <ChevronDown className={`h-4 w-4 transition-transform ${filters.order_dir === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dossiers</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {clients.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Aucun client trouvé
                    </td>
                  </tr>
                ) : (
                  clients.data.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/crm/clients/${client.id}`} className="font-medium text-gray-900 hover:text-[#B08D57]">
                          {client.type_client === 'personne_physique' 
                            ? `${client.prenom || ''} ${client.nom}`.trim()
                            : client.raison_sociale || client.nom
                          }
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          {getTypeIcon(client.type_client)}
                          {getTypeLabel(client.type_client)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {client.email && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span className="text-xs">{client.email}</span>
                            </div>
                          )}
                          {client.telephone && (
                            <div className="flex items-center gap-1 text-gray-600 mt-0.5">
                              <Phone className="h-3 w-3" />
                              <span className="text-xs">{client.telephone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {client.adresse && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs line-clamp-1">{client.adresse}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(client.statut)}`}>
                          {client.statut_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {client.total_dossiers || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/crm/clients/${client.id}`}
                            className="p-1 text-gray-400 hover:text-[#B08D57] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/crm/clients/${client.id}/edit`}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            onClick={() => handleDelete(client.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {clients.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Affichage de {((clients.current_page - 1) * clients.per_page) + 1} à{' '}
                {Math.min(clients.current_page * clients.per_page, clients.total)} sur {clients.total} clients
              </div>
              <div className="flex gap-2 flex-wrap">
                {clients.links.map((link, index) => (
                  <button
                    key={`${link.label}-${index}`}
                    onClick={() => {
                      if (link.url) {
                        router.get(link.url, {}, { 
                          preserveState: true, 
                          replace: true,
                          preserveScroll: true 
                        });
                      }
                    }}
                    disabled={!link.url}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      link.active
                        ? 'bg-[#B08D57] text-white'
                        : link.url
                        ? 'text-gray-700 hover:bg-gray-200'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </CrmLayout>
  );
};

// ============================================
// COMPOSANTS
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ label, value, subtitle, icon, color }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      {subtitle && <span className="text-xs font-medium text-gray-500">{subtitle}</span>}
    </div>
    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

export default ClientsIndex;