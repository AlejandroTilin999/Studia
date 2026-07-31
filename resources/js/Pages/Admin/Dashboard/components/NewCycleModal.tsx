import React, { useState, useEffect, useMemo } from 'react';
import { X, Unlock, Calendar, CheckCircle2, ListChecks, ArrowRight, ArrowLeft, Sun, Snowflake, AlertCircle, Info, BookOpen, GraduationCap, Layout } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormSelect } from '@/Components/forms/FormSelect';
import { cn } from '@/lib/utils';

interface NewCycleModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit';
    data: any;
    setData: any;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const MONTHS = [
    { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }, { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' }, { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

const currentYearNum = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => (currentYearNum + i).toString());

export default function NewCycleModal({
    isOpen,
    onClose,
    mode = 'create',
    data,
    setData,
    errors,
    processing,
    onSubmit
}: NewCycleModalProps) {
    const [step, setStep] = useState(1);
    const [modalidad, setModalidad] = useState<'A' | 'B' | null>(null);
    const [baseYear, setBaseYear] = useState(currentYearNum.toString());

    // Reiniciar al abrir solo si es creación
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            if (mode === 'create') {
                setModalidad(null);
                setBaseYear(currentYearNum.toString());
            } else {
                // Detectar modalidad del nombre si es edición
                if (data.nombre.includes('Periodo A')) setModalidad('A');
                else if (data.nombre.includes('Periodo B')) setModalidad('B');

                // Extraer año base del nombre (ej: "2026-2027" -> "2026")
                const yearMatch = data.nombre.match(/(\d{4})/);
                if (yearMatch) setBaseYear(yearMatch[1]);
            }
        }
    }, [isOpen, mode]);

    // Función para manejar la selección de modalidad y autocompletar
    const handleModalitySelect = (m: 'A' | 'B', yearStr: string) => {
        setModalidad(m);
        const year = parseInt(yearStr);

        const updates: any = {
            nombre: m === 'A'
                ? `Ciclo Escolar ${year}-${year + 1} / Periodo A`
                : `Ciclo Escolar ${year - 1}-${year} / Periodo B`,
            fecha_inicio: m === 'A' ? `${year}-08-01` : `${year}-02-01`,
            fecha_fin: m === 'A' ? `${year}-12-20` : `${year}-07-15`,
            p1_inicio: m === 'A' ? `${year}-08-01` : `${year}-02-01`,
            p1_fin: m === 'A' ? `${year}-09-30` : `${year}-03-31`,
            p1_activo: true,
            p2_inicio: m === 'A' ? `${year}-10-01` : `${year}-04-01`,
            p2_fin: m === 'A' ? `${year}-10-31` : `${year}-04-30`,
            p2_activo: false,
            p3_inicio: m === 'A' ? `${year}-11-01` : `${year}-05-01`,
            p3_fin: m === 'A' ? `${year}-12-20` : `${year}-07-15`,
            p3_activo: false,
        };

        // Solo forzar 'falso' en creación. En edición respetamos lo que ya tiene.
        if (mode === 'create') {
            updates.activo = false;
        }

        setData({ ...data, ...updates });
    };

    // Solo autocompletar si es creación para no sobreescribir ediciones manuales
    useEffect(() => {
        if (modalidad && mode === 'create') {
            handleModalitySelect(modalidad, baseYear);
        }
    }, [baseYear]);

    // Sincronizar anclas si el usuario cambia las fechas globales manualmente
    useEffect(() => {
        if (data.fecha_inicio && data.fecha_inicio.split('-').length === 3) {
            setData('p1_inicio', data.fecha_inicio);
        }
    }, [data.fecha_inicio]);

    useEffect(() => {
        if (data.fecha_fin && data.fecha_fin.split('-').length === 3) {
            setData('p3_fin', data.fecha_fin);
        }
    }, [data.fecha_fin]);

    // [ENCADENAMIENTO v2.9.1] El parcial N inicia un día después de que termina el N-1
    useEffect(() => {
        if (data.p1_fin && data.p1_fin.split('-').length === 3 && data.p1_fin.split('-')[2] !== '') {
            const date = new Date(data.p1_fin + 'T00:00:00');
            date.setDate(date.getDate() + 1);
            const nextDay = date.toISOString().split('T')[0];
            if (data.p2_inicio !== nextDay) setData('p2_inicio', nextDay);
        }
    }, [data.p1_fin]);

    useEffect(() => {
        if (data.p2_fin && data.p2_fin.split('-').length === 3 && data.p2_fin.split('-')[2] !== '') {
            const date = new Date(data.p2_fin + 'T00:00:00');
            date.setDate(date.getDate() + 1);
            const nextDay = date.toISOString().split('T')[0];
            if (data.p3_inicio !== nextDay) setData('p3_inicio', nextDay);
        }
    }, [data.p2_fin]);

    // Reglas de Coherencia
    const validation = useMemo(() => {
        if (!data.fecha_inicio || !data.fecha_fin || !modalidad) return { valid: false, message: null };
        const start = new Date(data.fecha_inicio + 'T00:00:00');
        const end = new Date(data.fecha_fin + 'T00:00:00');
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return { valid: false, message: null };
        const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        if (end <= start) return { valid: false, message: 'La fecha de término debe ser posterior a la de inicio.' };
        if (diffMonths < 3) return { valid: false, message: 'Un ciclo escolar debe durar al menos 4 meses.' };
        if (diffMonths > 7) return { valid: false, message: 'Un ciclo escolar no puede durar más de 7 meses.' };
        const startMonth = start.getMonth() + 1;
        if (modalidad === 'A' && (startMonth < 7 || startMonth > 10)) return { valid: false, message: 'El Periodo A (Nones) normalmente inicia entre Julio y Octubre.' };
        if (modalidad === 'B' && (startMonth > 4 && startMonth < 12)) return { valid: false, message: 'El Periodo B (Pares) normalmente inicia entre Enero y Abril.' };
        return { valid: true, message: null };
    }, [data.fecha_inicio, data.fecha_fin, modalidad]);

    const isStep1Valid = data.nombre.trim() !== '' && validation.valid;

    const handleDatePartChange = (field: string, type: 'day' | 'month' | 'year', value: string) => {
        const currentDate = data[field] || '';
        let [y, m, d] = currentDate.split('-');
        if (type === 'day') d = value;
        if (type === 'month') m = value;
        if (type === 'year') y = value;
        setData(field, `${y || ''}-${m || ''}-${d || ''}`);
    };

    const getParts = (dateStr: string) => {
        const [y, m, d] = (dateStr || '').split('-');
        return { d: d || '', m: m || '', y: y || '' };
    };

    const DatePickerField = ({ label, field, required = false, disabled = false }: { label: string, field: string, required?: boolean, disabled?: boolean }) => {
        const { d, m, y } = getParts(data[field]);
        const days = useMemo(() => {
            const yearVal = parseInt(y) || 2026;
            const monthVal = parseInt(m) || 1;
            const count = new Date(yearVal, monthVal, 0).getDate();
            return Array.from({ length: count }, (_, i) => (i + 1).toString().padStart(2, '0'));
        }, [m, y]);

        return (
            <div className="space-y-2">
                <FormLabel required={required} className="text-[11px] font-normal text-slate-400 uppercase tracking-normal ml-1">{label}</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                    <FormSelect disabled={disabled} value={d} onChange={e => handleDatePartChange(field, 'day', e.target.value)} className={cn("h-11 font-normal", disabled && "bg-slate-50 cursor-not-allowed opacity-60")}>
                        <option value="">Día</option>
                        {days.map(day => <option key={day} value={day}>{day}</option>)}
                    </FormSelect>
                    <FormSelect disabled={disabled} value={m} onChange={e => handleDatePartChange(field, 'month', e.target.value)} className={cn("h-11 font-normal", disabled && "bg-slate-50 cursor-not-allowed opacity-60")}>
                        <option value="">Mes</option>
                        {MONTHS.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
                    </FormSelect>
                    <FormSelect disabled={disabled} value={y} onChange={e => handleDatePartChange(field, 'year', e.target.value)} className={cn("h-11 font-normal", disabled && "bg-slate-50 cursor-not-allowed opacity-60")}>
                        <option value="">Año</option>
                        {YEARS.map(yearOpt => <option key={yearOpt} value={yearOpt}>{yearOpt}</option>)}
                    </FormSelect>
                </div>
            </div>
        );
    };

    const renderParcialScreen = (num: number) => {
        const isFirst = num === 1;
        const isLast = num === 3;

        // El inicio de un parcial siempre está anclado (al semestre o al parcial anterior)
        const isStartDisabled = true;

        return (
            <div className="space-y-6 flex-1 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500 w-full mx-auto">
                <div className="text-center space-y-2">
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">Periodo de Parcial {num}</h3>
                    <p className="text-slate-400 text-xs md:text-sm font-medium px-4">Establece las fechas en las que los docentes podrán asentar las calificaciones de este parcial.</p>
                </div>

                <div className="space-y-6 bg-slate-50/50 p-6 md:p-8 rounded-lg border border-slate-100/80">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <DatePickerField
                            label="Inicio de Captura"
                            field={`p${num}_inicio`}
                            required
                            disabled={isStartDisabled}
                        />
                        <DatePickerField
                            label="Cierre de Captura"
                            field={`p${num}_fin`}
                            required
                            disabled={isLast}
                        />
                    </div>
                    <div className="space-y-1">
                        {isFirst && (
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-normal ml-1 animate-pulse">
                                * Inicia automáticamente con el ciclo escolar.
                            </p>
                        )}
                        {!isFirst && (
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-normal ml-1">
                                * Inicia el día siguiente al cierre del parcial anterior.
                            </p>
                        )}
                        {isLast && (
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-normal ml-1 animate-pulse">
                                * Concluye automáticamente con el ciclo escolar.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-5xl" showFooter={false} fullBleed={true}>
            <div className="grid grid-cols-1 md:grid-cols-10 min-h-0 md:min-h-[500px] max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible h-full text-left relative font-body">
                <button type="button" onClick={onClose} className="fixed md:absolute top-5 right-5 z-50 p-2 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 transition-all focus:outline-none">
                    <X size={20} className="stroke-[2.5]" />
                </button>

                {/* Left Panel - Progress Stepper */}
                <div className="col-span-1 md:col-span-3 bg-[#0266E0] p-6 md:p-8 text-white flex flex-col justify-between select-none relative rounded-t-lg md:rounded-l-lg md:rounded-tr-none shrink-0">
                    <div className="space-y-8">
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <img src="/assets/logo-ph-blanco.webp" alt="Prepa Hidalgo" className="h-8 md:h-9 w-auto object-contain mb-8" />
                            <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                                {mode === 'create' ? 'Apertura de Ciclo' : 'Edición de Ciclo'}
                            </h3>
                            <p className="text-[13px] text-blue-100 leading-relaxed font-medium mt-3">Paso {step} de 4. Sigue el asistente para garantizar un calendario coherente.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-6 pt-2 px-1">
                                {[
                                    { s: 1, label: 'Identidad', sub: 'Datos base' },
                                    { s: 2, label: 'Parcial 01', sub: 'Inicio' },
                                    { s: 3, label: 'Parcial 02', sub: 'Intermedio' },
                                    { s: 4, label: 'Parcial 03', sub: 'Clausura' }
                                ].map((item) => (
                                    <div key={item.s} className="flex gap-4 items-start relative group">
                                        {item.s < 4 && <div className={cn("absolute left-4 top-8 w-0.5 h-8 -ml-[1px] transition-colors duration-500", step > item.s ? 'bg-white' : 'bg-white/20')} />}
                                        <div className={cn("h-8 w-8 rounded-full border-2 flex items-center justify-center font-normal text-[11px] shrink-0 z-10 transition-all duration-500 shadow-sm", step >= item.s ? "bg-white text-blue-600 border-white" : "border-white/20 text-white/40 shadow-none")}>
                                            {item.s}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <h4 className={cn("text-[13px] font-normal transition-colors duration-500", step >= item.s ? "text-white" : "text-white/40")}>{item.label}</h4>
                                            <p className="text-[10px] text-blue-100/60 mt-0.5 truncate font-normal leading-none">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-[10px] text-blue-200 font-black uppercase tracking-[0.2em] pt-6 border-t border-white/15 hidden md:block">Prepahid · Campus Digital</div>
                </div>

                {/* Right Content Area */}
                <div className="col-span-1 md:col-span-7 p-6 md:p-10 flex flex-col justify-between min-h-0 bg-white rounded-b-lg md:rounded-r-lg">

                    {/* STEP 1: GENERAL INFO */}
                    {step === 1 && (
                        <div className="space-y-6 flex-1 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                                <div className="space-y-2 text-left">
                                    <FormLabel required className="text-[11px] font-normal text-slate-400 uppercase tracking-normal ml-1">Año de Referencia</FormLabel>
                                    <FormSelect value={baseYear} onChange={e => setBaseYear(e.target.value)} className="h-11 font-normal text-sm border-2 border-slate-100">
                                        {YEARS.map(y => {
                                            const yInt = parseInt(y);
                                            return <option key={y} value={y}>Ciclo Escolar {yInt}-{yInt + 1}</option>
                                        })}
                                    </FormSelect>
                                </div>
                                <div className="space-y-2 text-left">
                                    <FormLabel required className="text-[11px] font-normal text-slate-400 uppercase tracking-normal ml-1">Modalidad Académica</FormLabel>
                                    <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 gap-1.5">
                                        <button type="button" onClick={() => handleModalitySelect('A', baseYear)} className={cn("flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all", modalidad === 'A' ? "bg-[#0266E0] text-white shadow-none" : "text-slate-400 hover:text-slate-600 hover:bg-white")}>Periodo A</button>
                                        <button type="button" onClick={() => handleModalitySelect('B', baseYear)} className={cn("flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all", modalidad === 'B' ? "bg-[#0266E0] text-white shadow-none" : "text-slate-400 hover:text-slate-600 hover:bg-white")}>Periodo B</button>
                                    </div>
                                </div>
                            </div>

                            {/* [NUEVO v3.9] Selector de Modo de Apertura */}
                            <div className="space-y-3 text-left">
                                <FormLabel required className="text-[11px] font-normal text-slate-400 uppercase tracking-normal ml-1">
                                    {mode === 'create' ? 'Estado Inicial del Ciclo' : 'Estado de Vigencia'}
                                </FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('activo', false)}
                                        className={cn(
                                            "flex flex-col gap-1 p-4 rounded-xl border-2 transition-all text-left",
                                            !data.activo ? "border-[#0266E0] bg-blue-50/50" : "border-slate-100 bg-white hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={cn("text-[11px] font-black uppercase tracking-normal", !data.activo ? "text-[#0266E0]" : "text-slate-500")}>
                                                {mode === 'create' ? 'Modo Planeación' : 'Poner en Planeación'}
                                            </span>
                                            {!data.activo && <CheckCircle2 size={14} className="text-[#0266E0]" />}
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight">
                                            {mode === 'create'
                                                ? 'Recomendado. Permite inscribir y organizar antes de iniciar el periodo.'
                                                : 'Mueve el ciclo a modo preparación (útil para corregir datos base).'}
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('activo', true)}
                                        className={cn(
                                            "flex flex-col gap-1 p-4 rounded-xl border-2 transition-all text-left",
                                            data.activo ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-white hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={cn("text-[11px] font-black uppercase tracking-normal", data.activo ? "text-emerald-600" : "text-slate-500")}>
                                                {mode === 'create' ? 'Activar Inmediatamente' : 'Marcar como Vigente'}
                                            </span>
                                            {data.activo && <CheckCircle2 size={14} className="text-emerald-500" />}
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight">
                                            {mode === 'create'
                                                ? 'El ciclo entra en vigor hoy. Cierra automáticamente el ciclo anterior.'
                                                : 'Activa el ciclo para permitir la captura de calificaciones y tareas.'}
                                        </p>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <FormLabel className="text-[11px] font-normal text-slate-400 uppercase tracking-normal ml-1">Nombre Oficial del Ciclo</FormLabel>
                                <FormInput value={data.nombre} onChange={e => setData('nombre', e.target.value)} placeholder="Ej: Ciclo Escolar 2026-2027 / Periodo A" className="h-11 text-sm font-normal border-slate-200 focus:border-[#0266E0] rounded-lg transition-all" icon={<Calendar size={18} className="text-slate-400" />} />
                                {errors.nombre && <span className="text-red-500 text-[11px] font-bold mt-1 block pl-2">{errors.nombre}</span>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                                <DatePickerField label="Fecha de Inicio del Semestre" field="fecha_inicio" required />
                                <DatePickerField label="Fecha de Término del Semestre" field="fecha_fin" required />
                            </div>

                            {!validation.valid && validation.message && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <AlertCircle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-rose-700 font-bold leading-tight">{validation.message}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEPS 2, 3, 4: PARCIALES */}
                    {(step === 2 || step === 3 || step === 4) && renderParcialScreen(step - 1)}

                    {/* Navigation Actions */}
                    <div className="mt-12 flex justify-between items-center border-t border-slate-100 pt-8 select-none">
                        <button
                            type="button"
                            onClick={step > 1 ? () => setStep(step - 1) : onClose}
                            className="px-8 py-3 text-slate-500 font-bold text-xs uppercase tracking-normal hover:text-slate-800 transition-all"
                        >
                            {step > 1 ? "Atrás" : "Cancelar"}
                        </button>

                        <button
                            type="button"
                            onClick={step < 4 ? () => setStep(step + 1) : onSubmit}
                            disabled={processing || !isStep1Valid}
                            className={cn(
                                "px-10 py-4 bg-[#0266E0] text-white rounded-lg font-bold text-xs uppercase tracking-normal transition-all flex items-center gap-2",
                                !isStep1Valid ? "opacity-30 grayscale cursor-not-allowed" : "hover:bg-blue-700 active:scale-[0.98]"
                            )}
                        >
                            {processing ? 'Procesando...' : (
                                <>
                                    {step < 4 ? "Siguiente" : (mode === 'create' ? "Finalizar Apertura" : "Guardar Cambios")}
                                    {step < 4 ? <ArrowRight size={16} /> : <CheckCircle2 size={16} />}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
