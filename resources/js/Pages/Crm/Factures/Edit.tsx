import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { ArrowLeft, Save, Plus, Trash2, Calculator, FileText } from 'lucide-react';

interface Ligne {
  id?: number;
  uid?: string;
  description: string;
  quantite: number;
  prix_unitaire: number;
  tva: number;
}

interface EditProps {
  auth: { user: any };
  facture: {
    id: number;
    dossier_id: string;
    client_id: string;
    date_emission: string;
    date_echeance: string;
    type: string;
    description: string | null;
    notes: string | null;
    lignes: Ligne[];
  };
  options: {
    dossiers: Array<{ id: string; reference: string; client: string; client_id: string }>;
    types: Array<{ value: string; label: string }>;
  };
}

const Edit = ({ auth, facture, options }: EditProps) => {
  const initialLignes = facture.lignes.map((l: any) => ({ ...l, uid: l.id ? `l-${l.id}` : `u-${Date.now()}-${Math.floor(Math.random()*10000)}` }));

  const { data, setData, put, processing, errors } = useForm({
    dossier_id: facture.dossier_id,
    client_id: facture.client_id,
    date_emission: facture.date_emission,
    date_echeance: facture.date_echeance,
    type: facture.type,
    description: facture.description || '',
    notes: facture.notes || '',
    lignes: initialLignes,
  });

  const [currentLigne, setCurrentLigne] = useState<Ligne>({ description: '', quantite: 1, prix_unitaire: 0, tva: 0 });

  const addLigne = () => {
    if (!currentLigne.description || currentLigne.quantite <= 0 || currentLigne.prix_unitaire <= 0) return;
    const uid = `u-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    setData('lignes', [...data.lignes, { ...currentLigne, uid }]);
    setCurrentLigne({ description: '', quantite: 1, prix_unitaire: 0, tva: 0 });
  };

  const removeLigne = (uid: string) => {
    setData('lignes', data.lignes.filter((l: any) => l.uid !== uid));
  };

  const updateLigneField = (index: number, field: keyof Ligne, value: any) => {
    const newLignes = [...data.lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    setData('lignes', newLignes);
  };

  const updateCurrentLigneField = (field: keyof Ligne, value: any) => {
    setCurrentLigne({ ...currentLigne, [field]: value });
  };

  const handleDossierChange = (dossierId: string) => {
    const dossier = options.dossiers.find(d => d.id === dossierId);
    setData('dossier_id', dossierId);
    if (dossier) setData('client_id', dossier.client_id);
  };

  const calculateTotal = () => {
    let total = 0;
    data.lignes.forEach(ligne => {
      const ht = ligne.quantite * ligne.prix_unitaire;
      const ttc = ht * (1 + ligne.tva / 100);
      total += ttc;
    });
    return total.toLocaleString('fr-FR') + ' FCFA';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/crm/factures/${facture.id}`);
  };

  return (
    <CrmLayout title="Modifier facture">
      <Head title="Modifier facture" />
      <div className="mb-8">
        <div className="flex items-center">
          <Link href={`/crm/factures/${facture.id}`} className="mr-4 p-2 text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></Link>
          <div><h1 className="text-3xl font-light tracking-tight">Modifier facture</h1><p className="text-gray-500">Modifiez les informations de la facture</p></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><FileText className="h-5 w-5 mr-2 text-[#B08D57]" />Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dossier_id" className="block text-sm font-medium mb-2">Dossier</label>
              <select id="dossier_id" value={data.dossier_id} onChange={(e) => handleDossierChange(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
                <option value="">Sélectionner un dossier</option>
                {options.dossiers.map(d => <option key={d.id} value={d.id}>{d.reference} - {d.client}</option>)}
              </select>
              {errors.dossier_id && <p className="text-red-600 text-sm mt-1">{errors.dossier_id}</p>}
            </div>
            <div>
              <label htmlFor="client_display" className="block text-sm font-medium mb-2">Client</label>
              <input id="client_display" type="text" value={options.dossiers.find(d => d.id === data.dossier_id)?.client || ''} disabled className="w-full px-4 py-2.5 border rounded-lg bg-gray-50" />
            </div>
            <div>
              <label htmlFor="date_emission" className="block text-sm font-medium mb-2">Date d'émission</label>
              <input id="date_emission" type="date" value={data.date_emission} onChange={e => setData('date_emission', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
            </div>
            <div>
              <label htmlFor="date_echeance" className="block text-sm font-medium mb-2">Date d'échéance</label>
              <input id="date_echeance" type="date" value={data.date_echeance} onChange={e => setData('date_echeance', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
            </div>
            <div>
              <label htmlFor="type_facture" className="block text-sm font-medium mb-2">Type de facture</label>
              <select id="type_facture" value={data.type} onChange={e => setData('type', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
                {options.types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Lignes de facture */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><Calculator className="h-5 w-5 mr-2 text-[#B08D57]" />Lignes de facture</h2>
          
          {data.lignes.length > 0 && (
            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr><th className="px-4 py-2 text-left">Description</th><th className="px-4 py-2 text-right">Qté</th><th className="px-4 py-2 text-right">Prix U.</th><th className="px-4 py-2 text-right">TVA</th><th className="px-4 py-2 text-right">Total TTC</th><th className="px-4 py-2 w-10"></th></tr>
                </thead>
                <tbody>
                  {data.lignes.map((ligne: any, idx: number) => {
                    const ht = ligne.quantite * ligne.prix_unitaire;
                    const ttc = ht * (1 + ligne.tva / 100);
                    return (
                      <tr key={ligne.uid || idx} className="border-t">
                        <td className="px-4 py-2"><input value={ligne.description} onChange={e => updateLigneField(idx, 'description', e.target.value)} className="w-full px-2 py-1 border rounded" /></td>
                        <td className="px-4 py-2"><input type="number" value={ligne.quantite} onChange={e => updateLigneField(idx, 'quantite', Number.parseFloat(e.target.value))} className="w-20 px-2 py-1 border rounded text-right" /></td>
                        <td className="px-4 py-2"><input type="number" value={ligne.prix_unitaire} onChange={e => updateLigneField(idx, 'prix_unitaire', Number.parseFloat(e.target.value))} className="w-28 px-2 py-1 border rounded text-right" /></td>
                        <td className="px-4 py-2"><input type="number" value={ligne.tva} onChange={e => updateLigneField(idx, 'tva', Number.parseFloat(e.target.value))} className="w-20 px-2 py-1 border rounded text-right" /></td>
                        <td className="px-4 py-2 text-right font-medium">{ttc.toLocaleString()} FCFA</td>
                        <td className="px-4 py-2 text-center"><button type="button" onClick={() => removeLigne(ligne.uid)} className="text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr><td colSpan={4} className="px-4 py-2 text-right font-bold">Total TTC</td><td className="px-4 py-2 text-right font-bold">{calculateTotal()}</td><td></td></tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Ajouter une ligne */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-5"><input placeholder="Description" value={currentLigne.description} onChange={e => updateCurrentLigneField('description', e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="col-span-2"><input type="number" placeholder="Qté" value={currentLigne.quantite} onChange={e => updateCurrentLigneField('quantite', Number.parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="col-span-2"><input type="number" placeholder="Prix unitaire" value={currentLigne.prix_unitaire} onChange={e => updateCurrentLigneField('prix_unitaire', Number.parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="col-span-2"><input type="number" placeholder="TVA %" value={currentLigne.tva} onChange={e => updateCurrentLigneField('tva', Number.parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="col-span-1"><button type="button" onClick={addLigne} className="w-full py-2 bg-[#B08D57] text-white rounded-lg"><Plus className="h-4 w-4 mx-auto" /></button></div>
          </div>
        </div>

        {/* Description et notes */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Informations complémentaires</h2>
          <div className="space-y-4">
            <div><label htmlFor="description" className="block text-sm font-medium mb-2">Description</label><textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} rows={2} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label htmlFor="notes" className="block text-sm font-medium mb-2">Notes (mentions légales, etc.)</label><textarea id="notes" value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg" /></div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link href={`/crm/factures/${facture.id}`} className="px-6 py-2.5 border rounded-lg">Annuler</Link>
          <button type="submit" disabled={processing || data.lignes.length === 0} className="px-6 py-2.5 bg-[#B08D57] text-white rounded-lg disabled:opacity-50 flex items-center"><Save className="h-4 w-4 mr-2" />{processing ? 'Mise à jour...' : 'Mettre à jour'}</button>
        </div>
      </form>
    </CrmLayout>
  );
};

export default Edit;