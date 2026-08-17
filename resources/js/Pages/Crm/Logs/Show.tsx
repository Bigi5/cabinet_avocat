import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { ArrowLeft, ScrollText } from 'lucide-react';

interface Log {
  id: number;
  user: { id: number; nom_complet: string; role_label: string } | null;
  action: string;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface LogShowProps {
  auth: { user: unknown };
  log: Log;
}

const LogShow = ({ log }: LogShowProps) => (
  <CrmLayout title="Détail du journal">
    <Head title="Détail du journal" />

    <Link href={route('crm.logs.index')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#B08D57] hover:text-[#9c7a4a]">
      <ArrowLeft className="h-4 w-4" /> Retour aux logs
    </Link>

    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
        <ScrollText className="h-6 w-6 text-[#B08D57]" />
        <div><h1 className="text-xl font-semibold text-gray-900">{log.action}</h1><p className="text-sm text-gray-500">{log.created_at}</p></div>
      </div>
      <dl className="divide-y divide-gray-100">
        <div className="px-6 py-4"><dt className="text-sm text-gray-500">Description</dt><dd className="mt-1 text-gray-900">{log.description}</dd></div>
        <div className="px-6 py-4"><dt className="text-sm text-gray-500">Utilisateur</dt><dd className="mt-1 text-gray-900">{log.user?.nom_complet ?? 'Utilisateur inconnu'}{log.user?.role_label ? ` (${log.user.role_label})` : ''}</dd></div>
        <div className="px-6 py-4"><dt className="text-sm text-gray-500">Adresse IP</dt><dd className="mt-1 text-gray-900">{log.ip_address ?? 'Non renseignée'}</dd></div>
        <div className="px-6 py-4"><dt className="text-sm text-gray-500">Navigateur</dt><dd className="mt-1 break-all text-gray-900">{log.user_agent ?? 'Non renseigné'}</dd></div>
      </dl>
    </div>
  </CrmLayout>
);

export default LogShow;
