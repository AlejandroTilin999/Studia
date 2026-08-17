import { usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    className = '',
}: {
    mustVerifyEmail?: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    return (
        <section className={className}>
            <header className="mb-8 border-b border-slate-50 pb-6 text-left">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Información Personal
                </h2>
            </header>

            <form className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 relative">
                        <input
                            id="nombre"
                            className="peer w-full h-14 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium cursor-not-allowed select-none"
                            value={user.nombre || ''}
                            disabled
                            placeholder=" "
                        />
                        <label
                            htmlFor="nombre"
                            className="absolute left-3 -top-2.5 bg-white px-2 text-xs font-bold text-slate-400"
                        >
                            Nombre(s) (No editable)
                        </label>
                    </div>

                    <div className="relative">
                        <input
                            id="apellido_paterno"
                            className="peer w-full h-14 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium cursor-not-allowed select-none"
                            value={user.apellido_paterno || ''}
                            disabled
                            placeholder=" "
                        />
                        <label
                            htmlFor="apellido_paterno"
                            className="absolute left-3 -top-2.5 bg-white px-2 text-xs font-bold text-slate-400"
                        >
                            Apellido Paterno (No editable)
                        </label>
                    </div>

                    <div className="relative">
                        <input
                            id="apellido_materno"
                            className="peer w-full h-14 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium cursor-not-allowed select-none"
                            value={user.apellido_materno || ''}
                            disabled
                            placeholder=" "
                        />
                        <label
                            htmlFor="apellido_materno"
                            className="absolute left-3 -top-2.5 bg-white px-2 text-xs font-bold text-slate-400"
                        >
                            Apellido Materno (No editable)
                        </label>
                    </div>
                </div>

                <div className="relative">
                    <input
                        id="email"
                        type="email"
                        className="peer w-full h-14 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium cursor-not-allowed select-none"
                        value={user.email || ''}
                        placeholder=" "
                        disabled
                    />
                    <label
                        htmlFor="email"
                        className="absolute left-3 -top-2.5 bg-white px-2 text-xs font-bold text-slate-400"
                    >
                        Correo Electrónico (No editable)
                    </label>
                </div>
            </form>
        </section>
    );
}
