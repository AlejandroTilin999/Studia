"use client";

import { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import { ButtonLogin } from "@/Components/ButtonLogin";
import { Input } from "@/Components/Input";
import { Label } from "@/Components/Label";
import { cn } from "@/lib/utils";
import Button from "@/Components/ui/button";
import { ChevronLeft, GraduationCap, User, Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [profile, setProfile] = useState<"student" | "staff">("student");
  const [showPassword, setShowPassword] = useState(false);
  
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
    <div className="h-screen w-full bg-[#cfe8ff] md:bg-white flex flex-col md:flex-row overflow-hidden font-body relative">
      <Head title="Inicio de Sesión" />
      <style>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none !important;
        }
      `}</style>
      
      {/* Botón de Regresar en Móvil (Estilo de botón asimétrico blanco de la referencia) */}
      <div className="absolute top-5 left-5 z-50 md:hidden">
        <Link 
          href="/"
          className="h-9 px-5 bg-white text-[#0266E0] rounded-l-full rounded-tr-full rounded-br-none flex items-center justify-center text-[13px] font-black hover:bg-white/95 transition-all active:scale-[0.98] shadow-none"
        >
          Regresar
        </Link>
      </div>

      {/* Cabecera superior con logotipo en Móvil (Color azul sólido sin figuras) */}
      <div className="w-full h-[30vh] bg-[#0266E0] flex flex-col items-center justify-center shrink-0 md:hidden relative">
        <img 
          src="/assets/logo-ph-blanco.png" 
          alt="Logo PREPAHID" 
          className="w-[260px] h-auto object-contain z-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
        />
        <p className="text-white/85 text-xs font-semibold mt-3.5 z-10 tracking-wide text-center uppercase">
          Por favor, ingresa tus datos
        </p>
      </div>

      {/* Contenedor del Formulario (Tarjeta redondeada que sube en móvil, columna en web) */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white px-6 pt-7 pb-6 rounded-t-[30px] md:rounded-t-none -mt-6 md:mt-0 md:p-6 lg:p-16 xl:p-2 relative z-20 w-full h-full overflow-hidden md:overflow-y-auto shadow-[0_-10px_30px_rgba(2,102,224,0.06)] md:shadow-none">
        <div className="max-w-md w-full relative flex flex-col items-center md:items-start mt-1 md:my-auto">
          
          {/* Logotipo en versión Desktop */}
          <div className="hidden md:flex mb-5 lg:mb-6 justify-start ml-0 w-full max-w-[460px]">
            <img 
              src="/assets/phid_logo.png" 
              alt="Logo PREPAHID" 
              className="w-[380px] lg:w-[440px] h-auto object-contain -ml-2 lg:-ml-3"
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6 lg:space-y-8 w-full flex flex-col items-center md:items-start">
            {/* Seleccion de Perfil */}
            <div className="space-y-1.5 md:space-y-3 w-full max-w-[420px]">
              <Label className="text-[#64748b] font-bold text-xs lg:text-[13px] tracking-wide uppercase">Selecciona tu perfil</Label>
              <div className="flex bg-slate-100 rounded-xl overflow-hidden w-full">
                <button
                  type="button"
                  onClick={() => { setProfile("student"); setData("profile_type", "student"); }}
                  className={cn(
                    "flex-1 py-3 text-xs lg:text-[14px] font-bold transition-all flex items-center justify-center gap-1.5 outline-none",
                    profile === "student" 
                      ? "bg-[#0266E0] text-white" 
                      : "bg-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  <GraduationCap className={cn("w-4 h-4", profile === "student" ? "text-white" : "text-slate-400")} />
                  Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => { setProfile("staff"); setData("profile_type", "staff"); }}
                  className={cn(
                    "flex-1 py-3 text-xs lg:text-[14px] font-bold transition-all flex items-center justify-center gap-1.5 outline-none",
                    profile === "staff" 
                      ? "bg-[#0266E0] text-white" 
                      : "bg-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  <User className={cn("w-4 h-4", profile === "staff" ? "text-white" : "text-slate-400")} />
                  Personal
                </button>
              </div>
            </div>

            {/* Iniciar Sesión */}
            <div className="space-y-3.5 md:space-y-5 lg:space-y-8 w-full max-w-[420px]">
              <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">Iniciar Sesión</h2>
              
              <div className="space-y-3 md:space-y-4 lg:space-y-6 w-full">
                {/* Input Email/Matrícula */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none z-20" />
                    <Input 
                      required
                      type="text"
                      value={data.email}
                      onChange={e => setData("email", e.target.value)}
                      placeholder=" "
                      className="peer h-14 w-full border-slate-200 rounded-xl focus:border-[#0266E0] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all shadow-none bg-slate-50/30 pl-11 pr-5 text-sm lg:text-base font-normal text-slate-800 placeholder-transparent z-10"
                    />
                    <label className="absolute left-10 top-0 -translate-y-1/2 text-[9.5px] lg:text-[10.5px] text-slate-400 font-extrabold uppercase pointer-events-none transition-all duration-200 bg-white px-1.5 z-20
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:left-11 peer-placeholder-shown:text-xs lg:peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:font-semibold peer-placeholder-shown:normal-case peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0
                      peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:left-10 peer-focus:text-[9.5px] lg:peer-focus:text-[10.5px] peer-focus:text-[#0266E0] peer-focus:font-extrabold peer-focus:uppercase peer-focus:bg-white peer-focus:px-1.5"
                    >
                      {profile === "student" ? "Matrícula" : "Correo electrónico / Matrícula"}
                    </label>
                  </div>
                  {errors.email && (
                    <p className="text-rose-500 text-xs mt-1 font-semibold pl-2">{errors.email}</p>
                  )}
                </div>

                {/* Input Contraseña */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none z-20" />
                    <Input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={data.password}
                      onChange={e => setData("password", e.target.value)}
                      placeholder=" "
                      className="peer h-14 w-full border-slate-200 rounded-xl focus:border-[#0266E0] focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all shadow-none bg-slate-50/30 pl-11 pr-12 text-sm lg:text-base font-normal text-slate-800 placeholder-transparent z-10"
                    />
                    <label className="absolute left-10 top-0 -translate-y-1/2 text-[9.5px] lg:text-[10.5px] text-slate-400 font-extrabold uppercase pointer-events-none transition-all duration-200 bg-white px-1.5 z-20
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:left-11 peer-placeholder-shown:text-xs lg:peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:font-semibold peer-placeholder-shown:normal-case peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0
                      peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:left-10 peer-focus:text-[9.5px] lg:peer-focus:text-[10.5px] peer-focus:text-[#0266E0] peer-focus:font-extrabold peer-focus:uppercase peer-focus:bg-white peer-focus:px-1.5"
                    >
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-650 focus:outline-none transition-colors z-20"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-rose-500 text-xs mt-1 font-semibold pl-2">{errors.password}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Botón Ingresar */}
            <div className="space-y-3 w-full max-w-[420px] pt-1">
              <ButtonLogin 
                type="submit"
                disabled={processing}
                className="w-full h-12 lg:h-[54px] bg-[#0266E0] hover:bg-[#0256cc] text-white font-extrabold rounded-xl text-sm lg:text-base transition-all active:scale-[0.98] tracking-wider uppercase"
              >
                {processing ? "Ingresando..." : "Ingresar"}
              </ButtonLogin>
              <div className="w-full text-center">
                <button 
                  type="button"
                  className="text-[#0266E0] text-[12px] lg:text-[14px] font-black hover:text-[#014cb8] hover:underline underline-offset-4 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {/* Desarrollado por */}
            <div className="mt-4 md:mt-8 flex items-center justify-center gap-2 text-[11px] lg:text-[13px] font-bold text-slate-400 bg-slate-50 border border-slate-100/50 py-2 px-4 rounded-xl w-full max-w-[420px] mx-auto">
              <span>Desarrollado por</span>
              <img src="/assets/studia-logo.png" alt="Logo Studia" className="w-[50px] lg:w-[50px] h-auto object-contain opacity-75" />
            </div>
          </form>
        </div>
      </div>

      {/* Columna Derecha (Desktop únicamente) */}
      <div className="hidden md:flex flex-1 relative bg-white items-center justify-center overflow-hidden h-full">
        <div className="absolute top-12 right-12 z-20">
          <Button>
            <Link href="/">
              Regresar
            </Link>
          </Button>
        </div>

        <div className="absolute right-[-20%] w-[140%] aspect-square bg-[#e3f2fd] rounded-full translate-x-[15%]"></div>
        <div className="absolute right-[-20%] w-[130%] aspect-square bg-[#cfe8ff] rounded-full translate-x-[25%]"></div>
        <div className="absolute right-[-30%] w-[120%] aspect-square bg-[#1e88e5] rounded-full translate-x-[35%] opacity-60"></div>

        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <img
            src="/assets/persona-login.png"
            alt="Estudiante 3D"
            className="h-[70%] lg:h-[90%] w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}