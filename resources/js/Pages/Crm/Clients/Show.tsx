// resources/js/Pages/Crm/Clients/Show.tsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Building, 
  FileText,
  Folder,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Client {
  id: number;
  reference: string;
  type_client: string;
  type_client_label: string;
  nom_complet: string;
  prenom: string | null;
  nom: string | null;
  raison_sociale: string | null;
  email: string;
  telephone: string | null;
  adresse: string | null;
  statut: string;
  statut_label: string;
  statut_color: string;
  total_dossiers: number;
  dossiers_en_cours: number;
  created_at: string;
  updated_at: string;
  observations: string | null; // ✅ AJOUTÉ
}

interface Dossier {
  id: number;
  reference: string;
  type_mission: string;
  date_ouverture: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  progression: number;
}

interface ShowProps {
  auth: {
    user: AuthUser;
  };
  client: Client;
  dossiers: Dossier[];
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const Show = ({ auth, client, dossiers }: ShowProps) => {
  // Gestion de la suppression
  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      router.delete(`/crm/clients/${client.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          router.visit('/crm/clients');
        },
        onError: (errors) => {
          console.error('Erreur lors de la suppression:', errors);
          alert('Impossible de supprimer ce client.');
        },
      });
    }
  };

  // Calcul du taux de réussite (clôturés / total)
  const tauxReussite = client.total_dossiers > 0 
    ? Math.round(((client.total_dossiers - client.dossiers_en_cours) / client.total_dossiers) * 100) 
    : 0;

  return (
    <CrmLayout title={`Client - ${client.nom_complet}`}>
      <Head title={`Client - ${client.nom_complet}`} />

      {/* En-tête avec navigation */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/crm/clients" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">{client.nom_complet}</h1>
              <p className="text-gray-500 font-light">Client depuis le {client.created_at}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/crm/clients/${client.id}/edit`}
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

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Informations client */}
        <div className="space-y-6">
          {/* Carte d'identité */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#B08D57]/5 flex items-center justify-center">
                {client.type_client === 'personne_physique' ? (
                  <User className="h-8 w-8 text-[#B08D57]" />
                ) : (
                  <Building className="h-8 w-8 text-[#B08D57]" />
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">{client.nom_complet}</h2>
                <p className="text-sm text-gray-500">{client.reference}</p>
                <div className="mt-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${client.statut_color}`}>
                    {client.statut_label}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{client.email || '-'}</p>
                </div>
              </div>

              {client.telephone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium text-gray-900">{client.telephone}</p>
                  </div>
                </div>
              )}

              {client.adresse && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="text-sm font-medium text-gray-900">{client.adresse}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Folder className="h-6 w-6 text-[#B08D57] mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{client.total_dossiers}</p>
                <p className="text-xs text-gray-500">Dossiers totaux</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Briefcase className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{client.dossiers_en_cours}</p>
                <p className="text-xs text-gray-500">En cours</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {client.total_dossiers > 0 ? client.total_dossiers - client.dossiers_en_cours : 0}
                </p>
                <p className="text-xs text-gray-500">Clôturés</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{tauxReussite}%</p>
                <p className="text-xs text-gray-500">Taux réussite</p>
              </div>
            </div>
          </div>

          {/* Observations - ✅ AJOUTÉ */}
          {client.observations && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Observations
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {client.observations}
              </p>
            </div>
          )}
        </div>

        {/* Colonne de droite - Dossiers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#B08D57]/5 to-transparent">
              <h3 className="text-lg font-semibold text-gray-900">Dossiers du client</h3>
            </div>

            {dossiers.length === 0 ? (
              <div className="p-12 text-center">
                <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun dossier</h4>
                <p className="text-gray-500 mb-6">Ce client n'a pas encore de dossier.</p>
                <Link
                  href={`/crm/dossiers/create?client_id=${client.id}`}
                  className="inline-flex items-center px-4 py-2 bg-[#B08D57] text-white rounded-lg font-medium hover:bg-[#9c7a4a] transition-colors"
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Créer un dossier
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dossiers.map((dossier) => {
                  // Sécuriser la progression
                  const progression = Math.max(0, Math.min(100, dossier.progression || 0));
                  
                  return (
                    <div key={dossier.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-[#B08D57]/10 flex items-center justify-center">
                            <Folder className="h-5 w-5 text-[#B08D57]" />
                          </div>
                          <div className="ml-3">
                            <Link href={`/crm/dossiers/${dossier.id}`} className="font-medium text-gray-900 hover:text-[#B08D57]">
                              {dossier.reference}
                            </Link>
                            <p className="text-sm text-gray-600">{dossier.type_mission}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${dossier.statut_color}`}>
                          {dossier.statut_label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Ouverture</p>
                          <p className="font-medium text-gray-700">{dossier.date_ouverture}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Progression</p>
                          <div className="flex items-center mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-[#B08D57] h-2 rounded-full transition-all" 
                                style={{ width: `${progression}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{progression}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-3">
                        <Link
                          href={`/crm/dossiers/${dossier.id}`}
                          className="text-xs text-[#B08D57] hover:text-[#9c7a4a] font-medium"
                        >
                          Voir détails →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href={`/crm/dossiers/create?client_id=${client.id}`}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <Folder className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Nouveau dossier</span>
              </Link>
              
              <Link
                href={`/crm/actes/create?client_id=${client.id}`}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <FileText className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Nouvel acte</span>
              </Link>
              
              <Link
                href={`/crm/echeances/create?client_id=${client.id}`}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <Clock className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Nouvelle échéance</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  );
};

export default Show;