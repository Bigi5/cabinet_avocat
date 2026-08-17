// resources/js/Pages/Crm/Echeances/Edit.tsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { ArrowLeft, Save, Clock, Folder, User, Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';

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
  dossier_id: string;
  user_id: string;
  titre: string;
  description: string | null;
  date_echeance: string;
  criticite: string;
  statut: string;
  notification_email: boolean;
  notification_sms: boolean;
  notification_whatsapp: boolean;
}

interface Option {
  id: string;
  reference: string;
  client: string;
}

interface UserOption {
  id: string;
  nom: string;
  role: string;
}

interface CriticiteOption {
  value: string;
  label: string;
}

interface StatutOption {
  value: string;
  label: string;
}

interface EditProps {
  auth: {
    user: AuthUser;
  };
  echeance: Echeance;
  options: {
    dossiers: Option[];
    users: UserOption[];
    criticites: CriticiteOption[];
    statuts: StatutOption[];
  };
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const Edit = ({ auth, echeance, options }: EditProps) => {
  const { data, setData, put, processing, errors } = useForm({
    dossier_id: echeance.dossier_id,
    user_id: echeance.user_id,
    titre: echeance.titre,
    description: echeance.description || '',
    date_echeance: echeance.date_echeance.slice(0, 16),
    criticite: echeance.criticite,
    statut: echeance.statut,
    notification_email: echeance.notification_email,
    notification_sms: echeance.notification_sms,
    notification_whatsapp: echeance.notification_whatsapp,
  });

  // Validation avant soumission
  const validateForm = (): boolean => {
    if (!data.titre.trim()) {
      alert('Veuillez saisir un titre pour l\'échéance.');
      return false;
    }

    if (!data.date_echeance) {
      alert('Veuillez sélectionner une date et une heure.');
      return false;
    }

    if (!data.user_id) {
      alert('Veuillez sélectionner un responsable.');
      return false;
    }

    // Vérifier que la date n'est pas dans le passé (optionnel pour l'édition)
    const selectedDate = new Date(data.date_echeance);
    const now = new Date();
    // On autorise les dates passées pour l'édition, mais on peut avertir
    if (selectedDate < now) {
      if (!confirm('Cette date est dans le passé. Voulez-vous continuer ?')) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    put(`/crm/echeances/${echeance.id}`);
  };

  return (
    <CrmLayout title="Modifier échéance">
      <Head title="Modifier échéance" />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/crm/echeances"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">
                Modifier échéance
              </h1>
              <p className="text-gray-500 font-light">
                Modifiez les informations de l'échéance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Titre */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.titre}
              onChange={(e) => setData('titre', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
              placeholder="Audience, dépôt, rendez-vous..."
              required
              maxLength={255}
            />
            {errors.titre && <p className="mt-1 text-sm text-red-600">{errors.titre}</p>}
          </div>

          {/* Dossier */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Folder className="inline h-4 w-4 mr-1" />
              Dossier
            </label>
            <select
              value={data.dossier_id}
              onChange={(e) => setData('dossier_id', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
            >
              <option value="">Sélectionner un dossier</option>
              {options.dossiers.map((dossier) => (
                <option key={dossier.id} value={dossier.id}>
                  {dossier.reference} - {dossier.client}
                </option>
              ))}
            </select>
            {errors.dossier_id && <p className="mt-1 text-sm text-red-600">{errors.dossier_id}</p>}
          </div>

          {/* Responsable */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Responsable <span className="text-red-500">*</span>
            </label>
            <select
              value={data.user_id}
              onChange={(e) => setData('user_id', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
              required
            >
              <option value="">Sélectionner un responsable</option>
              {options.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nom} ({user.role})
                </option>
              ))}
            </select>
            {errors.user_id && <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>}
          </div>

          {/* Date et heure */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date et heure <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={data.date_echeance}
              onChange={(e) => setData('date_echeance', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
              required
            />
            {errors.date_echeance && <p className="mt-1 text-sm text-red-600">{errors.date_echeance}</p>}
          </div>

          {/* Criticité */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <div className="flex flex-wrap gap-4">
              {options.criticites.map((crit) => (
                <label key={crit.value} className="flex items-center">
                  <input
                    type="radio"
                    name="criticite"
                    value={crit.value}
                    checked={data.criticite === crit.value}
                    onChange={(e) => setData('criticite', e.target.value)}
                    className="h-4 w-4 text-[#B08D57] focus:ring-[#B08D57] border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{crit.label}</span>
                </label>
              ))}
            </div>
            {errors.criticite && <p className="mt-1 text-sm text-red-600">{errors.criticite}</p>}
          </div>

          {/* Statut */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={data.statut}
              onChange={(e) => setData('statut', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all appearance-none bg-white"
            >
              {options.statuts.map((statut) => (
                <option key={statut.value} value={statut.value}>
                  {statut.label}
                </option>
              ))}
            </select>
            {errors.statut && <p className="mt-1 text-sm text-red-600">{errors.statut}</p>}
          </div>

          {/* Notifications */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Bell className="inline h-4 w-4 mr-1" />
              Notifications
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.notification_email}
                  onChange={(e) => setData('notification_email', e.target.checked)}
                  className="h-4 w-4 text-[#B08D57] focus:ring-[#B08D57] border-gray-300 rounded"
                />
                <Mail className="h-4 w-4 ml-2 mr-1 text-gray-400" />
                <span className="text-sm text-gray-700">Notification par email</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.notification_sms}
                  onChange={(e) => setData('notification_sms', e.target.checked)}
                  className="h-4 w-4 text-[#B08D57] focus:ring-[#B08D57] border-gray-300 rounded"
                />
                <Smartphone className="h-4 w-4 ml-2 mr-1 text-gray-400" />
                <span className="text-sm text-gray-700">Notification par SMS</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.notification_whatsapp}
                  onChange={(e) => setData('notification_whatsapp', e.target.checked)}
                  className="h-4 w-4 text-[#B08D57] focus:ring-[#B08D57] border-gray-300 rounded"
                />
                <MessageSquare className="h-4 w-4 ml-2 mr-1 text-gray-400" />
                <span className="text-sm text-gray-700">Notification WhatsApp</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={4}
              maxLength={5000}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all"
              placeholder="Informations complémentaires..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/crm/echeances"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-[#B08D57] text-white rounded-lg font-medium hover:bg-[#9c7a4a] transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </CrmLayout>
  );
};

export default Edit;