import * as React from "react";

interface TeacherInfoCardProps {
    name: string;
    specialty: string;
    email: string;
    groupsCount?: number;
}

export default function TeacherInfoCard({ name, specialty, email, groupsCount = 0 }: TeacherInfoCardProps) {
    // Helper to split full name into parts
    const nameParts = name.trim().split(/\s+/).filter(p => !["Mtro.", "Mtra.", "Dr.", "Dra.", "Ing."].includes(p));
    let firstName = name;
    let lastNamePaternal = '-';
    let lastNameMaternal = '-';

    if (nameParts.length >= 4) {
        firstName = nameParts.slice(0, nameParts.length - 2).join(' ');
        lastNamePaternal = nameParts[nameParts.length - 2];
        lastNameMaternal = nameParts[nameParts.length - 1];
    } else if (nameParts.length === 3) {
        firstName = nameParts[0];
        lastNamePaternal = nameParts[1];
        lastNameMaternal = nameParts[2];
    } else if (nameParts.length === 2) {
        firstName = nameParts[0];
        lastNamePaternal = nameParts[1];
        lastNameMaternal = '-';
    }

    return (
        <div className="bg-slate-50 rounded-xl p-6 md:p-8 border border-slate-200/80 select-none transition-all duration-300 hover:shadow-xs">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* Profile Header with Basic Info (Aligned to Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pb-5 border-b border-slate-200/50 text-left items-center">

                    <div className="lg:col-span-4 space-y-1.5">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Tu Información Profesional</span>
                        <h3 className="text-xl font-medium text-slate-800 leading-none tracking-tight">{name}</h3>
                        <p className="text-xs text-slate-500 font-semibold">{email}</p>
                    </div>

                    <div className="hidden lg:flex flex-col items-end text-right gap-1 shrink-0 ml-auto">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-right">Institución</span>
                        <img src="/assets/phid_logo.webp" alt="Prepa Hidalgo" className="h-7 w-auto grayscale opacity-70" />
                    </div>
                </div>

                {/* Grid of Detailed Data */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pt-1 text-left">
                    <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Nombre(s)</span>
                        <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1">{firstName}</h3>
                    </div>
                    <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Apellido Paterno</span>
                        <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1">{lastNamePaternal}</h3>
                    </div>
                    <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Apellido Materno</span>
                        <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1">{lastNameMaternal}</h3>
                    </div>
                    <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Especialidad</span>
                        <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1">{specialty || 'General'}</h3>
                    </div>
                    <div className="min-w-0">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Ciclo Escolar</span>
                        <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1">2026-A (Activo)</h3>
                    </div>
                    <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] block">Grupos Asignados</span>
                        <h3 className="text-[13px] font-bold text-slate-700 leading-tight mt-1">{groupsCount} grupos</h3>
                    </div>
                </div>

            </div>
        </div>
    );
}
