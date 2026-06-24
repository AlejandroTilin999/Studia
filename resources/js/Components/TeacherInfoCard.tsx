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
        .toUpperCase() || "FM";

    return (
        <div className="bg-[#f8fafc] border border-slate-200/60 rounded-xl p-5 mb-6 text-left shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-[#e8f2ff] text-[#1e88e5] border border-blue-100/50 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm">
                    {initials}
                </div>
                <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Docente Adscrito</span>
                    <h3 className="text-base font-extrabold text-slate-800 leading-tight">{name}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{specialty}</p>
                </div>
            </div>
            <div className="text-xs text-slate-400 font-medium">
                <span className="font-semibold text-slate-500">Contacto: </span>
                <a href={`mailto:${email}`} className="text-[#1e88e5] font-bold hover:underline">{email}</a>
            </div>
        </div>
    );
}
