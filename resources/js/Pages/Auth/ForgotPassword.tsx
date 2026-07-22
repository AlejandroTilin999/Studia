"use client";

import { Head, useForm, Link } from "@inertiajs/react";
import { ButtonLogin } from "@/Components/ButtonLogin";
import { ArrowLeft } from "lucide-react";
import { FormEventHandler } from "react";

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
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

            {/* COLUMNA IZQUIERDA (Formulario) */}
            <div className="w-full lg:w-[55%] bg-white relative flex flex-col justify-center items-center px-6 md:px-12 xl:px-24 py-6 md:py-8 lg:py-8 xl:py-12 lg:h-full lg:overflow-y-auto z-20 order-2 lg:order-1">
                
                <div className="w-full max-w-[500px] relative">
                    {/* Botón superior de regresar (Alineado con el contenido) */}
                    <div className="mb-4 lg:mb-6">
                        <Link
                            href={route('login')}
                            className="text-[11px] lg:text-[12px] text-slate-400 hover:text-[#0266E0] font-black flex items-center gap-2 transition-all cursor-pointer group uppercase tracking-widest"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Volver al inicio de sesión
                        </Link>
                    </div>

                    {/* Formulario */}
                    <div className="w-full animate-in fade-in slide-in-from-left-4 duration-500">
                        {/* Logotipo Azul/Color */}
                        <div className="mb-4 lg:mb-6 justify-start flex w-full">
                            <img
                                src="/assets/phid_logo.png"
                                alt="Logo PREPAHID"
                                className="w-[240px] h-auto object-contain"
                            />
                        </div>

                        <div className="mb-6 lg:mb-8">
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter mb-3 leading-none">
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
                                        onChange={e => setData("email", e.target.value)}
                                        placeholder=" "
                                        className="peer w-full h-16 px-5 bg-white border border-slate-200 rounded-xl text-lg text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
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

                            <div className="pt-4 flex justify-end">
                                <ButtonLogin
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto bg-[#0266E0] hover:bg-[#0152b5] text-white px-10 h-14 rounded-full font-black text-base transition-all active:scale-[0.98] shadow-[0_10px_20px_-5px_rgba(2,102,224,0.3)] uppercase tracking-widest"
                                >
                                    {processing ? "Enviando..." : "Enviar enlace"}
                                </ButtonLogin>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* COLUMNA VISUAL */}
            <div className="w-full lg:w-[45%] relative h-20 sm:h-24 lg:h-screen shrink-0 bg-[#0266E0] order-1 lg:order-2 lg:overflow-hidden">
                {/* Capa de la imagen de la chica */}
                <div className="absolute inset-0 z-0 overflow-hidden hidden lg:block">
                    <img
                        src="/assets/alumna.png"
                        alt="Restablecer Visual"
                        className="absolute bottom-0 right-0 h-[95%] w-auto max-w-none opacity-100 brightness-105 transition-all duration-500 lg:translate-x-16 object-bottom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-l from-transparent via-transparent to-[#0266E0]/40"></div>
                </div>

                {/* Onda Divisoria Responsive */}
                <div className="absolute bottom-[-4px] left-0 w-full h-12 lg:top-0 lg:left-[-4px] lg:bottom-auto lg:h-full lg:w-24 z-10">
                    {/* Onda para Escritorio */}
                    <svg
                        className="hidden lg:block h-full w-full fill-white"
                        viewBox="0 0 100 1000"
                        preserveAspectRatio="none"
                    >
                        <path 
                            d="M0 0 C 40 150, 80 250, 40 400 C 0 550, 80 750, 40 850 C 20 950, 0 1000, 0 1000 L 0 1000 L 0 0 Z" 
                            stroke="white"
                            strokeWidth="3"
                        />
                    </svg>

                    {/* Onda para Móvil */}
                    <svg
                        className="block lg:hidden w-full h-full fill-white"
                        viewBox="0 0 1000 100"
                        preserveAspectRatio="none"
                    >
                        <path 
                            d="M0 100 C 150 60, 250 20, 400 60 C 550 100, 750 20, 850 60 C 950 80, 1000 100, 1000 100 L 1000 100 L 0 100 Z" 
                            stroke="white"
                            strokeWidth="3"
                        />
                    </svg>
                </div>

                {/* Logotipo Minimalista Blanco en la esquina - Solo en Desktop */}
                <div className="hidden lg:block absolute lg:bottom-6 lg:right-12 z-20 opacity-60">
                    <img src="/assets/logo-ph-blanco.png" alt="Logo PH" className="h-12 w-auto brightness-200" />
                </div>
            </div>
        </div>
    );
}
