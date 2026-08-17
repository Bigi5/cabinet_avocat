// resources/js/Components/Notifications/NotificationDropdown.tsx

import React from 'react';
import { router } from '@inertiajs/react'; // ✅ Étape 1 : Import router
import {
    Folder,
    Clock,
    Archive,
    Users,
    Bell
} from 'lucide-react';

interface Notification {
    id?: string;
    title?: string;
    message?: string;
    time?: string;
    type?: string;
    read_at?: string | null;
    dossier_id?: number | null;
    link?: string | null;
}

interface Props {
    notifications: Notification[];
}

const NotificationDropdown = ({ notifications }: Props) => {
    // ✅ Étape 2 : Fonction pour obtenir l'icône en fonction du type
    const getNotificationIcon = (type?: string) => {
        switch (type) {
            case 'dossier_created':
                return <Folder className="h-5 w-5 text-blue-600" />;
            case 'echeance':
                return <Clock className="h-5 w-5 text-orange-600" />;
            case 'archive':
                return <Archive className="h-5 w-5 text-gray-600" />;
            case 'client':
                return <Users className="h-5 w-5 text-green-600" />;
            default:
                return <Bell className="h-5 w-5 text-[#B08D57]" />;
        }
    };

    // ✅ Étape 2 : Fonction de clic sur une notification
const handleNotificationClick = (notification: Notification) => {
    if (!notification.id) return;

    router.post(
        route('crm.notifications.read', notification.id),
        {},
        {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                if (notification.dossier_id) {
                    window.location.href = route(
                        'crm.dossiers.show',
                        notification.dossier_id
                    );
                }
            },
        }
    );
};
const handleMarkAllAsRead = () => {
    router.post(
        route('crm.notifications.readAll'),
        {},
        {
            preserveScroll: true,
            preserveState: false,
        }
    );
};

    return (
        <div className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-[9999]">

          <div className="flex items-center justify-between px-5 py-4 border-b">

    <h3 className="font-semibold text-gray-900">
        Notifications
    </h3>

    {notifications.length > 0 && (
        <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-[#B08D57] hover:underline"
        >
            Tout marquer comme lu
        </button>
    )}

</div>

            <div className="max-h-96 overflow-y-auto">

                {notifications.length === 0 ? (

                    <div className="py-10 text-center text-gray-500 text-sm">
                        Aucune notification
                    </div>

                ) : (

                    notifications.map((notification) => (

                        // ✅ Étape 3 : onClick ajouté
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className="flex gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                        >
                            {/* Icône */}
                            <div className="mt-1">
                                {getNotificationIcon(notification.type)}
                            </div>

                            {/* Contenu */}
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                    {notification.title}
                                </p>

                                <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                </p>

                                <p className="text-xs text-gray-400 mt-2">
                                    {notification.time}
                                </p>
                            </div>
                        </div>

                    ))

                )}

            </div>

        </div>
    );
};

export default NotificationDropdown;