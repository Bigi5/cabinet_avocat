// resources/js/Pages/Contact.tsx
import React from "react";
import AppLayout from "../Layouts/AppLayout";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <AppLayout>
      {/* Hero Section Contact */}
      <section className="relative py-20 bg-gradient-to-r from-[#0B2A4A] to-[#1a3a5f]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-serif text-white mb-6">
            Contact
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Prenez rendez-vous avec Maître Bernardin BOBOE
          </p>
        </div>
      </section>

      {/* Formulaire de Contact */}
      <section className="py-24 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Titre */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-serif text-[#0B2A4A] mb-6">
              Entrer en contact
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Maître Bernardin BOBOE vous reçoit sur rendez-vous du lundi au vendredi 
              au sein de son cabinet situé au 03 BP 3805 Cotonou.
            </p>
            <p className="text-lg text-gray-600 mt-4">
              Veuillez remplir le formulaire ci-après
            </p>
          </div>

          {/* Formulaire */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Nom complet */}
              <div className="space-y-2">
                <label className="block text-lg font-medium text-gray-700">
                  Votre nom complet
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ex: André DUPONT"
                    className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/20 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-lg font-medium text-gray-700">
                  Votre email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="ex: contact@example.com"
                    className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/20 focus:outline-none transition-all duration-300"
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Téléphone */}
              <div className="space-y-2">
                <label className="block text-lg font-medium text-gray-700">
                  Votre numéro de téléphone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="ex: 0125896631"
                    className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/20 focus:outline-none transition-all duration-300"
                  />
                  <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              {/* Sujet */}
              <div className="space-y-2">
                <label className="block text-lg font-medium text-gray-700">
                  Le sujet de votre rendez-vous
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: Recouvrement de créances"
                    className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/20 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2 mb-8">
              <label className="block text-lg font-medium text-gray-700">
                Message
              </label>
              <div className="relative">
                <textarea
                  rows={6}
                  placeholder="Décrivez brièvement votre situation..."
                  className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/20 focus:outline-none transition-all duration-300 resize-none"
                />
              </div>
            </div>

            {/* Bouton d'envoi */}
            <div className="text-center">
              <button className="group relative bg-gradient-to-r from-[#B08D57] to-[#c9a86a] text-white px-12 py-5 rounded-xl font-medium overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Send className="w-5 h-5 relative" />
                <span className="relative">Envoyer la demande</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Coordonnées */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Adresse */}
            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-white flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <MapPin className="w-8 h-8 text-[#0B2A4A]" />
              </div>
              <h3 className="text-xl font-serif text-[#0B2A4A] mb-3">Adresse</h3>
              <p className="text-gray-600">
                03 BP 3805 Cotonou<br />
                Bénin
              </p>
            </div>

            {/* Téléphone */}
            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-white flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Phone className="w-8 h-8 text-[#0B2A4A]" />
              </div>
              <h3 className="text-xl font-serif text-[#0B2A4A] mb-3">Téléphone</h3>
              <p className="text-gray-600">
                +229 0121045016<br />
                +229 0121339492
              </p>
            </div>

            {/* Email */}
            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-white flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Mail className="w-8 h-8 text-[#0B2A4A]" />
              </div>
              <h3 className="text-xl font-serif text-[#0B2A4A] mb-3">Email</h3>
              <p className="text-gray-600">
                etudbob2@yahoo.fr
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Carte/Image de localisation */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative h-96 bg-gradient-to-br from-[#0B2A4A] to-[#1a3a5f] flex items-center justify-center">
              {/* Placeholder pour la carte - Remplacez par une vraie carte ou image */}
              <div className="text-center text-white">
                <MapPin className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-serif mb-2">Notre cabinet</h3>
                <p className="text-white/80">03 BP 3805 Cotonou, Bénin</p>
                <button className="mt-6 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors duration-300">
                  Voir sur Google Maps
                </button>
              </div>
              
              {/* Image de fond optionnelle */}
              <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center" />
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Contact;