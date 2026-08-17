// resources/js/Pages/Crm/Utilisateurs/Show.tsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield,
  Briefcase,
  Clock,
  FileText,
  Folder,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Star,
  Activity,
  Key,
  Power
} from 'lucide-react';

interface Utilisateur {
  id: number;
  reference: string;
  email: string;
  nom: string;
  prenom: string;
  nom_complet: string;
  initiales: string;
  role: string;
  role_label: string;
  role_color: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  telephone: string | null;
  total_dossiers: number;
  dossiers_en_cours: number;
  dossiers_collaboration: number;
  total_actes: number;
  total_documents: number;
  total_echeances: number;
  echeances_urgentes: number;
  actes_ce_mois: number;
  documents_ce_mois: number;
  created_at: string;
  updated_at: string;
}

interface Dossier {
  id: number;
  reference: string;
  type_mission: string;
  client: string;
  statut: string;
  statut_color: string;
  progression: number;
  date_ouverture: string;
}

interface DossierCollaboration {
  id: number;
  reference: string;
  type_mission: string;
  client: string;
  role: string;
  role_label: string;
  statut: string;
  date_ouverture: string;
}

interface Acte {
  id: number;
  type_acte: string;
  description: string;
  dossier: string | null;
  horodatage: string;
}

interface Document {
  id: number;
  nom_fichier: string;
  type_document: string;
  dossier: string | null;
  taille: string;
  date: string;
}

interface Echeance {
  id: number;
  titre: string;
  date: string;
  criticite: string;
  criticite_color: string;
  statut: string;
  statut_color: string;
  est_urgent: boolean;
  est_en_retard: boolean;
}

interface ShowProps {
  auth: {
    user: any;
  };
  utilisateur: Utilisateur;
  dossiers_responsable: Dossier[];
  dossiers_collaboration: DossierCollaboration[];
  actes_recents: Acte[];
  documents_recents: Document[];
  echeances: Echeance[];
}

const Show = ({ auth, utilisateur, dossiers_responsable, dossiers_collaboration, actes_recents, documents_recents, echeances }: ShowProps) => {
  return (
    <CrmLayout title={`Utilisateur - ${utilisateur.nom_complet}`}>
      <Head title={`Utilisateur - ${utilisateur.nom_complet}`} />

      {/* En-tête avec navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/crm/utilisateurs" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">{utilisateur.nom_complet}</h1>
              <p className="text-gray-500 font-light">Utilisateur depuis le {utilisateur.created_at}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/crm/utilisateurs/${utilisateur.id}/edit`}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                  router.delete(`/crm/utilisateurs/${utilisateur.id}`, {
                    preserveScroll: true,
                    onSuccess: () => router.visit('/crm/utilisateurs'),
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

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Informations utilisateur */}
        <div className="space-y-6">
          {/* Carte d'identité */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#B08D57]/5 flex items-center justify-center">
                <span className="text-[#B08D57] font-bold text-2xl">{utilisateur.initiales}</span>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">{utilisateur.nom_complet}</h2>
                <p className="text-sm text-gray-500">{utilisateur.reference}</p>
                <div className="mt-2 flex space-x-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${utilisateur.role_color}`}>
                    {utilisateur.role_label}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${utilisateur.statut_color}`}>
                    {utilisateur.statut_label}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{utilisateur.email}</p>
                </div>
              </div>

              {utilisateur.telephone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium text-gray-900">{utilisateur.telephone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Membre depuis</p>
                  <p className="text-sm font-medium text-gray-900">{utilisateur.created_at}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Briefcase className="h-5 w-5 text-[#B08D57] mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{utilisateur.total_dossiers}</p>
                <p className="text-xs text-gray-500">Dossiers</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Activity className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{utilisateur.dossiers_en_cours}</p>
                <p className="text-xs text-gray-500">En cours</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{utilisateur.echeances_urgentes}</p>
                <p className="text-xs text-gray-500">Urgentes</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FileText className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{utilisateur.total_actes}</p>
                <p className="text-xs text-gray-500">Actes</p>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (confirm('Réinitialiser le mot de passe ?')) {
                    // Logique de réinitialisation
                  }
                }}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Key className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Réinitialiser mot de passe</span>
                </div>
              </button>
              
              {utilisateur.statut === 'actif' ? (
                <button
                  onClick={() => {
                    if (confirm('Désactiver cet utilisateur ?')) {
                      // Logique de désactivation
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Power className="h-4 w-4 text-orange-400 mr-3" />
                    <span className="text-sm font-medium text-orange-600">Désactiver le compte</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (confirm('Activer cet utilisateur ?')) {
                      // Logique d'activation
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Power className="h-4 w-4 text-green-400 mr-3" />
                    <span className="text-sm font-medium text-green-600">Activer le compte</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Colonne de droite - Activité */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dossiers en tant que responsable */}
          {dossiers_responsable.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#B08D57]/5 to-transparent">
                <h3 className="text-lg font-semibold text-gray-900">Dossiers en tant que responsable</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {dossiers_responsable.map((dossier) => (
                  <div key={dossier.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Folder className="h-5 w-5 text-[#B08D57] mr-3" />
                        <div>
                          <Link href={`/crm/dossiers/${dossier.id}`} className="font-medium text-gray-900 hover:text-[#B08D57]">
                            {dossier.reference}
                          </Link>
                          <p className="text-sm text-gray-600">{dossier.client}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${dossier.statut_color}`}>
                        {dossier.statut}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500">{dossier.type_mission}</span>
                      <span className="text-gray-400">Ouvert le {dossier.date_ouverture}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dossiers en collaboration */}
          {dossiers_collaboration.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
                <h3 className="text-lg font-semibold text-gray-900">Dossiers en collaboration</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {dossiers_collaboration.map((dossier) => (
                  <div key={dossier.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Folder className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <Link href={`/crm/dossiers/${dossier.id}`} className="font-medium text-gray-900 hover:text-[#B08D57]">
                            {dossier.reference}
                          </Link>
                          <p className="text-sm text-gray-600">{dossier.client}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {dossier.role_label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500">{dossier.type_mission}</span>
                      <span className="text-gray-400">Ouvert le {dossier.date_ouverture}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Échéances */}
          {echeances.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Échéances à venir</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {echeances.slice(0, 5).map((echeance) => (
                  <div key={echeance.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link href={`/crm/echeances/${echeance.id}`} className="font-medium text-gray-900 hover:text-[#B08D57]">
                          {echeance.titre}
                        </Link>
                        <p className="text-sm text-gray-600">{echeance.date}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${echeance.criticite_color}`}>
                          {echeance.criticite}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${echeance.statut_color}`}>
                          {echeance.statut}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </CrmLayout>
  );
};

export default Show;