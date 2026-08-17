import React from 'react';
import CrmLayout from '@/Layouts/CrmLayout';

interface Emplacement {
  id: number;
  code: string;
  code_complet: string;
  nom: string;
  type: string;
  capacite: number | null;
  occupation: number;
  occupation_rate: number;
  statut: string;
}

interface Props {
  emplacements: Emplacement[];
}

export default function Emplacements({ emplacements }: Props) {
  return (
    <CrmLayout title="Emplacements d'archives">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Emplacements d'archives</h1>
        <p className="text-gray-500 font-light">Suivi des armoires, boîtes et emplacements physiques.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Occupation</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {emplacements.map((emplacement) => (
                <tr key={emplacement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{emplacement.code_complet || emplacement.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{emplacement.nom}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">{emplacement.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {emplacement.occupation} / {emplacement.capacite ?? '-'}
                    <span className="ml-2 text-gray-400">({emplacement.occupation_rate}%)</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{emplacement.statut}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CrmLayout>
  );
}
