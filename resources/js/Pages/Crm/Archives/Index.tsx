import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Search,
  Eye,
  Archive,
  RefreshCw,
  Folder,
  FileText,
  FileCheck,
  CreditCard,
  Home,
  CheckCircle,
  XCircle,
  MapPin,
  ChevronRight,
  Plus,
} from 'lucide-react';
import NouvelleArchivePhysique from './NouvelleArchivePhysique';

// ✅ Interfaces TypeScript
interface Archive {
  id: number;
  reference: string;
  type: string;
  type_label: string;
  titre: string;
  original_reference: string | null;
  date_archivage: string;
  motif: string;
  motif_label: string;
  statut: string;
  emplacement: {
    id: number;
    code: string;
    code_complet: string;
  } | null;
  emplacement_detail: string | null;
  archive_par: string | null;
  created_at: string;
  documents_count?: number;
  historiques_count?: number;
}

interface ArchivesProps {
  archives: {
    data: Archive[];
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
  stats: {
    total: number;
    archives: number;
    en_restauration: number;
    restaures: number;
    par_type: {
      dossier: number;
      document: number;
      acte: number;
      facture: number;
      bail: number;
    };
  };
  emplacements: Array<{ id: number; code: string; code_complet: string; occupation: number }>;
  filters: {
    search: string;
    type: string;
    statut: string;
    emplacement_id: string;
    order_by: string;
    order_dir: string;
  };
}

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ReactNode;
  color: string;
}

// ✅ Fonction de formatage de date
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

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <div className="bg-white rounded-xl border p-5 shadow-sm">
    <div className="flex justify-between">
      <div>
        <p className="text-xs text-gray-400">{title}</p>
        <div className="text-2xl font-light mt-1">{value}</div>
      </div>
      <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center`}>{icon}</div>
    </div>
  </div>
);

const ArchivesIndex = ({ archives, stats, emplacements, filters }: ArchivesProps) => {
  // ✅ État local pour les filtres (synchronisé avec les props)
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [selectedStatut, setSelectedStatut] = useState(filters.statut || 'all');
  const [selectedEmplacement, setSelectedEmplacement] = useState(filters.emplacement_id || '');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showNewArchiveModal, setShowNewArchiveModal] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<number | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // ✅ Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, selectedStatut, selectedEmplacement]);

  // ✅ Appliquer les filtres via Inertia - Route corrigée
  const applyFilters = () => {
    router.get(
      route('crm.archives.index'), // ✅ Corrigé
      {
        search: searchTerm,
        type: selectedType,
        statut: selectedStatut,
        emplacement_id: selectedEmplacement,
        order_by: filters.order_by,
        order_dir: filters.order_dir,
      },
      {
        preserveState: true,
        preserveScroll: true,
        only: ['archives', 'filters'],
      }
    );
  };

  // ✅ Changer de page
  const handlePageChange = (url: string | null) => {
    if (!url) return;
    router.get(url, {}, { preserveState: true, preserveScroll: true, only: ['archives'] });
  };

  // ✅ Restaurer une archive - Routes corrigées
  const handleRestore = (archiveId: number) => {
    setIsRestoring(true);
    router.post(
      route('crm.archives.restaurer', archiveId), // ✅ Corrigé
      {},
      {
        onSuccess: () => {
          setShowRestoreConfirm(null);
          setIsRestoring(false);
          router.reload({ only: ['archives', 'stats'] });
        },
        onError: () => {
          setIsRestoring(false);
        },
      }
    );
  };

  // ✅ Confirmer la restauration - Route corrigée
  const handleConfirmRestore = (archiveId: number) => {
    setIsRestoring(true);
    router.post(
      route('crm.archives.confirmer-restauration', archiveId), // ✅ Corrigé
      {},
      {
        onSuccess: () => {
          setShowRestoreConfirm(null);
          setIsRestoring(false);
          router.reload({ only: ['archives', 'stats'] });
        },
        onError: () => {
          setIsRestoring(false);
        },
      }
    );
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      dossier: <Folder className="h-5 w-5" />,
      document: <FileText className="h-5 w-5" />,
      acte: <FileCheck className="h-5 w-5" />,
      facture: <CreditCard className="h-5 w-5" />,
      bail: <Home className="h-5 w-5" />,
    };
    return icons[type] || <FileText className="h-5 w-5" />;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      dossier: 'bg-blue-100 text-blue-600',
      document: 'bg-purple-100 text-purple-600',
      acte: 'bg-green-100 text-green-600',
      facture: 'bg-red-100 text-red-600',
      bail: 'bg-amber-100 text-amber-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, { label: string; color: string; icon: any }> = {
      archive: { label: 'Archivé', color: 'bg-gray-100 text-gray-600', icon: Archive },
      en_cours_de_restauration: { label: 'En restauration', color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
      restaure: { label: 'Restauré', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      supprime: { label: 'Supprimé', color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    return badges[statut] || badges.archive;
  };

  return (
    <CrmLayout title="Archives">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Archives</h1>
            <p className="text-gray-500 font-light">Gérez les archives physiques et numériques du cabinet</p>
          </div>
          <button
            onClick={() => setShowNewArchiveModal(true)}
            className="px-6 py-2.5 bg-[#B08D57] text-white rounded-xl hover:bg-[#9a7a4a] transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Nouvelle archive physique</span>
          </button>
        </div>
      </div>

      {/* ✅ Cartes statistiques améliorées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total archivé" value={stats.total} icon={<Archive className="h-5 w-5" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="En archive" value={stats.archives} icon={<Archive className="h-5 w-5" />} color="bg-gray-100 text-gray-600" />
        <StatCard title="En restauration" value={stats.en_restauration} icon={<RefreshCw className="h-5 w-5" />} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Restaurés" value={stats.restaures} icon={<CheckCircle className="h-5 w-5" />} color="bg-green-100 text-green-600" />
        <StatCard 
          title="Types" 
          value={
            <div className="text-sm space-y-0.5">
              <div>📁 Dossiers: {stats.par_type.dossier}</div>
              <div>📄 Documents: {stats.par_type.document}</div>
              <div>📜 Actes: {stats.par_type.acte}</div>
              <div>💳 Factures: {stats.par_type.facture}</div>
              <div>🏠 Baux: {stats.par_type.bail}</div>
            </div>
          } 
          icon={<Folder className="h-5 w-5" />} 
          color="bg-purple-100 text-purple-600" 
        />
      </div>

      {/* Barre d'outils */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-300" />
            <input
              type="text"
              placeholder="Rechercher une archive..."
              className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] bg-gray-50/50 hover:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-[#B08D57] text-white' : 'text-gray-500'}`}>Tableau</button>
              <button onClick={() => setViewMode('cards')} className={`px-3 py-2 text-sm border-l ${viewMode === 'cards' ? 'bg-[#B08D57] text-white' : 'text-gray-500'}`}>Cartes</button>
            </div>

            <select className="px-4 py-2.5 border rounded-xl bg-white text-sm" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">Tous types</option>
              <option value="dossier">Dossiers</option>
              <option value="document">Documents</option>
              <option value="acte">Actes</option>
              <option value="facture">Factures</option>
              <option value="bail">Baux</option>
            </select>

            <select className="px-4 py-2.5 border rounded-xl bg-white text-sm" value={selectedStatut} onChange={(e) => setSelectedStatut(e.target.value)}>
              <option value="all">Tous statuts</option>
              <option value="archive">Archivé</option>
              <option value="en_cours_de_restauration">En restauration</option>
              <option value="restaure">Restauré</option>
            </select>

            <select className="px-4 py-2.5 border rounded-xl bg-white text-sm" value={selectedEmplacement} onChange={(e) => setSelectedEmplacement(e.target.value)}>
              <option value="">Tous emplacements</option>
              {emplacements.map(e => <option key={e.id} value={e.id}>{e.code_complet}</option>)}
            </select>

            <div className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-xl">
              {archives.total} archive{archives.total > 1 ? 's' : ''}
            </div>
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
              <button onClick={() => setShowRestoreConfirm(null)} className="px-4 py-2 border rounded-lg">
                Annuler
              </button>
              <button 
                onClick={() => handleConfirmRestore(showRestoreConfirm)} 
                disabled={isRestoring} 
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                {isRestoring ? 'Traitement...' : 'Confirmer la restauration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vue Tableau */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-gray-400">Référence</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400">Type</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400">Titre</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400">Réf. originale</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400">Date archivage</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400">Emplacement</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400">Statut</th>
                  <th className="px-6 py-4 text-left text-xs text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {archives.data.map(a => {
                  const TypeIcon = getTypeIcon(a.type);
                  const typeColor = getTypeColor(a.type);
                  const statutBadge = getStatutBadge(a.statut);
                  const StatutIcon = statutBadge.icon;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4 font-mono text-sm">{a.reference}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${typeColor} inline-flex items-center gap-1`}>
                          {TypeIcon}{a.type_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{a.titre}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.original_reference || '-'}</td>
                      <td className="px-6 py-4 text-sm">{formatDateShort(a.date_archivage)}</td>
                      <td className="px-6 py-4">
                        {a.emplacement ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{a.emplacement.code_complet}</span>
                            {a.emplacement_detail && <span className="text-xs text-gray-400 ml-1">({a.emplacement_detail})</span>}
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${statutBadge.color} inline-flex items-center gap-1`}>
                          <StatutIcon className="h-3 w-3" />{statutBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1">
                          <Link href={route('crm.archives.show', a.id)} className="p-2 text-gray-400 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </Link>
                          {a.statut === 'archive' && (
                            <button 
                              onClick={() => setShowRestoreConfirm(a.id)}
                              className="p-2 text-gray-400 hover:text-yellow-600"
                              title="Restaurer"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* ✅ Pagination fonctionnelle avec liens Inertia */}
          {archives.total > 0 && (
            <div className="px-6 py-4 border-t bg-gray-50/50">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>
                  Affichage de {archives.from} à {archives.to} sur {archives.total}
                </span>
                <div className="flex space-x-2">
                  {archives.links && archives.links.map((link, index) => {
                    if (index === 0 || index === archives.links.length - 1) {
                      // Boutons Précédent / Suivant
                      return (
                        <button
                          key={index}
                          onClick={() => handlePageChange(link.url)}
                          disabled={!link.url}
                          className="px-3 py-1.5 border rounded-lg disabled:opacity-50 bg-white hover:bg-gray-50"
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      );
                    }
                    
                    // Numéros de page
                    return (
                      <button
                        key={index}
                        onClick={() => handlePageChange(link.url)}
                        className={`px-3 py-1.5 rounded-lg ${
                          link.active 
                            ? 'bg-[#B08D57] text-white shadow-sm' 
                            : 'border bg-white hover:bg-gray-50'
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

      {/* Vue Cartes */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archives.data.map(a => {
            const TypeIcon = getTypeIcon(a.type);
            const typeColor = getTypeColor(a.type);
            const statutBadge = getStatutBadge(a.statut);
            const StatutIcon = statutBadge.icon;
            return (
              <div key={a.id} className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-xl ${typeColor}`}>{TypeIcon}</div>
                  <span className={`px-2 py-1 text-xs rounded-full ${statutBadge.color} inline-flex items-center gap-1`}>
                    <StatutIcon className="h-3 w-3" />{statutBadge.label}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{a.titre}</h3>
                <p className="text-xs text-gray-500 font-mono mb-3">{a.reference}</p>
                <div className="space-y-2 text-sm mb-4">
                  <p><span className="text-gray-500">Type:</span> {a.type_label}</p>
                  <p><span className="text-gray-500">Réf. originale:</span> {a.original_reference || '-'}</p>
                  <p><span className="text-gray-500">Archivé le:</span> {formatDateShort(a.date_archivage)}</p>
                  {a.emplacement && <p><span className="text-gray-500">Emplacement:</span> {a.emplacement.code_complet}</p>}
                  {a.documents_count !== undefined && (
                    <p><span className="text-gray-500">Documents:</span> {a.documents_count}</p>
                  )}
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <Link href={route('crm.archives.show', a.id)} className="text-[#B08D57] text-sm flex items-center">
                    Détails <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                  {a.statut === 'archive' && (
                    <button 
                      onClick={() => setShowRestoreConfirm(a.id)}
                      className="text-yellow-600 text-sm flex items-center hover:underline"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Restaurer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {archives.data.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center">
          <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune archive</h3>
          <p className="text-gray-500">Aucune archive ne correspond à vos critères.</p>
        </div>
      )}

      {/* Modal Nouvelle Archive Physique */}
      {showNewArchiveModal && (
        <NouvelleArchivePhysique onClose={() => setShowNewArchiveModal(false)} />
      )}
    </CrmLayout>
  );
};

export default ArchivesIndex;