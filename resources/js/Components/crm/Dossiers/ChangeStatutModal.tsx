// resources/js/Components/Crm/Dossiers/ChangeStatutModal.tsx

import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface ChangeStatutModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossierId: number;
  dossierReference: string;
  currentStatut: string;
  onSuccess?: () => void;
}

const ChangeStatutModal = ({
  isOpen,
  onClose,
  dossierId,
  dossierReference,
  currentStatut,
  onSuccess,
}: ChangeStatutModalProps) => {
  const [statut, setStatut] = useState(currentStatut);
  const [motif, setMotif] = useState('');
  const [motifCommentaire, setMotifCommentaire] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setStatut(currentStatut);
      setMotif('');
      setMotifCommentaire('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, currentStatut]);

  // ✅ Liste des statuts disponibles
  const STATUTS = [
    { value: 'cree', label: 'Créé', color: 'bg-gray-100 text-gray-600' },
    { value: 'en_cours', label: 'En cours', color: 'bg-blue-100 text-blue-600' },
    { value: 'en_attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-600' },
    { value: 'execute', label: 'Exécuté', color: 'bg-green-100 text-green-600' },
    { value: 'cloture', label: 'Clôturé', color: 'bg-purple-100 text-purple-600' },
    { value: 'archive', label: 'Archivé', color: 'bg-gray-100 text-gray-600' },
  ];

  // ✅ Liste des motifs pour la clôture
  const MOTIFS = [
    { value: 'cloture', label: 'Clôture du dossier' },
    { value: 'inactif', label: 'Dossier inactif' },
    { value: 'ancien', label: 'Dossier ancien' },
    { value: 'litige_resolu', label: 'Litige résolu' },
    { value: 'autre', label: 'Autre motif' },
  ];

  // ✅ Vérifier si le statut sélectionné est "Clôturé"
  const isCloture = statut === 'cloture';

  // ✅ Vérifier si le formulaire est valide
  const isValid = () => {
    if (isCloture && !motif) return false;
    return true;
  };

  // ✅ Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const data: any = {
      statut: statut,
    };

    if (isCloture) {
      data.motif = motif;
      if (motifCommentaire) {
        data.motif_commentaire = motifCommentaire;
      }
    }

    router.post(
      route('crm.dossiers.statut', dossierId),
      data,
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setSuccess('Statut modifié avec succès !');
          setIsSubmitting(false);
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 1500);
        },
        onError: (errors) => {
          setError('Erreur lors du changement de statut.');
          setIsSubmitting(false);
          console.error('Erreurs:', errors);
        },
      }
    );
  };

  // ✅ Si le modal n'est pas ouvert, ne rien afficher
  if (!isOpen) return null;

  // ✅ Récupérer le libellé du statut actuel
  const currentStatutLabel = STATUTS.find(s => s.value === currentStatut)?.label || currentStatut;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Changer le statut</h2>
            <p className="text-sm text-gray-500">
              Dossier {dossierReference} • Statut actuel: {currentStatutLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ✅ Messages d'erreur/succès */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* ✅ Sélection du statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau statut <span className="text-red-500">*</span>
            </label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] outline-none transition"
              disabled={isSubmitting}
            >
              {STATUTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Motif (visible uniquement pour Clôturé) */}
          {isCloture && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif <span className="text-red-500">*</span>
                </label>
                <select
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] outline-none transition"
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner un motif</option>
                  {MOTIFS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  value={motifCommentaire}
                  onChange={(e) => setMotifCommentaire(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] outline-none transition"
                  placeholder="Commentaire optionnel..."
                  disabled={isSubmitting}
                />
              </div>

              {/* ✅ Encadré jaune d'avertissement */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">⚠️ Attention</p>
                    <p className="text-sm text-yellow-700">
                      Ce dossier sera archivé automatiquement. Tous les documents et actes associés seront également archivés.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Boutons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid()}
              className={`flex-1 px-4 py-2 rounded-lg text-white transition-all disabled:opacity-50 ${
                isSubmitting 
                  ? 'bg-[#B08D57] cursor-wait' 
                  : 'bg-[#B08D57] hover:bg-[#9a7a4a]'
              }`}
            >
              {isSubmitting ? 'Enregistrement...' : 'Valider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeStatutModal;