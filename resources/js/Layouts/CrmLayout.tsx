// resources/js/Layouts/CrmLayout.tsx
import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import NotificationDropdown from '@/Components/Notifications/NotificationDropdown';



import {
  LayoutDashboard,
  Users,
  Folder,
  FileText,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  FileCheck,
  Clock,
  Building,
  ChevronDown,
  User,
  Settings,
  Mail,
  Home,
  CreditCard,
  Send,
  BarChart3,
  Archive
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface Notification {
  title?: string;
  message?: string;
  time?: string;
  type?: string;
}

interface User {
  name: string;
  email: string;
  role?: string;
  type?: string;
  avatar_url?: string | null;
}

interface Auth {
  user: User;
}

interface PageProps {
  [key: string]: unknown;
  auth: Auth;
  crm_permissions?: string[];
  notifications?: Notification[];
  url?: string;
}

interface CrmLayoutProps {
  children: React.ReactNode;
  title?: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const CrmLayout = ({ children, title = 'Tableau de bord' }: CrmLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { auth, crm_permissions: crmPermissions = [], notifications: notifsProp, url } = usePage<PageProps>().props;
  
  const notifications = notifsProp ?? [];
  const currentPath = url ?? '';

  const user = auth?.user || {
    name: 'Utilisateur',
    email: 'user@cabinet.com',
    role: 'Utilisateur',
    avatar_url: null
  };

  const userRole = user.role ?? user.type ?? 'Utilisateur';

  // Menu items
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', href: '/crm/dashboard', permission: 'crm.dashboard' },
    { icon: <Users size={20} />, label: 'Clients', href: '/crm/clients', permission: 'crm.clients' },
    { icon: <Folder size={20} />, label: 'Dossiers', href: '/crm/dossiers', permission: 'crm.dossiers' },
    { icon: <FileCheck size={20} />, label: 'Actes / procédures', href: '/crm/actes', permission: 'crm.actes' },
    { icon: <FileText size={20} />, label: 'Documents', href: '/crm/documents', permission: 'crm.documents' },
    { icon: <Clock size={20} />, label: 'Échéances', href: '/crm/echeances', permission: 'crm.echeances' },
    { icon: <Home size={20} />, label: 'Baux & Loyers', href: '/crm/baux', permission: 'crm.baux' },
    { icon: <CreditCard size={20} />, label: 'Factures', href: '/crm/factures', permission: 'crm.factures' },
    { icon: <Send size={20} />, label: 'Transmissions', href: '/crm/transmissions', permission: 'crm.transmissions' },
    { icon: <Archive size={20} />, label: 'Archives', href: '/crm/archives', permission: 'crm.archives' },
    { icon: <Building size={20} />, label: 'Utilisateurs', href: '/crm/utilisateurs', permission: 'crm.utilisateurs' },
    { icon: <BarChart3 size={20} />, label: 'Statistiques', href: '/crm/statistiques', permission: 'crm.statistiques' },
  ];

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  const getUserInitials = () =>
    user.name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'MB';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white h-20 flex items-center px-6 lg:px-8 border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/crm/dashboard" className="flex items-center">
            <div className="w-64">
              <img 
                src="/images/logo.png" 
                alt="Cabinet Maître Bernadin BOBOE"
                className="h-48 w-auto object-contain" 
                onError={({ currentTarget }) => {
                  const target = currentTarget;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.logo-fallback');
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'block';
                  }
                }}
              />
              <div className="logo-fallback hidden">
                <h1 className="text-2xl font-bold text-gray-900">CABINET</h1>
                <h2 className="text-lg font-semibold text-gray-700">MAÎTRE BERNADIN BOBOE</h2>
              </div>
            </div>
          </Link>
          
          {/* Search bar */}
          <div className="hidden lg:block relative flex-1 max-w-xl mx-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57]/20 focus:border-[#B08D57] transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm"
              placeholder="Rechercher dossier, actes, baux..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.get('/crm/search', {
                    q: searchQuery.trim(),
                  });
                }
              }}
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button 
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-[#B08D57] hover:bg-gray-100" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          <div className="relative">

  <button
    onClick={() => setNotificationsOpen(!notificationsOpen)}
    className="relative p-2 text-gray-600 hover:text-[#B08D57] hover:bg-gray-100 rounded-lg transition-colors"
  >
    <Bell className="h-5 w-5" />

    {notifications.length > 0 && (
      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
        {notifications.length}
      </span>
    )}
  </button>

  {notificationsOpen && (
    <NotificationDropdown
      notifications={notifications}
    />
  )}

</div>
            {/* User profile */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)} 
                className="flex items-center space-x-3 focus:outline-none hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="w-8 h-8 overflow-hidden rounded-full bg-[#B08D57] flex items-center justify-center">
                  {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : <span className="text-white font-bold text-sm">{getUserInitials()}</span>}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 hidden lg:block transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-50 border border-gray-100 py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                        <User className="h-4 w-4 mr-3 text-gray-400" /> Mon profil
                      </Link>
                      <Link href="/settings" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                        <Settings className="h-4 w-4 mr-3 text-gray-400" /> Paramètres
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <Link 
                        method="post" 
                        href="/logout" 
                        as="button" 
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <LogOut className="h-4 w-4 mr-3" /> Déconnexion
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-20">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-20 left-0 bottom-0 z-40 w-72 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col shadow-lg border-r border-gray-200
        `}>
          {/* Close button mobile */}
          <div className="flex justify-end lg:hidden p-4 border-b border-gray-200">
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md text-gray-600 hover:text-[#B08D57] hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User profile in sidebar */}
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-[#B08D57]/5 to-transparent">
            <div className="flex items-center">
              <div className="relative">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-[#B08D57] flex items-center justify-center">
                  {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : <span className="text-white font-bold text-base">{getUserInitials()}</span>}
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
              </div>
              <div className="ml-3">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Navigation title */}
          <div className="px-5 py-3 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu principal</h3>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems
            .filter((item) => !item.permission || crmPermissions.includes(item.permission))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive(item.href)
                    ? 'bg-[#B08D57] text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-[#B08D57] hover:text-white'
                  }
                `}
              >
                <div className={`${isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                  {item.icon}
                </div>
                <span className="ml-3 text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Support section */}
          <div className="mt-auto px-4 py-4 border-t border-gray-200 bg-gray-50">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-full bg-[#B08D57]/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-[#B08D57]" />
                </div>
                <h4 className="ml-2 text-sm font-semibold text-gray-900">Support</h4>
              </div>
              <p className="text-xs text-gray-500 mb-2">Besoin d'aide ? Contactez-nous</p>
              <button className="w-full py-1.5 bg-[#B08D57] text-white text-xs rounded-lg hover:bg-[#9c7a4a] transition-colors">
                Contacter
              </button>
            </div>
            <div className="mt-3">
              <Link 
                method="post" 
                href="/logout" 
                as="button" 
                className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" /> Déconnexion
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-5rem)] bg-gray-50 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CrmLayout;
