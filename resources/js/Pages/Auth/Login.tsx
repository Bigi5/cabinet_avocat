// resources/js/Pages/Auth/Login.tsx
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, Eye, EyeOff, Scale } from 'lucide-react';

export default function Login({ 
    status, 
    canResetPassword 
}: { 
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Colonne gauche - Illustration */}
            <div className="md:w-1/2 bg-gradient-to-br from-[#0B2A4A] to-[#1a3a5f] text-white p-8 md:p-16">
                <div className="max-w-md mx-auto h-full flex flex-col justify-center">
                    <Link href="/" className="inline-flex items-center gap-3 mb-12 text-white/80 hover:text-white">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                            <Scale className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-serif font-bold">Cabinet Juridique</span>
                    </Link>

                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-4">
                                Accès sécurisé
                            </h1>
                            <p className="text-white/80 text-lg">
                                Accédez à votre espace personnel pour gérer vos dossiers et suivre vos procédures.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Confidentialité garantie</h3>
                                    <p className="text-white/70 text-sm">Vos données sont protégées et chiffrées</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold">Authentification sécurisée</h3>
                                    <p className="text-white/70 text-sm">Protocoles de sécurité avancés</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/20">
                            <p className="text-white/60 text-sm">
                                Besoin d'aide ? Contactez notre support au <br />
                                <span className="text-white font-medium">+229 0121045016</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Colonne droite - Formulaire */}
            <div className="md:w-1/2 bg-white p-8 md:p-16 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <Head title="Connexion - Cabinet Juridique" />

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-serif font-bold text-[#0B2A4A] mb-3">
                            Connexion
                        </h2>
                        <p className="text-gray-600">
                            Entrez vos identifiants pour accéder à votre compte
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Champ Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#0B2A4A] mb-2">
                                Adresse email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0B2A4A] focus:border-transparent transition-all duration-200"
                                    placeholder="votre@email.com"
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Champ Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#0B2A4A] mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0B2A4A] focus:border-transparent transition-all duration-200"
                                    placeholder="Votre mot de passe"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 text-[#B08D57] focus:ring-[#B08D57] border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    Se souvenir de moi
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-medium text-[#0B2A4A] hover:text-[#B08D57] transition-colors duration-200"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            )}
                        </div>

                        {/* Bouton de connexion */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#0B2A4A] to-[#1a3a5f] text-white font-medium rounded-xl hover:from-[#1a3a5f] hover:to-[#0B2A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2A4A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Connexion en cours...
                                </span>
                            ) : (
                                'Se connecter'
                            )}
                        </button>

                       

                        {/* Retour à l'accueil */}
                        <div className="text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center text-sm text-gray-500 hover:text-[#0B2A4A] transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Retour à l'accueil
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}