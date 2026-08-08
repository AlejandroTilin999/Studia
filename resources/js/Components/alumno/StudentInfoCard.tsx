import * as React from "react";

interface StudentInfoCardProps {
    matricula: string;
    name: string;
    groupName: string;
}

export default function StudentInfoCard({ matricula, name, groupName }: StudentInfoCardProps) {
    return (
        <div className="bg-[#f8fafc] border border-slate-200/60 rounded-xl p-5 mb-6 text-left shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Matrícula</span>
                    <span className="font-extrabold text-slate-700 text-sm block">{matricula}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre Completo</span>
                    <span className="font-extrabold text-slate-700 text-sm block">{name}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grado y grupo</span>
                    <span className="font-extrabold text-slate-700 text-sm block">{groupName}</span>
                </div>
            </div>
        </div>
    );
}
