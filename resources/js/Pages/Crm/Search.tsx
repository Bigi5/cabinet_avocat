import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Search,
  Users,
  Folder,
  FileText,
  File,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface SearchResult {
  type: 'client' | 'dossier' | 'acte' | 'document';
  id: number;
  title: string;
  subtitle: string;
  url: string;
}

interface SearchProps {
  results: {
    clients: SearchResult[];
    dossiers: SearchResult[];
    actes: SearchResult[];
    documents: SearchResult[];
  };
  query: string;
  total: number;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'client':
      return <Users className="h-5 w-5 text-blue-600" />;
    case 'dossier':
      return <Folder className="h-5 w-5 text-amber-600" />;
    case 'acte':
      return <FileText className="h-5 w-5 text-green-600" />;
    case 'document':
      return <File className="h-5 w-5 text-purple-600" />;
    default:
      return <Search className="h-5 w-5 text-gray-600" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'client':
      return 'Client';
    case 'dossier':
      return 'Dossier';
    case 'acte':
      return 'Acte';
    case 'document':
      return 'Document';
    default:
      return 'Résultat';
  }
};

const SearchResults = ({ results, query, total }: SearchProps) => {
  const allResults = [
    ...results.clients,
    ...results.dossiers,
    ...results.actes,
    ...results.documents,
  ];

  return (
    <CrmLayout title={`Recherche: ${query}`}>
      <div className="space-y-8">
        {/* En-tête */}
        <div className="flex items-center gap-4">
          <Link href="/crm/dashboard" className="p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-light text-gray-900">
              Résultats pour "<span className="font-semibold">{query}</span>"
            </h1>
            <p className="text-gray-500 mt-1">{total} résultat{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Résultats groupés par type */}
        {total === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900">Aucun résultat</h2>
            <p className="text-gray-500 mt-2">Essayez avec d'autres mots-clés</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Clients */}
            {results.clients.length > 0 && (
              <ResultSection
                title="Clients"
                results={results.clients}
                count={results.clients.length}
              />
            )}

            {/* Dossiers */}
            {results.dossiers.length > 0 && (
              <ResultSection
                title="Dossiers"
                results={results.dossiers}
                count={results.dossiers.length}
              />
            )}

            {/* Actes */}
            {results.actes.length > 0 && (
              <ResultSection
                title="Actes"
                results={results.actes}
                count={results.actes.length}
              />
            )}

            {/* Documents */}
            {results.documents.length > 0 && (
              <ResultSection
                title="Documents"
                results={results.documents}
                count={results.documents.length}
              />
            )}
          </div>
        )}
      </div>
    </CrmLayout>
  );
};

const ResultSection = ({ title, results, count }: { title: string; results: SearchResult[]; count: number }) => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{count} résultat{count > 1 ? 's' : ''}</p>
    </div>
    <div className="divide-y divide-gray-100">
      {results.map((result) => (
        <Link
          key={`${result.type}-${result.id}`}
          href={result.url}
          className="px-6 py-4 hover:bg-gray-50 transition-colors group flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {getIcon(result.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{result.title}</p>
              <p className="text-sm text-gray-500 mt-1 truncate">{result.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {getTypeLabel(result.type)}
            </span>
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default SearchResults;
