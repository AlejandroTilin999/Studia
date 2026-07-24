import React, { useState } from 'react';
import BaseModal from '@/Components/BaseModal';
import { Package, X, Calendar, Users, FileStack, Layers } from 'lucide-react';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormSelect } from '@/Components/forms/FormSelect';

interface GroupItem {
    id: number;
    nombre: string;
}

interface PeriodItem {
    id: number;
    nombre: string;
}

interface BatchDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: GroupItem[];
    periods: PeriodItem[];
    onProcess: (params: { tipo: string, grupo_id: string, ciclo_id: string }) => void;
    processing: boolean;
}

export default function BatchDownloadModal({
    isOpen,
    onClose,
    groups,
    periods,
    onProcess,
    processing
}: BatchDownloadModalProps) {
    const [tipo, setTipo] = useState('boleta');
    const [grupoId, setGrupoId] = useState('');
    const [cicloId, setCicloId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tipo || !grupoId || !cicloId) return;
        onProcess({ tipo, grupo_id: grupoId, ciclo_id: cicloId });
    };

    const isFormValid = tipo && grupoId && cicloId;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-3xl"
            showFooter={false}
            fullBleed={true}
        >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[460px] max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible h-full text-left relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="fixed md:absolute top-4 right-4 z-50 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Panel - Brand Blue */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none shrink-0">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-8 md:h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight flex items-center gap-3">
                                <FileStack size={22} className="shrink-0" />
                                Descarga por Lote
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[11px] md:text-xs text-blue-100 leading-relaxed font-normal">
                                Esta herramienta permite generar un único archivo de impresión con los documentos de todos los alumnos de un grupo seleccionado.
                            </p>
                            <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                                <p className="text-[10px] text-blue-50 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Layers size={10} />
                                    Tip:
                                </p>
                                <p className="text-[10px] text-blue-100">
                                    Ideal para la entrega masiva de boletas al final de cada parcial o semestre.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block mt-6">
                        ADMINISTRACIÓN DE EXPEDIENTES GRUPALES
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="col-span-1 md:col-span-3 p-5 md:p-8 flex flex-col justify-between min-h-0 bg-white rounded-b-[10px] md:rounded-r-[10px] md:rounded-bl-none">
                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                        <div className="space-y-2">
                            <FormLabel required>1. Selecciona el Tipo de Documento</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setTipo('boleta')}
                                    className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${tipo === 'boleta' ? 'border-[#0266E0] bg-blue-50/50 ring-1 ring-[#0266E0]/10' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${tipo === 'boleta' ? 'text-[#0266E0]' : 'text-slate-600'}`}>Boletas</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipo('constancia')}
                                    className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${tipo === 'constancia' ? 'border-[#0266E0] bg-blue-50/50 ring-1 ring-[#0266E0]/10' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${tipo === 'constancia' ? 'text-[#0266E0]' : 'text-slate-600'}`}>Constancias</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipo('asistencia')}
                                    className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${tipo === 'asistencia' ? 'border-[#0266E0] bg-blue-50/50 ring-1 ring-[#0266E0]/10' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${tipo === 'asistencia' ? 'text-[#0266E0]' : 'text-slate-600'}`}>Asistencias</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <FormLabel required>2. Ciclo Escolar</FormLabel>
                                <FormSelect
                                    value={cicloId}
                                    onChange={e => setCicloId(e.target.value)}
                                    className="h-10 text-xs"
                                >
                                    <option value="">Seleccionar ciclo...</option>
                                    {periods.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </FormSelect>
                            </div>

                            <div className="space-y-1.5">
                                <FormLabel required>3. Grupo Académico</FormLabel>
                                <FormSelect
                                    value={grupoId}
                                    onChange={e => setGrupoId(e.target.value)}
                                    className="h-10 text-xs font-bold"
                                >
                                    <option value="">Seleccionar grupo...</option>
                                    <option value="all" className="text-[#0266E0] font-black">--- TODOS LOS GRUPOS ---</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.nombre}</option>
                                    ))}
                                </FormSelect>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end items-center gap-2 border-t border-slate-100 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-slate-350 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                        >
                            Cerrar
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid || processing}
                            className="px-6 py-2 bg-[#0266E0] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus:outline-none active:scale-[0.98] shadow-sm flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                "Descargar todas"
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </BaseModal>
    );
}
