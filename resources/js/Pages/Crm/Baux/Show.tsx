// resources/js/Pages/Crm/Baux/Show.tsx
import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Building,
  Home,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Printer,
  Mail,
  Phone,
  Plus,
  Eye
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

interface Bail {
  id: number;
  reference: string;
  locataire: {
    id: number;
    nom: string;
    email: string;
    telephone: string;
  } | null;
  bailleur: {
    id: number;
    nom: string;
    email: string;
    telephone: string;
  } | null;
  dossier: {
    id: number;
    reference: string;
  } | null;
  montant_loyer: number;
  montant_loyer_formatted: string;
  frequence: string;
  frequence_label: string;
  date_debut: string;
  date_fin: string | null;
  jour_echeance: number;
  caution: number | null;
  caution_formatted: string | null;
  description: string | null;
  adresse_bien: string | null;
  reference_cadastrale: string | null;
  statut: string;
  statut_label: string;
  duree: string;
  total_impaye: number;
  total_impaye_formatted: string;
  created_at: string;
}

interface Paiement {
  id: number;
  montant: number;
  montant_formatted: string;
  date_paiement: string;
  mois_concerne: string;
  mode_paiement: string;
  mode_paiement_label: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  reference_cheque: string | null;
  cheque_encaisse: boolean;
  observations: string | null;
  quittance?: {
    id: number;
    numero: string;
  } | null;
}

interface Echeance {
  id: number;
  date_echeance: string;
  montant: number;
  montant_formatted: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  est_en_retard: boolean;
}

interface ShowProps {
  auth: {
    user: AuthUser;
  };
  bail: Bail;
  paiements: Paiement[];
  echeances: Echeance[];
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const Show = ({ auth, bail, paiements, echeances }: ShowProps) => {
  const [activeTab, setActiveTab] = useState<'echeances' | 'paiements'>('echeances');
  const [showPaiementForm, setShowPaiementForm] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    montant: bail.montant_loyer,
    date_paiement: new Date().toISOString().slice(0, 10),
    mois_concerne: new Date().toISOString().slice(0, 7),
    mode_paiement: 'especes',
    reference_cheque: '',
    observations: '',
  });

  // ============================================
  // GESTION DES ACTIONS
  // ============================================

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bail ?')) {
      router.delete(`/crm/baux/${bail.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          router.visit('/crm/baux');
        },
        onError: () => {
          alert('Impossible de supprimer ce bail.');
        },
      });
    }
  };

  const handlePaiement = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/crm/baux/${bail.id}/paiements`, {
      preserveScroll: true,
      onSuccess: () => {
        setShowPaiementForm(false);
        reset();
      },
      onError: (errors) => {
        console.error('Erreurs de validation:', errors);
      },
    });
  };

  const handleGenerateEcheances = () => {
    if (confirm('Générer toutes les échéances à venir pour ce bail ?')) {
      post(`/crm/baux/${bail.id}/generate-echeances`, {
        preserveScroll: true,
        onSuccess: () => {
          router.reload();
        },
        onError: () => {
          alert('Impossible de générer les échéances.');
        },
      });
    }
  };

  const handlePrint = () => {
    window.open(
      `/crm/baux/${bail.id}/pdf`,
      '_blank'
    );
  };

  const handleSendReminder = () => {
    if (confirm('Envoyer un rappel de paiement au locataire ?')) {
      router.post(`/crm/baux/${bail.id}/reminder`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          alert('Rappel envoyé avec succès.');
        },
        onError: () => {
          alert('Impossible d\'envoyer le rappel.');
        },
      });
    }
  };

  const handleResilier = () => {
    if (confirm('Êtes-vous sûr de vouloir résilier ce bail ?')) {
      router.post(`/crm/baux/${bail.id}/resilier`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          router.reload();
        },
        onError: () => {
          alert('Impossible de résilier ce bail.');
        },
      });
    }
  };

  // ============================================
  // UTILITAIRES
  // ============================================

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      termine: 'bg-gray-100 text-gray-800',
      resilie: 'bg-red-100 text-red-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getStatutBorderColor = (statut: string) => {
    const colors: Record<string, string> = {
      actif: 'border-green-200',
      termine: 'border-gray-200',
      resilie: 'border-red-200',
    };
    return colors[statut] || 'border-gray-200';
  };

  const isActif = bail.statut === 'actif';

  return (
    <CrmLayout title={`Bail ${bail.reference}`}>
      <Head title={`Bail ${bail.reference}`} />

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/crm/baux" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Bail {bail.reference}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatutColor(bail.statut)}`}>
                  {bail.statut_label}
                </span>
                <span className="text-sm text-gray-500">Créé le {bail.created_at}</span>
                {isActif && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Actif</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isActif && (
              <button
                onClick={handleResilier}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Résilier
              </button>
            )}
            <Link
              href={`/crm/baux/${bail.id}/edit`}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={handleGenerateEcheances}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center text-sm bg-white shadow-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Générer échéances
            </button>
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
        {/* Colonne gauche - Infos bail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte récapitulative */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Locataire */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#B08D57]/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-[#B08D57]" />
                  </div>
                  <h3 className="ml-3 font-semibold text-gray-900">Locataire</h3>
                </div>
                {bail.locataire ? (
                  <div>
                    <p className="font-medium text-gray-900">{bail.locataire.nom}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {bail.locataire.email}
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {bail.locataire.telephone || 'Non renseigné'}
                    </div>
                    <Link
                      href={`/crm/clients/${bail.locataire.id}`}
                      className="mt-3 inline-block text-sm text-[#B08D57] hover:underline"
                    >
                      Voir la fiche client →
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">Non renseigné</p>
                )}
              </div>

              {/* Bailleur */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#B08D57]/10 flex items-center justify-center">
                    <Building className="h-5 w-5 text-[#B08D57]" />
                  </div>
                  <h3 className="ml-3 font-semibold text-gray-900">Bailleur</h3>
                </div>
                {bail.bailleur ? (
                  <div>
                    <p className="font-medium text-gray-900">{bail.bailleur.nom}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {bail.bailleur.email}
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {bail.bailleur.telephone || 'Non renseigné'}
                    </div>
                    <Link
                      href={`/crm/clients/${bail.bailleur.id}`}
                      className="mt-3 inline-block text-sm text-[#B08D57] hover:underline"
                    >
                      Voir la fiche client →
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">Non renseigné</p>
                )}
              </div>
            </div>

            {/* Adresse du bien */}
            {bail.adresse_bien && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Home className="h-5 w-5 text-[#B08D57] mr-2" />
                  <h3 className="font-semibold text-gray-900">Adresse du bien</h3>
                </div>
                <p className="text-gray-700">{bail.adresse_bien}</p>
                {bail.reference_cadastrale && (
                  <p className="text-sm text-gray-500 mt-1">Réf. cadastrale: {bail.reference_cadastrale}</p>
                )}
              </div>
            )}

            {/* Description */}
            {bail.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-[#B08D57] mr-2" />
                  <h3 className="font-semibold text-gray-900">Description / Clauses</h3>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{bail.description}</p>
              </div>
            )}
          </div>

          {/* Onglets Échéances / Paiements */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap">
                <button
                  onClick={() => setActiveTab('echeances')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'echeances'
                      ? 'text-[#B08D57] border-b-2 border-[#B08D57]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Échéances ({echeances.length})
                </button>
                <button
                  onClick={() => setActiveTab('paiements')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'paiements'
                      ? 'text-[#B08D57] border-b-2 border-[#B08D57]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Paiements ({paiements.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'echeances' && (
                <div>
                  {echeances.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune échéance générée</p>
                      <button
                        onClick={handleGenerateEcheances}
                        className="mt-4 px-4 py-2 bg-[#B08D57] text-white rounded-lg text-sm hover:bg-[#9c7a4a]"
                      >
                        Générer les échéances
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {echeances.map((echeance) => (
                        <div
                          key={echeance.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border ${
                            echeance.est_en_retard
                              ? 'bg-red-50 border-red-200'
                              : echeance.statut === 'paye'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{echeance.date_echeance}</p>
                              <p className="text-xs text-gray-500">Échéance</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{echeance.montant_formatted}</p>
                              {echeance.est_en_retard && (
                                <p className="text-xs text-red-600 flex items-center mt-1">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  En retard
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={`mt-2 sm:mt-0 px-3 py-1 text-xs font-medium rounded-full ${echeance.statut_color}`}>
                            {echeance.statut_label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'paiements' && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowPaiementForm(!showPaiementForm)}
                      className="px-4 py-2 bg-[#B08D57] text-white rounded-lg text-sm hover:bg-[#9c7a4a] flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Enregistrer un paiement
                    </button>
                  </div>

                  {showPaiementForm && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">Nouveau paiement</h4>
                      <form onSubmit={handlePaiement} className="space-y-4" autoComplete="off">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Montant (FCFA)</label>
                            <input
                              type="number"
                              value={data.montant}
                              onChange={(e) => setData('montant', Number(e.target.value))}
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                            {errors.montant && <p className="text-sm text-red-600">{errors.montant}</p>}
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Date de paiement</label>
                            <input
                              type="date"
                              value={data.date_paiement}
                              onChange={(e) => setData('date_paiement', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                            {errors.date_paiement && <p className="text-sm text-red-600">{errors.date_paiement}</p>}
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Mois concerné</label>
                            <input
                              type="month"
                              value={data.mois_concerne}
                              onChange={(e) => setData('mois_concerne', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                            {errors.mois_concerne && <p className="text-sm text-red-600">{errors.mois_concerne}</p>}
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Mode de paiement</label>
                            <select
                              value={data.mode_paiement}
                              onChange={(e) => setData('mode_paiement', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg"
                            >
                              <option value="especes">Espèces</option>
                              <option value="cheque">Chèque</option>
                              <option value="virement">Virement</option>
                              <option value="carte">Carte bancaire</option>
                            </select>
                            {errors.mode_paiement && <p className="text-sm text-red-600">{errors.mode_paiement}</p>}
                          </div>
                          {data.mode_paiement === 'cheque' && (
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">Référence chèque</label>
                              <input
                                type="text"
                                value={data.reference_cheque}
                                onChange={(e) => setData('reference_cheque', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                              {errors.reference_cheque && <p className="text-sm text-red-600">{errors.reference_cheque}</p>}
                            </div>
                          )}
                          <div className="md:col-span-2">
                            <label className="block text-sm text-gray-700 mb-1">Observations</label>
                            <textarea
                              value={data.observations}
                              onChange={(e) => setData('observations', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                            {errors.observations && <p className="text-sm text-red-600">{errors.observations}</p>}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowPaiementForm(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-[#B08D57] text-white rounded-lg text-sm hover:bg-[#9c7a4a] disabled:opacity-50"
                          >
                            {processing ? 'Enregistrement...' : 'Enregistrer'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {paiements.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun paiement enregistré</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paiements.map((paiement) => (
                        <div key={paiement.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900">{paiement.date_paiement}</p>
                              <p className="text-xs text-gray-500">Payé le</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{paiement.montant_formatted}</p>
                              <p className="text-sm text-gray-600">Pour {paiement.mois_concerne}</p>
                              <p className="text-xs text-gray-500">Mode: {paiement.mode_paiement_label}</p>

                              {/* ✅ AJOUT : Bouton imprimer la quittance */}
                             {paiement.quittance && (
  <button
    onClick={() => {
      const quittance = paiement.quittance;
      if (!quittance) return;

      window.open(
        `/crm/quittances/${quittance.id}/pdf`,
        '_blank'
      );
    }}
    className="mt-2 text-sm text-[#0B2A4A] hover:text-[#B08D57] font-medium flex items-center gap-1"
  >
    <Printer className="h-4 w-4" />
    Imprimer la quittance
  </button>
)}
                            </div>
                          </div>
                          <span className={`mt-2 sm:mt-0 px-3 py-1 text-xs font-medium rounded-full ${paiement.statut_color}`}>
                            {paiement.statut_label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite - Résumé financier */}
        <div className="space-y-6">
          {/* Carte résumé */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé financier</h3>
            <div className="space-y-4">
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-600">Loyer mensuel</span>
                <span className="font-semibold text-gray-900">{bail.montant_loyer_formatted}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-600">Fréquence</span>
                <span className="text-gray-900">{bail.frequence_label}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-600">Caution</span>
                <span className="text-gray-900">{bail.caution_formatted || '-'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-600">Durée</span>
                <span className="text-gray-900">{bail.duree}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-600 font-medium">Total impayé</span>
                <span className="text-lg font-bold text-red-600">{bail.total_impaye_formatted}</span>
              </div>
            </div>
          </div>

          {/* Lien dossier si existant */}
          {bail.dossier && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dossier associé</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-[#B08D57] mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{bail.dossier.reference}</p>
                    <p className="text-sm text-gray-500">Dossier lié à ce bail</p>
                  </div>
                </div>
                <Link
                  href={`/crm/dossiers/${bail.dossier.id}`}
                  className="text-[#B08D57] hover:text-[#9c7a4a]"
                >
                  Voir →
                </Link>
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Printer className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-700">Imprimer le bail</span>
                </div>
              </button>

              <button
                onClick={handleSendReminder}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-700">Envoyer un rappel</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  );
};

export default Show;