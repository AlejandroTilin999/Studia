import * as React from "react";

interface TeacherInfoCardProps {
    name: string;
    specialty: string;
    email: string;
}

export default function TeacherInfoCard({ name, specialty, email }: TeacherInfoCardProps) {
    const initials = name
        .split(" ")
        .filter((n) => n.length > 0 && !["Mtro.", "Mtra.", "Dr.", "Dra.", "Ing."].includes(n))
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "DC";

    return (
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[32px] p-6 text-left shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center group transition-all duration-300 hover:shadow-md hover:border-blue-100/50">
            {/* Elemento decorativo */}
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex items-center gap-5">
                <div className="h-16 w-16 bg-gradient-to-br from-[#e8f2ff] to-[#f4f7ff] text-[#1e88e5] border border-blue-100 rounded-[22px] flex items-center justify-center font-black text-2xl shadow-inner transform group-hover:scale-105 transition-transform duration-500">
                    {initials}
                </div>
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-[#1e88e5] rounded-full mb-1.5 border border-blue-100/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e88e5] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Perfil Docente Activo</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 leading-none tracking-tight">{name}</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                        Especialidad: <span className="text-slate-600 font-black">{specialty || 'No asignada'}</span>
                    </p>
                </div>
            </div>

            <div className="relative z-10 bg-slate-50/80 border border-slate-100 rounded-2xl px-5 py-3 flex flex-col items-start sm:items-end gap-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Correo Institucional</span>
                <a href={`mailto:${email}`} className="text-sm text-slate-700 font-bold hover:text-[#1e88e5] transition-colors">{email}</a>
            </div>
        </div>
    );
}
