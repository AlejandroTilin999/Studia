import React from 'react';
import { Check, Layers, Trash2, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { Criterion } from '../services/constants';

interface WizardSetupProps {
    wizardStep: number;
    setWizardStep: (step: number) => void;
    draftCriteria: Criterion[];
    parcialLabel: string;
    grupo: string;
    materia: string;
    pctValid: boolean;
    totalPct: number;
    updateCriterion: (id: number, field: 'nombre' | 'porcentaje', value: string | number) => void;
    toggleSyncTasks: (id: number) => void;
    removeCriterion: (id: number) => void;
    addCriterion: () => void;
    finishWizard: () => void;
}

export default function WizardSetup({
    wizardStep,
    setWizardStep,
    draftCriteria,
    parcialLabel,
    grupo,
    materia,
    pctValid,
    totalPct,
    updateCriterion,
    toggleSyncTasks,
    removeCriterion,
    addCriterion,
    finishWizard
}: WizardSetupProps) {
    return (
        <div>
            {/* Stepper */}
            <div className="flex items-center gap-3 mb-8">
                {[{ n: 1, label: 'Criterios' }, { n: 2, label: 'Confirmar' }].map((s, i) => (
                    <div key={s.n} className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${wizardStep >= s.n ? 'bg-[#1e88e5] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {wizardStep > s.n ? <Check size={13} /> : s.n}
                            </div>
                            <span className={`text-xs font-extrabold ${wizardStep >= s.n ? 'text-slate-700' : 'text-slate-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < 1 && <div className="w-12 h-px bg-slate-200" />}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Step 1: Criterios */}
                {wizardStep === 1 && (
                    <div className="p-8">
                        <h2 className="text-lg font-extrabold text-slate-800 mb-1">
                            Criterios de evaluación
                        </h2>
                        <p className="text-sm text-slate-400 font-semibold mb-6">
                            {parcialLabel} · {grupo} · {materia}
                        </p>

                        {/* Indicador suma */}
                        <div className={`flex flex-col gap-1.5 mb-5 px-4 py-3 rounded-xl ${pctValid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                            <div className="flex items-center gap-2 text-xs font-extrabold">
                                <div className={`w-2 h-2 rounded-full ${pctValid ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                Distribución: {totalPct}% {pctValid ? '— Configuración lista para guardar' : '— Pendiente por asignar (Total 100%)'}
                            </div>
                            {!draftCriteria.some(c => c.sincronizar_tareas) && (
                                <div className="text-[10px] font-bold ml-4 text-slate-400">
                                    * Es necesario vincular un criterio con la plataforma.
                                </div>
                            )}
                        </div>

                        {/* Lista de criterios */}
                        <div className="space-y-3 mb-6">
                            {draftCriteria.map((c, idx) => (
                                <div key={c.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-extrabold text-slate-500 shrink-0">
                                        {idx + 1}
                                    </span>

                                    {/* Nombre */}
                                    <input
                                        type="text"
                                        value={c.nombre}
                                        onChange={e => updateCriterion(c.id, 'nombre', e.target.value)}
                                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-semibold outline-none focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                                        placeholder="Nombre del criterio"
                                    />

                                    {/* Porcentaje */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={c.porcentaje === 0 ? '' : c.porcentaje}
                                            onChange={e => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                const num = val === '' ? 0 : parseInt(val);
                                                if (num <= 100) updateCriterion(c.id, 'porcentaje', num);
                                            }}
                                            className="w-16 text-center bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm font-extrabold text-slate-800 outline-none focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                                            placeholder="0"
                                        />
                                        <span className="text-xs font-extrabold text-slate-400">%</span>
                                    </div>

                                    {/* Barra de progreso */}
                                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
                                        <div
                                            className="h-full bg-[#1e88e5] rounded-full transition-all"
                                            style={{ width: `${Math.min(c.porcentaje, 100)}%` }}
                                        />
                                    </div>

                                    {/* Sincronizar con plataforma */}
                                    <button
                                        onClick={() => toggleSyncTasks(c.id)}
                                        type="button"
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border shrink-0 ${c.sincronizar_tareas
                                                ? 'bg-blue-50 border-blue-200 text-[#1e88e5]'
                                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-655 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Layers size={13} className={c.sincronizar_tareas ? 'text-[#1e88e5]' : 'text-slate-400'} />
                                        <span>Plataforma</span>
                                    </button>

                                    {/* Eliminar */}
                                    <button
                                        onClick={() => removeCriterion(c.id)}
                                        disabled={draftCriteria.length <= 1}
                                        className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Agregar criterio */}
                        <button
                            onClick={addCriterion}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs font-extrabold text-slate-400 hover:border-[#1e88e5] hover:text-[#1e88e5] hover:bg-blue-50/30 transition-all mb-8"
                        >
                            <Plus size={14} />
                            Agregar criterio
                        </button>

                        {/* Acciones */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setWizardStep(2)}
                                disabled={!pctValid}
                                className="flex items-center gap-2 bg-[#1e88e5] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-extrabold text-sm transition-all shadow-sm active:scale-[0.98]"
                            >
                                Revisar y confirmar
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Confirmar */}
                {wizardStep === 2 && (
                    <div className="p-8">
                        <h2 className="text-lg font-extrabold text-slate-800 mb-1">
                            Confirmar configuración
                        </h2>
                        <p className="text-sm text-slate-400 font-semibold mb-6">
                            {parcialLabel} · {grupo} · {materia}
                        </p>

                        {/* Resumen */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100 mb-6 overflow-hidden">
                            {draftCriteria.map((c, idx) => (
                                <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded-full bg-[#1e88e5]/10 text-[#1e88e5] flex items-center justify-center text-[10px] font-extrabold">
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-700">{c.nombre}</span>
                                        {c.sincronizar_tareas && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-[#1e88e5] border border-blue-100 px-2 py-0.5 rounded-md">
                                                <Layers size={9} />
                                                Plataforma
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* mini barra */}
                                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#1e88e5] rounded-full" style={{ width: `${c.porcentaje}%` }} />
                                        </div>
                                        <span className="text-sm font-extrabold text-slate-800 w-10 text-right">
                                            {c.porcentaje === 0 ? '' : `${c.porcentaje}%`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center justify-between px-5 py-3 bg-[#e8f2ff]/60">
                                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total</span>
                                <span className="text-sm font-black text-[#1e88e5]">100%</span>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setWizardStep(1)}
                                className="text-sm font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Editar criterios
                            </button>
                            <button
                                onClick={finishWizard}
                                className="flex items-center gap-2 bg-[#1e88e5] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-extrabold text-sm transition-all shadow-sm active:scale-[0.98]"
                            >
                                <Check size={15} />
                                Guardar y entrar al parcial
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
