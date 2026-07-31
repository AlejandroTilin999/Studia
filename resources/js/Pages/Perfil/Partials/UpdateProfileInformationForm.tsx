import InputError from '@/Components/InputError';
import { ButtonLogin } from '@/Components/ButtonLogin';
import { useForm, usePage, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { SwalHelper } from "@/utils/SwalHelper";

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

    const { data, setData, patch, errors, processing } =
        useForm({
            nombre: user.nombre,
            apellido_paterno: user.apellido_paterno,
            apellido_materno: user.apellido_materno,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('perfil.update'), {
            onSuccess: () => {
                SwalHelper.toast('Perfil actualizado con éxito', 'success');
            }
        });
    };

    return (
        <section className={className}>
            <header className="mb-8 border-b border-slate-50 pb-6 text-left">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Información Personal
                </h2>
                <p className="mt-2 text-sm text-slate-500 font-medium">
                    Asegúrate de que tus datos de contacto estén actualizados.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6" autoComplete="off">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 relative">
                        <input
                            id="nombre"
                            className="peer w-full h-14 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            required
                            placeholder=" "
                            autoComplete="off"
                        />
                        <label
                            htmlFor="nombre"
                            className="absolute left-4 top-4 text-slate-400 peer-placeholder-shown:text-sm peer-focus:text-xs peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[#0266E0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold transition-all cursor-text pointer-events-none"
                        >
                            Nombre(s)
                        </label>
                        <InputError className="mt-2" message={errors.nombre} />
                    </div>

                    <div className="relative">
                        <input
                            id="apellido_paterno"
                            className="peer w-full h-14 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
                            value={data.apellido_paterno}
                            onChange={(e) => setData('apellido_paterno', e.target.value)}
                            required
                            placeholder=" "
                            autoComplete="off"
                        />
                        <label
                            htmlFor="apellido_paterno"
                            className="absolute left-4 top-4 text-slate-400 peer-placeholder-shown:text-sm peer-focus:text-xs peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[#0266E0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold transition-all cursor-text pointer-events-none"
                        >
                            Apellido Paterno
                        </label>
                        <InputError className="mt-2" message={errors.apellido_paterno} />
                    </div>

                    <div className="relative">
                        <input
                            id="apellido_materno"
                            className="peer w-full h-14 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
                            value={data.apellido_materno}
                            onChange={(e) => setData('apellido_materno', e.target.value)}
                            required
                            placeholder=" "
                            autoComplete="off"
                        />
                        <label
                            htmlFor="apellido_materno"
                            className="absolute left-4 top-4 text-slate-400 peer-placeholder-shown:text-sm peer-focus:text-xs peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[#0266E0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold transition-all cursor-text pointer-events-none"
                        >
                            Apellido Materno
                        </label>
                        <InputError className="mt-2" message={errors.apellido_materno} />
                    </div>
                </div>

                <div className="relative">
                    <input
                        id="email"
                        type="email"
                        className="peer w-full h-14 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium opacity-70"
                        value={data.email}
                        placeholder=" "
                        disabled
                    />
                    <label
                        htmlFor="email"
                        className="absolute left-3 -top-2.5 bg-white px-2 text-xs font-bold text-slate-400 transition-all"
                    >
                        Correo Electrónico (No editable)
                    </label>
                    <p className="mt-2 text-[10px] text-slate-400 font-bold italic px-1 text-left">
                        El correo electrónico es gestionado por la institución y no puede ser modificado.
                    </p>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-left">
                        <p className="text-sm text-amber-800 font-medium">
                            Tu dirección de correo no ha sido verificada.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 underline hover:text-amber-900 font-bold"
                            >
                                Haz clic aquí para reenviar el correo de verificación.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-bold text-emerald-600">
                                Un nuevo enlace de verificación ha sido enviado a tu correo.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                    <ButtonLogin
                        disabled={processing}
                        className="bg-[#0266E0] hover:bg-[#0152b5] text-white px-10 h-12 rounded-lg font-black text-xs uppercase tracking-widest transition-all border-none shadow-none"
                    >
                        Guardar cambios
                    </ButtonLogin>
                </div>
            </form>
        </section>
    );
}
