// resources/js/Pages/Crm/Dossiers/Show.tsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import ChangeStatutModal from '@/Components/crm/Dossiers/ChangeStatutModal';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Folder, 
  User, 
  Building, 
  FileText, 
  Clock, 
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Download,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';

interface Dossier {
  id: number;
  reference: string;
  type_mission: string;
  type_mission_label: string;
  date_ouverture: string;
  client: {
    id: number;
    nom: string;
    email: string;
    telephone: string;
  } | null;
  responsable: {
    id: number;
    nom: string;
    role: string;
  } | null;
  statut: string;
  statut_label: string;
  statut_color: string;
  montant: number | null;
  description: string | null;
  progression: number;
  collaborateurs: Array<{
    id: number;
    nom: string;
    prenom: string;
    role: string;
    role_label: string;
  }>;
  total_actes: number;
  total_documents: number;
  total_echeances: number;
  created_at: string;
  updated_at: string;
}

interface Acte {
  id: number;
  type_acte: string;
  type_acte_label: string;
  description: string;
  horodatage: string;
  user: string | null;
}

interface Document {
  id: number;
  nom_fichier: string;
  type_document: string;
  extension: string;
  taille: string;
  icone: string;
  couleur: string;
  date: string;
  user: string | null;
}

interface Echeance {
  id: number;
  titre: string;
  description: string;
  date: string;
  heure: string;
  criticite: string;
  criticite_label: string;
  criticite_color: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  est_urgent: boolean;
  est_en_retard: boolean;
}

interface ShowProps {
  auth: {
    user: any;
  };
  dossier: Dossier;
  actes: Acte[];
  documents: Document[];
  echeances: Echeance[];
}

const Show = ({ auth, dossier, actes, documents, echeances }: ShowProps) => {
  // ✅ Étape 8: État pour le modal de changement de statut
  const [showStatutModal, setShowStatutModal] = useState(false);

  // ✅ Gestion de la suppression
  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      router.delete(`/crm/dossiers/${dossier.id}`, {
        preserveScroll: true,
        onSuccess: () => router.visit('/crm/dossiers'),
      });
    }
  };

  // ✅ Gestion du succès du changement de statut
  const handleStatutChangeSuccess = () => {
    router.reload({ only: ['dossier'] });
  };

  return (
    <CrmLayout title={`Dossier ${dossier.reference}`}>
      <Head title={`Dossier ${dossier.reference}`} />

      {/* En-tête avec navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/crm/dossiers" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Dossier {dossier.reference}</h1>
              <p className="text-gray-500 font-light">Créé le {dossier.created_at}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {/* ✅ Étape 10: Bouton Changer le statut */}
            <button
              onClick={() => setShowStatutModal(true)}
              className="px-4 py-2 border border-blue-200 text-blue-700 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Changer le statut
            </button>
            
            <Link
              href={`/crm/dossiers/${dossier.id}/edit`}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Colonne de gauche */}
        <div className="space-y-6">
          {/* Carte dossier */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#B08D57]/5 flex items-center justify-center">
                <Folder className="h-8 w-8 text-[#B08D57]" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">{dossier.type_mission_label}</h2>
                <p className="text-sm text-gray-500">Réf: {dossier.reference}</p>
                <div className="mt-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${dossier.statut_color}`}>
                    {dossier.statut_label}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  {dossier.client ? (
                    <Link href={`/crm/clients/${dossier.client.id}`} className="text-sm font-medium text-[#B08D57] hover:underline">
                      {dossier.client.nom}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">Non assigné</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Responsable</p>
                  <p className="text-sm font-medium text-gray-900">{dossier.responsable?.nom || 'Non assigné'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date d'ouverture</p>
                  <p className="text-sm font-medium text-gray-900">{dossier.date_ouverture}</p>
                </div>
              </div>

              {dossier.montant && (
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Montant</p>
                    <p className="text-sm font-medium text-gray-900">{dossier.montant.toLocaleString()} FCFA</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2">Progression</p>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-[#B08D57] h-2 rounded-full" 
                      style={{ width: `${dossier.progression}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{dossier.progression}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {dossier.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{dossier.description}</p>
            </div>
          )}

          {/* Collaborateurs */}
          {dossier.collaborateurs && dossier.collaborateurs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaborateurs</h3>
              <div className="space-y-3">
                {dossier.collaborateurs.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{collab.nom} {collab.prenom}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {collab.role_label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne de droite - Statistiques et actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <FileText className="h-6 w-6 text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dossier.total_actes}</p>
              <p className="text-xs text-gray-500">Actes</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <Folder className="h-6 w-6 text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dossier.total_documents}</p>
              <p className="text-xs text-gray-500">Documents</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <Clock className="h-6 w-6 text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dossier.total_echeances}</p>
              <p className="text-xs text-gray-500">Échéances</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {echeances.filter(e => e.est_urgent || e.est_en_retard).length}
              </p>
              <p className="text-xs text-gray-500">Alertes</p>
            </div>
          </div>

          {/* Onglets (simplifiés pour l'exemple) */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button className="px-6 py-3 text-sm font-medium text-[#B08D57] border-b-2 border-[#B08D57]">
                  Actes ({actes.length})
                </button>
                <button className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Documents ({documents.length})
                </button>
                <button className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Échéances ({echeances.length})
                </button>
              </nav>
            </div>

            {/* Liste des actes */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Actes récents</h3>
                <Link
                  href={`/crm/actes/create?dossier_id=${dossier.id}`}
                  className="text-sm text-[#B08D57] hover:text-[#9c7a4a] font-medium flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nouvel acte
                </Link>
              </div>

              {actes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Aucun acte pour ce dossier</p>
              ) : (
                <div className="space-y-3">
                  {actes.slice(0, 5).map((acte) => (
                    <div key={acte.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{acte.type_acte_label}</p>
                          <p className="text-xs text-gray-500">{acte.horodatage} • {acte.user}</p>
                        </div>
                      </div>
                      <Link href={`/crm/actes/${acte.id}`} className="text-[#B08D57] hover:text-[#9c7a4a]">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href={`/crm/actes/create?dossier_id=${dossier.id}`}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <FileText className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Nouvel acte</span>
              </Link>
              
              <Link
                href={`/crm/documents/create?dossier_id=${dossier.id}`}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <Folder className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Ajouter document</span>
              </Link>
              
              <Link
                href={`/crm/echeances/create?dossier_id=${dossier.id}`}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <Clock className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Nouvelle échéance</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Étape 12: Modal de changement de statut */}
      <ChangeStatutModal
        isOpen={showStatutModal}
        onClose={() => setShowStatutModal(false)}
        dossierId={dossier.id}
        dossierReference={dossier.reference}
        currentStatut={dossier.statut}
        onSuccess={handleStatutChangeSuccess}
      />
    </CrmLayout>
  );
};

export default Show;
