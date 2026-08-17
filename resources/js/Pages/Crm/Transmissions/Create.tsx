import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { ArrowLeft, Save, Send, FileText, Folder, User, Mail, Phone, Calendar, Upload, X } from 'lucide-react';

interface CreateProps {
  auth: { user: any };
  options: {
    dossiers: Array<{ id: string; reference: string; client: string }>;
    documents: Array<{ id: string; nom_fichier: string; dossier_reference: string | null }>;
    types: Array<{ value: string; label: string }>;
    statuts: Array<{ value: string; label: string }>;
  };
}

const Create = ({ auth, options }: CreateProps) => {
  const { data, setData, post, processing, errors } = useForm({
    dossier_id: '',
    document_id: '',
    type: 'remise',
    statut: 'envoye',
    destinataire_nom: '',
    destinataire_email: '',
    destinataire_telephone: '',
    destinataire_fonction: '',        // ✅ AJOUTÉ
    destinataire_organisation: '',    // ✅ AJOUTÉ
    destinataire_adresse: '',         // ✅ AJOUTÉ
    objet: '',
    message: '',
    date_transmission: new Date().toISOString().slice(0, 10),
    notes: '',
    preuve: null as File | null,
    generer_decharge: false,          // ✅ AJOUTÉ
  });

  const [preuveName, setPreuveName] = useState('');

  const handlePreuveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('preuve', file);
      setPreuveName(file.name);
    }
  };

  const removePreuve = () => {
    setData('preuve', null);
    setPreuveName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/crm/transmissions', {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  return (
    <CrmLayout title="Nouvelle transmission">
      <Head title="Nouvelle transmission" />
      <div className="mb-8">
        <div className="flex items-center">
          <Link href="/crm/transmissions" className="mr-4 p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-light tracking-tight">Nouvelle transmission</h1>
            <p className="text-gray-500">Créez une trace de transmission de document</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informations générales */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Send className="h-5 w-5 mr-2 text-[#B08D57]" />
            Informations générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Type de transmission *</label>
              <select
                value={data.type}
                onChange={e => setData('type', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
              >
                {options.types.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Statut initial</label>
              <select
                value={data.statut}
                onChange={e => setData('statut', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
              >
                {options.statuts?.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
                {!options.statuts && (
                  <>
                    <option value="brouillon">Brouillon</option>
                    <option value="envoye">Envoyé</option>
                    <option value="en_attente">En attente</option>
                  </>
                )}
              </select>
              {errors.statut && <p className="text-red-600 text-sm mt-1">{errors.statut}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date de transmission</label>
              <input
                type="date"
                value={data.date_transmission}
                onChange={e => setData('date_transmission', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
              />
              {errors.date_transmission && <p className="text-red-600 text-sm mt-1">{errors.date_transmission}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Destinataire */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-[#B08D57]" />
            Destinataire
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Nom complet *</label>
              <input
                type="text"
                value={data.destinataire_nom}
                onChange={e => setData('destinataire_nom', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                placeholder="Nom et prénom"
              />
              {errors.destinataire_nom && <p className="text-red-600 text-sm mt-1">{errors.destinataire_nom}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="inline h-4 w-4 mr-1" />Email
              </label>
              <input
                type="email"
                value={data.destinataire_email}
                onChange={e => setData('destinataire_email', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                placeholder="email@exemple.com"
              />
              {errors.destinataire_email && <p className="text-red-600 text-sm mt-1">{errors.destinataire_email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Phone className="inline h-4 w-4 mr-1" />Téléphone
              </label>
              <input
                type="tel"
                value={data.destinataire_telephone}
                onChange={e => setData('destinataire_telephone', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                placeholder="+229 XX XX XX XX"
              />
              {errors.destinataire_telephone && <p className="text-red-600 text-sm mt-1">{errors.destinataire_telephone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fonction</label>
              <input
                type="text"
                value={data.destinataire_fonction}
                onChange={e => setData('destinataire_fonction', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                placeholder="Avocat, Directeur, etc."
              />
              {errors.destinataire_fonction && <p className="text-red-600 text-sm mt-1">{errors.destinataire_fonction}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Organisation</label>
              <input
                type="text"
                value={data.destinataire_organisation}
                onChange={e => setData('destinataire_organisation', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                placeholder="Cabinet, Entreprise, etc."
              />
              {errors.destinataire_organisation && <p className="text-red-600 text-sm mt-1">{errors.destinataire_organisation}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Adresse</label>
              <input
                type="text"
                value={data.destinataire_adresse}
                onChange={e => setData('destinataire_adresse', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                placeholder="Adresse complète"
              />
              {errors.destinataire_adresse && <p className="text-red-600 text-sm mt-1">{errors.destinataire_adresse}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Dossier et document */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Folder className="h-5 w-5 mr-2 text-[#B08D57]" />
            Dossier et document
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Dossier associé</label>
              <select
                value={data.dossier_id}
                onChange={e => setData('dossier_id', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
              >
                <option value="">Sélectionner un dossier</option>
                {options.dossiers.map(d => (
                  <option key={d.id} value={d.id}>{d.reference} - {d.client}</option>
                ))}
              </select>
              {errors.dossier_id && <p className="text-red-600 text-sm mt-1">{errors.dossier_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Document associé</label>
              <select
                value={data.document_id}
                onChange={e => setData('document_id', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
              >
                <option value="">Sélectionner un document</option>
                {options.documents.map(d => (
                  <option key={d.id} value={d.id}>{d.nom_fichier} {d.dossier_reference ? `(${d.dossier_reference})` : ''}</option>
                ))}
              </select>
              {errors.document_id && <p className="text-red-600 text-sm mt-1">{errors.document_id}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: Contenu */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#B08D57]" />
            Contenu de la transmission
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Objet *</label>
              <input
                type="text"
                value={data.objet}
                onChange={e => setData('objet', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                placeholder="Objet de la transmission"
              />
              {errors.objet && <p className="text-red-600 text-sm mt-1">{errors.objet}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={data.message}
                onChange={e => setData('message', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                placeholder="Message accompagnant la transmission..."
              />
              {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 5: Preuve */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2 text-[#B08D57]" />
            Preuve de transmission
          </h2>
          <div>
            <label className="block text-sm font-medium mb-2">Document preuve (optionnel)</label>
            {!data.preuve ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition">
                <input
                  type="file"
                  id="preuve"
                  onChange={handlePreuveChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label htmlFor="preuve" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Cliquez pour télécharger une preuve</span>
                  <span className="text-xs text-gray-400">PDF, JPG, PNG (max 5 Mo)</span>
                </label>
              </div>
            ) : (
              <div className="border rounded-lg p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-[#B08D57] mr-2" />
                  <span className="text-sm">{preuveName}</span>
                </div>
                <button
                  type="button"
                  onClick={removePreuve}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {errors.preuve && <p className="text-red-600 text-sm mt-1">{errors.preuve}</p>}
          </div>
        </div>

        {/* Section 6: Options */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="generer_decharge"
              checked={data.generer_decharge}
              onChange={e => setData('generer_decharge', e.target.checked)}
              className="h-4 w-4 text-[#B08D57] rounded border-gray-300 focus:ring-[#B08D57]"
            />
            <label htmlFor="generer_decharge" className="text-sm font-medium">
              Générer automatiquement une décharge
            </label>
          </div>
          {errors.generer_decharge && <p className="text-red-600 text-sm mt-1">{errors.generer_decharge}</p>}
        </div>

        {/* Section 7: Notes */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Notes internes</h2>
          <textarea
            value={data.notes}
            onChange={e => setData('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
            placeholder="Notes internes (non visibles par le destinataire)..."
          />
          {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/crm/transmissions"
            className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={processing}
            className="px-6 py-2.5 bg-[#B08D57] text-white rounded-lg hover:bg-[#9a7a4a] transition disabled:opacity-50 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {processing ? 'Création...' : 'Créer la transmission'}
          </button>
        </div>
      </form>
    </CrmLayout>
  );
};

export default Create;