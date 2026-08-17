// resources/js/Pages/Crm/Dashboard.tsx

import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import {
  Users,
  Folder,
  FileText,
  Home,
  CreditCard,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  ChevronRight,
  Search,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Send,
  FileCheck,
} from 'lucide-react';

// ✅ Recharts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from 'recharts';

// ============================================
// TYPES
// ============================================

// ✅ Couleurs professionnelles
const CHART_COLORS = {
  primary: '#B08D57',
  secondary: '#D4B896',
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  orange: '#F59E0B',
  red: '#EF4444',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
};

const CHART_COLORS_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.purple,
  CHART_COLORS.orange,
  CHART_COLORS.red,
  CHART_COLORS.pink,
  CHART_COLORS.indigo,
  CHART_COLORS.teal,
  CHART_COLORS.secondary,
];

interface Kpis {
  dossiers_actifs: number;
  dossiers_clotures: number;
  taux_reussite: number;
  dossiers_par_avocat: number;
  avocats_actifs: number;
  clients_actifs: number;
  actes_en_attente: number;
  documents_total: number;
  echeances_aujourd_hui: number;
  echeances_semaine: number;
  baux_actifs: number;
  loyers_impayes: number;
  factures_impayees: number;
  transmissions_en_attente: number;
  decharges_en_attente: number;
}

interface Stat {
  label: string;
  value: number;
  change: number;
  change_text: string;
  icon: string;
  color: string;
  trend: 'up' | 'down';
}

interface UrgentEcheance {
  id: number;
  title: string;
  reference: string | null;
  date_formatted: string;
  location: string;
  type: string;
  priorite: string;
  statut: string;
  dossier_id: number | null;
  user: string | null;
}

interface RecentActivity {
  id: string;
  action: string;
  detail: string;
  time: string;
  time_formatted: string;
  icon: string;
  color: string;
  user: string | null;
  type: string;
  url: string;
}

interface RecentDossier {
  id: number;
  reference: string;
  titre: string;
  client: string;
  client_id: number;
  statut: string;
  statut_color: string;
  avocat: string;
  avocat_id: number;
  progression: number;
}

interface StatsFinancieres {
  honoraires_encaisses: number;
  factures_payees: number;
  factures_impayees: number;
  taux_recouvrement: number;
  loyers_impayes: number;
  total_encours: number;
}

interface ActiviteData {
  date: string;
  actes: number;
  documents: number;
  echeances: number;
  factures: number;
  transmissions: number;
  total: number;
}

interface ChartsData {
  dossiers_par_mois: Array<{ mois: string; total: number }>;
  honoraires_par_mois: Array<{ mois: string; montant: number }>;
  dossiers_par_statut: Array<{ statut: string; total: number }>;
}

interface DashboardData {
  kpis: Kpis;
  stats: Stat[];
  urgent_echeances: UrgentEcheance[];
  recent_activities: RecentActivity[];
  recent_dossiers: RecentDossier[];
  stats_financieres: StatsFinancieres;
  activite?: ActiviteData[];
  charts: ChartsData;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

interface Auth {
  user: User;
}

interface DashboardProps {
  auth: Auth;
  data: DashboardData;
  user: User;
}

// ============================================
// COMPOSANTS STATISTIQUES
// ============================================

const StatCard = ({ stat }: { stat: Stat }) => {
  const IconComponent = getIcon(stat.icon);
  const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
        </div>
        <div className={`h-12 w-12 rounded-full ${stat.color} flex items-center justify-center`}>
          {IconComponent}
        </div>
      </div>
      <div className="flex items-center mt-3">
        <TrendIcon className={`h-4 w-4 mr-1 ${trendColor}`} />
        <span className={`text-sm font-medium ${trendColor}`}>{stat.change_text}</span>
      </div>
    </div>
  );
};

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    Users: <Users className="h-6 w-6" />,
    Folder: <Folder className="h-6 w-6" />,
    FileText: <FileText className="h-6 w-6" />,
    Home: <Home className="h-6 w-6" />,
    CreditCard: <CreditCard className="h-6 w-6" />,
    AlertCircle: <AlertCircle className="h-6 w-6" />,
    Clock: <Clock className="h-6 w-6" />,
    TrendingUp: <TrendingUp className="h-6 w-6" />,
    TrendingDown: <TrendingDown className="h-6 w-6" />,
    BarChart3: <BarChart3 className="h-6 w-6" />,
    PieChart: <PieChart className="h-6 w-6" />,
    Activity: <Activity className="h-6 w-6" />,
    DollarSign: <DollarSign className="h-6 w-6" />,
    Send: <Send className="h-6 w-6" />,
    FileCheck: <FileCheck className="h-6 w-6" />,
  };
  return icons[iconName] || <FileText className="h-6 w-6" />;
};

const KpiCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Dashboard = ({ auth, data, user }: DashboardProps) => {
  const charts = data.charts ?? {
    dossiers_par_mois: [],
    honoraires_par_mois: [],
    dossiers_par_statut: [],
  };

  const {
    kpis,
    stats,
    urgent_echeances,
    recent_activities,
    recent_dossiers,
    stats_financieres,
    activite,
  } = data;

  return (
    <CrmLayout title="Tableau de bord">
      <Head title="Tableau de bord" />

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-gray-500 font-light">
              Bienvenue, {user.name} :
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/crm/dossiers/create"
              className="px-4 py-2 bg-[#B08D57] text-white rounded-xl hover:bg-[#9a7a4a] transition-colors flex items-center text-sm shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau dossier
            </Link>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard
          label="Dossiers actifs"
          value={kpis.dossiers_actifs}
          icon={<Folder className="h-5 w-5 text-blue-600" />}
          color="bg-blue-100"
        />
        <KpiCard
          label="Taux de réussite"
          value={`${kpis.taux_reussite}%`}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          color="bg-green-100"
        />
        <KpiCard
          label="Clients actifs"
          value={kpis.clients_actifs}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          color="bg-purple-100"
        />
        <KpiCard
          label="Échéances aujourd'hui"
          value={kpis.echeances_aujourd_hui}
          icon={<Clock className="h-5 w-5 text-orange-600" />}
          color="bg-orange-100"
        />
        <KpiCard
          label="Factures impayées"
          value={kpis.factures_impayees}
          icon={<CreditCard className="h-5 w-5 text-red-600" />}
          color="bg-red-100"
        />
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* ✅ Graphiques avec Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique 1: Évolution des dossiers - Line Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-[#B08D57]" />
            Évolution des dossiers
          </h3>
          {charts.dossiers_par_mois && charts.dossiers_par_mois.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={charts.dossiers_par_mois}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mois" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '8px 12px',
                  }}
                  formatter={(value) => [`${Number(value ?? 0)} dossiers`, 'Total']}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.primary }}
                  name="Dossiers"
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="none"
                  fill={`${CHART_COLORS.primary}20`}
                  name=""
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>

        {/* Graphique 2: Répartition par statut - Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-[#B08D57]" />
            Répartition par statut
          </h3>
          {charts.dossiers_par_statut && charts.dossiers_par_statut.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={charts.dossiers_par_statut}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} ${(Number(percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="total"
                  nameKey="statut"
                >
                  {charts.dossiers_par_statut.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS_PALETTE[index % CHART_COLORS_PALETTE.length]} 
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '8px 12px',
                  }}
                  formatter={(value, name) => [`${Number(value ?? 0)} dossiers`, String(name ?? '')]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Graphique 3: Honoraires par mois - Bar Chart */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-[#B08D57]" />
            Évolution des honoraires
          </h3>
          {charts.honoraires_par_mois && charts.honoraires_par_mois.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={charts.honoraires_par_mois}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mois" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '8px 12px',
                  }}
                  formatter={(value) => [`${Number(value ?? 0).toLocaleString()} FCFA`, 'Montant']}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                />
                <Bar
                  dataKey="montant"
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  name="Honoraires"
                >
                  {charts.honoraires_par_mois.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS_PALETTE[index % CHART_COLORS_PALETTE.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Échéances urgentes et Activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Échéances urgentes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Échéances urgentes
            </h3>
            <Link href="/crm/echeances" className="text-sm text-[#B08D57] hover:underline">
              Voir tout
            </Link>
          </div>
          {urgent_echeances.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Aucune échéance urgente</p>
          ) : (
            <div className="space-y-3">
              {urgent_echeances.map((echeance) => (
                <div key={echeance.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{echeance.title}</p>
                    <p className="text-xs text-gray-500">
                      {echeance.reference && `Dossier ${echeance.reference} • `}
                      {echeance.date_formatted}
                    </p>
                  </div>
                  <Link
                    href={`/crm/echeances/${echeance.id}`}
                    className="p-2 text-gray-400 hover:text-[#B08D57] transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-[#B08D57]" />
              Activités récentes
            </h3>
            <Link href="/crm/activites" className="text-sm text-[#B08D57] hover:underline">
              Voir tout
            </Link>
          </div>
          {recent_activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Aucune activité récente</p>
          ) : (
            <div className="space-y-4">
              {recent_activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0`}>
                    {getIcon(activity.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.detail}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{activity.time}</span>
                      {activity.user && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-400">{activity.user}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {activity.url && (
                    <Link href={activity.url} className="text-gray-400 hover:text-[#B08D57]">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dossiers récents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Folder className="h-5 w-5 mr-2 text-[#B08D57]" />
            Dossiers récents
          </h3>
          <Link href="/crm/dossiers" className="text-sm text-[#B08D57] hover:underline">
            Voir tout
          </Link>
        </div>
        {recent_dossiers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Aucun dossier récent</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avocat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recent_dossiers.map((dossier) => (
                  <tr key={dossier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{dossier.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{dossier.client}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${dossier.statut_color}`}>
                        {dossier.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{dossier.avocat}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-1 max-w-[120px] bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#B08D57] h-2 rounded-full"
                            style={{ width: `${dossier.progression}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-600">{dossier.progression}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/crm/dossiers/${dossier.id}`}
                        className="text-[#B08D57] hover:text-[#9c7a4a] transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CrmLayout>
  );
};

export default Dashboard;
