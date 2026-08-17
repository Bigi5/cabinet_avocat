// resources/js/Pages/services/Specialises.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { 
  ArrowLeft, Users, Building, Scale, FileSearch,
  PhoneCall, Mail, MapPin, ChevronRight, CheckCircle, 
  Cpu, Shield, Zap, Target, Award, 
  Lock, Monitor, Cloud, Database, Key,
  Clock, BarChart, Upload, Search, Calendar,
  ArrowRight
} from "lucide-react";

const Specialises = () => {
  const services = [
    {
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Constat Électronique",
      text: "Preuves digitalisées avec valeur juridique : capture d'écran, pages web, publications sociales.",
      details: [
        "Capture de sites web et réseaux sociaux",
        "Horodatage certifié électronique",
        "Procès-verbal de constat numérique",
        "Intégrité des preuves garantie par blockchain"
      ],
      legal: "Valeur probante renforcée - Article 5 décret 2006-422",
      technologie: "Blockchain + Horodatage certifié",
      icon: Monitor
    },
    {
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Télésignification",
      text: "Envoi sécurisé d'actes par voie électronique conformément aux autorisations légales.",
      details: [
        "Plateforme sécurisée de transmission",
        "Accusé de réception électronique signé",
        "Traçabilité complète de l'envoi",
        "Archivage numérique des preuves"
      ],
      legal: "Autorisé par la loi n°2017-20 du 20 avril 2017",
      technologie: "Signature électronique qualifiée",
      icon: Upload
    },
    {
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Certification de Date Certaine", 
      text: "Attestation officielle de l'existence d'un document à une date donnée.",
      details: [
        "Horodatage légal de documents",
        "Conservation sécurisée des originaux",
        "Certificat de conformité délivré",
        "Valeur probante devant les tribunaux"
      ],
      legal: "Article 1328 du Code civil OHADA révisé",
      technologie: "Horodatage certifié + Archivage",
      icon: Calendar
    },
    {
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Portail Client en Ligne",
      text: "Suivi dématérialisé des dossiers et téléchargement sécurisé des actes.",
      details: [
        "Tableau de bord personnalisé",
        "Accès 24h/24 aux documents",
        "Notifications en temps réel",
        "Messagerie sécurisée intégrée"
      ],
      legal: "RGPD conforme - Sécurité ISO 27001",
      technologie: "Cloud sécurisé + Chiffrement AES-256",
      icon: Cloud
    },
    {
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Médiation Conventionnelle Digitale",
      text: "Résolution des conflits à distance via plateforme sécurisée de visioconférence.",
      details: [
        "Salles de visioconférence chiffrées",
        "Échange de documents sécurisé",
        "Signature électronique des accords",
        "Suivi post-médiation digital"
      ],
      legal: "Loi n°2017-20 - Médiation conventionnelle",
      technologie: "Visioconférence E2E chiffrée",
      icon: Users
    },
    {
      image: "https://images.unsplash.com/photo-1551135049-8a33b2f5c0f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Audit de Sécurité Numérique",
      text: "Évaluation des risques cyber et conformité RGPD pour les professionnels.",
      details: [
        "Analyse des vulnérabilités",
        "Conformité RGPD et loi informatique",
        "Recommandations de sécurisation",
        "Attestation d'audit délivrée"
      ],
      legal: "RGPD - Loi n°2017-20",
      technologie: "Outils certifiés ANSSI",
      icon: Shield
    }
  ];

  const technologies = [
    "Blockchain pour l'intégrité des preuves",
    "Signature électronique qualifiée (eIDAS)",
    "Chiffrement de bout en bout (E2EE)",
    "Horodatage certifié légal",
    "Cloud souverain et sécurisé",
    "Authentification à deux facteurs",
    "Archivage électronique à valeur probante",
    "APIs sécurisées pour l'intégration"
  ];

  const certifications = [
    {
      nom: "ISO 27001",
      domaine: "Sécurité de l'information",
      validite: "2023-2026",
      icon: Shield
    },
    {
      nom: "eIDAS",
      domaine: "Services de confiance électronique",
      validite: "Certification européenne",
      icon: Lock
    },
    {
      nom: "RGPD",
      domaine: "Protection des données",
      validite: "Conforme depuis 2018",
      icon: Database
    },
    {
      nom: "ANSSI",
      domaine: "Sécurité des systèmes",
      validite: "Prestataire qualifié",
      icon: Key
    }
  ];

  const avantages = [
    {
      titre: "Délais Réduits",
      valeur: "-40%",
      description: "Temps de traitement moyen",
      icon: Clock
    },
    {
      titre: "Disponibilité",
      valeur: "24h/24",
      description: "Accès aux services",
      icon: Zap
    },
    {
      titre: "Traçabilité",
      valeur: "100%",
      description: "Opérations tracées",
      icon: BarChart
    },
    {
      titre: "Sécurité",
      valeur: "AES-256",
      description: "Chiffrement des données",
      icon: Lock
    }
  ];

  const casUsage = [
    {
      icon: Search,
      title: "Constat de diffamation en ligne",
      description: "Un chef d'entreprise victime de diffamation sur les réseaux sociaux fait constater les publications par notre service de constat électronique.",
      resultat: "Preuves horodatées utilisées avec succès devant le tribunal"
    },
    {
      icon: Cloud,
      title: "Médiation commerciale internationale",
      description: "Deux entreprises situées dans différents pays résolvent leur litige commercial via notre plateforme de médiation digitale sécurisée.",
      resultat: "Accord signé électroniquement en 2 semaines, sans déplacement"
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2A4A]/20 to-[#1a3a5f]/20" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <Link href="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8">
              <ArrowLeft className="w-4 h-4" /> Retour aux services
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B2A4A] to-[#1a3a5f] flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-serif font-bold">Services Spécialisés & Modernes</h1>
                <p className="text-xl text-white/90 mt-2 max-w-3xl">
                  L'innovation juridique au service des défis contemporains - Expertise numérique certifiée
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xl text-gray-700 mb-8">
                À l'ère de la transformation numérique, notre cabinet combine expertise traditionnelle d'huissier 
                et technologies innovantes pour vous offrir des solutions adaptées aux défis juridiques contemporains.
              </p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0B2A4A]/10 to-[#B08D57]/10 px-6 py-3 rounded-full">
                <Target className="w-5 h-5 text-[#B08D57]" />
                <span className="text-[#0B2A4A] font-semibold">Innovation & Excellence numérique depuis 2010</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Colonne gauche - Services */}
            <div className="lg:col-span-2 space-y-16">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="space-y-8">
                    {/* Image */}
                    <div className="overflow-hidden rounded-2xl shadow-2xl">
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    
                    {/* Titre et icône */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-8 h-8 text-[#0B2A4A]" />
                      </div>
                      <h2 className="text-3xl font-serif font-bold text-[#0B2A4A]">
                        {service.title}
                      </h2>
                    </div>
                    
                    {/* Description */}
                    <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                      <p>{service.text}</p>
                      
                      {/* Détails */}
                      <div className="space-y-3 mt-6">
                        {service.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-[#B08D57] flex-shrink-0" />
                            <span className="text-gray-700">{detail}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Cadre légal et technologie */}
                      <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-200">
                        <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Scale className="w-4 h-4 text-[#0B2A4A]" />
                            <span className="font-semibold text-[#0B2A4A]">Cadre légal</span>
                          </div>
                          <p className="text-gray-600 text-sm">{service.legal}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Cpu className="w-4 h-4 text-[#0B2A4A]" />
                            <span className="font-semibold text-[#0B2A4A]">Technologie</span>
                          </div>
                          <p className="text-gray-600 text-sm">{service.technologie}</p>
                        </div>
                      </div>
                    </div>
                    
                    {index < services.length - 1 && (
                      <div className="pt-8 border-t border-gray-200"></div>
                    )}
                  </div>
                );
              })}

              {/* Statistiques */}
              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-serif font-bold text-[#0B2A4A] mb-8">Nos avantages en chiffres</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {avantages.map((avantage, index) => {
                    const Icon = avantage.icon;
                    return (
                      <div key={index} className="bg-white p-6 rounded-2xl shadow-lg text-center border border-gray-100">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B2A4A] to-[#1a3a5f] flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold text-[#0B2A4A] mb-1">{avantage.valeur}</div>
                        <h4 className="text-base font-bold text-[#0B2A4A] mb-1">{avantage.titre}</h4>
                        <p className="text-gray-600 text-xs">{avantage.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technologies */}
              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-serif font-bold text-[#0B2A4A] mb-8">Technologies maîtrisées</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {technologies.map((tech, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-[#0B2A4A] text-white flex items-center justify-center flex-shrink-0">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <span className="text-gray-700 font-medium text-sm">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cas d'usage */}
              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-serif font-bold text-[#0B2A4A] mb-8">Cas d'usage concrets</h3>
                <div className="space-y-6">
                  {casUsage.map((cas, index) => {
                    const Icon = cas.icon;
                    return (
                      <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[#0B2A4A]" />
                          </div>
                          <h4 className="text-xl font-bold text-[#0B2A4A]">{cas.title}</h4>
                        </div>
                        <p className="text-gray-600 mb-3 text-sm">{cas.description}</p>
                        <div className="text-sm text-gray-500">
                          <span className="font-semibold text-[#B08D57]">Résultat :</span> {cas.resultat}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-8">
              {/* Tous les services */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <h3 className="text-2xl font-serif font-bold text-[#0B2A4A] mb-6">Tous les services</h3>
                <div className="w-20 h-1 bg-[#B08D57] rounded-full mb-8" />
                <div className="space-y-6">
                  {[
                    { title: "Services Pour Les Particuliers", icon: Users, link: "/services/particuliers" },
                    { title: "Services Pour Les Entreprises", icon: Building, link: "/services/entreprises" },
                    { title: "Services Pour Les Professionnels", icon: Scale, link: "/services/professionnels" },
                    { title: "Services Spécialisés", icon: FileSearch, link: "/services/specialises", active: true }
                  ].map((service, i) => (
                    <Link 
                      key={i} 
                      href={service.link}
                      className="group flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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

              {/* Certifications */}
              <div className="bg-gradient-to-br from-[#F7F7F7] to-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <h3 className="text-2xl font-serif font-bold text-[#0B2A4A] mb-6">Certifications & Conformités</h3>
                <div className="space-y-6">
                  {certifications.map((certif, index) => {
                    const Icon = certif.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B2A4A] to-[#1a3a5f] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#0B2A4A]">{certif.nom}</h4>
                          <p className="text-gray-600 text-sm mb-1">{certif.domaine}</p>
                          <div className="text-[#B08D57] text-xs font-medium">{certif.validite}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-br from-[#0B2A4A] to-[#1a3a5f] text-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-serif font-bold mb-6">Comment pouvons-nous vous aider ?</h3>
                <p className="text-white/80 mb-8">Contactez-nous pour découvrir nos solutions innovantes.</p>
                <div className="space-y-6 mb-8">
                  {contactInfo.map((info, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        {info.icon}
                      </div>
                      <div>
                        <div className="font-medium mb-1">{info.title}</div>
                        {info.details.map((d, idx) => <div key={idx} className="text-white/80 text-sm">{d}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#B08D57] to-amber-500 text-white px-8 py-4 rounded-xl font-medium hover:from-amber-500 hover:to-[#B08D57] transition-all duration-300">
                  Demander une démonstration
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Bas */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-serif font-bold text-[#0B2A4A] mb-6">Prêt pour le futur du droit ?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Découvrez comment nos solutions innovantes peuvent transformer votre approche juridique 
              et vous donner un avantage concurrentiel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-gradient-to-r from-[#0B2A4A] to-[#1a3a5f] text-white px-8 py-4 rounded-xl font-medium hover:from-[#1a3a5f] hover:to-[#2a4a7f]">
                Demander un devis personnalisé
              </Link>
              <a href="tel:+2290121045016" className="bg-gradient-to-r from-[#B08D57] to-amber-500 text-white px-8 py-4 rounded-xl font-medium hover:from-amber-500 hover:to-[#B08D57]">
                Service innovation
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Specialises;