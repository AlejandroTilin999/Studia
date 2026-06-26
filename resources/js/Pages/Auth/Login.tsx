"use client";

import { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import { ButtonLogin } from "@/Components/ButtonLogin";
import { Input } from "@/Components/Input";
import { Label } from "@/Components/Label";
import { cn } from "@/lib/utils";
import Button from "@/Components/ui/button";


export default function LoginPage() {
  const [profile, setProfile] = useState<"student" | "staff">("student");
  
  // Usamos useForm de Inertia para manejar el envío al servidor
  const { post, processing, setData, data } = useForm({
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
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden font-body">
      <Head title="Inicio de Sesión" />
      
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-16 xl:p-2  bg-white relative">
        <div className="max-w-md w-full relative flex flex-col items-center md:items-start">
          <div className="w-full flex md:hidden justify-end mb-4">
            <Button >
              <Link href="/">
               
                Regresar
              </Link>
            </Button>
          </div>
          
          <div className="mb-10 lg:mb-14 flex justify-start ml-0 w-full max-w-[420px]">
            <img 
              src="/assets/logo-ph.webp" 
              alt="Logo PREPAHID" 
              className="w-[320px] lg:w-[380px] h-auto object-contain"
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-6 lg:space-y-8 w-full flex flex-col items-center md:items-start">
            {/* Seleccion de Perfil */}
            <div className="space-y-3 w-full max-w-[420px]">
              <Label className="text-[#777] font-bold text-lg lg:text-xl">Selecciona tu perfil</Label>
              <div className="flex p-1 bg-[#f5f5f7] rounded-xl w-full">
                <button
                  type="button"
                  onClick={() => { setProfile("student"); setData("profile_type", "student"); }}
                  className={cn(
                    "flex-1 py-2 lg:py-2.5 text-xs lg:text-[14px] font-bold rounded-lg transition-all",
                    profile === "student" ? "bg-white shadow-sm text-slate-800" : "text-[#b0b0b0] hover:text-slate-600"
                  )}
                >
                  Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => { setProfile("staff"); setData("profile_type", "staff"); }}
                  className={cn(
                    "flex-1 py-2 lg:py-2.5 text-xs lg:text-[14px] font-bold rounded-lg transition-all",
                    profile === "staff" ? "bg-white shadow-sm text-slate-800" : "text-[#b0b0b0] hover:text-slate-600"
                  )}
                >
                  Personal
                </button>
              </div>
            </div>

            {/* Iniciar Sesión */}
            <div className="space-y-6 lg:space-y-8 w-full max-w-[420px]">
              <h2 className="text-lg lg:text-xl font-bold text-[#555] tracking-tight">Iniciar Sesión</h2>
              
              <div className="space-y-5 lg:space-y-6 w-full">
                <div className="relative">
                  <Label className="text-[11px] lg:text-[13px] font-bold text-[#b5b5b5] absolute -top-2 left-4 bg-white px-2 z-10">
                    {profile === "student" ? "Matrícula" : "Correo electrónico"}
                  </Label>
                  <Input 
                    required
                    value={data.email}
                    onChange={e => setData("email", e.target.value)}
                    className="h-12 lg:h-[54px] border-slate-200 rounded-xl focus:ring-0 focus:border-slate-300 transition-all shadow-none bg-transparent px-5 text-sm lg:text-base w-full"
                  />
                </div>

                <div className="relative">
                  <Label className="text-[11px] lg:text-[13px] font-bold text-[#b5b5b5] absolute -top-2 left-4 bg-white px-2 z-10">
                    Contraseña
                  </Label>
                  <Input 
                    type="password"
                    required
                    value={data.password}
                    onChange={e => setData("password", e.target.value)}
                    className="h-12 lg:h-[54px] border-slate-200 rounded-xl focus:ring-0 focus:border-slate-300 transition-all shadow-none bg-transparent px-5 text-sm lg:text-base w-full"
                  />
                </div>
              </div>
            </div>

            {/* Botón Ingresar */}
            <div className="space-y-2 lg:space-y-2.5 w-full max-w-[420px]">
              <ButtonLogin 
                type="submit"
                disabled={processing}
                className="w-full h-12 lg:h-[54px] bg-[#1a2b4b] hover:bg-[#0f1a2e] text-white font-bold rounded-full text-base lg:text-lg shadow-none transition-transform active:scale-[0.98]"
              >
                {processing ? "Ingresando..." : "Ingresar"}
              </ButtonLogin>
              <div className="w-full text-left">
                <button 
                  type="button"
                  className="text-[#1a2b4b] text-[11px] lg:text-[15px] font-bold hover:underline underline-offset-4"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

          <div className="mt-auto mt-1 lg:mt-2 flex items-center gap-2 text-[11px] lg:text-[14px] font-medium text-[#737373] w-full max-w-[420px] text-left">
    Desarrollado por 
    <img src="/assets/studia-logo.png" alt="Logo PREPAHID" className="w-[60px] lg:w-[60px] h-auto object-contain" />
  </div>
          </form>
        </div>
      </div>


   
      
      {/* Columna Derecha */}
      {/* Columna Derecha */}
<div className="hidden md:flex flex-1 relative bg-white items-center justify-center overflow-hidden h-full">

  <div className="absolute top-6 right-6 z-20">
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