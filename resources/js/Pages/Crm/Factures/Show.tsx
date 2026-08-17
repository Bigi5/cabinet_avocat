import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  Mail,
  CheckCircle,
  FileText,
  CreditCard,
  Plus,
  User,
  Phone,
  History,
  Clock,
  AlertCircle,
  Receipt
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface Ligne {
  id: number;
  description: string;
  quantite: number;
  prix_unitaire: number;
  montant_ht_formatted: string;
  tva: number;
  montant_ttc_formatted: string;
}

interface Paiement {
  id: number;
  montant: number;
  montant_formatted: string;
  date_paiement: string;
  mode: string;
  mode_label: string;
  reference_cheque: string | null;
  observations: string | null;
  created_at?: string;
}

interface Facture {
  id: number;
  reference: string;
  client: { id: number; nom: string; email: string; telephone: string } | null;
  dossier: { id: number; reference: string } | null;
  date_emission: string;
  date_echeance: string;
  montant_ht: number;
  montant_ht_formatted: string;
  montant_ttc: number;
  montant_ttc_formatted: string;
  statut: string;
  statut_label: string;
  statut_color: string;
  type: string;
  description: string | null;
  notes: string | null;
  solde: number;
  solde_formatted: string;
  est_payee: boolean;
  user: string | null;
  created_at: string;
  tva_total?: number;
  tva_total_formatted?: string;
}

interface ShowProps {
  auth: { user: any };
  facture: Facture;
  lignes: Ligne[];
  paiements: Paiement[];
  timeline?: Array<{
    date: string;
    type: string;
    label: string;
    details?: string;
    icon?: string;
  }>;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const Show = ({ auth, facture, lignes, paiements, timeline = [] }: ShowProps) => {
  const [showPaiementForm, setShowPaiementForm] = useState(false);
  const { data, setData, post, processing, reset, errors } = useForm({
    montant: facture.solde || 0,
    date_paiement: new Date().toISOString().slice(0, 10),
    mode: 'especes',
    reference_cheque: '',
    observations: '',
  });

  const dejaPaye = facture.montant_ttc - facture.solde;

  const handlePaiement = (e: React.FormEvent) => {
    e.preventDefault();

    if (data.montant > facture.solde) {
      alert('Le montant du paiement ne peut pas dépasser le solde restant.');
      return;
    }

    if (data.montant <= 0) {
      alert('Le montant du paiement doit être supérieur à 0.');
      return;
    }

    post(`/crm/factures/${facture.id}/paiements`, {
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

  const handleValidate = () => {
    if (confirm('Valider et envoyer cette facture ?')) {
      post(`/crm/factures/${facture.id}/validate`);
    }
  };

  const handleEmail = () => {
    if (!facture.client?.email) {
      alert('Le client ne possède pas d\'adresse email.');
      return;
    }
    if (confirm(`Envoyer la facture par email à ${facture.client.email} ?`)) {
      router.post(`/crm/factures/${facture.id}/email`);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      const content = document.getElementById('print-content')?.innerHTML || '';
      printWindow.document.write(`
        <html>
          <head>
            <title>Facture ${facture.reference}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px 12px; border-bottom: 1px solid #ddd; text-align: left; }
              th { background-color: #f5f5f5; }
              .text-right { text-align: right; }
              .total { font-size: 18px; font-weight: bold; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            ${content}
            <div class="footer">Document généré automatiquement - ${new Date().toLocaleDateString('fr-FR')}</div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadPDF = () => {
    window.open(`/crm/factures/${facture.id}/pdf`, '_blank');
  };

  const getStatutColor = () => {
    const colors = {
      brouillon: 'bg-gray-100 text-gray-600',
      envoyee: 'bg-blue-100 text-blue-800',
      payee: 'bg-green-100 text-green-800',
      impayee: 'bg-red-100 text-red-800',
      annulee: 'bg-gray-100 text-gray-500',
    };
    return colors[facture.statut as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getModeIcon = (mode: string) => {
    const icons: Record<string, string> = {
      especes: '💵',
      cheque: '🧾',
      virement: '🏦',
      carte: '💳',
    };
    return icons[mode] || '💰';
  };

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      especes: 'Espèces',
      cheque: 'Chèque',
      virement: 'Virement',
      carte: 'Carte bancaire',
    };
    return labels[mode] || mode;
  };

  const tvaTotal = lignes.reduce((acc, l) => acc + (l.prix_unitaire * l.quantite * l.tva / 100), 0);

  return (
    <CrmLayout title={`Facture ${facture.reference}`}>
      <Head title={`Facture ${facture.reference}`} />

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/crm/factures" className="mr-4 p-2 text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-light tracking-tight">Facture {facture.reference}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatutColor()}`}>
                  {facture.statut_label}
                </span>
                <span className="text-sm text-gray-500">Créée le {facture.created_at}</span>
                {facture.est_payee && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Soldée</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {facture.statut === 'brouillon' && (
              <>
                <Link
                  href={`/crm/factures/${facture.id}/edit`}
                  className="px-4 py-2 border rounded-xl text-sm flex items-center hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />Modifier
                </Link>
                <button
                  onClick={handleValidate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm flex items-center hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4 mr-2" />Valider & envoyer
                </button>
              </>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 border rounded-xl text-sm flex items-center hover:bg-gray-50"
            >
              <Printer className="h-4 w-4 mr-2" />Imprimer
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 border rounded-xl text-sm flex items-center hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />PDF
            </button>
          </div>
        </div>
      </div>

      <div id="print-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Infos facture */}
          <div className="lg:col-span-2 space-y-6">
            {/* Détails facture */}
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#B08D57]" />
                Détails de la facture
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><p className="text-xs text-gray-500">Client</p><p className="font-medium">{facture.client?.nom || '-'}</p></div>
                <div><p className="text-xs text-gray-500">Dossier</p><p className="font-medium">{facture.dossier?.reference || '-'}</p></div>
                <div><p className="text-xs text-gray-500">Date d'émission</p><p className="font-medium">{facture.date_emission}</p></div>
                <div><p className="text-xs text-gray-500">Date d'échéance</p><p className="font-medium">{facture.date_echeance}</p></div>
                <div><p className="text-xs text-gray-500">Type</p><p className="font-medium capitalize">{facture.type}</p></div>
                <div><p className="text-xs text-gray-500">Créée par</p><p className="font-medium">{facture.user || '-'}</p></div>
              </div>

              {/* Lignes */}
              <h3 className="font-medium mb-3">Lignes de facture</h3>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Qté</th>
                      <th className="px-4 py-2 text-right">Prix U.</th>
                      <th className="px-4 py-2 text-right">TVA</th>
                      <th className="px-4 py-2 text-right">Total TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignes.map(l => (
                      <tr key={l.id} className="border-t">
                        <td className="px-4 py-2">{l.description}</td>
                        <td className="px-4 py-2 text-right">{l.quantite}</td>
                        <td className="px-4 py-2 text-right">{l.prix_unitaire.toLocaleString()} FCFA</td>
                        <td className="px-4 py-2 text-right">{l.tva}%</td>
                        <td className="px-4 py-2 text-right font-medium">{l.montant_ttc_formatted}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t">
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right font-bold">Total TTC</td>
                      <td className="px-4 py-2 text-right font-bold">{facture.montant_ttc_formatted}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {facture.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm">{facture.description}</p>
                </div>
              )}
              {facture.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm whitespace-pre-line">{facture.notes}</p>
                </div>
              )}
            </div>

            {/* Historique des paiements */}
            {paiements.length > 0 && (
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-[#B08D57]" />
                  Historique des paiements
                </h2>
                <div className="space-y-3">
                  {paiements.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{p.montant_formatted}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {getModeIcon(p.mode)} {getModeLabel(p.mode)}
                        </p>
                        {p.observations && <p className="text-xs text-gray-400">{p.observations}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{p.date_paiement}</p>
                        {p.reference_cheque && <p className="text-xs text-gray-500">Chèque: {p.reference_cheque}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <History className="h-5 w-5 mr-2 text-[#B08D57]" />
                  Historique des événements
                </h2>
                <div className="relative">
                  {timeline.map((event, index) => (
                    <div key={index} className="flex items-start mb-4 last:mb-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {event.icon === 'file' && <FileText className="h-4 w-4 text-gray-500" />}
                        {event.icon === 'mail' && <Mail className="h-4 w-4 text-blue-500" />}
                        {event.icon === 'credit-card' && <CreditCard className="h-4 w-4 text-green-500" />}
                        {event.icon === 'check' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {!event.icon && <Clock className="h-4 w-4 text-gray-400" />}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">{event.label}</p>
                        {event.details && <p className="text-xs text-gray-500">{event.details}</p>}
                        <p className="text-xs text-gray-400">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite - Résumé et actions */}
          <div className="space-y-6">
            {/* Client */}
            {facture.client && (
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-[#B08D57]" />
                  Client
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{facture.client.nom}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {facture.client.email || 'Non renseigné'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {facture.client.telephone || 'Non renseigné'}
                  </div>
                  {facture.dossier && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      Dossier: {facture.dossier.reference}
                    </div>
                  )}
                  <Link
                    href={`/crm/clients/${facture.client.id}`}
                    className="mt-2 inline-block text-sm text-[#B08D57] hover:underline"
                  >
                    Voir la fiche client →
                  </Link>
                </div>
              </div>
            )}

            {/* Résumé financier */}
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Receipt className="h-5 w-5 mr-2 text-[#B08D57]" />
                Résumé financier
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-600">Montant HT</span>
                  <span className="font-medium">{facture.montant_ht_formatted}</span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-600">TVA</span>
                  <span className="font-medium">{tvaTotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-dashed">
                  <span className="text-gray-600 font-medium">Montant TTC</span>
                  <span className="font-bold text-lg">{facture.montant_ttc_formatted}</span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-600">Déjà payé</span>
                  <span className="text-green-600 font-medium">{dejaPaye.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-semibold">Reste à payer</span>
                  <span className="text-xl font-bold text-red-600">{facture.solde_formatted}</span>
                </div>
              </div>
            </div>

            {/* Enregistrer un paiement */}
            {facture.statut !== 'payee' && facture.statut !== 'annulee' && facture.solde > 0 && (
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <button
                  onClick={() => setShowPaiementForm(!showPaiementForm)}
                  className="w-full py-2 bg-[#B08D57] text-white rounded-lg flex items-center justify-center hover:bg-[#9c7a4a]"
                >
                  <Plus className="h-4 w-4 mr-2" />Enregistrer un paiement
                </button>
                {showPaiementForm && (
                  <form onSubmit={handlePaiement} className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Montant (max {facture.solde_formatted})</label>
                      <input
                        type="number"
                        step="100"
                        min="0"
                        max={facture.solde}
                        placeholder="Montant"
                        value={data.montant || ''}
                        onChange={e => setData('montant', e.target.value === '' ? 0 : Number.parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      {errors.montant && <p className="text-sm text-red-600">{errors.montant}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Date de paiement</label>
                      <input
                        type="date"
                        value={data.date_paiement}
                        onChange={e => setData('date_paiement', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      {errors.date_paiement && <p className="text-sm text-red-600">{errors.date_paiement}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Mode de paiement</label>
                      <select
                        value={data.mode}
                        onChange={e => setData('mode', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="especes">💵 Espèces</option>
                        <option value="cheque">🧾 Chèque</option>
                        <option value="virement">🏦 Virement</option>
                        <option value="carte">💳 Carte bancaire</option>
                      </select>
                      {errors.mode && <p className="text-sm text-red-600">{errors.mode}</p>}
                    </div>
                    {data.mode === 'cheque' && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Référence chèque</label>
                        <input
                          type="text"
                          placeholder="Référence chèque"
                          value={data.reference_cheque}
                          onChange={e => setData('reference_cheque', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                        {errors.reference_cheque && <p className="text-sm text-red-600">{errors.reference_cheque}</p>}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Observations</label>
                      <textarea
                        placeholder="Observations"
                        value={data.observations}
                        onChange={e => setData('observations', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      {errors.observations && <p className="text-sm text-red-600">{errors.observations}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={processing || data.montant > facture.solde || data.montant <= 0}
                      className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {processing ? 'Enregistrement...' : 'Enregistrer le paiement'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Actions rapides */}
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEmail}
                  className="w-full flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={!facture.client?.email}
                >
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  Envoyer par email
                  {!facture.client?.email && <span className="ml-2 text-xs text-red-500">(Aucun email)</span>}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4 mr-3 text-gray-400" />
                  Télécharger PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Printer className="h-4 w-4 mr-3 text-gray-400" />
                  Imprimer
                </button>
              </div>
              {facture.est_payee && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg text-center">
                  <p className="text-xs text-green-600">✓ Facture soldée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  );
};

export default Show;