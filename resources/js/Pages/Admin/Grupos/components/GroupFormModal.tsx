import React, { useState, useEffect, useMemo } from 'react';
import { X, Layers, Hash, Calendar, AlertTriangle, Info } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormSelect } from '@/Components/forms/FormSelect';
import { FormInput } from '@/Components/forms/FormInput';
import { cn } from '@/lib/utils';

interface GroupFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    group: any;
    data: {
        codigo: string;
        nombre: string;
        turno: string;
        semestre: number | string;
        seccion: string;
        generacion: string;
        especialidad: string;
        docente_tutor_id: string | number;
        activo: boolean;
        crear_escalera?: boolean;
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    profesores?: any[];
    specialties?: any[];
    currentYear?: number;
    activeParity?: 'odd' | 'even';
}

export default function GroupFormModal({
    isOpen,
    onClose,
    mode,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    specialties = [],
    profesores = [],
    currentYear = new Date().getFullYear(),
    activeParity = 'odd',
}: GroupFormModalProps) {
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');

    const availableSemesters = useMemo(() => {
        if (activeParity === 'even') {
            return [2, 4, 6];
        }
        return [1, 3, 5];
    }, [activeParity]);

    const getDefaultGeneration = useMemo(() => {
        return (semNum: number) => {
            let targetStartYear = currentYear;
            if (activeParity === 'even') {
                if (semNum === 2) targetStartYear = currentYear - 1;
                else if (semNum === 4) targetStartYear = currentYear - 2;
                else if (semNum === 6) targetStartYear = currentYear - 3;
            } else {
                if (semNum === 1) targetStartYear = currentYear;
                else if (semNum === 3) targetStartYear = currentYear - 1;
                else if (semNum === 5) targetStartYear = currentYear - 2;
            }
            return `${targetStartYear}-${targetStartYear + 3}`;
        };
    }, [currentYear, activeParity]);

    // Sincronizar y parsear datos al abrir el modal
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit') {
                if (data.semestre) {
                    setSelectedSemester(data.semestre.toString());
                } else if (data.codigo) {
                    const firstPart = data.codigo.trim().split('-')[0] || '';
                    if (firstPart.length >= 1) {
                        setSelectedSemester(firstPart.charAt(0));
                    }
                }
                setSelectedSection(data.seccion || 'A');
            } else {
                // En modo creación, selecciona el semestre por defecto según el ciclo activo (2° en Periodo B)
                const defaultSemStr = activeParity === 'even' ? '2' : '1';
                const defaultSemNum = Number(defaultSemStr);
                const defaultGen = getDefaultGeneration(defaultSemNum);

                setSelectedSemester(defaultSemStr);
                setSelectedSection('A');
                setData('seccion', 'A');
                setData('turno', 'Matutino');
                setData('semestre', defaultSemNum);
                setData('generacion', defaultGen);
                setData('crear_escalera', true);
            }
        }
    }, [isOpen, mode, activeParity, currentYear, getDefaultGeneration]);

    // Autogenerar generación al cambiar semestre en modo creación
    useEffect(() => {
        if (isOpen && mode === 'create' && selectedSemester) {
            const semNum = Number(selectedSemester);
            const gen = getDefaultGeneration(semNum);
            setData('generacion', gen);
        }
    }, [selectedSemester, isOpen, mode, getDefaultGeneration]);

    const generationOptions = React.useMemo(() => {
        const options: string[] = [];
        const baseYear = currentYear - 4;
        for (let i = 0; i <= 6; i++) {
            const start = baseYear + i;
            const end = start + 3;
            options.push(`${start}-${end}`);
        }
        if (data.generacion && !options.includes(data.generacion)) {
            options.unshift(data.generacion);
        }
        return options;
    }, [currentYear, data.generacion]);

    const getSpecialtySuffix = (major: string) => {
        if (!major || !major.trim()) return '';
        const majorLower = major.trim().toLowerCase();
        const match = specialties.find(
            s => s && ((s.nombre?.toLowerCase() === majorLower) ||
            (majorLower === 'ti' && s.nombre?.toLowerCase() === 'informática'))
        );
        return match ? (match.codigo?.toUpperCase() || 'INF') : '';
    };

    // Autogenerar código y nombre al cambiar semestre, sección o especialidad solo en modo creación
    useEffect(() => {
        if (isOpen && mode === 'create') {
            const suffix = getSpecialtySuffix(data.especialidad);
            if (selectedSemester && selectedSection && suffix && data.especialidad) {
                const genYear = data.generacion ? data.generacion.split('-')[0] : currentYear;
                setData('codigo', `${selectedSemester}${selectedSection}-${suffix}-${genYear}`);
                setData('semestre', Number(selectedSemester));
                setData('seccion', selectedSection);
            } else {
                setData('codigo', '');
            }
        }
    }, [selectedSemester, selectedSection, data.especialidad, data.generacion, isOpen, currentYear, mode]);

    useEffect(() => {
        if (isOpen && mode === 'create') {
            if (!data.especialidad) {
                setData('nombre', '');
                return;
            }
            const majorLower = data.especialidad?.toLowerCase() || '';
            const match = specialties.find(
                s => s && ((s.nombre?.toLowerCase() === majorLower) ||
                (majorLower === 'ti' && s.nombre?.toLowerCase() === 'informática'))
            );
            const displayMajor = match ? match.nombre : (data.especialidad === 'TI' ? 'Informática' : data.especialidad);

            if (selectedSemester && selectedSection && displayMajor) {
                setData('nombre', `${selectedSemester}°${selectedSection} ${displayMajor}`);
            } else {
                setData('nombre', '');
            }
        }
    }, [selectedSemester, selectedSection, data.especialidad, isOpen, mode]);

    const isFormValid = mode === 'edit' || (data.generacion.trim() !== '' && data.especialidad.trim() !== '' && selectedSemester !== '');

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-3xl"
            onSubmit={onSubmit}
            isConfirmDisabled={processing || !isFormValid}
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[420px] max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible h-full text-left relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="fixed md:absolute top-4 right-4 z-50 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Panel */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none shrink-0">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.webp" alt="Prepa Hidalgo" className="h-8 md:h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                                {mode === 'create' ? 'Registrar Nuevo Grupo' : 'Modificar Grupo'}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] md:text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Genera un nuevo grupo académico. Define la generación, el semestre y vincula un tutor.'
                                    : 'Actualiza la información estructural del grupo o cambia al docente tutor.'}
                            </p>
                        </div>
                    </div>
                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block mt-6 uppercase tracking-widest">
                        PREPAHID · CAMPUS DIGITAL
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-1 md:col-span-3 p-5 md:p-6 flex flex-col justify-between min-h-0 md:min-h-[400px] relative bg-white rounded-b-[10px] md:rounded-r-[10px] md:rounded-bl-none">
                    <div className="space-y-4 flex-1 flex flex-col justify-center">

                        {/* Leyenda Explicativa de Registro Automático */}
                        {mode === 'create' && (
                            <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-left text-blue-900">
                                <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                <div className="text-xs leading-relaxed">
                                    <span className="font-bold block text-blue-900 mb-0.5">Generación en Escalera y Asignación Automática</span>
                                    Selecciona la especialidad. El sistema asignará automáticamente la letra de grupo correspondiente (ej. <strong>A</strong>, <strong>B</strong>, <strong>C</strong>...) y generará su ruta en escalera.
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Semestre</FormLabel>
                                {mode === 'create' ? (
                                    <FormSelect
                                        value={selectedSemester}
                                        onChange={e => setSelectedSemester(e.target.value)}
                                        className="h-9 text-xs font-normal"
                                    >
                                        {availableSemesters.map(s => (
                                            <option key={s} value={s}>{s}° Semestre</option>
                                        ))}
                                    </FormSelect>
                                ) : (
                                    <FormInput
                                        readOnly
                                        value={selectedSemester ? `${selectedSemester}° Semestre` : '---'}
                                        className="h-9 text-xs bg-slate-50 border-slate-200 text-slate-700 font-semibold cursor-not-allowed select-none"
                                    />
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel required>Bachillerato / Especialidad</FormLabel>
                                {mode === 'create' ? (
                                    <FormSelect
                                        value={data.especialidad}
                                        onChange={e => setData('especialidad', e.target.value)}
                                        className="h-9 text-xs"
                                    >
                                        <option value="">Selecciona especialidad</option>
                                        {specialties.map((s) => (
                                            <option key={s.id} value={s.nombre}>{s.nombre}</option>
                                        ))}
                                    </FormSelect>
                                ) : (
                                    <FormInput
                                        readOnly
                                        value={data.especialidad || '---'}
                                        className="h-9 text-xs bg-slate-50 border-slate-200 text-slate-700 font-semibold cursor-not-allowed select-none"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Generación</FormLabel>
                                {mode === 'create' ? (
                                    <FormSelect
                                        value={data.generacion}
                                        onChange={e => setData('generacion', e.target.value)}
                                        className="h-9 text-xs font-normal"
                                    >
                                        <option value="">Seleccionar generación...</option>
                                        {generationOptions.map(gen => (
                                            <option key={gen} value={gen}>Gen. {gen}</option>
                                        ))}
                                    </FormSelect>
                                ) : (
                                    <FormInput
                                        readOnly
                                        value={data.generacion ? `Gen. ${data.generacion}` : '---'}
                                        className="h-9 text-xs bg-slate-50 border-slate-200 text-slate-700 font-semibold cursor-not-allowed select-none"
                                    />
                                )}
                                {errors.generacion && <span className="text-red-500 text-[10px] mt-1 block">{errors.generacion}</span>}
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel required>Turno</FormLabel>
                                <FormInput
                                    readOnly
                                    value={data.turno || 'Matutino'}
                                    className="h-9 text-xs bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed select-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel>Profesor Titular (Tutor)</FormLabel>
                            <FormSelect
                                value={data.docente_tutor_id}
                                onChange={e => setData('docente_tutor_id', e.target.value)}
                                className="h-9 text-xs"
                            >
                                <option value="">Sin tutor asignado</option>
                                {profesores.map((p) => (
                                    <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                                ))}
                            </FormSelect>
                        </div>

                        {/* Preview Box */}
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Previsualización</span>
                                <Layers size={12} className="text-slate-300" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-medium block">Código Único</span>
                                    <span className="text-[12px] font-normal text-slate-700 uppercase tracking-wide">{data.codigo || '---'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-medium block">Nombre Oficial</span>
                                    <span className="text-[12px] font-normal text-slate-900 uppercase tracking-tight">{data.nombre || '---'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Función Escalera (Solo para 1° Semestre) */}
                        {mode === 'create' && selectedSemester === '1' && (
                            <div className="pt-2 animate-in slide-in-from-top-1 duration-300">
                                <label className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl cursor-pointer group hover:bg-blue-50 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={data.crear_escalera}
                                        onChange={e => setData('crear_escalera', e.target.checked)}
                                        className="w-4 h-4 rounded border-blue-300 text-[#0266E0] focus:ring-[#0266E0]"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-blue-700">Generar escalera académica</span>
                                        <span className="text-[10px] text-blue-500 font-medium">Crea automáticamente los grupos de 2° a 6° para esta generación.</span>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-slate-350 hover:bg-slate-50 active:scale-95 active:bg-slate-100 active:translate-y-[1px] text-slate-700 rounded-xl text-xs font-semibold transition-all transform duration-75 focus:outline-none cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !isFormValid}
                            className="px-5 py-2 bg-[#0266E0] hover:bg-blue-700 active:scale-95 active:bg-blue-800 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-all transform duration-75 focus:outline-none cursor-pointer flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                mode === 'create' ? 'Registrar Grupo' : 'Guardar Cambios'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
