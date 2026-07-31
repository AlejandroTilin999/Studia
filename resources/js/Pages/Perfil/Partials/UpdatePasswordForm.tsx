import InputError from '@/Components/InputError';
import { ButtonLogin } from '@/Components/ButtonLogin';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { SwalHelper } from "@/utils/SwalHelper";

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                SwalHelper.toast('Contraseña actualizada correctamente', 'success');
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="mb-8 border-b border-slate-50 pb-6 text-left">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Seguridad de la Cuenta
                </h2>

                <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
                    Actualiza tu contraseña regularmente para mantener tu cuenta institucional protegida.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6" autoComplete="off">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                    <div className="md:col-span-2 relative">
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            type={showCurrent ? "text" : "password"}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            placeholder=" "
                            autoComplete="off"
                            className="peer w-full h-14 pl-4 pr-12 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
                            required
                        />
                        <label
                            htmlFor="current_password"
                            className="absolute left-4 top-4 text-slate-400 peer-placeholder-shown:text-sm peer-focus:text-xs peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[#0266E0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold transition-all cursor-text pointer-events-none"
                        >
                            Contraseña Actual
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <InputError message={errors.current_password} className="mt-2" />
                    </div>

                    <div className="relative">
                        <input
                            id="password"
                            ref={passwordInput}
                            type={showNew ? "text" : "password"}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder=" "
                            autoComplete="new-password"
                            className="peer w-full h-14 pl-4 pr-12 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
                            required
                        />
                        <label
                            htmlFor="password"
                            className="absolute left-4 top-4 text-slate-400 peer-placeholder-shown:text-sm peer-focus:text-xs peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[#0266E0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold transition-all cursor-text pointer-events-none"
                        >
                            Nueva Contraseña
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="relative">
                        <input
                            id="password_confirmation"
                            type={showConfirm ? "text" : "password"}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder=" "
                            autoComplete="new-password"
                            className="peer w-full h-14 pl-4 pr-12 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
                            required
                        />
                        <label
                            htmlFor="password_confirmation"
                            className="absolute left-4 top-4 text-slate-400 peer-placeholder-shown:text-sm peer-focus:text-xs peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[#0266E0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold transition-all cursor-text pointer-events-none"
                        >
                            Confirmar Contraseña
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                </div>

                <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
                    <ButtonLogin
                        disabled={processing}
                        className="bg-[#0266E0] hover:bg-[#0152b5] text-white px-10 h-12 rounded-lg font-black text-xs uppercase tracking-widest transition-all border-none shadow-none"
                    >
                        Actualizar clave
                    </ButtonLogin>
                </div>
            </form>
        </section>
    );
}
