import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  Send,
  Mail,
  Phone,
  ChevronRight,
  Edit,
  Printer,
  FileSignature,
  Archive,
  Clock,
  User,
  Folder,
  Paperclip,
  UserCheck,
  Hash
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface Transmission {
  id: number;
  reference: string;
  objet: string;
  type: string;
  type_label: string;
  destinataire_nom: string;
  destinataire_email?: string;
  destinataire_telephone?: string;
  emetteur: string | null;
  dossier: { id: number; reference: string } | null;
  date_transmission: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  a_decharge: boolean;
  decharge_signe: boolean;
  pieces_jointes_count?: number;
  created_at: string;
}

interface Stats {
  total: number;
  brouillons: number;
  en_attente: number;
  envoyes: number;
  recus: number;
  signes: number;
  archives: number;
  annules: number;
}

interface Filters {
  search: string;
  statut: string;
  type: string;
  dossier_id: string;
  order_by: string;
  order_dir: string;
}

interface Options {
  dossiers: Array<{ id: string; reference: string }>;
}

interface TransmissionsProps {
  transmissions: {
    data: Transmission[];
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
const TransmissionsIndex = ({ transmissions, stats, filters, options }: TransmissionsProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatut, setSelectedStatut] = useState(filters.statut || 'all');
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [selectedDossier, setSelectedDossier] = useState(filters.dossier_id || '');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // ============================================
  // GESTION DES FILTRES AVEC INERTIA
  // ============================================
  const applyFilters = () => {
    router.get('/crm/transmissions', {
      search: searchTerm || '',
      statut: selectedStatut || 'all',
      type: selectedType || 'all',
      dossier_id: selectedDossier || '',
      order_by: filters.order_by || 'date_transmission',
      order_dir: filters.order_dir || 'desc',
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters();
  };

  const handleStatutChange = (value: string) => {
    setSelectedStatut(value);
    applyFilters();
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    applyFilters();
  };

  const handleDossierChange = (value: string) => {
    setSelectedDossier(value);
    applyFilters();
  };

  // ============================================
  // PAGINATION
  // ============================================
  const handlePageChange = (url: string | null) => {
    if (url) {
      router.get(url, {}, {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      });
    }
  };

  // ============================================
  // SUPPRESSION
  // ============================================
  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transmission ?')) {
      router.delete(`/crm/transmissions/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          router.reload();
        },
        onError: () => {
          alert('Impossible de supprimer cette transmission.');
        },
      });
    }
  };

  // ============================================
  // UTILITAIRES
  // ============================================
  const getStatutIcon = (statut: string) => {
    switch(statut) {
      case 'brouillon': return <FileText className="h-3 w-3" />;
      case 'en_attente': return <Clock className="h-3 w-3" />;
      case 'envoye': return <Send className="h-3 w-3" />;
      case 'recu': return <Mail className="h-3 w-3" />;
      case 'signe': return <FileSignature className="h-3 w-3" />;
      case 'archive': return <Archive className="h-3 w-3" />;
      case 'annule': return <XCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      transmission: 'Transmission',
      remise: 'Remise',
      notification: 'Notification',
      signification: 'Signification',
      retour_dossier: 'Retour dossier',
      courrier: 'Courrier',
      convocation: 'Convocation',
      decision: 'Décision',
    };
    return labels[type] || type;
  };

  // ✅ Badge décharge amélioré
  const getDechargeBadge = (aDecharge: boolean, dechargeSigne: boolean) => {
    if (dechargeSigne) {
      return { label: 'Décharge signée', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3 mr-1" /> };
    }
    if (aDecharge) {
      return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3 mr-1" /> };
    }
    return { label: 'Aucune', color: 'bg-gray-100 text-gray-500', icon: <XCircle className="h-3 w-3 mr-1" /> };
  };

  // ✅ Formater la date
  const formatDate = (date: string) => {
    return date; // Déjà formaté par le backend
  };

  // ============================================
  // RENDU
  // ============================================
  return (
    <CrmLayout title="Transmissions">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Transmissions</h1>
            <p className="text-gray-500 font-light">Gérez les transmissions et décharges</p>
          </div>
          <Link
            href="/crm/transmissions/create"
            className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] flex items-center text-sm shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle transmission
          </Link>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        <StatCard title="Total" value={stats.total} icon={<FileText className="h-4 w-4" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Brouillons" value={stats.brouillons} icon={<FileText className="h-4 w-4" />} color="bg-gray-100 text-gray-600" />
        <StatCard title="En attente" value={stats.en_attente} icon={<Clock className="h-4 w-4" />} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Envoyées" value={stats.envoyes} icon={<Send className="h-4 w-4" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Reçues" value={stats.recus} icon={<Mail className="h-4 w-4" />} color="bg-green-100 text-green-600" />
        <StatCard title="Signées" value={stats.signes} icon={<FileSignature className="h-4 w-4" />} color="bg-purple-100 text-purple-600" />
        <StatCard title="Archivées" value={stats.archives} icon={<Archive className="h-4 w-4" />} color="bg-gray-100 text-gray-600" />
      </div>

      {/* Barre d'outils */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-300" />
            <input
              type="text"
              placeholder="Rechercher une transmission..."
              className="pl-9 pr-4 py-2.5 w-full border rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57]"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex border rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm transition-colors ${viewMode === 'table' ? 'bg-[#B08D57] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Tableau
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm border-l transition-colors ${viewMode === 'cards' ? 'bg-[#B08D57] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Cartes
              </button>
            </div>

            <select
              className="px-4 py-2.5 border rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#B08D57]/20"
              value={selectedStatut}
              onChange={(e) => handleStatutChange(e.target.value)}
            >
              <option value="all">Tous statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="en_attente">En attente</option>
              <option value="envoye">Envoyé</option>
              <option value="recu">Reçu</option>
              <option value="signe">Signé</option>
              <option value="archive">Archivé</option>
              <option value="annule">Annulé</option>
            </select>

            <select
              className="px-4 py-2.5 border rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#B08D57]/20"
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="all">Tous types</option>
              <option value="transmission">Transmission</option>
              <option value="remise">Remise en main propre</option>
              <option value="notification">Notification</option>
              <option value="signification">Signification</option>
              <option value="retour_dossier">Retour de dossier</option>
              <option value="courrier">Envoi de courrier</option>
              <option value="convocation">Convocation</option>
              <option value="decision">Décision</option>
            </select>

            <select
              className="px-4 py-2.5 border rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#B08D57]/20"
              value={selectedDossier}
              onChange={(e) => handleDossierChange(e.target.value)}
            >
              <option value="">Tous dossiers</option>
              {options.dossiers.map(d => <option key={d.id} value={d.id}>{d.reference}</option>)}
            </select>

            <div className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-xl whitespace-nowrap">
              {transmissions.total} transmission{transmissions.total > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Vue Tableau */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">Réf.</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">Dossier / Objet</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">Destinataire</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">Décharge</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transmissions.data.map(t => {
                  const dechargeBadge = getDechargeBadge(t.a_decharge, t.decharge_signe);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 group transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm text-gray-900">{t.reference}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {t.dossier && (
                            <div className="flex items-center text-gray-500 text-xs mb-1">
                              <Folder className="h-3 w-3 mr-1" />
                              <span>{t.dossier.reference}</span>
                            </div>
                          )}
                          <div className="font-medium text-gray-800">{t.objet}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">{t.destinataire_nom}</div>
                          {t.emetteur && (
                            <div className="text-xs text-gray-400">Émis par {t.emetteur}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{getTypeLabel(t.type)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{formatDate(t.date_transmission)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${t.statut_color} flex items-center w-fit`}>
                          {getStatutIcon(t.statut)}
                          <span className="ml-1">{t.statut_label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${dechargeBadge.color} flex items-center w-fit`}>
                          {dechargeBadge.icon}
                          {dechargeBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/crm/transmissions/${t.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <a
                            href={`/crm/transmissions/${t.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Télécharger le PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                          <Link
                            href={`/crm/transmissions/${t.id}/edit`}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
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
          {transmissions.total > 0 && transmissions.links && transmissions.links.length > 3 && (
            <div className="px-6 py-4 border-t bg-gray-50/50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                <span>Affichage de {transmissions.from} à {transmissions.to} sur {transmissions.total}</span>
                <div className="flex space-x-2 flex-wrap gap-1">
                  {transmissions.links.map((link, index) => {
                    if (index === 0 || index === transmissions.links.length - 1) {
                      return (
                        <button
                          key={`${link.label}-${index}`}
                          onClick={() => handlePageChange(link.url)}
                          disabled={!link.url}
                          className={`px-3 py-1.5 border rounded-lg text-xs transition-all ${
                            link.url
                              ? 'hover:bg-white hover:text-gray-700 bg-white'
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
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                          link.active
                            ? 'bg-[#B08D57] text-white shadow-sm'
                            : 'border hover:bg-white hover:text-gray-700 bg-white'
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

      {/* Vue Cartes - Enrichie */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transmissions.data.map(t => {
            const dechargeBadge = getDechargeBadge(t.a_decharge, t.decharge_signe);
            return (
              <div key={t.id} className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-all group">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">{t.reference}</span>
                    </div>
                    <span className="text-xs text-gray-400">{getTypeLabel(t.type)}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${t.statut_color}`}>
                    {t.statut_label}
                  </span>
                </div>

                {/* Objet */}
                <div className="mb-3">
                  <p className="font-medium text-gray-800 text-sm">{t.objet}</p>
                </div>

                {/* Détails */}
                <div className="space-y-1.5 mb-3 text-sm">
                  {t.dossier && (
                    <div className="flex items-center text-gray-600 text-xs">
                      <Folder className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                      <span className="font-medium">{t.dossier.reference}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 text-xs">
                    <User className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    <span>{t.destinataire_nom}</span>
                  </div>
                  {t.emetteur && (
                    <div className="flex items-center text-gray-400 text-xs">
                      <UserCheck className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                      <span>Émis par {t.emetteur}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-400 text-xs">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    <span>{formatDate(t.date_transmission)}</span>
                  </div>
                  {t.pieces_jointes_count !== undefined && t.pieces_jointes_count > 0 && (
                    <div className="flex items-center text-gray-400 text-xs">
                      <Paperclip className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                      <span>{t.pieces_jointes_count} pièce{t.pieces_jointes_count > 1 ? 's' : ''} jointe{t.pieces_jointes_count > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className={`text-xs px-2 py-1 rounded-full ${dechargeBadge.color} flex items-center`}>
                    {dechargeBadge.icon}
                    {dechargeBadge.label}
                  </span>
                  <div className="flex items-center space-x-1">
                    <a
                      href={`/crm/transmissions/${t.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Télécharger le PDF"
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                    <Link
                      href={`/crm/transmissions/${t.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/crm/transmissions/${t.id}`}
                      className="text-[#B08D57] text-sm hover:underline flex items-center"
                    >
                      Détails <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message vide */}
      {transmissions.data.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border">
          <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transmission</h3>
          <p className="text-gray-500 mb-6">Aucune transmission ne correspond à vos critères.</p>
          <Link
            href="/crm/transmissions/create"
            className="px-4 py-2 bg-[#B08D57] text-white rounded-xl hover:bg-[#9c7a4a] inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer une transmission
          </Link>
        </div>
      )}
    </CrmLayout>
  );
};

// ============================================
// COMPOSANT STATCARD
// ============================================
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <div className="bg-white rounded-xl border p-3 shadow-sm hover:shadow-md transition-all">
    <div className="flex flex-col items-center text-center">
      <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center mb-1`}>
        {icon}
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{title}</p>
    </div>
  </div>
);

export default TransmissionsIndex;