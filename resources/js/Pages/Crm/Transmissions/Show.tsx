import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Folder,
  Calendar,
  Send,
  Mail,
  Phone,
  Upload,
  Signature,
  FileCheck,
  Eye
} from 'lucide-react';

interface Transmission {
  id: number;
  reference: string;
  objet: string;
  type: string;
  type_label: string;
  message: string | null;
  destinataire_nom: string;
  destinataire_email: string | null;
  destinataire_telephone: string | null;
  emetteur: { id: number; nom: string } | null;
  dossier: { id: number; reference: string } | null;
  document: { id: number; nom_fichier: string } | null;
  date_transmission: string;
  date_reception: string | null;
  statut: string;
  statut_label: string;
  statut_color: string;
  preuve_chemin: string | null;
  notes: string | null;
  created_at: string;
}

interface Decharge {
  id: number;
  signataire_nom: string;
  signataire_fonction: string | null;
  date_decharge: string;
  signature_chemin: string | null;
  document_chemin: string | null;
  statut: string;
  statut_label: string;
  statut_color: string;
  observations: string | null;
  user: string | null;
}

interface ShowProps {
  auth: { user: any };
  transmission: Transmission;
  decharge: Decharge | null;
}

const Show = ({ auth, transmission, decharge }: ShowProps) => {
  const [showDechargeForm, setShowDechargeForm] = useState(false);
  const [showSignForm, setShowSignForm] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    signataire_nom: '',
    signataire_fonction: '',
    date_decharge: new Date().toISOString().slice(0, 10),
    observations: '',
    signature: null as File | null,
    document: null as File | null,
  });

  const [signatureName, setSignatureName] = useState('');
  const [documentName, setDocumentName] = useState('');

  const handleGenerateDecharge = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/crm/transmissions/${transmission.id}/generate-decharge`, {
      onSuccess: () => setShowDechargeForm(false),
    });
  };

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/crm/transmissions/${transmission.id}/sign`, {
      onSuccess: () => setShowSignForm(false),
    });
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('signature', file);
      setSignatureName(file.name);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('document', file);
      setDocumentName(file.name);
    }
  };

  const handleDelete = () => {
    if (confirm('Voulez-vous vraiment supprimer cette transmission ? Cette action est irréversible.')) {
      router.delete(`/crm/transmissions/${transmission.id}`);
    }
  };

  const getStatutIcon = () => {
    switch(transmission.statut) {
      case 'envoye': return <Send className="h-5 w-5" />;
      case 'recu': return <Mail className="h-5 w-5" />;
      case 'signe': return <CheckCircle className="h-5 w-5" />;
      case 'refuse': return <XCircle className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <CrmLayout title={`Transmission ${transmission.reference}`}>
      <Head title={`Transmission ${transmission.reference}`} />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/crm/transmissions" className="mr-4 p-2 text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></Link>
            <div>
              <h1 className="text-3xl font-light tracking-tight">Transmission {transmission.reference}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${transmission.statut_color} flex items-center`}>
                  {getStatutIcon()}<span className="ml-1.5">{transmission.statut_label}</span>
                </span>
                <span className="text-sm text-gray-500">Créée le {transmission.created_at}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <a
              href={`/crm/transmissions/${transmission.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border rounded-xl text-sm flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />PDF
            </a>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border rounded-xl text-sm flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />Imprimer
            </button>
            <Link
              href={`/crm/transmissions/${transmission.id}/edit`}
              className="px-4 py-2 border rounded-xl text-sm flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-xl text-sm flex items-center hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails transmission */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center"><Send className="h-5 w-5 mr-2 text-[#B08D57]" />Détails de la transmission</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="text-xs text-gray-500">Type</p><p className="font-medium">{transmission.type_label}</p></div>
              <div><p className="text-xs text-gray-500">Date d'envoi</p><p className="font-medium">{transmission.date_transmission}</p></div>
              {transmission.date_reception && <div><p className="text-xs text-gray-500">Date de réception</p><p className="font-medium">{transmission.date_reception}</p></div>}
              <div><p className="text-xs text-gray-500">Émetteur</p><p className="font-medium">{transmission.emetteur?.nom || '-'}</p></div>
            </div>

            <h3 className="font-medium mb-2">Objet</h3>
            <p className="text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg">{transmission.objet}</p>

            {transmission.message && (
              <>
                <h3 className="font-medium mb-2">Message</h3>
                <p className="text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg whitespace-pre-line">{transmission.message}</p>
              </>
            )}

            {transmission.notes && (
              <>
                <h3 className="font-medium mb-2">Notes internes</h3>
                <p className="text-gray-500 text-sm mb-4 p-3 bg-gray-50 rounded-lg">{transmission.notes}</p>
              </>
            )}

            {transmission.preuve_chemin && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">Preuve de transmission</span>
                  <a href={route('crm.transmissions.files.show', { id: transmission.id, type: 'preuve' })} target="_blank" className="ml-auto text-blue-600 hover:underline text-sm flex items-center"><Eye className="h-4 w-4 mr-1" />Voir</a>
                </div>
              </div>
            )}
          </div>

          {/* Dossier et document */}
          {(transmission.dossier || transmission.document) && (
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center"><Folder className="h-5 w-5 mr-2 text-[#B08D57]" />Dossier et document</h2>
              {transmission.dossier && (
                <div className="mb-3 flex items-center">
                  <Folder className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">Dossier: </span>
                  <Link href={`/crm/dossiers/${transmission.dossier.id}`} className="ml-2 text-[#B08D57] hover:underline">{transmission.dossier.reference}</Link>
                </div>
              )}
              {transmission.document && (
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">Document: </span>
                  <a href={`/crm/documents/${transmission.document.id}`} className="ml-2 text-[#B08D57] hover:underline">{transmission.document.nom_fichier}</a>
                </div>
              )}
            </div>
          )}

          {/* Destinataire */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center"><User className="h-5 w-5 mr-2 text-[#B08D57]" />Destinataire</h2>
            <div className="space-y-3">
              <div><p className="text-xs text-gray-500">Nom</p><p className="font-medium">{transmission.destinataire_nom}</p></div>
              {transmission.destinataire_email && <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{transmission.destinataire_email}</p></div>}
              {transmission.destinataire_telephone && <div><p className="text-xs text-gray-500">Téléphone</p><p className="font-medium">{transmission.destinataire_telephone}</p></div>}
            </div>
          </div>
        </div>

        {/* Colonne droite - Décharge */}
        <div className="space-y-6">
          {!decharge ? (
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Décharge</h3>
              {!showDechargeForm ? (
                <button onClick={() => setShowDechargeForm(true)} className="w-full py-2 bg-[#B08D57] text-white rounded-lg flex items-center justify-center"><FileCheck className="h-4 w-4 mr-2" />Créer une décharge</button>
              ) : (
                <form onSubmit={handleGenerateDecharge} className="space-y-3">
                  <input type="text" placeholder="Nom du signataire *" value={data.signataire_nom} onChange={e => setData('signataire_nom', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                  <input type="text" placeholder="Fonction" value={data.signataire_fonction} onChange={e => setData('signataire_fonction', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                  <input type="date" value={data.date_decharge} onChange={e => setData('date_decharge', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                  <textarea placeholder="Observations" value={data.observations} onChange={e => setData('observations', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg" />
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setShowDechargeForm(false)} className="flex-1 py-2 border rounded-lg">Annuler</button>
                    <button type="submit" disabled={processing || !data.signataire_nom} className="flex-1 py-2 bg-[#B08D57] text-white rounded-lg">Créer</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center"><FileCheck className="h-5 w-5 mr-2 text-green-600" />Décharge</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between"><span className="text-gray-500">Statut</span><span className={`px-2 py-1 text-xs rounded-full ${decharge.statut_color}`}>{decharge.statut_label}</span></div>
                <div><span className="text-gray-500">Signataire</span><p className="font-medium">{decharge.signataire_nom}</p></div>
                {decharge.signataire_fonction && <div><span className="text-gray-500">Fonction</span><p>{decharge.signataire_fonction}</p></div>}
                <div><span className="text-gray-500">Date de décharge</span><p>{decharge.date_decharge}</p></div>
                {decharge.observations && <div><span className="text-gray-500">Observations</span><p className="text-sm">{decharge.observations}</p></div>}
                {decharge.user && <div><span className="text-gray-500">Créée par</span><p>{decharge.user}</p></div>}
              </div>

              {decharge.statut === 'en_attente' && !showSignForm && (
                <button onClick={() => setShowSignForm(true)} className="w-full py-2 bg-purple-600 text-white rounded-lg flex items-center justify-center"><Signature className="h-4 w-4 mr-2" />Signer la décharge</button>
              )}

              {showSignForm && (
                <form onSubmit={handleSign} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Signature *</label>
                    {!data.signature ? (
                      <div className="border-2 border-dashed rounded-lg p-3 text-center">
                        <input type="file" id="signature" onChange={handleSignatureChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                        <label htmlFor="signature" className="cursor-pointer flex flex-col items-center"><Upload className="h-6 w-6 text-gray-400" /><span className="text-xs">Signature scannée</span></label>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-2 flex justify-between"><span className="text-sm">{signatureName}</span><button type="button" onClick={() => setData('signature', null)} className="text-red-500">×</button></div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Document signé (optionnel)</label>
                    {!data.document ? (
                      <div className="border-2 border-dashed rounded-lg p-3 text-center">
                        <input type="file" id="document" onChange={handleDocumentChange} className="hidden" accept=".pdf" />
                        <label htmlFor="document" className="cursor-pointer flex flex-col items-center"><Upload className="h-6 w-6 text-gray-400" /><span className="text-xs">Document signé (PDF)</span></label>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-2 flex justify-between"><span className="text-sm">{documentName}</span><button type="button" onClick={() => setData('document', null)} className="text-red-500">×</button></div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setShowSignForm(false)} className="flex-1 py-2 border rounded-lg">Annuler</button>
                    <button type="submit" disabled={processing || !data.signature} className="flex-1 py-2 bg-purple-600 text-white rounded-lg">Valider la signature</button>
                  </div>
                </form>
              )}

              {(decharge.signature_chemin || decharge.document_chemin) && (
                <div className="mt-4 pt-3 border-t">
                  {decharge.signature_chemin && <a href={route('crm.transmissions.files.show', { id: transmission.id, type: 'signature' })} target="_blank" className="block text-sm text-blue-600 hover:underline mb-2"><Eye className="h-3 w-3 inline mr-1" /> Voir la signature</a>}
                  {decharge.document_chemin && <a href={route('crm.transmissions.files.show', { id: transmission.id, type: 'document' })} target="_blank" className="block text-sm text-blue-600 hover:underline"><FileText className="h-3 w-3 inline mr-1" /> Voir le document signé</a>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CrmLayout>
  );
};

export default Show;
