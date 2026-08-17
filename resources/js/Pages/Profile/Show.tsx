import { Head, router, useForm } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import CrmLayout from '@/Layouts/CrmLayout';
import { Camera, LoaderCircle, LockKeyhole, Save, Trash2, UserRound } from 'lucide-react';

interface ProfileUser {
    id: number;
    name: string;
    email: string;
    telephone: string | null;
    adresse: string | null;
    type: string;
    type_label: string;
    avatar_url: string | null;
    created_at: string | null;
}

interface ProfileProps {
    user: ProfileUser;
}

const avatarTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxAvatarSize = 2 * 1024 * 1024;

export default function Show({ user }: ProfileProps) {
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        telephone: user.telephone ?? '',
        adresse: user.adresse ?? '',
    });
    const avatarForm = useForm<{ avatar: File | null }>({ avatar: null });
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const deleteForm = useForm({ password: '' });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [networkError, setNetworkError] = useState<string | null>(null);
    const [deletingAvatar, setDeletingAvatar] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const initials = user.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    const clearFeedback = () => {
        setNotice(null);
        setNetworkError(null);
    };

    const submitProfile = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearFeedback();
        profileForm.clearErrors();

        if (!profileForm.data.name.trim()) {
            profileForm.setError('name', 'Le nom est obligatoire.');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(profileForm.data.email)) {
            profileForm.setError('email', 'Veuillez saisir une adresse e-mail valide.');
            return;
        }

        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => setNotice('Profil mis à jour avec succès.'),
            onError: () => setNetworkError('La mise à jour a échoué. Vérifiez les champs puis réessayez.'),
        });
    };

    const selectAvatar = (event: ChangeEvent<HTMLInputElement>) => {
        clearFeedback();
        const file = event.target.files?.[0] ?? null;

        if (!file) {
            return;
        }

        if (!avatarTypes.includes(file.type)) {
            setAvatarError("L'avatar doit être au format JPG, PNG ou WEBP.");
            return;
        }

        if (file.size > maxAvatarSize) {
            setAvatarError("L'avatar ne doit pas dépasser 2 Mo.");
            return;
        }

        setAvatarError(null);
        avatarForm.clearErrors();
        avatarForm.setData('avatar', file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const uploadAvatar = () => {
        if (!avatarForm.data.avatar) {
            setAvatarError('Veuillez sélectionner une image avant de l’enregistrer.');
            return;
        }

        clearFeedback();
        avatarForm.post(route('profile.avatar.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                avatarForm.reset();
                setAvatarPreview(null);
                setNotice('Avatar mis à jour avec succès.');
            },
            onError: () => setNetworkError("L'envoi de l'avatar a échoué. Vérifiez le fichier puis réessayez."),
        });
    };

    const removeAvatar = () => {
        clearFeedback();
        setDeletingAvatar(true);

        router.delete(route('profile.avatar.destroy'), {
            preserveScroll: true,
            onSuccess: () => setNotice('Avatar supprimé avec succès.'),
            onError: () => setNetworkError("La suppression de l'avatar a échoué. Veuillez réessayer."),
            onFinish: () => setDeletingAvatar(false),
        });
    };

    const submitPassword = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearFeedback();
        passwordForm.clearErrors();

        if (passwordForm.data.password.length < 8) {
            passwordForm.setError('password', 'Le nouveau mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        if (passwordForm.data.password !== passwordForm.data.password_confirmation) {
            passwordForm.setError('password_confirmation', 'La confirmation du mot de passe ne correspond pas.');
            return;
        }

        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setNotice('Mot de passe mis à jour avec succès.');
            },
            onError: () => setNetworkError('La mise à jour du mot de passe a échoué. Vérifiez les champs puis réessayez.'),
        });
    };

    const deleteAccount = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearFeedback();
        deleteForm.delete(route('profile.destroy'), {
            preserveScroll: true,
            onError: () => setNetworkError('La suppression du compte a échoué. Vérifiez votre mot de passe puis réessayez.'),
        });
    };

    const displayedAvatar = avatarPreview ?? user.avatar_url;

    return (
        <CrmLayout title="Mon profil">
            <Head title="Mon profil" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
                    <p className="mt-1 text-gray-600">Gérez vos informations personnelles et la sécurité de votre compte.</p>
                </div>

                {(notice || networkError) && (
                    <div className={`rounded-lg border px-4 py-3 text-sm ${networkError ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
                        {networkError ?? notice}
                    </div>
                )}

                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#B08D57]">
                            {displayedAvatar ? (
                                <img src={displayedAvatar} alt={`Avatar de ${user.name}`} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">{initials}</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                            <p className="text-sm text-gray-600">{user.type_label || user.type}</p>
                            {user.created_at && <p className="mt-1 text-xs text-gray-500">Membre depuis le {user.created_at}</p>}
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Camera className="h-4 w-4" />
                                    Choisir une image
                                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={selectAvatar} />
                                </label>
                                {avatarForm.data.avatar && (
                                    <button type="button" onClick={uploadAvatar} disabled={avatarForm.processing} className="inline-flex items-center gap-2 rounded-lg bg-[#B08D57] px-3 py-2 text-sm font-medium text-white hover:bg-[#9c7a4a] disabled:opacity-60">
                                        {avatarForm.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Enregistrer l’avatar
                                    </button>
                                )}
                                {user.avatar_url && !avatarPreview && (
                                    <button type="button" onClick={removeAvatar} disabled={deletingAvatar} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60">
                                        {deletingAvatar ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Supprimer
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">JPG, PNG ou WEBP — 2 Mo maximum.</p>
                            {(avatarError || avatarForm.errors.avatar) && <p className="mt-2 text-sm text-red-600">{avatarError ?? avatarForm.errors.avatar}</p>}
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2"><UserRound className="h-5 w-5 text-[#B08D57]" /><h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2></div>
                    <form onSubmit={submitProfile} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <Field label="Nom complet" error={profileForm.errors.name}><input value={profileForm.data.name} onChange={(event) => profileForm.setData('name', event.target.value)} autoComplete="name" className={inputClass} /></Field>
                        <Field label="Adresse e-mail" error={profileForm.errors.email}><input type="email" value={profileForm.data.email} onChange={(event) => profileForm.setData('email', event.target.value)} autoComplete="email" className={inputClass} /></Field>
                        <Field label="Téléphone" error={profileForm.errors.telephone}><input type="tel" value={profileForm.data.telephone} onChange={(event) => profileForm.setData('telephone', event.target.value)} autoComplete="tel" className={inputClass} /></Field>
                        <Field label="Adresse" error={profileForm.errors.adresse}><textarea value={profileForm.data.adresse} onChange={(event) => profileForm.setData('adresse', event.target.value)} rows={3} autoComplete="street-address" className={inputClass} /></Field>
                        <div className="md:col-span-2 flex justify-end"><SubmitButton processing={profileForm.processing} label="Enregistrer les modifications" /></div>
                    </form>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-[#B08D57]" /><h2 className="text-lg font-semibold text-gray-900">Mot de passe</h2></div>
                    <form onSubmit={submitPassword} className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <Field label="Mot de passe actuel" error={passwordForm.errors.current_password}><input type="password" value={passwordForm.data.current_password} onChange={(event) => passwordForm.setData('current_password', event.target.value)} autoComplete="current-password" className={inputClass} /></Field>
                        <Field label="Nouveau mot de passe" error={passwordForm.errors.password}><input type="password" value={passwordForm.data.password} onChange={(event) => passwordForm.setData('password', event.target.value)} autoComplete="new-password" className={inputClass} /></Field>
                        <Field label="Confirmation" error={passwordForm.errors.password_confirmation}><input type="password" value={passwordForm.data.password_confirmation} onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)} autoComplete="new-password" className={inputClass} /></Field>
                        <div className="md:col-span-3 flex justify-end"><SubmitButton processing={passwordForm.processing} label="Mettre à jour le mot de passe" /></div>
                    </form>
                </section>

                <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-red-700">Supprimer mon compte</h2>
                    <p className="mt-1 text-sm text-gray-600">Cette action est irréversible. Vos données de compte seront supprimées.</p>
                    {!confirmingDeletion ? <button type="button" onClick={() => setConfirmingDeletion(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Supprimer mon compte</button> : (
                        <form onSubmit={deleteAccount} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                            <Field label="Confirmez avec votre mot de passe" error={deleteForm.errors.password}><input type="password" value={deleteForm.data.password} onChange={(event) => deleteForm.setData('password', event.target.value)} autoComplete="current-password" className={inputClass} /></Field>
                            <button type="submit" disabled={deleteForm.processing} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">{deleteForm.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}Confirmer la suppression</button>
                            <button type="button" onClick={() => { setConfirmingDeletion(false); deleteForm.clearErrors(); deleteForm.reset(); }} className="h-10 rounded-lg px-4 text-sm font-medium text-gray-700 hover:bg-gray-100">Annuler</button>
                        </form>
                    )}
                </section>
            </div>
        </CrmLayout>
    );
}

const inputClass = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/20';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return <label className="block text-sm font-medium text-gray-700">{label}{children}{error && <p className="mt-1 text-sm font-normal text-red-600">{error}</p>}</label>;
}

function SubmitButton({ processing, label }: { processing: boolean; label: string }) {
    return <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-lg bg-[#B08D57] px-4 py-2 text-sm font-medium text-white hover:bg-[#9c7a4a] disabled:opacity-60">{processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{label}</button>;
}
