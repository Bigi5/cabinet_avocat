import React from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { FolderOpen, FileText, Calendar, MessageSquare, User, Mail, Phone } from 'lucide-react';

interface ClientDashboardProps {
  client: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
  stats: {
    en_cours: number;
    resolus: number;
    documents: number;
    rendez_vous: number;
    total_dossiers: number;
  };
  ongoingCases?: Array<Record<string, unknown>>;
  resolvedCases?: Array<Record<string, unknown>>;
  prochainRdv?: string | null;
}

const ClientDashboard = ({ client, stats, ongoingCases = [], resolvedCases = [], prochainRdv }: ClientDashboardProps) => {
  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-light text-gray-900">
          Bonjour, <span className="font-semibold">{client.prenom} {client.nom}</span>
        </h1>
        <p className="text-gray-500 mt-1">Bienvenue dans votre espace client</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Dossiers en cours" value={stats.en_cours} icon={<FolderOpen className="h-5 w-5 text-[#B08D57]" />} />
        <StatCard title="Documents" value={stats.documents} icon={<FileText className="h-5 w-5 text-[#B08D57]" />} />
        <StatCard title="Rendez-vous" value={stats.rendez_vous} icon={<Calendar className="h-5 w-5 text-[#B08D57]" />} />
        <StatCard title="Messages" value="3" icon={<MessageSquare className="h-5 w-5 text-[#B08D57]" />} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-[#B08D57]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-[#B08D57]" />
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Votre espace est prêt</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
          Nous préparons vos dossiers. Vous recevrez une notification dès qu'ils seront disponibles.
        </p>
        {prochainRdv ? (
          <p className="text-sm text-gray-600 mb-4">Prochain rendez-vous : {prochainRdv}</p>
        ) : null}
        <div className="flex items-center justify-center space-x-3">
          <button className="px-4 py-2 bg-[#B08D57] text-white text-sm rounded-lg hover:bg-[#9c7a4a]">
            Contacter mon avocat
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Mes coordonnées</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 text-gray-400 mr-3" />
            <span className="text-gray-600">{client.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 text-gray-400 mr-3" />
            <span className="text-gray-600">{client.telephone}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Dossiers en cours</h3>
          {ongoingCases.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun dossier en cours.</p>
          ) : (
            <ul className="space-y-2 text-sm text-gray-600">
              {ongoingCases.map((caseItem, index) => (
                <li key={index} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                  {String(caseItem?.reference ?? caseItem?.nom ?? 'Dossier')} 
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Dossiers résolus</h3>
          {resolvedCases.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun dossier résolu.</p>
          ) : (
            <ul className="space-y-2 text-sm text-gray-600">
              {resolvedCases.map((caseItem, index) => (
                <li key={index} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                  {String(caseItem?.reference ?? caseItem?.nom ?? 'Dossier')}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: number | string; icon: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="h-8 w-8 rounded-full bg-[#B08D57]/10 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-lg font-semibold text-gray-900">{value}</span>
    </div>
    <p className="text-xs text-gray-500">{title}</p>
  </div>
);

export default ClientDashboard;
