import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormSelect } from '@/Components/forms/FormSelect';

interface GroupFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    group: any;
    data: {
        code: string;
        name: string;
        shift: string;
        major: string;
        tutor_teacher_id: string | number;
        turno_id: string | number;
        activo: boolean;
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    profesores?: any[];
    materiasList?: any[];
    specialties?: any[];
    groupsList?: any[];
    planes?: any[];
    turnos?: any[];
}

export default function GroupFormModal({
    isOpen,
    onClose,
    mode,
    group,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    specialties = [],
    profesores = [],
    groupsList = [],
    turnos = [],
}: GroupFormModalProps) {
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    // Sincronizar y parsear datos al abrir el modal
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && data.code) {
                const cleanCode = data.code.trim();
                const parts = cleanCode.split('-');
                if (parts.length >= 2) {
                    const firstPart = parts[0];
                    if (firstPart.length === 2) {
                        setSelectedSemester(firstPart.charAt(0));
                        setSelectedSection(firstPart.charAt(1).toUpperCase());
                    } else if (firstPart.length === 1) {
                        setSelectedSemester(firstPart);
                        if (parts[1] && parts[1].length === 1) {
                            setSelectedSection(parts[1].toUpperCase());
                        }
                    }
                } else {
                    const firstChar = cleanCode.charAt(0);
                    const secondChar = cleanCode.charAt(1);
                    if (['1','2','3','4','5','6'].includes(firstChar)) {
                        setSelectedSemester(firstChar);
                    }
                    if (secondChar && /^[A-Z]$/i.test(secondChar)) {
                        setSelectedSection(secondChar.toUpperCase());
                    }
                }
            } else {
                setSelectedSemester('');
                setSelectedSection('');
            }
        }
    }, [isOpen, mode]);

    const getSpecialtySuffix = (major: string) => {
        if (!major) return '';
        const match = specialties.find(
            s => s.name.toLowerCase() === major.toLowerCase() ||
            (major.toLowerCase() === 'ti' && s.name.toLowerCase() === 'informática')
        );
        return match ? match.code.toUpperCase() : 'INF';
    };

    // Autogenerar código y nombre al cambiar semestre, sección o especialidad
    useEffect(() => {
        if (isOpen) {
            const suffix = getSpecialtySuffix(data.major);
            if (selectedSemester && selectedSection && suffix) {
                setData('code', `${selectedSemester}${selectedSection}-${suffix}`);
            } else {
                setData('code', '');
            }
        }
    }, [selectedSemester, selectedSection, data.major, isOpen, specialties]);

    useEffect(() => {
        if (isOpen) {
            const match = specialties.find(
                s => s.name.toLowerCase() === data.major.toLowerCase() ||
                (data.major.toLowerCase() === 'ti' && s.name.toLowerCase() === 'informática')
            );
            const displayMajor = match ? match.name : (data.major === 'TI' ? 'Informática' : data.major);

            if (selectedSemester && selectedSection && displayMajor) {
                setData('name', `${selectedSemester}${selectedSection} ${displayMajor}`);
            } else {
                setData('name', '');
            }
        }
    }, [selectedSemester, selectedSection, data.major, isOpen, specialties]);

    const isFormValid = data.code.trim() !== '' && data.name.trim() !== '';

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
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[300px] h-full text-left relative">
                {/* Windows Close button relative to the entire grid modal container */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Info Panel (col-span-2) - Solid Blue #0266E0 */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-xl font-bold text-white leading-tight">
                                {mode === 'create' ? 'Registrar Nuevo Grupo' : 'Modificar Grupo'}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Genera un nuevo grupo para estructurar la carga de alumnos. Configura el semestre, sección, turno y bachillerato.'
                                    : 'Modifica los datos principales del grupo académico.'}
                            </p>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block">
                        Prepahid Campus Escolar
                    </div>
                </div>

                {/* Right Form Panel (col-span-3) */}
                <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[280px] relative">
                    <div className="space-y-4 flex-1 pr-2">
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Semestre</FormLabel>
                                <FormSelect
                                    value={selectedSemester}
                                    onChange={e => setSelectedSemester(e.target.value)}
                                    className="h-10 text-xs"
                                >
                                    <option value="">Seleccionar semestre...</option>
                                    <option value="1">1° Semestre</option>
                                    <option value="2">2° Semestre</option>
                                    <option value="3">3° Semestre</option>
                                    <option value="4">4° Semestre</option>
                                    <option value="5">5° Semestre</option>
                                    <option value="6">6° Semestre</option>
                                </FormSelect>
                            </div>

                            <div className="space-y-1.5">
                                <FormLabel required>Sección / Grupo</FormLabel>
                                <FormSelect
                                    value={selectedSection}
                                    onChange={e => setSelectedSection(e.target.value)}
                                    className="h-10 text-xs"
                                >
                                    <option value="">Seleccionar sección...</option>
                                    <option value="A">Grupo A</option>
                                    <option value="B">Grupo B</option>
                                    <option value="C">Grupo C</option>
                                    <option value="D">Grupo D</option>
                                    <option value="E">Grupo E</option>
                                </FormSelect>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Especialidad</FormLabel>
                                <FormSelect
                                    value={data.major}
                                    onChange={e => setData('major', e.target.value)}
                                >
                                    <option value="">Selecciona especialidad</option>
                                    {specialties.map((s) => (
                                        <option key={s.id} value={s.name}>
                                            {s.name}
                                        </option>
                                    ))}
                                </FormSelect>
                                {errors.major && <span className="text-red-500 text-[10px] mt-1 block">{errors.major}</span>}
                            </div>

                            <div className="space-y-1.5">
                                <FormLabel required>Turno</FormLabel>
                                <FormSelect
                                    value={data.turno_id}
                                    onChange={e => {
                                        const id = e.target.value;
                                        setData('turno_id', id);
                                        const matchedTurno = turnos.find(t => t.id.toString() === id.toString());
                                        if (matchedTurno) {
                                            setData('shift', matchedTurno.nombre);
                                        } else {
                                            setData('shift', '');
                                        }
                                    }}
                                >
                                    <option value="">Selecciona un turno</option>
                                    {turnos.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre}
                                        </option>
                                    ))}
                                </FormSelect>
                                {errors.turno_id && <span className="text-red-500 text-[10px] mt-1 block">{errors.turno_id}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel>Tutor / Profesor Titular</FormLabel>
                                <FormSelect
                                    value={data.tutor_teacher_id}
                                    onChange={e => setData('tutor_teacher_id', e.target.value)}
                                >
                                    <option value="">Sin tutor asignado</option>
                                    {profesores.map((p) => {
                                        const assignedGroup = groupsList?.find(
                                            g => g.teacher_id === p.id && g.id !== group?.id
                                        );
                                        const suffix = assignedGroup ? ` (Ya es tutor de ${assignedGroup.name})` : '';
                                        return (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre_completo}{suffix}
                                            </option>
                                        );
                                    })}
                                </FormSelect>
                                {errors.tutor_teacher_id && <span className="text-red-500 text-[10px] mt-1 block">{errors.tutor_teacher_id}</span>}
                            </div>
                        </div>

                        {/* Preview de Datos Autogenerados */}
                        <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl text-left text-[11px] space-y-2">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                Previsualización del Grupo
                            </span>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-medium block">Código Generado</span>
                                    <span className="font-extrabold text-slate-700">{data.code || '---'}</span>
                                    {errors.code && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.code}</span>}
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-medium block">Nombre del Grupo</span>
                                    <span className="font-extrabold text-slate-700">{data.name || '---'}</span>
                                    {errors.name && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.name}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Footer */}
                    <div className="mt-6 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none">
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
                            className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all focus:outline-none active:scale-[0.98]"
                        >
                            {processing ? 'Guardando...' : mode === 'create' ? 'Crear Grupo' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
