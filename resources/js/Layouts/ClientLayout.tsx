// resources/js/Layouts/ClientLayout.tsx
import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Bell,
  Calendar,
  Folder,
  FileText,
  Home,
  User,
  Scale,
  ChevronRight
} from 'lucide-react';

interface ClientLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const ClientLayout = ({ children, title = 'Mon espace' }: ClientLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { auth } = usePage().props as any;
  const user = auth?.user || {
    name: 'Jean Client',
    email: 'jean.client@email.com',
    avatar: null
  };

  // Obtenir les initiales
  const getUserInitials = () => {
    if (!user.name) return 'JC';
    return user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Menu items simplifiés
  const menuItems = [
    { icon: <Home size={20} />, label: 'Tableau de bord', href: '/dashboard' },
    { icon: <Folder size={20} />, label: 'Mes dossiers', href: '/mes-dossiers' },
    { icon: <FileText size={20} />, label: 'Mes documents', href: '/mes-documents' },
    { icon: <Calendar size={20} />, label: 'Rendez-vous', href: '/mes-rendez-vous' },
  ];

  // Récupérer l'URL actuelle
  const { url } = usePage().props as any;
  const currentPath = url || window.location.pathname;

  // Vérifier si un item est actif
  const isActive = (href: string) => {
    return currentPath === href;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header simple */}
      <header className="bg-white h-16 flex items-center px-4 lg:px-6 border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-[#B08D57] flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <div className="ml-2">
              <span className="text-sm font-semibold text-gray-900">Cabinet</span>
              <span className="text-xs text-gray-500 block">Mᵉ Bernadin BOBOE</span>
            </div>
          </Link>

          {/* Actions droite */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-[#B08D57]">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Menu mobile */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-[#B08D57]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Profil desktop */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="w-8 h-8 overflow-hidden rounded-full bg-[#B08D57] flex items-center justify-center">
                  {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : <span className="text-white font-bold text-sm">{getUserInitials()}</span>}
                </div>
                <span className="text-sm font-medium text-gray-700">JC</span>
                <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-100 py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      method="post"
                      href="/logout"
                      as="button"
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <LogOut className="h-3 w-3 mr-2" />
                      Déconnexion
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* En-tête sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-[#B08D57] flex items-center justify-center">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 font-medium text-gray-900">Menu</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profil mobile */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="w-10 h-10 overflow-hidden rounded-full bg-[#B08D57] flex items-center justify-center">
              {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : <span className="text-white font-bold">{getUserInitials()}</span>}
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Client</p>
              <div className="flex items-center mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs text-gray-500">En ligne</span>
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="flex items-center justify-between mt-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Dossiers</p>
              <p className="text-sm font-semibold text-gray-900">6</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Documents</p>
              <p className="text-sm font-semibold text-gray-900">24</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">RDV</p>
              <p className="text-sm font-semibold text-gray-900">2</p>
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm ${
                isActive(item.href) ? 'bg-[#B08D57] text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Déconnexion mobile */}
        <div className="p-4 border-t border-gray-200">
          <Link
            method="post"
            href="/logout"
            as="button"
            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Déconnexion
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;
