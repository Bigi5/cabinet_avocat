import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import CrmLayout from '@/Layouts/CrmLayout';
import { Bell, Eye, Palette, Globe, Save, Mail, Smartphone } from 'lucide-react';

interface SettingsProps {
    settings: {
        notifications: {
            email: boolean;
            sms: boolean;
            push: boolean;
        };
        privacy: {
            profile_visibility: string;
            data_sharing: boolean;
        };
        appearance: {
            theme: string;
            language: string;
        };
    };
}

const Settings = ({ settings }: SettingsProps) => {
    const { data, setData, put, processing } = useForm({
        notifications: settings.notifications,
        privacy: settings.privacy,
        appearance: settings.appearance,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('settings.update'));
    };

    return (
        <CrmLayout title="Paramètres">
            <Head title="Paramètres" />
            
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                    <p className="text-gray-600 mt-1">Personnalisez votre expérience dans le CRM</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Notifications */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <Bell className="h-5 w-5 text-[#B08D57] mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                                    <div>
                                        <label className="font-medium text-gray-900">Notifications par email</label>
                                        <p className="text-sm text-gray-600">Recevez des notifications par email</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.notifications.email}
                                        onChange={e => setData('notifications', { ...data.notifications, email: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B08D57]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Smartphone className="h-4 w-4 mr-3 text-gray-400" />
                                    <div>
                                        <label className="font-medium text-gray-900">Notifications SMS</label>
                                        <p className="text-sm text-gray-600">Recevez des notifications par SMS</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.notifications.sms}
                                        onChange={e => setData('notifications', { ...data.notifications, sms: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B08D57]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Confidentialité */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <Eye className="h-5 w-5 text-[#B08D57] mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900">Confidentialité</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium text-gray-900 mb-2">
                                    Visibilité du profil
                                </label>
                                <select
                                    value={data.privacy.profile_visibility}
                                    onChange={e => setData('privacy', { ...data.privacy, profile_visibility: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                                >
                                    <option value="private">Privé (uniquement moi)</option>
                                    <option value="contacts_only">Contacts uniquement</option>
                                    <option value="public">Public</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium text-gray-900">Partage des données</label>
                                    <p className="text-sm text-gray-600">Autoriser l'utilisation des données à des fins d'amélioration</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.privacy.data_sharing}
                                        onChange={e => setData('privacy', { ...data.privacy, data_sharing: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B08D57]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Apparence */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <Palette className="h-5 w-5 text-[#B08D57] mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900">Apparence</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium text-gray-900 mb-2">
                                    Thème
                                </label>
                                <select
                                    value={data.appearance.theme}
                                    onChange={e => setData('appearance', { ...data.appearance, theme: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                                >
                                    <option value="light">Clair</option>
                                    <option value="dark">Sombre</option>
                                    <option value="system">Système</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-900 mb-2">
                                    <Globe className="inline h-4 w-4 mr-1" />
                                    Langue
                                </label>
                                <select
                                    value={data.appearance.language}
                                    onChange={e => setData('appearance', { ...data.appearance, language: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:border-transparent"
                                >
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bouton d'enregistrement */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-[#B08D57] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#9c7a4a] transition-colors flex items-center"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                        </button>
                    </div>
                </form>
            </div>
        </CrmLayout>
    );
};

export default Settings;