import React, { useState, useEffect } from 'react';
import { X, Layers, Hash, Calendar } from 'lucide-react';
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
}: GroupFormModalProps) {
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');

    // Sincronizar y parsear datos al abrir el modal
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && data.codigo) {
                const cleanCode = data.codigo.trim();
                const parts = cleanCode.split('-');
                if (parts.length >= 1) {
                    const firstPart = parts[0];
                    if (firstPart.length >= 2) {
                        setSelectedSemester(firstPart.charAt(0));
                        setSelectedSection(data.seccion || firstPart.charAt(1).toUpperCase());
                    }
                }
            } else {
                setSelectedSemester('');
                setSelectedSection('');
                setData('turno', 'Matutino');
                setData('semestre', '');
                setData('generacion', '');
            }
        }
    }, [isOpen, mode]);

    // [LÓGICA v6.5] Autogenerar generación basada en semestre e inteligencia temporal
    useEffect(() => {
        if (isOpen && mode === 'create' && selectedSemester) {
            const sem = Number(selectedSemester);
            let targetStartYear = currentYear;

            // Restar años según el nivel académico
            if (sem === 3 || sem === 4) targetStartYear -= 1;
            else if (sem === 5 || sem === 6) targetStartYear -= 2;

            const gen = `${targetStartYear}-${targetStartYear + 3}`;
            setData('generacion', gen);
        }
    }, [selectedSemester, isOpen, mode, currentYear]);

    const generationOptions = React.useMemo(() => {
        const options: string[] = [];
        const baseYear = currentYear - 3;
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
        const majorLower = major.toLowerCase();
        const match = specialties.find(
            s => s && ((s.nombre?.toLowerCase() === majorLower) ||
            (majorLower === 'ti' && s.nombre?.toLowerCase() === 'informática'))
        );
        return match ? (match.codigo?.toUpperCase() || 'INF') : 'INF';
    };

    // Autogenerar código y nombre al cambiar semestre, sección o especialidad
    useEffect(() => {
        if (isOpen) {
            const suffix = getSpecialtySuffix(data.especialidad);
            if (selectedSemester && selectedSection && suffix) {
                setData('codigo', `${selectedSemester}${selectedSection}-${suffix}-${data.generacion.split('-')[0] || currentYear}`);
                setData('semestre', Number(selectedSemester));
                setData('seccion', selectedSection);
            } else {
                setData('codigo', '');
            }
        }
    }, [selectedSemester, selectedSection, data.especialidad, data.generacion, isOpen, currentYear]);

    useEffect(() => {
        if (isOpen) {
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
    }, [selectedSemester, selectedSection, data.especialidad, isOpen]);

    const isFormValid = data.codigo.trim() !== '' && data.nombre.trim() !== '' && data.generacion.trim() !== '';

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
                    <div className="space-y-5 flex-1 flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Semestre</FormLabel>
                                <FormSelect
                                    value={selectedSemester}
                                    onChange={e => setSelectedSemester(e.target.value)}
                                    className="h-9 text-xs font-normal"
                                >
                                    <option value="">Grado...</option>
                                    {[1, 2, 3, 4, 5, 6].map(s => (
                                        <option key={s} value={s}>{s}° Semestre</option>
                                    ))}
                                </FormSelect>
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel required>Sección / Letra</FormLabel>
                                <FormSelect
                                    value={selectedSection}
                                    onChange={e => setSelectedSection(e.target.value)}
                                    className="h-9 text-xs font-normal"
                                >
                                    <option value="">Sección...</option>
                                    {['A', 'B', 'C', 'D', 'E'].map(l => (
                                        <option key={l} value={l}>Grupo {l}</option>
                                    ))}
                                </FormSelect>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Generación</FormLabel>
                                <FormSelect
                                    value={data.generacion}
                                    onChange={e => setData('generacion', e.target.value)}
                                    className="h-9 text-xs font-normal"
                                >
                                    <option value="">Generación...</option>
                                    {generationOptions.map(gen => (
                                        <option key={gen} value={gen}>Gen. {gen}</option>
                                    ))}
                                </FormSelect>
                                {errors.generacion && <span className="text-red-500 text-[10px] mt-1 block">{errors.generacion}</span>}
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel required>Turno</FormLabel>
                                <FormInput
                                    readOnly
                                    value={data.turno}
                                    className="h-9 text-xs bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed select-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Bachillerato / Especialidad</FormLabel>
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
                            className="px-4 py-2 bg-white border border-slate-350 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all focus:outline-none"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !isFormValid}
                            className="px-5 py-2 bg-[#0266E0] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all focus:outline-none flex items-center gap-2"
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
