import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent, useState, useMemo } from 'react';
import { Check, X, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { SwalHelper } from '@/utils/SwalHelper';
import BackButton from '@/Components/common/BackButton';
import { ButtonLogin } from '@/Components/ButtonLogin';

export default function ResetPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Reglas de validación calculadas al vuelo
    const rules = useMemo(() => {
        const pass = data.password;
        return {
            minLength: pass.length >= 8,
            hasUpper: /[A-Z]/.test(pass),
            hasNumber: /[0-9]/.test(pass),
            match: pass.length > 0 && pass === data.password_confirmation,
        };
    }, [data.password, data.password_confirmation]);

    // Fortaleza de contraseña
    const strength = useMemo(() => {
        const pass = data.password;
        if (!pass) return { score: 0, label: 'Muy débil', color: 'bg-rose-500', textColor: 'text-rose-500' };

        let score = 0;
        if (rules.minLength) score += 1;
        if (rules.hasUpper) score += 1;
        if (rules.hasNumber) score += 1;
        if (/[a-z]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score === 2) return { score, label: 'Débil', color: 'bg-amber-500', textColor: 'text-amber-500' };
        if (score === 3) return { score, label: 'Media', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
        if (score >= 4) return { score, label: 'Fuerte', color: 'bg-emerald-500', textColor: 'text-emerald-600' };

        return { score, label: 'Muy débil', color: 'bg-rose-500', textColor: 'text-rose-500' };
    }, [data.password, rules]);

    // El formulario solo es válido si TODAS las reglas se cumplen
    const isFormValid = rules.minLength && rules.hasUpper && rules.hasNumber && rules.match;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!isFormValid) return;

        post(route('password.force_update'), {
            onSuccess: () => {
                SwalHelper.toast('¡Contraseña actualizada correctamente!', 'success');
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row font-body bg-white lg:h-screen lg:overflow-hidden relative select-none">
            <Head title="Cambio de Contraseña Obligatorio" />
            <style>{`
                ::-webkit-scrollbar { width: 0px; background: transparent; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                input::-ms-reveal, input::-ms-clear { display: none !important; }
            `}</style>

            {/* Cabecera Móvil */}
            <div className="w-full bg-[#0266E0] pt-14 pb-20 sm:pt-18 sm:pb-24 px-6 flex flex-col items-center justify-center text-center rounded-none shadow-none lg:hidden order-1 relative overflow-hidden">
                <img
                    src="/assets/logo-ph-blanco.webp"
                    alt="Logo PREPAHID"
                    className="h-16 w-auto object-contain brightness-200 mb-1 mt-2 relative z-10"
                />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-100 relative z-10 mb-6">
                    Cambio de Contraseña
                </span>

                <div className="absolute bottom-[-1px] left-0 w-full h-16 sm:h-20 z-10 pointer-events-none">
                    <svg className="w-full h-full fill-white" viewBox="0 0 1000 200" preserveAspectRatio="none">
                        <path d="M 0 200 L 0 110 C 140 50, 320 150, 500 130 C 780 130, 900 60, 1000 0 L 1000 200 Z" stroke="none" />
                    </svg>
                </div>
            </div>

            {/* COLUMNA IZQUIERDA (Formulario) */}
            <div className="w-full lg:w-[55%] bg-white relative flex flex-col justify-center items-center px-4 sm:px-6 md:px-12 xl:px-20 py-4 md:py-8 lg:py-8 xl:py-12 lg:h-full lg:overflow-y-auto z-20 order-2 lg:order-1">
                <div className="w-full max-w-[500px] relative bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] lg:shadow-none p-6 sm:p-8 lg:p-0 border border-slate-200/80 lg:border-none -mt-20 sm:-mt-24 lg:mt-0 z-30 mb-8 lg:mb-0">
                    
                    <div className="mb-4 lg:mb-6">
                        <BackButton
                            onClick={() => router.post(route('logout'))}
                            label="Volver al inicio de sesión"
                        />
                    </div>

                    <div className="w-full animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="mb-4 lg:mb-6 justify-start hidden lg:flex w-full">
                            <img
                                src="/assets/phid_logo.webp"
                                alt="Logo PREPAHID"
                                loading="eager"
                                fetchPriority="high"
                                className="w-[240px] h-auto object-contain"
                            />
                        </div>

                        <div className="mb-4 lg:mb-6">
                            <h2 className="text-3xl sm:text-4xl lg:text-4xl xl:text-[40px] font-black text-slate-800 tracking-tighter mb-2 leading-none">
                                Cambio de Contraseña
                            </h2>
                            <p className="text-sm font-semibold text-slate-400">
                                Por seguridad de tu cuenta, debes actualizar la contraseña genérica asignada.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5 w-full">
                            {/* Input Contraseña */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full h-14 pl-12 pr-12 bg-white border border-slate-200 rounded-xl text-base text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
                                        placeholder="Escribe tu nueva contraseña"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-rose-500 text-xs mt-1 font-semibold pl-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Fortaleza */}
                            {data.password.length > 0 && (
                                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60 animate-in fade-in duration-200">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Fortaleza</span>
                                        <span className={`font-extrabold text-[11px] ${strength.textColor}`}>{strength.label}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${strength.color}`}
                                            style={{ width: `${(strength.score / 4) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Requisitos */}
                            <div className="text-xs space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 text-left">
                                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">Requisitos obligatorios:</span>

                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${rules.minLength ? "bg-emerald-50 border-emerald-200" : "bg-slate-100 border-slate-200"}`}>
                                        {rules.minLength ? <Check size={11} className="text-emerald-600 stroke-[3]" /> : <X size={11} className="text-slate-300 stroke-[3]" />}
                                    </div>
                                    <span className={rules.minLength ? "text-slate-700 font-bold" : "text-slate-400 font-medium"}>
                                        Mínimo 8 caracteres
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${rules.hasUpper ? "bg-emerald-50 border-emerald-200" : "bg-slate-100 border-slate-200"}`}>
                                        {rules.hasUpper ? <Check size={11} className="text-emerald-600 stroke-[3]" /> : <X size={11} className="text-slate-300 stroke-[3]" />}
                                    </div>
                                    <span className={rules.hasUpper ? "text-slate-700 font-bold" : "text-slate-400 font-medium"}>
                                        Al menos una letra mayúscula
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${rules.hasNumber ? "bg-emerald-50 border-emerald-200" : "bg-slate-100 border-slate-200"}`}>
                                        {rules.hasNumber ? <Check size={11} className="text-emerald-600 stroke-[3]" /> : <X size={11} className="text-slate-300 stroke-[3]" />}
                                    </div>
                                    <span className={rules.hasNumber ? "text-slate-700 font-bold" : "text-slate-400 font-medium"}>
                                        Al menos un número
                                    </span>
                                </div>
                            </div>

                            {/* Input Confirmar Contraseña */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                    Confirmar Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full h-14 pl-12 pr-12 bg-white border border-slate-200 rounded-xl text-base text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
                                        placeholder="Confirma tu contraseña"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {data.password_confirmation.length > 0 && !rules.match && (
                                    <p className="text-rose-500 text-xs mt-1 font-semibold pl-1">Las contraseñas no coinciden.</p>
                                )}
                                {errors.password_confirmation && (
                                    <p className="text-rose-500 text-xs mt-1 font-semibold pl-1">{errors.password_confirmation}</p>
                                )}
                            </div>

                            {/* Botón Submit */}
                            <div className="pt-4">
                                <ButtonLogin
                                    type="submit"
                                    disabled={processing || !isFormValid}
                                    className="w-full bg-[#0266E0] hover:bg-[#0152b5] text-white px-10 h-14 rounded-full font-black text-base transition-all active:scale-[0.98] shadow-none uppercase tracking-widest cursor-pointer disabled:opacity-40"
                                >
                                    <Shield size={18} className="mr-2 inline" />
                                    {processing ? 'Guardando...' : 'Establecer Contraseña'}
                                </ButtonLogin>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* COLUMNA VISUAL Desktop */}
            <div className="hidden lg:block lg:w-[45%] relative lg:h-screen shrink-0 bg-[#0266E0] order-1 lg:order-2 lg:overflow-hidden">
                <div className="absolute inset-0 z-0 overflow-hidden hidden lg:block">
                    <img
                        src="/assets/alumna.webp"
                        alt="Visual Cambio Contraseña"
                        loading="eager"
                        fetchPriority="high"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[95%] w-auto max-w-none opacity-100 brightness-105 transition-all duration-500 object-bottom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-l from-transparent via-transparent to-[#0266E0]/40"></div>
                </div>

                <div className="absolute top-0 left-[-4px] h-full w-24 z-10 hidden lg:block">
                    <svg className="h-full w-full fill-white" viewBox="0 0 100 1000" preserveAspectRatio="none">
                        <path d="M0 0 C 40 150, 80 250, 40 400 C 0 550, 80 750, 40 850 C 20 950, 0 1000, 0 1000 L 0 0 Z" stroke="white" strokeWidth="3" />
                    </svg>
                </div>

                <div className="hidden lg:block absolute lg:bottom-6 lg:right-12 z-20 opacity-60">
                    <img src="/assets/logo-ph-blanco.webp" alt="Logo PH" className="h-12 w-auto brightness-200" />
                </div>
            </div>
        </div>
    );
}