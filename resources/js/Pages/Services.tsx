// resources/js/Pages/Services.tsx
import React from "react";
import AppLayout from "../Layouts/AppLayout";
import { Link } from "@inertiajs/react";
import { 
  User, 
  Building2, 
  Briefcase, 
  Scale,
  ChevronRight,
  FileText,
  Shield,
  Handshake,
  Target,
  Award
} from "lucide-react";

const Services = () => {
  const services = [
    {
      title: "Services Pour Les Particuliers",
      description: "Recouvrement amiable, constats d'huissier, notifications légales et conseils personnalisés pour la gestion de vos litiges quotidiens.",
      icon: User,
      link: "/services/particuliers",
      features: [
        "Recouvrement de créances",
        "Constats matériels",
        "Notifications légales",
        "Conseils juridiques",
        "Médiation familiale"
      ],
      color: "from-blue-100 to-blue-50"
    },
    {
      title: "Services Pour Les Entreprises",
      description: "Contentieux commercial complexe, litige B2B, recouvrement professionnel et exécution forcée de décisions pour protéger vos intérêts.",
      icon: Building2,
      link: "/services/entreprises",
      features: [
        "Contentieux commercial",
        "Droit des sociétés",
        "Recouvrement B2B",
        "Exécution forcée",
        "Audit juridique"
      ],
      color: "from-amber-100 to-amber-50"
    },
    {
      title: "Services Pour Les Professionnels Du Droit",
      description: "Expertise juridique avancée, conseils stratégiques aux professionnels du droit et accompagnement dédié pour les dossiers complexes.",
      icon: Scale,
      link: "/services/professionnels",
      features: [
        "Consultation stratégique",
        "Audit juridique",
        "Formation continue",
        "Représentation",
        "Expertise technique"
      ],
      color: "from-blue-100 to-blue-50"
    },
    {
      title: "Services Spécialisés Et Modernes",
      description: "Solutions innovantes adaptées aux défis juridiques contemporains avec une approche technologique et une réactivité exceptionnelle.",
      icon: Briefcase,
      link: "/services/Specialises",
      features: [
        "Droit numérique",
        "Protection des données",
        "E-commerce",
        "Contentieux international",
        "Médiation digitale"
      ],
      color: "from-amber-100 to-amber-50"
    },
  ];

  const specialties = [
    {
      title: "Recouvrement",
      description: "Amiable et judiciaire avec respect des délais légaux",
      icon: Handshake,
      count: "500+"
    },
    {
      title: "Constats",
      description: "Matériels, état des lieux, preuves pour sécuriser vos droits",
      icon: FileText,
      count: "300+"
    },
    {
      title: "Contentieux",
      description: "Commercial, civil, familial avec expertise pointue",
      icon: Scale,
      count: "200+"
    },
    {
      title: "Conseils",
      description: "Stratégiques et préventifs pour anticiper les risques",
      icon: Target,
      count: "150+"
    },
  ];

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-r from-[#0B2A4A] to-[#1a3a5f]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-serif text-white mb-6">
            Nos services
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Des solutions juridiques adaptées à chaque besoin
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-24 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Titre avec barre */}
            <div>
              <div className="flex items-start gap-6 mb-8">
                <div className="w-4 h-40 bg-gradient-to-b from-[#B08D57] to-amber-400 rounded-full" />
                <div>
                  <h2 className="text-4xl lg:text-5xl font-serif text-[#2E2E2E] mb-6">
                    Le domaine où nous exerçons notre droit
                  </h2>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xl text-gray-700 mb-8">
                Forts de plus de 15 ans d'expérience, nous mettons notre expertise 
                au service des particuliers, entreprises et professionnels du droit 
                pour des solutions efficaces et pérennes.
              </p>
              <p className="text-lg text-gray-600">
                Notre cabinet allie tradition du métier d'huissier et innovations 
                juridiques pour répondre aux défis contemporains avec rigueur 
                et créativité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                >
                  {/* Card content */}
                  <div className="p-8 h-full flex flex-col">
                    {/* En-tête avec icône */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-24 h-24 rounded-2xl ${service.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-12 h-12 text-[#0B2A4A]" />
                      </div>
                      {/* Bouton en bas maintenant */}
                    </div>

                    {/* Titre */}
                    <h3 className="text-2xl lg:text-3xl font-serif text-[#0B2A4A] mb-4">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-8">
                      {service.description}
                    </p>

                    {/* Liste des fonctionnalités */}
                    <div className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#B08D57]" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bouton "En savoir plus" en bas */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                      <Link
                        href={service.link}
                        className="inline-flex items-center justify-between w-full group/btn bg-gradient-to-r from-[#0B2A4A]/5 to-[#B08D57]/5 hover:from-[#0B2A4A]/10 hover:to-[#B08D57]/10 text-[#0B2A4A] font-medium px-6 py-4 rounded-xl transition-all duration-300"
                      >
                        <span>En savoir plus</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm opacity-80">Découvrir</span>
                          <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Ligne décorative */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-[#B08D57] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Spécialités */}
      <section className="py-24 bg-gradient-to-b from-[#F7F7F7] to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0B2A4A]/5 to-[#B08D57]/5 px-6 py-3 rounded-full mb-6">
              <Award className="w-5 h-5 text-[#B08D57]" />
              <span className="text-[#0B2A4A] font-semibold uppercase tracking-wider">
                Nos domaines d'excellence
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-serif text-[#0B2A4A] mb-6">
              Des chiffres qui parlent
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {specialties.map((specialty, index) => {
              const Icon = specialty.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-white flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-10 h-10 text-[#0B2A4A]" />
                  </div>
                  
                  <div className="text-3xl font-bold text-[#0B2A4A] mb-2">
                    {specialty.count}
                  </div>
                  
                  <h3 className="text-xl font-serif text-[#0B2A4A] mb-3">
                    {specialty.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {specialty.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Processus */}
      <section className="py-20 bg-gradient-to-r from-[#0B2A4A] to-[#1a3a5f] text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            Comment procédons-nous ?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                <div className="text-2xl font-bold text-[#B08D57]">1</div>
              </div>
              <h3 className="text-xl font-serif">Analyse</h3>
              <p className="text-white/80">Évaluation complète de votre situation</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                <div className="text-2xl font-bold text-[#B08D57]">2</div>
              </div>
              <h3 className="text-xl font-serif">Stratégie</h3>
              <p className="text-white/80">Plan d'action sur-mesure</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                <div className="text-2xl font-bold text-[#B08D57]">3</div>
              </div>
              <h3 className="text-xl font-serif">Exécution</h3>
              <p className="text-white/80">Mise en œuvre rigoureuse</p>
            </div>
          </div>
          
          <div className="mt-12">
            <Link
              href="/contact"
              className="bg-[#B08D57] hover:bg-[#a07a4f] text-white px-10 py-4 rounded-lg font-medium inline-flex items-center gap-2 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Demander un devis personnalisé
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Services;