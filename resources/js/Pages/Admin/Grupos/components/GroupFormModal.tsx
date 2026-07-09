import React, { useState, useEffect } from 'react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormSelect } from '@/Components/forms/FormSelect';
import { ProfesorSelect, MateriaSelect } from '../types';

interface GroupFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    group: any;
    profesores: ProfesorSelect[];
    materiasList?: MateriaSelect[];
    data: {
        code: string;
        name: string;
        shift: string;
        specialty: string;
        teacher_id: number | string;
        linked_courses: number[];
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
}

export default function GroupFormModal({
    isOpen,
    onClose,
    mode,
    group,
    profesores,
    materiasList = [],
    data,
    setData,
    errors,
    processing,
    onSubmit,
    saveStatus = 'idle',
}: GroupFormModalProps) {
    const [step, setStep] = useState(1);
    const [selectedSemester, setSelectedSemester] = useState('1');
    const [selectedSection, setSelectedSection] = useState('A');
    const [subjectSearch, setSubjectSearch] = useState('');

    // Sincronizar y parsear datos al abrir el modal
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSubjectSearch('');
            
            if (mode === 'edit' && data.code) {
                // Intentamos desestructurar el código (ej: "1-A" o "1A")
                const parts = data.code.split('-');
                if (parts.length === 2) {
                    setSelectedSemester(parts[0]);
                    setSelectedSection(parts[1].toUpperCase());
                } else {
                    const firstChar = data.code.charAt(0);
                    const lastChar = data.code.slice(1);
                    if (['1','2','3','4','5','6'].includes(firstChar)) {
                        setSelectedSemester(firstChar);
                    }
                    if (lastChar) {
                        setSelectedSection(lastChar.toUpperCase());
                    }
                }
            } else {
                setSelectedSemester('1');
                setSelectedSection('A');
            }
        }
    }, [isOpen, mode]);

    // Autogenerar código y nombre al cambiar semestre o sección
    useEffect(() => {
        if (isOpen) {
            setData('code', `${selectedSemester}-${selectedSection}`);
        }
    }, [selectedSemester, selectedSection, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setData('name', `${selectedSemester}° Semestre - Grupo ${selectedSection}`);
        }
    }, [selectedSemester, selectedSection, isOpen]);

    const toggleCourseSelection = (courseId: number) => {
        const currentCourses = data.linked_courses || [];
        if (currentCourses.includes(courseId)) {
            setData('linked_courses', currentCourses.filter(id => id !== courseId));
        } else {
            setData('linked_courses', [...currentCourses, courseId]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            if (step === 1 && !isStep1Valid) return;
            setStep(prev => prev + 1);
        } else {
            onSubmit(e);
        }
    };

    // Validar paso 1 (siempre es válido gracias a los selectores)
    const isStep1Valid = data.code.trim() !== '' && data.name.trim() !== '';

    // Filtrar materias por búsqueda
    const filteredCourses = materiasList.filter(course => 
        course.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        course.code.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={saveStatus !== 'idle' ? '' : mode === 'create' ? 'Crear Nuevo Grupo' : 'Editar Grupo'}
            subtitle={saveStatus !== 'idle' ? '' : "Completa la configuración académica de este grupo"}
            maxWidthClass="max-w-md"
            onSubmit={handleSubmit}
            confirmLabel={processing ? 'Guardando...' : mode === 'create' ? 'Crear Grupo' : 'Guardar'}
            isConfirmDisabled={processing}
            showFooter={false}
        >
            {saveStatus === 'saving' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#1e88e5]/20 border-t-[#1e88e5] animate-spin"></div>
                    <p className="font-extrabold text-slate-800 text-sm">
                        {mode === 'create' ? 'Creando grupo académico...' : 'Guardando cambios...'}
                    </p>
                    <p className="text-xs text-slate-400 font-bold">Por favor, espera un momento.</p>
                </div>
            )}

            {saveStatus === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in duration-200">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <svg className="w-8 h-8 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-base">¡Operación Exitosa!</h3>
                    <p className="text-xs text-slate-500 font-medium text-center">
                        {mode === 'create' ? 'El grupo académico ha sido creado.' : 'Los cambios han sido guardados correctamente.'}
                    </p>
                </div>
            )}

            {saveStatus === 'error' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in duration-200">
                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                        <svg className="w-8 h-8 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-base">Hubo un problema</h3>
                    <p className="text-xs text-rose-550 font-bold text-center max-w-[280px]">
                        No se pudo guardar el grupo escolar. Por favor verifica los campos e intenta de nuevo.
                    </p>
                </div>
            )}

            {saveStatus === 'idle' && (
                <>
                    {/* Indicador de pasos visual */}
                    <div className="flex items-center justify-between px-2 pb-6 mb-6 border-b border-slate-100 select-none">
                        {[
                            { num: 1, label: 'Datos' },
                            { num: 2, label: 'Tutoría' },
                            { num: 3, label: 'Materias' }
                        ].map((s) => {
                            const isActive = step === s.num;
                            const isCompleted = step > s.num;
                            return (
                                <div key={s.num} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-[#1e88e5] text-white ring-4 ring-blue-50' 
                                            : isCompleted 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        {isCompleted ? '✓' : s.num}
                                    </div>
                                    <span className={`text-[10px] font-extrabold transition-all duration-300 ${
                                        isActive 
                                            ? 'text-[#1e88e5]' 
                                            : isCompleted 
                                                ? 'text-emerald-600' 
                                                : 'text-slate-400'
                                    }`}>
                                        {s.label}
                                    </span>
                                    {s.num < 3 && (
                                        <div className="w-8 h-[1px] bg-slate-200 mx-1"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Paso 1: Información Básica */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-1.5">
                                    <FormLabel required>Semestre</FormLabel>
                                    <FormSelect
                                        value={selectedSemester}
                                        onChange={e => setSelectedSemester(e.target.value)}
                                    >
                                        <option value="1">1° Semestre (1er Año)</option>
                                        <option value="2">2° Semestre (1er Año)</option>
                                        <option value="3">3° Semestre (2do Año)</option>
                                        <option value="4">4° Semestre (2do Año)</option>
                                        <option value="5">5° Semestre (3er Año)</option>
                                        <option value="6">6° Semestre (3er Año)</option>
                                    </FormSelect>
                                </div>

                                <div className="space-y-1.5">
                                    <FormLabel required>Sección / Grupo</FormLabel>
                                    <FormSelect
                                        value={selectedSection}
                                        onChange={e => setSelectedSection(e.target.value)}
                                    >
                                        <option value="A">Grupo A</option>
                                        <option value="B">Grupo B</option>
                                        <option value="C">Grupo C</option>
                                        <option value="D">Grupo D</option>
                                        <option value="E">Grupo E</option>
                                    </FormSelect>
                                </div>
                            </div>

                            {/* Preview de Datos Autogenerados */}
                            <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left text-[11px] space-y-2">
                                <span className="text-slate-400 font-bold uppercase tracking-wider block">
                                    Previsualización del Grupo
                                </span>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-medium block">Código Generado</span>
                                        <span className="font-extrabold text-slate-700">{data.code}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-medium block">Nombre del Grupo</span>
                                        <span className="font-extrabold text-slate-700">{data.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Horarios y Tutoría */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-1.5">
                                    <FormLabel required>Turno</FormLabel>
                                    <FormSelect
                                        value={data.shift}
                                        onChange={e => setData('shift', e.target.value)}
                                    >
                                        <option value="Horario único">Horario único</option>
                                        <option value="Matutino">Matutino</option>
                                        <option value="Vespertino">Vespertino</option>
                                    </FormSelect>
                                    {errors.shift && <span className="text-red-500 text-[10px] mt-1 block">{errors.shift}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <FormLabel required>Especialidad</FormLabel>
                                    <FormSelect
                                        value={data.specialty}
                                        onChange={e => setData('specialty', e.target.value)}
                                    >
                                        <option value="TI">TI</option>
                                        <option value="Gastronomía">Gastronomía</option>
                                        <option value="Biotecnología">Biotecnología</option>
                                    </FormSelect>
                                    {errors.specialty && <span className="text-red-500 text-[10px] mt-1 block">{errors.specialty}</span>}
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Profesor Titular / Tutor</FormLabel>
                                <FormSelect
                                    value={data.teacher_id}
                                    onChange={e => setData('teacher_id', e.target.value ? Number(e.target.value) : '')}
                                >
                                    <option value="">Pendiente de Asignación</option>
                                    {profesores.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                                    ))}
                                </FormSelect>
                                {errors.teacher_id && <span className="text-red-500 text-[10px] mt-1 block">{errors.teacher_id}</span>}
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Carga Académica */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-200 text-left">
                            <FormLabel>Vincular Materias (Asignaturas)</FormLabel>
                            
                            {/* Buscador */}
                            <div className="mb-3 relative">
                                <input
                                    type="text"
                                    placeholder="Buscar materia por nombre o código..."
                                    value={subjectSearch}
                                    onChange={(e) => setSubjectSearch(e.target.value)}
                                    className="w-full px-3 py-2.5 text-[12px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-400 focus:outline-none transition-all placeholder-slate-400"
                                />
                            </div>

                            {/* Listado Checklist */}
                            {filteredCourses.length > 0 ? (
                                <div className="border border-slate-100 rounded-2xl bg-slate-50/50 p-2 space-y-1 max-h-[160px] overflow-y-auto pr-1">
                                    {filteredCourses.map((course) => {
                                        const isChecked = data.linked_courses?.includes(course.id);
                                        return (
                                            <label 
                                                key={course.id} 
                                                className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl border border-slate-100 hover:border-blue-100 cursor-pointer select-none transition-all"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleCourseSelection(course.id)}
                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400 border-slate-200 cursor-pointer"
                                                />
                                                <div className="text-[11px]">
                                                    <span className="font-extrabold text-slate-700 block">
                                                        {course.name}
                                                    </span>
                                                    <span className="text-[9.5px] text-slate-400 font-bold">
                                                        Código: {course.code}
                                                    </span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-[11px] font-bold">
                                    {subjectSearch ? "No se encontraron materias." : "No hay materias registradas."}
                                </div>
                            )}
                            {errors.linked_courses && <span className="text-red-500 text-[10px] mt-1 block">{errors.linked_courses}</span>}
                        </div>
                    )}

                    {/* Footer de Navegación del Wizard */}
                    <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(prev => prev - 1)}
                                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl text-xs font-extrabold text-slate-500 cursor-pointer"
                            >
                                Atrás
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl text-xs font-extrabold text-slate-500 cursor-pointer"
                            >
                                Cancelar
                            </button>
                        )}

                        <div className="flex gap-2">
                            {step < 3 ? (
                                <button
                                    type="button"
                                    disabled={step === 1 && !isStep1Valid}
                                    onClick={() => setStep(prev => prev + 1)}
                                    className="px-5 py-2.5 bg-[#1e88e5] text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl text-xs font-extrabold cursor-pointer"
                                >
                                    Siguiente
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl text-xs font-extrabold cursor-pointer"
                                >
                                    {processing ? 'Guardando...' : mode === 'create' ? 'Crear Grupo' : 'Guardar'}
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </BaseModal>
    );
}
