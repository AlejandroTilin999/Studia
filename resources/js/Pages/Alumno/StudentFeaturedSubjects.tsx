import { Folder } from 'lucide-react';

interface Subject {
    name: string;
    progress: number;
    teacher: string;
}

interface StudentFeaturedSubjectsProps {
    featuredSubjects: Subject[];
}

export default function StudentFeaturedSubjects({
    featuredSubjects,
}: StudentFeaturedSubjectsProps) {
    return (
        <>
            {/* Materias Destacadas */}
            <div className="space-y-4 text-left">
                <h4 className="text-sm font-bold text-slate-700">Materias destacadas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredSubjects.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-150 rounded-xl">
                            {/* Icon Box */}
                            <div className="p-2.5 bg-slate-200/50 text-slate-500 rounded-xl shrink-0">
                                <Folder size={18} />
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-slate-700 truncate">{sub.name}</span>
                                    <span className="text-slate-400 shrink-0">{sub.progress}%</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div 
                                        className="bg-[#1e88e5] h-1.5 rounded-full transition-all duration-500" 
                                        style={{ width: `${sub.progress}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold block mt-1.5 truncate">{sub.teacher}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Próximas Clases */}
            <div className="space-y-4 text-left">
                <h4 className="text-sm font-bold text-slate-700">Próximas clases</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="bg-[#e8f2ff] text-[#1e88e5] px-4 py-3 rounded-xl text-xs font-bold select-none border border-blue-100/50 flex-1 text-center">
                        Periodo 3: Física - Aula B3
                    </div>
                    <div className="bg-slate-50 text-slate-600 px-4 py-3 rounded-xl text-xs font-bold select-none border border-slate-200/50 flex-1 text-center">
                        Periodo 4: Receso
                    </div>
                </div>
            </div>
        </>
    );
}
