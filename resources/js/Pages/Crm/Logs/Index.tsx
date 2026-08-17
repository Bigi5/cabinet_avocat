import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { Eye, ScrollText } from 'lucide-react';

interface Log {
  id: number;
  user: { id: number; nom_complet: string; role_label: string } | null;
  action: string;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface LogsProps {
  auth: { user: unknown };
  logs: { data: Log[]; current_page: number; last_page: number; total: number };
  filters: { search: string; action: string; user_id: string; date_debut: string; date_fin: string };
  options: {
    actions: Array<{ value: string; label: string }>;
    users: Array<{ value: number; label: string }>;
  };
}

const LogsIndex = ({ logs, filters, options }: LogsProps) => (
  <CrmLayout title="Journal d'activité">
    <Head title="Journal d'activité" />

    <div className="mb-8">
      <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Journal d'activité</h1>
      <p className="text-gray-500 font-light">Consultez les actions effectuées dans le cabinet.</p>
    </div>

    <div className="mb-6 grid gap-4 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-4">
      <div><p className="text-sm text-gray-500">Recherche</p><p className="font-medium">{filters.search || 'Aucune'}</p></div>
      <div><p className="text-sm text-gray-500">Action</p><p className="font-medium">{options.actions.find((action) => action.value === filters.action)?.label ?? 'Toutes'}</p></div>
      <div><p className="text-sm text-gray-500">Utilisateur</p><p className="font-medium">{options.users.find((user) => String(user.value) === String(filters.user_id))?.label ?? 'Tous'}</p></div>
      <div><p className="text-sm text-gray-500">Période</p><p className="font-medium">{filters.date_debut || 'Début'} — {filters.date_fin || 'Aujourd’hui'}</p></div>
    </div>

    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900"><ScrollText className="h-5 w-5 text-[#B08D57]" /> Activités</div>
        <span className="text-sm text-gray-500">{logs.total} résultat(s)</span>
      </div>
      {logs.data.length === 0 ? (
        <p className="p-10 text-center text-gray-500">Aucun journal ne correspond aux filtres sélectionnés.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {logs.data.map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{log.description}</p>
                <p className="mt-1 text-sm text-gray-500">{log.action} · {log.user?.nom_complet ?? 'Utilisateur inconnu'} · {log.created_at}</p>
              </div>
              <Link href={route('crm.logs.show', log.id)} className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#B08D57] hover:text-[#9c7a4a]">
                <Eye className="h-4 w-4" /> Détails
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  </CrmLayout>
);

export default LogsIndex;
