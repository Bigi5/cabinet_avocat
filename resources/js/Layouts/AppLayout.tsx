// AppLayout.tsx - Version corrigée
import React from 'react';
import { Link } from '@inertiajs/react';
import { 
  MapPin, Phone, Mail, Globe
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  // Option 1: Supprimez complètement la vérification d'authentification
  // OU Option 2: Gardez-la mais gérez le cas où user est undefined

  return (
    <div className="w-full font-sans text-gray-900 antialiased">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="relative">
                <img 
                  src="/images/logo.png" 
                  alt="Cabinet Juridique - Logo" 
                  className="h-12 md:h-14 object-contain brightness-105 contrast-105"
                  style={{ 
                    maxWidth: '220px',
                    height: 'auto',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))'
                  }}
                />
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors duration-300 relative group text-base"
              >
                Accueil
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#B08D57] group-hover:w-full transition-all duration-300"></span>
              </Link>
              
              <Link
                href="/le-cabinet"
                className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors duration-300 relative group text-base"
              >
                Le cabinet
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#B08D57] group-hover:w-full transition-all duration-300"></span>
              </Link>
              
              <Link
                href="/services"
                className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors duration-300 relative group text-base"
              >
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#B08D57] group-hover:w-full transition-all duration-300"></span>
              </Link>
              
              <Link
                href="/contact"
                className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors duration-300 relative group text-base"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#B08D57] group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              {/* SUPPRIMEZ ou CORRIGEZ cette partie */}
              {/* 
              {user ? (
                <div className="flex items-center gap-5">
                  <div className="hidden md:flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B08D57] to-amber-400 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[#0B2A4A] font-medium text-base">
                      {user.name || 'Mon compte'}
                    </span>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="bg-gradient-to-r from-[#0B2A4A] to-[#1a3a5f] text-white px-5 py-2 rounded-md font-medium hover:from-[#1a3a5f] hover:to-[#2a4a7f] transition-all duration-300 shadow-md hover:shadow-lg text-base"
                  >
                    Tableau de bord
                  </Link>
                  
                  <form method="POST" action="/logout" className="hidden md:block">
                    <button
                      type="submit"
                      className="flex items-center gap-2 text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors duration-300 text-base"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </form>
                </div>
              ) : null}
              */}
              
              {/* À LA PLACE, gardez seulement le lien "Prendre rendez-vous" */}
              <Link
                href="/contact"
                className="bg-gradient-to-r from-[#B08D57] to-[#c9a86a] text-white px-5 py-2 rounded-md font-medium hover:from-[#a07a4f] hover:to-[#b8945a] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-base"
              >
                Prendre rendez-vous
              </Link>
              
              {/* Option: Ajoutez un lien vers l'espace client */}
              <Link
                href="/login"
                className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors duration-300 text-base hidden md:block"
              >
                Espace client
              </Link>
            </div>
          </div>
          
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors py-2 text-base">
                Accueil
              </Link>
              <Link href="/le-cabinet" className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors py-2 text-base">
                Le cabinet
              </Link>
              <Link href="/services" className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors py-2 text-base">
                Services
              </Link>
              <Link href="/contact" className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors py-2 text-base">
                Contact
              </Link>
              
              <div className="pt-2 border-t border-gray-100">
                {/* SUPPRIMEZ cette partie aussi */}
                {/* 
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors py-2 block text-base">
                      Tableau de bord
                    </Link>
                    <form method="POST" action="/logout">
                      <button
                        type="submit"
                        className="text-[#0B2A4A] font-medium hover:text-[#B08D57] transition-colors py-2 w-full text-left text-base"
                      >
                        Déconnexion
                      </button>
                    </form>
                  </>
                ) : null}
                */}
                
                
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen">
        {children}
      </main>

      <footer className="bg-gradient-to-b from-[#0B2A4A] to-[#1a3a5f] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">Cabinet Maître Bernadin BOBOE</h3>
            <p className="mt-3 text-sm leading-6 text-slate-200 max-w-md">
              Un cabinet juridique à votre service, spécialisé en droit immobilier, droit des affaires et accompagnement des particuliers.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Navigation</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li><Link href="/" className="hover:text-white">Accueil</Link></li>
              <li><Link href="/le-cabinet" className="hover:text-white">Le cabinet</Link></li>
              <li><Link href="/services" className="hover:text-white">Services</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Contact</h4>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 12 Rue du Cabinet, Abidjan</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +225 01 23 45 67 89</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@cabinet-bobo.com</p>
              <p className="flex items-center gap-2"><Globe className="h-4 w-4" /> www.cabinet-bobo.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;