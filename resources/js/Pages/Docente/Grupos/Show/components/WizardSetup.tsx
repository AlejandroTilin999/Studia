import React, { useRef, useState } from 'react';
import { Check, Layers, Trash2, Plus, ArrowRight, CornerDownLeft, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Criterion } from '../services/constants';
import BackButton from '@/Components/common/BackButton';

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
    onBack?: () => void;
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
    finishWizard,
    onBack
}: WizardSetupProps) {
    const nameInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const pctInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [warningMsg, setWarningMsg] = useState<{ id: number; msg: string } | null>(null);

    // Validación inteligente de porcentaje disponible (no permite exceder el 100%)
    const handlePctChange = (criterionId: number, rawVal: string) => {
        const cleanVal = rawVal.replace(/[^0-9]/g, '');
        const num = cleanVal === '' ? 0 : parseInt(cleanVal, 10);

        // Suma de los demás criterios
        const otherSum = draftCriteria
            .filter(c => c.id !== criterionId)
            .reduce((sum, c) => sum + (c.porcentaje || 0), 0);

        const available = Math.max(0, 100 - otherSum);

        if (num > available) {
            // Se excede del disponible -> limitar automáticamente al máximo disponible
            updateCriterion(criterionId, 'porcentaje', available);
            setWarningMsg({
                id: criterionId,
                msg: available > 0
                    ? `Solo tienes ${available}% disponible para este criterio.`
                    : `Ya asignaste el 100% de la ponderación.`
            });
            setTimeout(() => {
                setWarningMsg(prev => (prev?.id === criterionId ? null : prev));
            }, 3500);
        } else {
            updateCriterion(criterionId, 'porcentaje', num);
            if (warningMsg?.id === criterionId) setWarningMsg(null);
        }
    };

    // Salto automático de input con la tecla Enter
    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (idx < draftCriteria.length - 1) {
                nameInputRefs.current[idx + 1]?.focus();
                nameInputRefs.current[idx + 1]?.select();
            } else {
                addCriterion();
                setTimeout(() => {
                    nameInputRefs.current[idx + 1]?.focus();
                    nameInputRefs.current[idx + 1]?.select();
                }, 60);
            }
        }
    };

    const handlePctKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (idx < draftCriteria.length - 1) {
                nameInputRefs.current[idx + 1]?.focus();
                nameInputRefs.current[idx + 1]?.select();
            } else {
                addCriterion();
                setTimeout(() => {
                    nameInputRefs.current[idx + 1]?.focus();
                    nameInputRefs.current[idx + 1]?.select();
                }, 60);
            }
        }
    };

    const handleAddClick = () => {
        addCriterion();
        setTimeout(() => {
            const nextIdx = draftCriteria.length;
            nameInputRefs.current[nextIdx]?.focus();
            nameInputRefs.current[nextIdx]?.select();
        }, 60);
    };

    const hasPlatformSync = draftCriteria.some(c => c.sincronizar_tareas);

    return (
        <div className="w-full space-y-6">
            {/* Encabezado con Botón de Regreso y Stepper Minimalista */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {onBack ? (
                    <BackButton onClick={onBack} />
                ) : <div />}

                {/* Stepper Píldora Minimalista Menos Redondeado */}
                <div className="inline-flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/60 self-start sm:self-auto select-none">
                    <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                            wizardStep === 1
                                ? 'bg-white text-[#0266E0] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <span className="w-4 h-4 rounded-md bg-[#0266E0]/10 text-[#0266E0] flex items-center justify-center text-[10px] font-black">1</span>
                        <span>Criterios</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => pctValid && setWizardStep(2)}
                        disabled={!pctValid}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                            wizardStep === 2
                                ? 'bg-white text-[#0266E0] shadow-xs'
                                : 'text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-700'
                        }`}
                    >
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black ${
                            wizardStep === 2 ? 'bg-[#0266E0]/10 text-[#0266E0]' : 'bg-slate-200 text-slate-500'
                        }`}>2</span>
                        <span>Confirmación</span>
                    </button>
                </div>
            </div>

            {/* Contenedor Principal Estilo Tarjeta Blanca Menos Redondeado (rounded-2xl) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* STEP 1: CONFIGURAR CRITERIOS */}
                {wizardStep === 1 && (
                    <div className="p-6 sm:p-8 space-y-7">
                        {/* Título y Subtítulo de la Unidad */}
                        <div className="text-left space-y-1">
                            <span className="text-[11px] font-black text-[#0266E0] uppercase tracking-widest block">Configuración de Evaluación</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Criterios de evaluación
                            </h2>
                            <p className="text-xs sm:text-sm font-medium text-slate-500">
                                {parcialLabel} · <span className="font-bold text-slate-700">{grupo}</span> · {materia}
                            </p>
                        </div>

                        {/* Pauta de Estado de Distribución (Líneas arriba y abajo, sin bordes laterales) */}
                        <div className="py-4 border-y border-slate-200/80 select-none">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                                <div className="text-left space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                                            pctValid ? 'bg-emerald-500' : totalPct > 100 ? 'bg-rose-500' : 'bg-amber-400'
                                        }`} />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                            {pctValid ? 'Distribución completa (100%)' : totalPct > 100 ? `Excedido por ${totalPct - 100}%` : `Faltan ${100 - totalPct}% por asignar`}
                                        </h4>
                                    </div>
                                    <p className="text-[11.5px] font-medium text-slate-500 pl-4">
                                        {pctValid ? 'Todo listo para revisar y guardar la ponderación' : 'La suma total de porcentajes debe dar exactamente 100%'}
                                    </p>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className={`text-2xl font-black ${
                                        pctValid ? 'text-emerald-600' : totalPct > 100 ? 'text-rose-600' : 'text-slate-800'
                                    }`}>{totalPct}%</span>
                                    <span className="text-xs font-bold text-slate-400 block">de 100%</span>
                                </div>
                            </div>

                            {/* Barra de Ponderación Global */}
                            <div className="w-full bg-slate-100 h-2 rounded-lg overflow-hidden">
                                <div
                                    className={`h-full rounded-lg transition-all duration-500 ${
                                        pctValid ? 'bg-emerald-500' : totalPct > 100 ? 'bg-rose-500' : 'bg-[#0266E0]'
                                    }`}
                                    style={{ width: `${Math.min(totalPct, 100)}%` }}
                                />
                            </div>

                            {!hasPlatformSync && (
                                <p className="text-[11px] font-bold text-amber-600 mt-2 flex items-center gap-1.5 text-left">
                                    <span>*</span> Recuerda activar la casilla "Plataforma" en al menos 1 criterio para vincular tareas del curso.
                                </p>
                            )}
                        </div>

                        {/* Lista de Filas de Criterios (Menos Redondeados: rounded-xl y rounded-lg) */}
                        <div className="space-y-3">
                            {draftCriteria.map((c, idx) => {
                                // Calculamos disponible restante para guiar al usuario
                                const otherSum = draftCriteria
                                    .filter(item => item.id !== c.id)
                                    .reduce((sum, item) => sum + (item.porcentaje || 0), 0);
                                const availableForThis = Math.max(0, 100 - otherSum);

                                return (
                                    <div key={c.id} className="space-y-1">
                                        <div className="group relative flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-xl transition-all duration-200 shadow-2xs">
                                            {/* Nombre e Índice */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="w-7 h-7 rounded-md bg-white border border-slate-200/80 text-slate-700 flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
                                                    {idx + 1}
                                                </span>

                                                {/* Input del Nombre con marco de esquinas rectas/suaves (rounded-lg) */}
                                                <div className="flex-1 min-w-0 bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 focus-within:border-[#0266E0] focus-within:ring-2 focus-within:ring-blue-500/10 shadow-2xs transition-all">
                                                    <input
                                                        ref={el => (nameInputRefs.current[idx] = el)}
                                                        type="text"
                                                        value={c.nombre}
                                                        onChange={e => updateCriterion(c.id, 'nombre', e.target.value)}
                                                        onKeyDown={e => handleNameKeyDown(e, idx)}
                                                        className="w-full bg-transparent border-0 p-0 text-sm font-extrabold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-0"
                                                        placeholder="Nombre del criterio (Ej: Examen, Tareas, Proyecto...)"
                                                    />
                                                </div>
                                            </div>

                                            {/* Controles de Porcentaje, Barra y Acciones */}
                                            <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                                                {/* Barra de progreso visual integrada */}
                                                <div className="hidden lg:flex items-center gap-2 w-40">
                                                    <div className="flex-1 bg-slate-200/80 h-2 rounded-md overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#0266E0] rounded-md transition-all duration-300"
                                                            style={{ width: `${Math.min(c.porcentaje, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Input de Porcentaje (Validado que no supere el disponible) */}
                                                <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 shadow-2xs focus-within:border-[#0266E0] focus-within:ring-2 focus-within:ring-blue-500/10 shrink-0">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Ponderación</span>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            ref={el => (pctInputRefs.current[idx] = el)}
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            value={c.porcentaje === 0 ? '' : c.porcentaje}
                                                            onChange={e => handlePctChange(c.id, e.target.value)}
                                                            onKeyDown={e => handlePctKeyDown(e, idx)}
                                                            className="w-10 text-center bg-transparent border-0 p-0 text-sm font-black text-slate-900 outline-none focus:ring-0"
                                                            placeholder="0"
                                                            title={`Disponible: ${availableForThis}%`}
                                                        />
                                                        <span className="text-xs font-black text-slate-400">%</span>
                                                    </div>
                                                </div>

                                                {/* Botón Toggle de Vinculación a Plataforma */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSyncTasks(c.id)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                                                        c.sincronizar_tareas
                                                            ? 'bg-[#0266E0] text-white border-transparent shadow-xs'
                                                            : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                                                    }`}
                                                    title={c.sincronizar_tareas ? 'Vinculado a tareas del curso' : 'Haz clic para vincular a tareas'}
                                                >
                                                    <Layers size={13} className={c.sincronizar_tareas ? 'text-white' : 'text-slate-400'} />
                                                    <span>Plataforma</span>
                                                </button>

                                                {/* Botón de Eliminar */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeCriterion(c.id)}
                                                    disabled={draftCriteria.length <= 1}
                                                    className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                                                    title="Eliminar criterio"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mensaje de Advertencia Inteligente sobre Porcentaje Máximo Disponible */}
                                        {warningMsg?.id === c.id && (
                                            <div className="flex items-center gap-1.5 px-3 text-[11px] font-extrabold text-amber-600 bg-amber-50/80 py-1 rounded-lg border border-amber-200/60 text-left">
                                                <AlertTriangle size={13} className="shrink-0 text-amber-500" />
                                                <span>{warningMsg.msg}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Botón punteado Agregar Criterio (Estilo Cuadrado rounded-lg) */}
                        <button
                            type="button"
                            onClick={handleAddClick}
                            className="w-full py-3 border-2 border-dashed border-slate-200/90 hover:border-[#0266E0] bg-slate-50/50 hover:bg-blue-50/30 rounded-lg text-xs font-black text-slate-500 hover:text-[#0266E0] transition-all flex items-center justify-center gap-2 cursor-pointer group shadow-2xs select-none"
                        >
                            <Plus size={15} className="stroke-[3] group-hover:scale-110 transition-transform" />
                            <span>Agregar criterio</span>
                            <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-400 group-hover:border-blue-200 group-hover:text-[#0266E0] transition-colors">
                                <CornerDownLeft size={10} /> Presiona Enter
                            </span>
                        </button>

                        {/* Pie con Acción Principal */}
                        <div className="flex justify-end pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setWizardStep(2)}
                                disabled={!pctValid}
                                className="flex items-center gap-2 bg-[#0266E0] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-black text-xs transition-all shadow-sm hover:shadow active:scale-[0.98]"
                            >
                                <span>Revisar y confirmar</span>
                                <ArrowRight size={15} className="stroke-[3]" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: CONFIRMAR CONFIGURACIÓN */}
                {wizardStep === 2 && (
                    <div className="p-6 sm:p-8 space-y-7">
                        <div className="text-left space-y-1">
                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest block">Paso Final</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Confirmar ponderación
                            </h2>
                            <p className="text-xs sm:text-sm font-medium text-slate-500">
                                {parcialLabel} · <span className="font-bold text-slate-700">{grupo}</span> · {materia}
                            </p>
                        </div>

                        {/* Tarjeta Resumen */}
                        <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 divide-y divide-slate-200/60 overflow-hidden text-left">
                            {draftCriteria.map((c, idx) => (
                                <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-md bg-[#0266E0]/10 text-[#0266E0] flex items-center justify-center text-xs font-black">
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm font-extrabold text-slate-900">{c.nombre}</span>
                                        {c.sincronizar_tareas && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-blue-50 text-[#0266E0] border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                <Layers size={10} />
                                                Plataforma
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="hidden sm:block w-28 h-2 bg-slate-200 rounded-md overflow-hidden">
                                            <div className="h-full bg-[#0266E0] rounded-md" style={{ width: `${c.porcentaje}%` }} />
                                        </div>
                                        <span className="text-sm font-black text-slate-900 w-12 text-right">
                                            {c.porcentaje}%
                                        </span>
                                    </div>
                                </div>
                            ))}

                            <div className="flex items-center justify-between px-5 py-3.5 bg-blue-50/60">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Suma Total</span>
                                <span className="text-base font-black text-[#0266E0]">100%</span>
                            </div>
                        </div>

                        {/* Acciones Finales */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <BackButton
                                onClick={() => setWizardStep(1)}
                                label="Modificar criterios"
                            />
                            <button
                                type="button"
                                onClick={finishWizard}
                                className="flex items-center gap-2 bg-[#0266E0] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-black text-xs transition-all shadow-sm hover:shadow active:scale-[0.98]"
                            >
                                <Check size={15} className="stroke-[3]" />
                                <span>Guardar y comenzar parcial</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
