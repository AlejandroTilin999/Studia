"use client";

import { Head, useForm } from "@inertiajs/react";
import { ButtonLogin } from "@/Components/ButtonLogin";
import BackButton from "@/Components/common/BackButton";
import { router } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function ForgotPassword({ status, acceso = 'alumno' }: { status?: string; acceso?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const handleBackToLogin = () => {
        router.visit(`/login?acceso=${acceso}`);
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row font-body bg-white lg:h-screen lg:overflow-hidden relative select-none">
            <Head title="Restablecer Contraseña" />

            {/* Estilo para ocultar scrollbars nativas */}
            <style>{`
                ::-webkit-scrollbar {
                    width: 0px;
                    background: transparent;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                input::-ms-reveal,
                input::-ms-clear {
                    display: none !important;
                }
            `}</style>

            {/* Cabecera Azul Rectangular Móvil Alta (Idéntica a la imagen de referencia) */}
            <div className="w-full bg-[#0266E0] pt-14 pb-20 sm:pt-18 sm:pb-24 px-6 flex flex-col items-center justify-center text-center rounded-none shadow-none lg:hidden order-1 relative overflow-hidden">
                <img
                    src="/assets/logo-ph-blanco.webp"
                    alt="Logo PREPAHID"
                    className="h-16 w-auto object-contain brightness-200 mb-1 mt-2 relative z-10"
                />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-100 relative z-10 mb-6">
                    Restablecer Contraseña
                </span>

                <div className="absolute bottom-[-1px] left-0 w-full h-16 sm:h-20 z-10 pointer-events-none">
                    <svg className="w-full h-full fill-white" viewBox="0 0 1000 200" preserveAspectRatio="none">
                        <path d="M 0 200 L 0 110 C 140 50, 320 150, 500 130 C 780 130, 900 60, 1000 0 L 1000 200 Z" stroke="none" />
                    </svg>
                </div>
            </div>

            {/* COLUMNA IZQUIERDA (Formulario) */}
            <div className="w-full lg:w-[55%] bg-white relative flex flex-col justify-center items-center px-4 sm:px-6 md:px-12 xl:px-24 py-4 md:py-8 lg:py-8 xl:py-12 lg:h-full lg:overflow-y-auto z-20 order-2 lg:order-1">

                <div className="w-full max-w-[500px] relative bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] lg:shadow-none p-6 sm:p-8 lg:p-0 border border-slate-200/80 lg:border-none -mt-20 sm:-mt-24 lg:mt-0 z-30 mb-8 lg:mb-0">
                    {/* Botón superior de regresar (Alineado con el contenido) */}
                    <div className="mb-4 lg:mb-6">
                        <BackButton
                            onClick={handleBackToLogin}
                            label="Volver al inicio de sesión"
                        />
                    </div>

                    {/* Formulario */}
                    <div className="w-full animate-in fade-in slide-in-from-left-4 duration-500">
                        {/* Logotipo Azul/Color (Solo Desktop) */}
                        <div className="mb-4 lg:mb-6 justify-start hidden lg:flex w-full">
                            <img
                                src="/assets/phid_logo.webp"
                                alt="Logo PREPAHID"
                                loading="eager"
                                // @ts-ignore
                                fetchpriority="high"
                                className="w-[240px] h-auto object-contain"
                            />
                        </div>

                        <div className="mb-6 lg:mb-8">
                            <h2 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[42px] font-black text-slate-800 tracking-tighter mb-3 leading-none whitespace-nowrap">
                                ¿Olvidaste tu contraseña?
                            </h2>
                            <p className="text-base font-semibold text-slate-400">
                                No te preocupes. Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-xl animate-in fade-in duration-300">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6 lg:space-y-8 w-full">
                            <div className="space-y-4 lg:space-y-6">
                                <div className="relative">
                                    <input
                                        required
                                        id="email-input"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData("email", e.target.value.toLowerCase())}
                                        placeholder=" "
                                        className="peer w-full h-16 px-5 bg-white border border-slate-300 rounded-xl text-lg text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
                                    />
                                    <label
                                        htmlFor="email-input"
                                        className="absolute left-5 top-5 text-slate-500 peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:-top-2.5 peer-focus:left-4 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[#0266E0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold transition-all cursor-text pointer-events-none"
                                    >
                                        Correo electrónico
                                    </label>
                                    {errors.email && (
                                        <p className="text-rose-500 text-xs mt-1 font-semibold pl-1">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 w-full">
                                <ButtonLogin
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#0266E0] hover:bg-[#0152b5] text-white px-8 h-14 rounded-full font-black text-base transition-all active:scale-[0.98] shadow-none uppercase tracking-widest cursor-pointer"
                                >
                                    {processing ? "Enviando..." : "Enviar enlace"}
                                </ButtonLogin>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* COLUMNA VISUAL (Solo en Desktop) */}
            <div className="hidden lg:block lg:w-[45%] relative lg:h-screen shrink-0 bg-[#0266E0] order-1 lg:order-2 lg:overflow-hidden">
                {/* Capa de la imagen de la chica */}
                <div className="absolute inset-0 z-0 overflow-hidden hidden lg:block">
                    <img
                        src="/assets/alumna.webp"
                        alt="Restablecer Visual"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[95%] w-auto max-w-none opacity-100 brightness-105 transition-all duration-500 object-bottom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-l from-transparent via-transparent to-[#0266E0]/40"></div>
                </div>

                {/* Onda Divisoria Responsive (Solo en Desktop) */}
                <div className="absolute top-0 left-[-4px] h-full w-24 z-10 hidden lg:block">
                    <svg
                        className="h-full w-full fill-white"
                        viewBox="0 0 100 1000"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0 0 C 40 150, 80 250, 40 400 C 0 550, 80 750, 40 850 C 20 950, 0 1000, 0 1000 L 0 0 Z"
                            stroke="white"
                            strokeWidth="3"
                        />
                    </svg>
                </div>

                {/* Logotipo Minimalista Blanco en la esquina - Solo en Desktop */}
                <div className="hidden lg:block absolute lg:bottom-6 lg:right-12 z-20 opacity-60">
                    <img src="/assets/logo-ph-blanco.webp" alt="Logo PH" className="h-12 w-auto brightness-200" />
                </div>
            </div>
        </div>
    );
}
