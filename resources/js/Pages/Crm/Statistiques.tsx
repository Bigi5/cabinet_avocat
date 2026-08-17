import React from 'react';
import CrmLayout from '@/Layouts/CrmLayout';
import { BarChart3, TrendingUp, PieChart, Download } from 'lucide-react';

const Statistiques = () => {
  return (
    <CrmLayout title="Statistiques">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Statistiques</h1>
        <p className="text-gray-500 font-light">Analysez les performances de votre cabinet</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Module en construction</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Les statistiques détaillées seront disponibles prochainement.
        </p>
        <button className="mt-6 px-4 py-2 bg-[#B08D57] text-white rounded-lg hover:bg-[#9c7a4a] inline-flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Exporter les données
        </button>
      </div>
    </CrmLayout>
  );
};

export default Statistiques;