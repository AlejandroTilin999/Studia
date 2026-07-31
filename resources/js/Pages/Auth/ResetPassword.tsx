import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent, useState, useEffect } from 'react';
import { Check, X, Shield, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    // Estados para visibilidad de contraseñas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Estados para la validación en tiempo real
    const [rules, setRules] = useState({
        minLength: false,
        hasUpper: false,
        hasNumber: false,
    });
    const [strength, setStrength] = useState({ score: 0, label: 'Muy débil', color: 'bg-rose-500', textColor: 'text-rose-500' });

    // Validar contraseña cada vez que cambia
    useEffect(() => {
        const pass = data.password;
        const minLength = pass.length >= 8;
        const hasUpper = /[A-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);

        setRules({ minLength, hasUpper, hasNumber });

        // Calcular nivel de seguridad (0 a 4 puntos)
        let score = 0;
        if (minLength) score += 1;
        if (hasUpper) score += 1;
        if (hasNumber) score += 1;
        if (/[a-z]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1; // Punto extra por minúsculas + caracteres especiales

        let label = 'Muy débil';
        let color = 'bg-rose-500';
        let textColor = 'text-rose-500';

        if (score === 2) {
            label = 'Débil';
            color = 'bg-amber-500';
            textColor = 'text-amber-500';
        } else if (score === 3) {
            label = 'Media';
            color = 'bg-yellow-500';
            textColor = 'text-yellow-600';
        } else if (score >= 4) {
            label = 'Fuerte';
            color = 'bg-emerald-500';
            textColor = 'text-emerald-600';
        }

        setStrength({ score, label, color, textColor });
    }, [data.password]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Bloquear envío si no cumple con las reglas básicas de seguridad
        if (!rules.minLength || !rules.hasUpper || !rules.hasNumber) {
            return;
        }

        post(route('password.force_update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 md:p-6 pt-20 md:pt-6 bg-slate-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] font-body relative overflow-hidden">
            <Head title="Cambio de Contraseña Obligatorio" />
            <style>{`
                input::-ms-reveal,
                input::-ms-clear {
                    display: none !important;
                }
            `}</style>

            <div className="absolute top-5 left-5 z-50">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="h-9 px-5 bg-[#0266E0] text-white hover:bg-[#0152b5] rounded-l-full rounded-tr-full rounded-br-none flex items-center justify-center text-xs font-black transition-all active:scale-[0.98] border-none shadow-none"
                >
                    Regresar al Login
                </Link>
            </div>

            {/* Tarjeta de Formulario */}
            <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-none relative z-20 transition-all duration-300">

                {/* Logo PrepaHidalgo */}
                <div className="flex justify-center mb-6">
                    <img
                        src="/assets/phid_logo.webp"
                        alt="Logo PREPAHID"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-[200px] h-auto object-contain"
                    />
                </div>

                {/* Encabezado */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Cambio de Contraseña</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1.5">
                        Por seguridad de tu cuenta, debes actualizar la contraseña genérica asignada.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Input Contraseña */}
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0266E0] focus:bg-white font-medium transition-all"
                                placeholder="Escribe tu nueva contraseña"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.password}</p>
                        )}
                    </div>

                    {/* Barra de nivel de seguridad */}
                    {data.password.length > 0 && (
                        <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100/80">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Seguridad de la clave</span>
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

                    {/* Indicadores de requisitos */}
                    <div className="text-xs space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 text-left">
                        <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block mb-1">Requisitos obligatorios:</span>

                        <div className="flex items-center gap-2">
                            {rules.minLength ? (
                                <div className="w-4.5 h-4.5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-emerald-600 stroke-[3]" />
                                </div>
                            ) : (
                                <div className="w-4.5 h-4.5 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                                    <X size={12} className="text-slate-300 stroke-[3]" />
                                </div>
                            )}
                            <span className={rules.minLength ? "text-slate-600 font-bold" : "text-slate-400 font-medium"}>
                                Mínimo 8 caracteres
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {rules.hasUpper ? (
                                <div className="w-4.5 h-4.5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-emerald-600 stroke-[3]" />
                                </div>
                            ) : (
                                <div className="w-4.5 h-4.5 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                                    <X size={12} className="text-slate-300 stroke-[3]" />
                                </div>
                            )}
                            <span className={rules.hasUpper ? "text-slate-600 font-bold" : "text-slate-400 font-medium"}>
                                Al menos una letra mayúscula
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {rules.hasNumber ? (
                                <div className="w-4.5 h-4.5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-emerald-600 stroke-[3]" />
                                </div>
                            ) : (
                                <div className="w-4.5 h-4.5 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                                    <X size={12} className="text-slate-300 stroke-[3]" />
                                </div>
                            )}
                            <span className={rules.hasNumber ? "text-slate-600 font-bold" : "text-slate-400 font-medium"}>
                                Al menos un número
                            </span>
                        </div>
                    </div>

                    {/* Input Confirmar Contraseña */}
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0266E0] focus:bg-white font-medium transition-all"
                                placeholder="Confirma tu contraseña"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={processing || !rules.minLength || !rules.hasUpper || !rules.hasNumber}
                            className="w-full bg-[#0266E0] hover:bg-[#0152b5] text-white font-black py-3 px-4 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-none cursor-pointer"
                        >
                            <Shield size={16} />
                            {processing ? 'Guardando...' : 'Establecer Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
