// src/pages/Home.tsx
import React from "react";
import { Link } from "@inertiajs/react";
import AppLayout from "../Layouts/AppLayout";
import { 
  Clock, 
  Shield, 
  Users, 
  Award,
  Building2,
  Briefcase,
  User,
  ChevronRight,
  Quote,
  Star,
  CheckCircle,
  FileCheck,
  Scale
} from "lucide-react";

const Home = () => {
  const aboutCards = [
    {
      title: "Expertise juridiquement reconnue",
      text: "Notre équipe maîtrise toutes les procédures légales pour vous accompagner efficacement.",
      icon: Scale,
      color: "from-blue-600 to-blue-800"
    },
    {
      title: "Respect strict des délais légaux",
      text: "Nous garantissons un suivi rigoureux pour que vos affaires avancent rapidement.",
      icon: Clock,
      color: "from-amber-600 to-amber-800"
    },
    {
      title: "Accompagnement personnalisé",
      text: "Chaque client bénéficie d'un suivi sur-mesure, adapté à ses besoins spécifiques.",
      icon: Users,
      color: "from-blue-800 to-blue-900"
    },
    {
      title: "Confidentialité assurée",
      text: "Vos données et dossiers sont traités avec la plus grande discrétion et sécurité.",
      icon: Shield,
      color: "from-amber-700 to-amber-900"
    },
  ];

  const services = [
    {
      title: "Services Particuliers",
      text: "Recouvrement amiable et judiciaire, constats d'huissier, notifications légales et conseils personnalisés.",
      icon: User,
      link: "/services/particuliers",
      features: ["Recouvrement", "Constats", "Notifications", "Conseils"]
    },
    {
      title: "Services Entreprises",
      text: "Contentieux commercial complexe, litige B2B, recouvrement professionnel et exécution forcée.",
      icon: Building2,
      link: "/services/entreprises",
      features: ["Contentieux", "Litige commercial", "Recouvrement B2B"]
    },
    {
      title: "Services Professionnels",
      text: "Expertise juridique avancée, conseils stratégiques et accompagnement dédié pour les dossiers complexes.",
      icon: Briefcase,
      link: "/services/professionnels",
      features: ["Expertise", "Conseils stratégiques", "Accompagnement"]
    },
  ];

  const testimonials = [
    {
      name: "John Doe",
      text: "Un service rapide, efficace et d'une grande professionnalité. Mes dossiers ont été traités avec une rigueur exemplaire.",
      role: "Directeur d'entreprise",
      initials: "JD",
      color: "bg-blue-100"
    },
    {
      name: "Jules V.",
      text: "Nous avons récupéré nos créances rapidement tout en préservant nos relations commerciales. Expertise remarquable.",
      role: "Gérant de PME",
      initials: "JV",
      color: "bg-amber-100"
    },
    {
      name: "Sophie L.",
      text: "Je recommande vivement ce cabinet pour son sérieux, sa disponibilité et son accompagnement personnalisé de qualité.",
      role: "Professionnelle libérale",
      initials: "SL",
      color: "bg-blue-100"
    },
  ];

  const stats = [
    { value: "15+", label: "Années d'expérience", icon: Award },
    { value: "2500+", label: "Dossiers traités", icon: FileCheck },
    { value: "98%", label: "Clients satisfaits", icon: Star },
    { value: "24h", label: "Réponse garantie", icon: CheckCircle },
  ];

  return (
    <AppLayout>
      {/* HERO */}
      <section
        className="relative min-h-[80vh] flex flex-col justify-center px-6 lg:px-16 text-white"
        style={{
          backgroundImage: "linear-gradient(rgba(11, 42, 74, 0.9), rgba(11, 42, 74, 0.8)), url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2070&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-serif mb-4 drop-shadow-lg">
            Cabinet d'huissiers de justice
          </h2>
          <h3 className="text-2xl lg:text-3xl font-serif mb-6 drop-shadow-lg text-[#B08D57]">
            Rigueur, efficacité et confiance
          </h3>
          <p className="text-lg lg:text-xl max-w-[600px] drop-shadow-lg mb-8">
            Votre partenaire juridique de confiance, au service des particuliers 
            et entreprises depuis plus de 15 ans.
          </p>
          <Link
            href="/contact"
            className="bg-[#B08D57] hover:bg-[#a07a4f] px-8 py-4 rounded-lg text-white font-medium inline-flex items-center gap-2 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Prendre rendez-vous
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* STATISTIQUES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <div className="text-4xl font-bold text-[#0B2A4A] mb-2">{stat.value}</div>
                  <div className="text-gray-600 flex items-center justify-center gap-2">
                    <Icon className="w-5 h-5 text-[#B08D57]" />
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-[#F7F7F7] py-20 px-6 lg:px-16">
        <h2 className="text-4xl font-serif text-[#0B2A4A] mb-12 text-center">
          À Propos de notre cabinet
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {aboutCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${card.color} p-4 mb-6 mx-auto flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-serif text-[#0B2A4A] mb-3 text-center">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-center">{card.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-[#0B2A4A] py-20 px-6 lg:px-16 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif text-center mb-12">Nos services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <Link
                  key={i}
                  href={service.link}
                  className="bg-white p-8 rounded-xl text-[#0B2A4A] hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#0B2A4A] to-[#1a3a5f] p-5 mb-6 mx-auto flex items-center justify-center">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-serif mb-4 text-center">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 text-center">{service.text}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {service.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#F7F7F7] py-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif text-[#0B2A4A] text-center mb-12">
            Témoignages de nos clients
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((client, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 rounded-full ${client.color} flex items-center justify-center mr-4`}>
                    <span className="text-xl font-serif font-bold text-[#0B2A4A]">
                      {client.initials}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-serif text-[#0B2A4A]">{client.name}</h4>
                    <p className="text-gray-500 text-sm">{client.role}</p>
                  </div>
                </div>
                <Quote className="w-8 h-8 text-gray-300 mb-4" />
                <p className="text-gray-600 italic">"{client.text}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#B08D57] text-[#B08D57]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-r from-[#0B2A4A] to-[#1a3a5f] text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            Prêt à régler votre situation juridique ?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Contactez-nous dès aujourd'hui pour une consultation gratuite 
            et découvrez comment nous pouvons vous aider.
          </p>
          <Link
            href="/contact"
            className="bg-[#B08D57] hover:bg-[#a07a4f] text-white px-10 py-4 rounded-lg font-medium inline-flex items-center gap-2 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Prendre rendez-vous
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </AppLayout>
  );
};

export default Home;