// resources/js/Pages/Crm/Actes/Show.tsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Folder, 
  User, 
  Calendar, 
  Clock,
  Download,
  Printer
} from 'lucide-react';

interface Acte {
  id: number;
  type_acte: string;
  type_acte_label: string;
  description: string | null;
  horodatage: string;
  date: string;
  heure: string;
  dossier: {
    id: number;
    reference: string;
    type_mission: string;
    client: string;
  } | null;
  user: {
    id: number;
    nom: string;
    role: string;
  } | null;
  created_at: string;
}

interface ShowProps {
  auth: {
    user: any;
  };
  acte: Acte;
}

const Show = ({ auth, acte }: ShowProps) => {
  return (
    <CrmLayout title={`Acte - ${acte.type_acte_label}`}>
      <Head title={`Acte - ${acte.type_acte_label}`} />

      {/* En-tête avec navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/crm/actes" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">{acte.type_acte_label}</h1>
              <p className="text-gray-500 font-light">Créé le {acte.created_at}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </button>
            <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </button>
            <Link
              href={`/crm/actes/${acte.id}/edit`}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet acte ?')) {
                  router.delete(`/crm/actes/${acte.id}`, {
                    preserveScroll: true,
                    onSuccess: () => router.visit('/crm/actes'),
                  });
                }
              }}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Informations */}
        <div className="space-y-6">
          {/* Carte acte */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#B08D57]/5 flex items-center justify-center">
                <FileText className="h-8 w-8 text-[#B08D57]" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">{acte.type_acte_label}</h2>
                <p className="text-sm text-gray-500">ID: {acte.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Folder className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Dossier</p>
                  {acte.dossier ? (
                    <Link href={`/crm/dossiers/${acte.dossier.id}`} className="text-sm font-medium text-[#B08D57] hover:underline">
                      {acte.dossier.reference} - {acte.dossier.client}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">Non associé</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Créé par</p>
                  <p className="text-sm font-medium text-gray-900">{acte.user?.nom || 'Inconnu'}</p>
                  {acte.user && (
                    <p className="text-xs text-gray-400">{acte.user.role}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">{acte.date}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Heure</p>
                  <p className="text-sm font-medium text-gray-900">{acte.heure}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Type de dossier associé */}
          {acte.dossier && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dossier associé</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Type :</span>{' '}
                  <span className="font-medium text-gray-900">{acte.dossier.type_mission}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Client :</span>{' '}
                  <span className="font-medium text-gray-900">{acte.dossier.client}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Colonne de droite - Contenu */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenu de l'acte</h3>
            
            {acte.description ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{acte.description}</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune description fournie</p>
              </div>
            )}

            {/* Métadonnées */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Horodatage: {acte.horodatage}
              </p>
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  );
};

export default Show;