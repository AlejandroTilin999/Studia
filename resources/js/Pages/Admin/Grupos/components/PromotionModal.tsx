import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormSelect } from '@/Components/forms/FormSelect';
import { SwalHelper } from '@/utils/SwalHelper';
import axios from 'axios';
import { cn } from '@/lib/utils';

interface StudentItem {
    id: number;
    nombre: string;
    matricula: string;
}

interface PromotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceGroup: any;
    cycles: any[];
    groups: any[];
    onConfirm: (data: any) => void;
    processing: boolean;
}

export default function PromotionModal({
    isOpen,
    onClose,
    sourceGroup,
    cycles = [],
    groups = [],
    onConfirm,
    processing
}: PromotionModalProps) {
    const [targetCycleId, setTargetCycleId] = useState('');
    const [targetGroupId, setTargetGroupId] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Cargar alumnos al abrir
    useEffect(() => {
        if (isOpen && sourceGroup) {
            fetchStudents();
            // Sugerir grupo destino (N+1)
            const nextSemestre = (sourceGroup.semestre || 0) + 1;
            const suggestion = groups.find(g =>
                g.id !== sourceGroup.id &&
                g.semestre === nextSemestre &&
                g.specialty === sourceGroup.specialty
            );
            if (suggestion) setTargetGroupId(suggestion.id.toString());

            // Sugerir ciclo activo o siguiente
            const activeCycle = cycles.find(c => c.activo);
            if (activeCycle) setTargetCycleId(activeCycle.id.toString());
        }
    }, [isOpen, sourceGroup]);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            // Reutilizar lógica de reportes o crear una ligera
            const response = await axios.get(route('admin.reportes.asistencia_data', {
                grupo_id: sourceGroup.id,
                ciclo_id: cycles.find(c => c.activo)?.id || cycles[0]?.id
            }));
            const fetched = response.data.enrollments.map((e: any) => ({
                id: e.usuario_id, // Necesitamos el usuario_id para la promoción
                nombre: e.nombre,
                matricula: e.matricula
            }));
            setStudents(fetched);
            setSelectedStudents(fetched.map((s: any) => s.id));
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleToggleStudent = (id: number) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const isLastSemester = sourceGroup?.semestre === 6;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudents.length === 0) return SwalHelper.alert("Selección requerida", "Debes seleccionar al menos un alumno para promover.", "warning");

        onConfirm({
            grupo_origen_id: sourceGroup.id,
            grupo_destino_id: targetGroupId,
            ciclo_destino_id: targetCycleId,
            alumnos_ids: selectedStudents,
            marcar_egresados: isLastSemester
        });
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-4xl"
            showFooter={false}
            fullBleed={true}
        >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-10 min-h-0 md:min-h-[500px] h-full text-left relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 z-50 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 transition-all focus:outline-none">
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Panel */}
                <div className="col-span-1 md:col-span-3 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none shrink-0">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-8 w-auto object-contain mb-6" />
                            <h3 className="text-xl font-bold text-white leading-tight flex items-center gap-3">
                                <TrendingUp size={24} />
                                Gestión de Promociones
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs text-blue-100 leading-relaxed">
                                {isLastSemester
                                    ? 'Estás en el proceso de graduación. Al confirmar, los alumnos seleccionados serán marcados como Egresados del centro escolar.'
                                    : `Promueve a los alumnos del grupo ${sourceGroup?.name} al siguiente nivel académico.`}
                            </p>
                            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-200 block mb-1">Regla Administrativa</span>
                                <p className="text-[10px] text-blue-50 font-medium">Solo se permite la promoción a grupos del semestre inmediatamente superior.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-1 md:col-span-7 p-6 flex flex-col justify-between min-h-0 bg-white rounded-b-[10px] md:rounded-r-[10px]">
                    <div className="flex-1 overflow-hidden flex flex-col space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <FormLabel required>Ciclo Destino</FormLabel>
                                <FormSelect value={targetCycleId} onChange={e => setTargetCycleId(e.target.value)} required>
                                    <option value="">Seleccionar ciclo...</option>
                                    {cycles.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.activo && '(Vigente)'}</option>)}
                                </FormSelect>
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel required>{isLastSemester ? 'Grupo de Egreso' : 'Grupo Destino'}</FormLabel>
                                <FormSelect value={targetGroupId} onChange={e => setTargetGroupId(e.target.value)} required>
                                    <option value="">Seleccionar grupo...</option>
                                    {groups.filter(g => g.id !== sourceGroup?.id).map(g => (
                                        <option key={g.id} value={g.id}>{g.name} - {g.semestre}° Sem</option>
                                    ))}
                                </FormSelect>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-3">
                                <FormLabel className="mb-0">Alumnos a Promover ({selectedStudents.length})</FormLabel>
                                <button type="button" onClick={() => setSelectedStudents(students.map(s => s.id))} className="text-[10px] font-bold text-[#0266E0] uppercase hover:underline">Seleccionar todos</button>
                            </div>

                            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-2">
                                {loadingStudents ? (
                                    <div className="h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#0266E0] border-t-transparent rounded-full animate-spin" /></div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {students.map(s => {
                                            const isSelected = selectedStudents.includes(s.id);
                                            return (
                                                <div
                                                    key={s.id}
                                                    onClick={() => handleToggleStudent(s.id)}
                                                    className={cn(
                                                        "p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3",
                                                        isSelected ? "bg-white border-blue-200 shadow-sm" : "bg-transparent border-transparent grayscale opacity-60"
                                                    )}
                                                >
                                                    <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-[#0266E0] border-[#0266E0]" : "bg-white border-slate-300")}>
                                                        {isSelected && <CheckCircle2 size={10} className="text-white" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-bold text-slate-700 truncate leading-none mb-1 uppercase">{s.nombre}</p>
                                                        <p className="text-[9px] font-medium text-slate-400 font-mono tracking-tighter">{s.matricula}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end items-center gap-3 border-t border-slate-100 pt-5">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-700">Cancelar</button>
                        <button
                            type="submit"
                            disabled={processing || loadingStudents}
                            className="px-8 py-2.5 bg-[#0266E0] text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            {isLastSemester ? 'Confirmar Egreso' : 'Promover Alumnos'}
                        </button>
                    </div>
                </div>
            </form>
        </BaseModal>
    );
}
