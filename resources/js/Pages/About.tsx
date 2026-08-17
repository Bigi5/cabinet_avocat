// resources/js/Pages/About.tsx
import React from "react";
import AppLayout from "../Layouts/AppLayout";
import { Target, FileCheck, Shield, Users, Award, Briefcase, Scale } from "lucide-react";

const About = () => {
  const missions = [
    {
      title: "Fonctions d'officier public",
      description: "Actes authentiques et exécution des décisions de justice avec l'autorité de la loi.",
      icon: Scale,
      color: "from-blue-100 to-blue-50"
    },
    {
      title: "Fonctions de constats",
      description: "Constats matériels, état des lieux, preuves pour sécuriser vos droits.",
      icon: FileCheck,
      color: "from-amber-100 to-amber-50"
    },
    {
      title: "Fonctions de recouvrement amiable et mandats",
      description: "Recouvrement de créances avec approche négociée pour préserver les relations.",
      icon: Briefcase,
      color: "from-blue-100 to-blue-50"
    },
    {
      title: "Fonctions de conseils et d'assistance",
      description: "Accompagnement juridique personnalisé pour anticiper et résoudre vos litiges.",
      icon: Users,
      color: "from-amber-100 to-amber-50"
    },
    {
      title: "Fonctions d'officier ministériel",
      description: "Signification et notification des actes dans le respect des procédures légales.",
      icon: Award,
      color: "from-blue-100 to-blue-50"
    },
  ];

  const values = [
    {
      title: "Intégrité",
      description: "Nous agissons avec honnêteté et transparence dans toutes nos interventions.",
      icon: Shield
    },
    {
      title: "Expertise",
      description: "Notre maîtrise du droit nous permet de vous offrir des solutions pertinentes.",
      icon: Award
    },
    {
      title: "Engagement",
      description: "Votre succès juridique est notre priorité absolue à chaque étape.",
      icon: Target
    },
  ];

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-r from-[#0B2A4A] to-[#1a3a5f]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-serif text-white mb-6">
            Le Cabinet
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Découvrez notre histoire, nos valeurs et notre engagement
          </p>
        </div>
      </section>

      {/* Section Présentation */}
      <section className="py-24 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-96 bg-gradient-to-br from-[#0B2A4A] to-[#1a3a5f] flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <Scale className="w-20 h-20 mx-auto mb-6" />
                    <h3 className="text-2xl font-serif mb-4">Maître Bernardin BOBOE</h3>
                    <p className="text-white/80">Huissier de Justice</p>
                  </div>
                </div>
              </div>
              {/* Barre décorative */}
              <div className="absolute -left-4 top-8 w-4 h-48 bg-gradient-to-b from-[#B08D57] to-amber-400 rounded-full" />
            </div>

            {/* Texte */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-serif text-[#2E2E2E] mb-8">
                Nous sommes ici pour vous aider
                <span className="block text-[#B08D57]">à résoudre tous vos problèmes</span>
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-700">
                  Que ce soit d'ordre professionnel, personnel ou d'entreprise, notre cabinet met 
                  à votre disposition son expertise juridique pour trouver les solutions les plus 
                  adaptées à votre situation.
                </p>
                <p className="text-lg text-gray-700">
                  Fort de plus de 15 ans d'expérience, Maître Bernardin BOBOE et son équipe 
                  accompagnent chaque client avec rigueur, discrétion et efficacité.
                </p>
                <p className="text-lg text-gray-700">
                  Notre approche allie tradition du métier d'huissier et innovations juridiques 
                  pour vous offrir un service d'excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Missions */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Titre */}
          <div className="flex items-start gap-6 mb-16">
            <div className="w-4 h-40 bg-gradient-to-b from-[#B08D57] to-amber-400 rounded-full" />
            <div>
              <h2 className="text-4xl lg:text-5xl font-serif text-[#2E2E2E] mb-6">
                Nos missions accomplies
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                Notre expertise couvre l'ensemble des missions dévolues aux huissiers de justice, 
                avec une approche sur-mesure pour chaque situation.
              </p>
            </div>
          </div>

          {/* Missions en grille */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {missions.map((mission, index) => {
              const Icon = mission.icon;
              return (
                <div 
                  key={index}
                  className="group relative bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                >
                  {/* Cercle décoratif */}
                  <div className={`absolute -top-4 -right-4 w-32 h-32 rounded-full ${mission.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0B2A4A] to-[#1a3a5f] p-4 mb-6 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-serif text-[#0B2A4A] mb-4">
                      {mission.title}
                    </h3>
                    
                    <p className="text-gray-600">
                      {mission.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Valeurs */}
      <section className="py-24 bg-gradient-to-b from-[#F7F7F7] to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0B2A4A]/5 to-[#B08D57]/5 px-6 py-3 rounded-full mb-6">
              <Target className="w-5 h-5 text-[#B08D57]" />
              <span className="text-[#0B2A4A] font-semibold uppercase tracking-wider">
                Nos valeurs fondamentales
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-serif text-[#0B2A4A] mb-6">
              Ce qui nous guide au quotidien
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-white to-gray-50 mb-6 shadow-lg group-hover:shadow-xl transition-all duration-500">
                    <Icon className="w-12 h-12 text-[#0B2A4A]" />
                  </div>
                  
                  <h3 className="text-2xl font-serif text-[#0B2A4A] mb-4">
                    {value.title}
                  </h3>
                  
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Chiffres */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-4">
              <div className="text-5xl font-bold text-[#0B2A4A]">15+</div>
              <div className="text-lg text-gray-600">Années d'expérience</div>
            </div>
            
            <div className="space-y-4">
              <div className="text-5xl font-bold text-[#0B2A4A]">2500+</div>
              <div className="text-lg text-gray-600">Dossiers traités</div>
            </div>
            
            <div className="space-y-4">
              <div className="text-5xl font-bold text-[#0B2A4A]">98%</div>
              <div className="text-lg text-gray-600">Clients satisfaits</div>
            </div>
            
            <div className="space-y-4">
              <div className="text-5xl font-bold text-[#0B2A4A]">24h</div>
              <div className="text-lg text-gray-600">Réponse garantie</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#0B2A4A] via-[#1a3a5f] to-[#0B2A4A]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-serif text-white mb-6">
            Vous avez une question sur nos services ?
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour discuter de votre situation 
            et vous orienter vers la meilleure solution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-[#B08D57] to-amber-500 text-white px-10 py-4 rounded-xl font-medium hover:from-[#a07a4f] hover:to-amber-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Prendre rendez-vous
            </button>
            
            <button className="border-2 border-white/30 text-white px-10 py-4 rounded-xl font-medium hover:bg-white/10 transition-all duration-300">
              Nous contacter
            </button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default About;