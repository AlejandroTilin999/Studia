import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            nombre: user.nombre,
            apellido_paterno: user.apellido_paterno,
            apellido_materno: user.apellido_materno,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-bold text-slate-900">
                    Información del Perfil
                </h2>
                <p className="mt-1 text-sm text-slate-500 font-medium">
                    Actualiza la información de tu perfil y dirección de correo electrónico.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <InputLabel htmlFor="nombre" value="Nombre" />
                        <TextInput
                            id="nombre"
                            className="mt-1 block w-full"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            required
                            isFocused
                            autoComplete="given-name"
                        />
                        <InputError className="mt-2" message={errors.nombre} />
                    </div>

                    <div className="md:col-span-1">
                        <InputLabel htmlFor="apellido_paterno" value="Apellido Paterno" />
                        <TextInput
                            id="apellido_paterno"
                            className="mt-1 block w-full"
                            value={data.apellido_paterno}
                            onChange={(e) => setData('apellido_paterno', e.target.value)}
                            required
                            autoComplete="family-name"
                        />
                        <InputError className="mt-2" message={errors.apellido_paterno} />
                    </div>

                    <div className="md:col-span-1">
                        <InputLabel htmlFor="apellido_materno" value="Apellido Materno" />
                        <TextInput
                            id="apellido_materno"
                            className="mt-1 block w-full"
                            value={data.apellido_materno}
                            onChange={(e) => setData('apellido_materno', e.target.value)}
                            required
                            autoComplete="additional-name"
                        />
                        <InputError className="mt-2" message={errors.apellido_materno} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Correo Electrónico (No editable)" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        disabled
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                    <p className="mt-1 text-[10px] text-slate-400 font-medium italic">
                        El correo electrónico es gestionado por la institución y no puede ser modificado.
                    </p>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Tu dirección de correo no ha sido verificada.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Haz clic aquí para reenviar el correo de verificación.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Un nuevo enlace de verificación ha sido enviado a tu correo.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Guardado correctamente.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
