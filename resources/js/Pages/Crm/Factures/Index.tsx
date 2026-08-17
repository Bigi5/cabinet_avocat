import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Search,
  Plus,
  Eye,
  Edit,
  FileText,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Mail
} from 'lucide-react';

interface Facture {
  id: number;
  reference: string;
  client: { id: number; nom: string } | null;
  dossier: { id: number; reference: string } | null;
  date_emission: string;
  date_echeance: string;
  montant_ht_formatted: string;
  montant_ttc_formatted: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  type: string;
  solde: number;
  est_payee: boolean;
  created_at: string;
}

interface FacturesProps {
  factures: {
    data: Facture[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  stats: {
    total: number;
    brouillons: number;
    envoyees: number;
    payees: number;
    impayees: number;
    montant_total: number;
    montant_impaye: number;
  };
  filters: {
    search: string;
    statut: string;
    type: string;
    client_id: string;
    order_by: string;
    order_dir: string;
  };
  options: {
    clients: Array<{ id: string; nom: string }>;
  };
}

const FacturesIndex = ({ factures, stats, filters, options }: FacturesProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatut, setSelectedStatut] = useState(filters.statut || 'all');
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [selectedClient, setSelectedClient] = useState(filters.client_id || '');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredFactures = factures.data.filter(f => {
    const matchesSearch = f.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (f.client?.nom.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatut = selectedStatut === 'all' || f.statut === selectedStatut;
    const matchesType = selectedType === 'all' || f.type === selectedType;
    const matchesClient = !selectedClient || f.client?.id.toString() === selectedClient;
    return matchesSearch && matchesStatut && matchesType && matchesClient;
  });

  const getStatutColor = (statut: string) => {
    const colors = {
      brouillon: 'bg-gray-100 text-gray-600',
      envoyee: 'bg-blue-100 text-blue-800',
      payee: 'bg-green-100 text-green-800',
      impayee: 'bg-red-100 text-red-800',
      annulee: 'bg-gray-100 text-gray-500',
    };
    return colors[statut as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const montantTotalFormatted = new Intl.NumberFormat('fr-FR').format(stats.montant_total) + ' FCFA';

  return (
    <CrmLayout title="Factures">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Factures</h1>
            <p className="text-gray-500 font-light">Gérez les factures et suivez les paiements</p>
          </div>
          <Link href="/crm/factures/create" className="px-4 py-2 bg-[#B08D57] text-white rounded-xl font-medium hover:bg-[#9c7a4a] flex items-center text-sm shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Link>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total factures" value={stats.total} icon={<FileText className="h-5 w-5" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Brouillons" value={stats.brouillons} icon={<Edit className="h-5 w-5" />} color="bg-gray-100 text-gray-600" />
        <StatCard title="Envoyées" value={stats.envoyees} icon={<Mail className="h-5 w-5" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Payées" value={stats.payees} icon={<CheckCircle className="h-5 w-5" />} color="bg-green-100 text-green-600" />
        <StatCard title="Impayées" value={stats.impayees} icon={<AlertCircle className="h-5 w-5" />} color="bg-red-100 text-red-600" />
        <StatCard title="Montant total" value={montantTotalFormatted} icon={<DollarSign className="h-5 w-5" />} color="bg-purple-100 text-purple-600" />
      </div>

      {/* Barre d'outils */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-300" />
            <input type="text" placeholder="Rechercher une facture..." className="pl-9 pr-4 py-2.5 w-full border rounded-xl bg-gray-50/50"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex border rounded-xl overflow-hidden bg-white">
              <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-[#B08D57] text-white' : 'text-gray-500'}`}>Tableau</button>
              <button onClick={() => setViewMode('cards')} className={`px-3 py-2 text-sm border-l ${viewMode === 'cards' ? 'bg-[#B08D57] text-white' : 'text-gray-500'}`}>Cartes</button>
            </div>

            <select className="px-4 py-2.5 border rounded-xl bg-white text-sm" value={selectedStatut} onChange={(e) => setSelectedStatut(e.target.value)}>
              <option value="all">Tous statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="envoyee">Envoyée</option>
              <option value="payee">Payée</option>
              <option value="impayee">Impayée</option>
            </select>

            <select className="px-4 py-2.5 border rounded-xl bg-white text-sm" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">Tous types</option>
              <option value="honoraire">Honoraire</option>
              <option value="frais">Frais</option>
              <option value="avance">Avance</option>
            </select>

            <select className="px-4 py-2.5 border rounded-xl bg-white text-sm" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
              <option value="">Tous clients</option>
              {options.clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>

            <button onClick={() => router.get('/crm/factures', { search: searchTerm, statut: selectedStatut, type: selectedType, client_id: selectedClient })} className="px-4 py-2 border rounded-xl text-sm">Appliquer</button>

            <div className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-xl">{filteredFactures.length} facture{filteredFactures.length > 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Vue Tableau */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr><th className="px-6 py-4 text-left text-xs text-gray-400">Réf.</th><th className="px-6 py-4 text-left text-xs text-gray-400">Client</th><th className="px-6 py-4 text-left text-xs text-gray-400">Dossier</th><th className="px-6 py-4 text-left text-xs text-gray-400">Date</th><th className="px-6 py-4 text-left text-xs text-gray-400">Montant</th><th className="px-6 py-4 text-left text-xs text-gray-400">Statut</th><th className="px-6 py-4 text-left text-xs text-gray-400">Actions</th></tr>
            </thead>
            <tbody>
              {filteredFactures.map(f => (
                <tr key={f.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4 font-medium">{f.reference}</td>
                  <td className="px-6 py-4">{f.client?.nom || '-'}</td>
                  <td className="px-6 py-4">{f.dossier?.reference || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">Émis: {f.date_emission}</div>
                    <div className="text-xs text-gray-400">Échéance: {f.date_echeance}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{f.montant_ttc_formatted}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 text-xs rounded-full ${getStatutColor(f.statut)}`}>{f.statut_label}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                      <Link href={`/crm/factures/${f.id}`} className="p-2 text-gray-400 hover:text-blue-600"><Eye className="h-4 w-4" /></Link>
                      {f.statut === 'brouillon' && <Link href={`/crm/factures/${f.id}/edit`} className="p-2 text-gray-400 hover:text-amber-600"><Edit className="h-4 w-4" /></Link>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          {factures.total > 0 && (
            <div className="px-6 py-4 border-t bg-gray-50/50">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Affichage de {factures.from} à {factures.to} sur {factures.total} factures</span>
                <div className="flex space-x-2">
                  <button disabled={factures.current_page === 1} className="px-3 py-1.5 border rounded-lg disabled:opacity-50 bg-white">Précédent</button>
                  <button className="px-3 py-1.5 bg-[#B08D57] text-white rounded-lg shadow-sm">{factures.current_page}</button>
                  <button disabled={factures.current_page === factures.last_page} className="px-3 py-1.5 border rounded-lg disabled:opacity-50 bg-white">Suivant</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Cartes */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFactures.map(f => (
            <div key={f.id} className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div><h3 className="font-semibold">{f.reference}</h3><p className="text-xs text-gray-400">{f.created_at}</p></div>
                <span className={`px-3 py-1 text-xs rounded-full ${getStatutColor(f.statut)}`}>{f.statut_label}</span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">Client: {f.client?.nom || '-'}</p>
                <p className="text-sm text-gray-600">Dossier: {f.dossier?.reference || '-'}</p>
                <p className="text-sm font-medium text-[#B08D57]">{f.montant_ttc_formatted}</p>
              </div>
              <div className="flex justify-between pt-4 border-t">
                <div className="text-xs text-gray-400">Échéance: {f.date_echeance}</div>
                <Link href={`/crm/factures/${f.id}`} className="text-[#B08D57] text-sm">Détails →</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredFactures.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center"><FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture</h3><Link href="/crm/factures/create" className="px-4 py-2 bg-[#B08D57] text-white rounded-xl">Créer une facture</Link></div>
      )}
    </CrmLayout>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white rounded-xl border p-5 shadow-sm">
    <div className="flex justify-between"><div><p className="text-xs text-gray-400">{title}</p><p className="text-2xl font-light mt-1">{value}</p></div><div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center`}>{icon}</div></div>
  </div>
);

export default FacturesIndex;
