"use client";

import { useState, useEffect } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import { ButtonLogin } from "@/Components/ButtonLogin";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [profile, setProfile] = useState<"student" | "staff">("student");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');

    if (roleParam === 'student' || roleParam === 'staff') {
      setProfile(roleParam);
      setData("profile_type", roleParam);
    }
  }, []);

  const { post, processing, setData, data, errors } = useForm({
    email: '',
    password: '',
    remember: false,
    profile_type: 'student',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-body bg-white lg:h-screen lg:overflow-hidden relative">
      <Head title="Inicio de Sesión" />
      <style>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none !important;
        }
      `}</style>

      {/* COLUMNA IZQUIERDA (Formulario y Selección de Perfil) */}
      <div className="w-full lg:w-[60%] bg-white relative flex flex-col justify-center items-center px-6 py-12 lg:px-24 min-h-[500px] lg:h-full lg:overflow-y-auto z-20 order-2 lg:order-1">

        {/* Botón superior de regresar (Estilo Minimalista) */}
        <div className="absolute top-8 left-8 lg:top-12 lg:left-24 z-30">
          <Link
            href="/"
            className="text-[11px] lg:text-[12px] text-slate-400 hover:text-[#0266E0] font-black flex items-center gap-2 transition-all cursor-pointer group uppercase tracking-widest"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
        </div>

        <div className="w-full max-w-[500px] relative">
          {/* Formulario */}
          <div className="w-full animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Logotipo Azul/Color */}
            <div className="mb-10 justify-start flex w-full">
              <img
                src="/assets/phid_logo.png"
                alt="Logo PREPAHID"
                className="w-[240px] h-auto object-contain"
              />
            </div>

            <div className="mb-14">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter mb-3 leading-none">
                {profile === "student" ? "Portal Alumnos" : "Portal Personal"}
              </h2>
              <p className="text-base font-semibold text-slate-400">Ingresa tus credenciales para continuar.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-8 w-full">
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      required
                      id="email-input"
                      type="text"
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

                  <div className="relative">
                    <input
                      required
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      value={data.password}
                      onChange={e => setData("password", e.target.value)}
                      placeholder=" "
                      autoComplete="current-password"
                      className="peer w-full h-16 pl-5 pr-14 bg-white border border-slate-200 rounded-xl text-lg text-slate-700 focus:outline-none focus:border-[#0266E0] transition-all font-medium"
                    />
                    <label
                      htmlFor="password-input"
                      className="absolute left-5 top-5 text-slate-500 peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:-top-2.5 peer-focus:left-4 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[#0266E0] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold transition-all cursor-text pointer-events-none"
                    >
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0266E0] transition-colors"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                    {errors.password && (
                      <p className="text-rose-500 text-xs mt-1 font-semibold pl-1">{errors.password}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                  <button
                    type="button"
                    className="text-[#0266E0] text-sm font-black hover:underline underline-offset-4 decoration-2 transition-all uppercase tracking-widest"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <ButtonLogin
                    type="submit"
                    disabled={processing}
                    className="w-full sm:w-auto bg-[#0266E0] hover:bg-[#0152b5] text-white px-14 h-14 rounded-full font-black text-base transition-all active:scale-[0.98] shadow-[0_10px_20px_-5px_rgba(2,102,224,0.3)]"
                  >
                    {processing ? "Ingresando..." : "Acceso"}
                  </ButtonLogin>
                </div>
              </form>
            </div>
        </div>
      </div>

      {/* COLUMNA VISUAL (Sección Visual Adaptada para Responsive) */}
      <div className="w-full lg:w-[40%] relative overflow-hidden h-64 sm:h-80 lg:h-screen shrink-0 bg-[#0266E0] order-1 lg:order-2">

        {/* Capa de la imagen de la chica */}
        <div className="absolute inset-0 z-0">
          <img
            src={profile === "student" ? "/assets/alumna.png" : "/assets/docente.png"}
            alt="Login Visual"
            className={`absolute bottom-0 right-0 w-full h-full opacity-100 brightness-105 transition-all duration-500 ${profile === "student" ? 'object-contain h-full lg:h-full lg:scale-125 lg:origin-right-bottom lg:object-right-bottom object-center' : 'object-cover lg:object-right-bottom object-center'}`}
          />
          {/* Degradado para integrar la imagen al azul */}
          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-l from-transparent via-transparent to-[#0266E0]/40"></div>
        </div>

        {/* Onda Divisoria Responsive (Vertical en móvil, Horizontal en desktop) */}
        <div className="absolute bottom-0 left-0 w-full h-12 lg:top-0 lg:left-0 lg:h-full lg:w-24 z-10">
          {/* Onda para Escritorio */}
          <svg
            className="hidden lg:block h-full w-full fill-white"
            viewBox="0 0 100 1000"
            preserveAspectRatio="none"
          >
            <path d="M0 0 C 40 150, 80 250, 40 400 C 0 550, 80 750, 40 850 C 20 950, 0 1000, 0 1000 L 0 1000 L 0 0 Z" />
          </svg>

          {/* Onda para Móvil */}
          <svg
            className="block lg:hidden w-full h-full fill-white"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 150 60, 250 20, 400 60 C 550 100, 750 20, 850 60 C 950 80, 1000 100, 1000 100 L 1000 100 L 0 100 Z" />
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
