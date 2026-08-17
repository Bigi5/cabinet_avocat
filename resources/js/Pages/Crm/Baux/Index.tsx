// resources/js/Pages/Crm/Baux/Index.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Building,
  User,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Home,
  TrendingUp,
  DollarSign,
  ChevronRight
} from 'lucide-react';

interface Bail {
  id: number;
  reference: string;
  locataire: {
    id: number;
    nom: string;
  } | null;
  bailleur: {
    id: number;
    nom: string;
  } | null;
  dossier: {
    id: number;
    reference: string;
  } | null;
  montant_loyer: number;
  montant_loyer_formatted: string;
  frequence: string;
  frequence_label: string;
  date_debut: string;
  date_fin: string | null;
  adresse_bien: string | null;
  statut: string;
  statut_label: string;
  total_impaye: number;
  total_impaye_formatted: string;
  created_at: string;
  updated_at: string;
}

interface BauxProps {
  baux: {
    data: Bail[];
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
    termines: number;
    avec_impayes: number;
    montant_mensuel_total: number;
  };
  filters: {
    search: string;
    statut: string;
    locataire_id: string;
    order_by: string;
    order_dir: string;
  };
  options: {
    clients: Array<{ id: string; nom: string }>;
  };
}

const BauxIndex = ({ baux, stats, filters, options }: BauxProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatut, setSelectedStatut] = useState(filters.statut || 'all');
  const [selectedLocataire, setSelectedLocataire] = useState(filters.locataire_id || '');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filtrage local
  const filteredBaux = baux.data.filter(bail => {
    const matchesSearch = 
      bail.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bail.locataire?.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bail.adresse_bien?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatut = selectedStatut === 'all' || bail.statut === selectedStatut;
    const matchesLocataire = !selectedLocataire || bail.locataire?.id.toString() === selectedLocataire;
    
    return matchesSearch && matchesStatut && matchesLocataire;
  });

  // Obtenir la couleur du statut
  const getStatutColor = (statut: string) => {
    const colors = {
      actif: 'bg-green-100 text-green-800',
      termine: 'bg-gray-100 text-gray-800',
      resilie: 'bg-red-100 text-red-800',
    };
    return colors[statut as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Formater le montant mensuel total
  const montantMensuelTotalFormatted = new Intl.NumberFormat('fr-FR').format(stats.montant_mensuel_total) + ' FCFA';

  return (
    <CrmLayout title="Baux et Loyers">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Baux et Loyers</h1>
            <p className="text-gray-500 font-light">Gérez les contrats de location et suivez les paiements</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/crm/baux/create"
              className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all duration-200 flex items-center text-sm shadow-md shadow-[#B08D57]/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau bail
            </Link>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total baux" value={stats.total} icon={<FileText className="h-5 w-5" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Baux actifs" value={stats.actifs} icon={<CheckCircle className="h-5 w-5" />} color="bg-green-100 text-green-600" />
        <StatCard title="Baux terminés" value={stats.termines} icon={<XCircle className="h-5 w-5" />} color="bg-gray-100 text-gray-600" />
        <StatCard title="Avec impayés" value={stats.avec_impayes} icon={<AlertCircle className="h-5 w-5" />} color="bg-red-100 text-red-600" />
        <StatCard title="CA mensuel" value={montantMensuelTotalFormatted} icon={<DollarSign className="h-5 w-5" />} color="bg-purple-100 text-purple-600" />
      </div>

      {/* Barre d'outils */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un bail..."
              className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-gray-50/50 hover:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3">
            {/* Toggle vue */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'table' ? 'bg-[#B08D57] text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tableau
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 border-l border-gray-200 ${
                  viewMode === 'cards' ? 'bg-[#B08D57] text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cartes
              </button>
            </div>

            {/* Filtre par statut */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
              >
                <option value="all">Tous statuts</option>
                <option value="actif">Actif</option>
                <option value="termine">Terminé</option>
                <option value="resilie">Résilié</option>
              </select>
              <Filter className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtre par locataire */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-white text-sm"
                value={selectedLocataire}
                onChange={(e) => setSelectedLocataire(e.target.value)}
              >
                <option value="">Tous locataires</option>
                {options.clients.map(client => (
                  <option key={client.id} value={client.id}>{client.nom}</option>
                ))}
              </select>
              <User className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Résultats */}
            <div className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-xl">
              {filteredBaux.length} bail{filteredBaux.length > 1 ? 's' : ''}
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Référence</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Locataire</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Adresse</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Loyer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Période</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Impayés</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredBaux.map((bail) => (
                  <tr key={bail.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bail.reference}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-300" />
                        <span className="text-sm text-gray-700">{bail.locataire?.nom || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2 text-gray-300" />
                        <span className="text-sm text-gray-600 line-clamp-1">{bail.adresse_bien || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bail.montant_loyer_formatted}</div>
                      <div className="text-xs text-gray-400">/{bail.frequence_label}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{bail.date_debut}</div>
                      {bail.date_fin && <div className="text-xs text-gray-400">→ {bail.date_fin}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatutColor(bail.statut)}`}>
                        {bail.statut_label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bail.total_impaye > 0 ? (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">{bail.total_impaye_formatted}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-green-600">À jour</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/crm/baux/${bail.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Voir">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/crm/baux/${bail.id}/edit`} className="p-2 text-gray-400 hover:text-[#B08D57] hover:bg-amber-50 rounded-lg" title="Modifier">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer">
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
          {baux.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Affichage de <span className="font-medium text-gray-600">{baux.from}</span> à{' '}
                  <span className="font-medium text-gray-600">{baux.to}</span> sur{' '}
                  <span className="font-medium text-gray-600">{baux.total}</span> baux
                </div>
                <div className="flex space-x-2">
                  <button disabled={baux.current_page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white disabled:opacity-50 bg-white">
                    Précédent
                  </button>
                  <button className="px-3 py-1.5 bg-[#B08D57] text-white rounded-lg text-xs font-medium shadow-sm">
                    {baux.current_page}
                  </button>
                  {baux.current_page < baux.last_page && (
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white bg-white">
                      {baux.current_page + 1}
                    </button>
                  )}
                  <button disabled={baux.current_page === baux.last_page} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-white disabled:opacity-50 bg-white">
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
          {filteredBaux.map((bail) => (
            <div key={bail.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{bail.reference}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Créé le {bail.created_at}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatutColor(bail.statut)}`}>
                  {bail.statut_label}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">Locataire: {bail.locataire?.nom || '-'}</span>
                </div>
                {bail.adresse_bien && (
                  <div className="flex items-center text-sm">
                    <Home className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600 line-clamp-1">{bail.adresse_bien}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">{bail.montant_loyer_formatted} / {bail.frequence_label}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">{bail.date_debut} → {bail.date_fin || 'En cours'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {bail.total_impaye > 0 ? (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {bail.total_impaye_formatted} impayé
                  </div>
                ) : (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    À jour
                  </div>
                )}
                <Link href={`/crm/baux/${bail.id}`} className="text-[#B08D57] hover:text-[#9c7a4a] font-medium text-sm flex items-center">
                  Détails
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun bail */}
      {filteredBaux.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bail trouvé</h3>
          <p className="text-gray-500 mb-6">Aucun bail ne correspond à vos critères de recherche.</p>
          <Link href="/crm/baux/create" className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] transition-all inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un bail
          </Link>
        </div>
      )}
    </CrmLayout>
  );
};

// Composant StatCard
const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-light text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

export default BauxIndex;