// resources/js/Pages/services/Particuliers.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { 
  ArrowLeft, Users, Building, Scale, FileSearch,
  PhoneCall, Mail, MapPin, ChevronRight 
} from "lucide-react";

const Particuliers = () => {
  const services = [
    {
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Recouvrement de Créances",
      text: "Récupération de vos créances impayées : loyers, dettes familiales, indemnités diverses. Article 5 du décret 2006-422 - Monopole des huissiers."
    },
    {
      image: "https://images.unsplash.com/photo-1551135049-8a33b2f5c0f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Constat d'Adultère ou de Comportement",
      text: "Preuves matérielles pour les procédures de divorce avec valeur probante devant les tribunaux. Preuve authentique - Valeur probante renforcée."
    },
    {
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Constat de Nuisances",
      text: "Troubles du voisinage : bruit, pollution, troubles de jouissance constatés officiellement. Article 5 décret 2006-422 - Constatations matérielles."
    },
    {
      image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "État des Lieux Contradictoire",
      text: "Location : entrée et sortie des lieux avec inventaire détaillé et contradictoire. Document authentique - Force probante."
    },
    {
      image: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Signification de Mise en Demeure",
      text: "Notification officielle pour rupture de contrat, conflits familiaux ou obligations non respectées. Article 5 - Monopole de signification."
    },
    {
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Exécution de Décisions de Justice",
      text: "Mise en œuvre des décisions judiciaires : expulsion, pension alimentaire, dédommagements. Officier public - Pouvoir d'exécution forcée."
    },
    {
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Médiation Familiale ou de Voisinage",
      text: "Résolution amiable des conflits avant toute procédure judiciaire. Médiation conventionnelle encouragée par les réformes."
    }
  ];

  const contactInfo = [
    { icon: <PhoneCall className="w-5 h-5" />, title: 'Téléphone', details: ['+229 0121045016', '+229 0121339492'] },
    { icon: <MapPin className="w-5 h-5" />, title: 'Adresse', details: ['03 BP 3805 Cotonou', 'Bénin'] },
    { icon: <Mail className="w-5 h-5" />, title: 'Email', details: ['etudbob2@yahoo.fr'] }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-[#0B2A4A] via-[#1a3a5f] to-[#0B2A4A] text-white py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Link href="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8">
              <ArrowLeft className="w-4 h-4" /> Retour aux services
            </Link>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6">Services pour les Particuliers</h1>
            <p className="text-xl text-white/90 max-w-2xl">Votre défense juridique personnelle pour protéger vos droits au quotidien</p>
          </div>
        </section>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Colonne gauche - Services */}
            <div className="lg:col-span-2 space-y-16">
              {services.map((service, index) => (
                <div key={index} className="space-y-8">
                  {/* Image */}
                  <div className="overflow-hidden rounded-2xl shadow-2xl">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Titre */}
                  <h2 className="text-3xl font-serif font-bold text-[#0B2A4A]">
                    {service.title}
                  </h2>
                  
                  {/* Texte */}
                  <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                    <p>{service.text}</p>
                  </div>
                  
                  {index < services.length - 1 && (
                    <div className="pt-8 border-t border-gray-200"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Colonne droite */}
            <div className="space-y-8">
              {/* Tous les services */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-serif font-bold text-[#0B2A4A] mb-6">Tous les services</h3>
                <div className="w-20 h-1 bg-[#B08D57] rounded-full mb-8" />
                <div className="space-y-6">
                  {[
                    { title: "Services Pour Les Particuliers", icon: Users, link: "/services/particuliers", active: true },
                    { title: "Services Pour Les Entreprises", icon: Building, link: "/services/entreprises" },
                    { title: "Services Pour Les Professionnels", icon: Scale, link: "/services/professionnels" },
                    { title: "Services Spécialisés", icon: FileSearch, link: "/services/Specialises" }
                  ].map((service, i) => (
                    <Link 
                      key={i} 
                      href={service.link}
                      className="group flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B2A4A]/10 to-[#B08D57]/10 flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-[#0B2A4A]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[#0B2A4A] group-hover:text-[#B08D57]">{service.title}</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${service.active ? 'bg-[#B08D57]' : 'bg-gray-300'}`} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-br from-[#0B2A4A] to-[#1a3a5f] text-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-serif font-bold mb-6">Comment pouvons-nous vous aider ?</h3>
                <p className="text-white/80 mb-8">Contactez-nous pour un accompagnement personnalisé.</p>
                <div className="space-y-6 mb-8">
                  {contactInfo.map((info, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        {info.icon}
                      </div>
                      <div>
                        <div className="font-medium mb-1">{info.title}</div>
                        {info.details.map((d, idx) => <div key={idx} className="text-white/80">{d}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/contact" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-[#B08D57] to-amber-500 text-white px-8 py-4 rounded-xl font-medium hover:from-amber-500 hover:to-[#B08D57] transition-all duration-300">
                  Prendre rendez-vous
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Bas */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-serif font-bold text-[#0B2A4A] mb-6">Besoin d'une assistance immédiate ?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-gradient-to-r from-[#0B2A4A] to-[#1a3a5f] text-white px-8 py-4 rounded-xl font-medium hover:from-[#1a3a5f] hover:to-[#2a4a7f]">
                Demander un devis
              </Link>
              <Link href="tel:+2290121045016" className="bg-gradient-to-r from-[#B08D57] to-amber-500 text-white px-8 py-4 rounded-xl font-medium hover:from-amber-500 hover:to-[#B08D57]">
                Appeler maintenant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Particuliers;