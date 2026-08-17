// resources/js/Pages/Crm/Echeances/Show.tsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Clock, 
  Folder, 
  User, 
  Calendar, 
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Smartphone,
  MessageSquare,
  RefreshCw
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

interface Echeance {
  id: number;
  titre: string;
  description: string | null;
  date_echeance: string;
  date: string;
  heure: string;
  date_time: string;
  criticite: string;
  criticite_label: string;
  criticite_color: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  est_urgent: boolean;
  est_en_retard: boolean;
  est_aujourd_hui: boolean;
  est_demain: boolean;
  notifications: string[];
  notification_email: boolean;
  notification_sms: boolean;
  notification_whatsapp: boolean;
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
  updated_at: string;
}

interface ShowProps {
  auth: {
    user: AuthUser;
  };
  echeance: Echeance;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const Show = ({ auth, echeance }: ShowProps) => {
  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = () => {
    switch(echeance.statut) {
      case 'a_faire': return <Clock className="h-5 w-5" />;
      case 'en_cours': return <RefreshCw className="h-5 w-5" />;
      case 'termine': return <CheckCircle className="h-5 w-5" />;
      case 'annule': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  // Gestion de la suppression
  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette échéance ?')) {
      router.delete(`/crm/echeances/${echeance.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          router.visit('/crm/echeances');
        },
        onError: () => {
          alert('Impossible de supprimer cette échéance.');
        },
      });
    }
  };

  const handleSendReminder = () => {
    router.post(
      `/crm/echeances/${echeance.id}/reminder`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          alert('Le rappel a été envoyé avec succès.');
          router.reload();
        },
        onError: () => {
          alert('Impossible d\'envoyer le rappel. Veuillez réessayer.');
        },
      }
    );
  };

  // Gestion du statut "En cours"
  const handleMarquerEnCours = () => {
    router.post(`/crm/echeances/${echeance.id}/statut`, {
      statut: 'en_cours'
    }, {
      preserveScroll: true,
      onSuccess: () => {
        router.reload();
      },
      onError: () => {
        alert('Impossible de changer le statut.');
      }
    });
  };

  // Gestion du statut "Terminé"
  const handleMarquerTermine = () => {
    router.post(`/crm/echeances/${echeance.id}/statut`, {
      statut: 'termine'
    }, {
      preserveScroll: true,
      onSuccess: () => {
        router.reload();
      },
      onError: () => {
        alert('Impossible de changer le statut.');
      }
    });
  };

  // Gestion du report
  const handleReporter = () => {
    const nouvelleDate = prompt(
      "Nouvelle date de l'échéance (AAAA-MM-JJ HH:MM)",
      echeance.date_echeance.replace("T", " ").substring(0, 16)
    );

    if (!nouvelleDate) return;

    router.post(`/crm/echeances/${echeance.id}/report`, {
      date_echeance: nouvelleDate,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        router.reload();
      },
      onError: () => {
        alert('Impossible de reporter cette échéance.');
      }
    });
  };

  return (
    <CrmLayout title={`Échéance - ${echeance.titre}`}>
      <Head title={`Échéance - ${echeance.titre}`} />

      {/* En-tête avec navigation */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/crm/echeances" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">{echeance.titre}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${echeance.statut_color} flex items-center`}>
                  {getStatusIcon()}
                  <span className="ml-1">{echeance.statut_label}</span>
                </span>
                {echeance.est_urgent && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Urgent
                  </span>
                )}
                {echeance.est_en_retard && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    En retard
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/crm/echeances/${echeance.id}/edit`}
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

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Informations */}
        <div className="space-y-6">
          {/* Carte échéance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#B08D57]/5 flex items-center justify-center">
                <Clock className="h-8 w-8 text-[#B08D57]" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">{echeance.titre}</h2>
                <p className="text-sm text-gray-500">ID: {echeance.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date et heure</p>
                  <p className="text-sm font-medium text-gray-900">
                    {echeance.date} à {echeance.heure}
                    {echeance.est_aujourd_hui && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Aujourd'hui</span>
                    )}
                    {echeance.est_demain && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Demain</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className={`h-5 w-5 rounded-full ${echeance.criticite_color} flex items-center justify-center mr-3`}>
                  <AlertTriangle className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priorité</p>
                  <p className="text-sm font-medium text-gray-900">{echeance.criticite_label}</p>
                </div>
              </div>

              {echeance.dossier && (
                <div className="flex items-center">
                  <Folder className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Dossier</p>
                    <Link 
                      href={`/crm/dossiers/${echeance.dossier.id}`}
                      className="text-sm font-medium text-[#B08D57] hover:underline"
                    >
                      {echeance.dossier.reference} - {echeance.dossier.client}
                    </Link>
                  </div>
                </div>
              )}

              {echeance.user && (
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Responsable</p>
                    <p className="text-sm font-medium text-gray-900">{echeance.user.nom}</p>
                    <p className="text-xs text-gray-400">{echeance.user.role}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-[#B08D57]" />
              Notifications
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Email</span>
                </div>
                {echeance.notification_email ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Activé</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Désactivé</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">SMS</span>
                </div>
                {echeance.notification_sms ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Activé</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Désactivé</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">WhatsApp</span>
                </div>
                {echeance.notification_whatsapp ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Activé</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Désactivé</span>
                )}
              </div>
            </div>

            <button 
              onClick={handleSendReminder}
              className="mt-4 w-full py-2 border border-[#B08D57] text-[#B08D57] rounded-lg font-medium hover:bg-[#B08D57] hover:text-white transition-colors flex items-center justify-center"
            >
              <Bell className="h-4 w-4 mr-2" />
              Envoyer un rappel
            </button>
          </div>
        </div>

        {/* Colonne de droite - Description et actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            
            {echeance.description ? (
              <p className="text-gray-700 whitespace-pre-line">{echeance.description}</p>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune description fournie</p>
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleMarquerEnCours}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <RefreshCw className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Marquer en cours</span>
              </button>
              
              <button
                onClick={handleMarquerTermine}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <CheckCircle className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Marquer terminé</span>
              </button>
              
              <button
                onClick={handleReporter}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#B08D57] hover:bg-[#B08D57]/5 transition-colors"
              >
                <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Reporter</span>
              </button>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métadonnées</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">ID</p>
                <p className="font-medium text-gray-900">{echeance.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Créé le</p>
                <p className="font-medium text-gray-900">{echeance.created_at}</p>
              </div>
              <div>
                <p className="text-gray-500">Dernière modification</p>
                <p className="font-medium text-gray-900">{echeance.updated_at}</p>
              </div>
              <div>
                <p className="text-gray-500">Date échéance</p>
                <p className="font-medium text-gray-900">{echeance.date_time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  );
};

export default Show;