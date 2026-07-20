import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState, useEffect } from 'react';
import { Check, X, Shield, Lock } from 'lucide-react';

export default function ResetPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    // Estados para la validación en tiempo real
    const [rules, setRules] = useState({
        minLength: false,
        hasUpper: false,
        hasNumber: false,
    });
    const [strength, setStrength] = useState({ score: 0, label: 'Muy débil', color: 'bg-slate-200' });

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

        if (score === 2) {
            label = 'Débil';
            color = 'bg-amber-500';
        } else if (score === 3) {
            label = 'Media';
            color = 'bg-yellow-500';
        } else if (score >= 4) {
            label = 'Fuerte';
            color = 'bg-emerald-500';
        }

        setStrength({ score, label, color });
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
        <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#f8fafc]">
            <Head title="Cambio de Contraseña Obligatorio" />

            <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                        <Lock size={22} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Cambio de contraseña</h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Por seguridad, debes actualizar la contraseña genérica asignada.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Input Contraseña */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 font-medium"
                            required
                        />
                        {errors.password && (
                            <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.password}</p>
                        )}
                    </div>

                    {/* Barra de nivel de seguridad */}
                    {data.password.length > 0 && (
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-500">Seguridad:</span>
                                <span className="font-bold text-slate-700">{strength.label}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${strength.color}`} 
                                    style={{ width: `${(strength.score / 4) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Indicadores de requisitos */}
                    <div className="text-xs space-y-2 bg-slate-50/50 p-3.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Requisitos obligatorios:</span>
                        
                        <div className="flex items-center gap-2">
                            {rules.minLength ? (
                                <Check size={14} className="text-emerald-500 stroke-[3]" />
                            ) : (
                                <X size={14} className="text-slate-300 stroke-[3]" />
                            )}
                            <span className={rules.minLength ? "text-slate-600 font-medium" : "text-slate-400"}>
                                Mínimo 8 caracteres
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {rules.hasUpper ? (
                                <Check size={14} className="text-emerald-500 stroke-[3]" />
                            ) : (
                                <X size={14} className="text-slate-300 stroke-[3]" />
                            )}
                            <span className={rules.hasUpper ? "text-slate-600 font-medium" : "text-slate-400"}>
                                Al menos una letra mayúscula
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {rules.hasNumber ? (
                                <Check size={14} className="text-emerald-500 stroke-[3]" />
                            ) : (
                                <X size={14} className="text-slate-300 stroke-[3]" />
                            )}
                            <span className={rules.hasNumber ? "text-slate-600 font-medium" : "text-slate-400"}>
                                Al menos un número
                            </span>
                        </div>
                    </div>

                    {/* Input Confirmar Contraseña */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Confirmar Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 font-medium"
                            required
                        />
                        {errors.password_confirmation && (
                            <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.password_confirmation}</p>
                        )}
                    </div>

                    {/* Botón de Enviar */}
                    <div className="pt-2 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={processing || !rules.minLength || !rules.hasUpper || !rules.hasNumber}
                            className="w-full bg-[#1e88e5] hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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