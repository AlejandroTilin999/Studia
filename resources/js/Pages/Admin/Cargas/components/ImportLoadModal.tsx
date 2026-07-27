import React, { useState } from 'react';
import { X, Download, Layers, Users, AlertCircle } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormSelect } from '@/Components/forms/FormSelect';
import { SwalHelper } from '@/utils/SwalHelper';

interface ImportLoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    periods: any[];
    groups: any[];
    onConfirm: (data: any) => void;
    processing: boolean;
}

export default function ImportLoadModal({
    isOpen,
    onClose,
    periods = [],
    groups = [],
    onConfirm,
    processing
}: ImportLoadModalProps) {
    const [sourcePeriodId, setSourcePeriodId] = useState('');
    const [sourceGroupId, setSourceGroupId] = useState('');
    const [targetPeriodId, setTargetPeriodId] = useState('');
    const [targetGroupId, setTargetGroupId] = useState('');
    const [includeTeachers, setIncludeTeachers] = useState(true);

    const isFormValid = sourcePeriodId && sourceGroupId && targetPeriodId && targetGroupId;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            grupo_origen_id: sourceGroupId,
            ciclo_origen_id: sourcePeriodId,
            grupo_destino_id: targetGroupId,
            ciclo_destino_id: targetPeriodId,
            incluir_docentes: includeTeachers
        });
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-3xl"
            showFooter={false}
            fullBleed={true}
        >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[400px] h-full text-left relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 z-50 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 transition-all focus:outline-none">
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Panel */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none shrink-0">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-8 w-auto object-contain mb-6" />
                            <h3 className="text-xl font-bold text-white leading-tight flex items-center gap-2">
                                <Download size={22} />
                                Importar Carga Académica
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                Reutiliza la estructura de materias y docentes de un grupo o ciclo anterior para agilizar la planeación actual.
                            </p>
                            <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex gap-2.5">
                                <AlertCircle size={14} className="text-blue-200 shrink-0" />
                                <p className="text-[10px] text-blue-50 font-medium">Esta acción no duplicará materias si ya existen en el destino.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 bg-white rounded-b-[10px] md:rounded-r-[10px]">
                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><Layers size={12}/> Origen (De dónde copiar)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <FormLabel required>Ciclo Escolar</FormLabel>
                                    <FormSelect value={sourcePeriodId} onChange={e => setSourcePeriodId(e.target.value)} required>
                                        <option value="">Selecciona...</option>
                                        {periods.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </FormSelect>
                                </div>
                                <div className="space-y-1.5">
                                    <FormLabel required>Grupo Académico</FormLabel>
                                    <FormSelect value={sourceGroupId} onChange={e => setSourceGroupId(e.target.value)} required>
                                        <option value="">Selecciona...</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                                    </FormSelect>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><Download size={12}/> Destino (A dónde copiar)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <FormLabel required>Ciclo Escolar</FormLabel>
                                    <FormSelect value={targetPeriodId} onChange={e => setTargetPeriodId(e.target.value)} required>
                                        <option value="">Selecciona...</option>
                                        {periods.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </FormSelect>
                                </div>
                                <div className="space-y-1.5">
                                    <FormLabel required>Grupo Académico</FormLabel>
                                    <FormSelect value={targetGroupId} onChange={e => setTargetGroupId(e.target.value)} required>
                                        <option value="">Selecciona...</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                                    </FormSelect>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-3">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={includeTeachers}
                                    onChange={e => setIncludeTeachers(e.target.checked)}
                                    className="rounded border-slate-300 text-[#0266E0] focus:ring-[#0266E0] transition-all"
                                />
                                <div className="flex items-center gap-1.5">
                                    <Users size={14} className="text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Importar también asignación de docentes</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end items-center gap-3 border-t border-slate-100 pt-5">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-700">Cerrar</button>
                        <button
                            type="submit"
                            disabled={processing || !isFormValid}
                            className="px-8 py-2.5 bg-[#0266E0] text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            {processing ? 'Copiando...' : 'Importar Ahora'}
                        </button>
                    </div>
                </div>
            </form>
        </BaseModal>
    );
}
