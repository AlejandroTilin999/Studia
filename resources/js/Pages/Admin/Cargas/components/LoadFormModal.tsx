import React, { useEffect, useMemo } from 'react';
import { X, Layers, BookOpen, GraduationCap, ChevronRight, ChevronLeft } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormSelect } from '@/Components/forms/FormSelect';
import { CatalogItem, GroupCatalogItem, CourseCatalogItem, TeacherCatalogItem } from '../types';

interface LoadFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    load: any;
    existingLoads?: any[];
    periods: CatalogItem[];
    groups: GroupCatalogItem[];
    courses: CourseCatalogItem[];
    teachers: TeacherCatalogItem[];
    data: {
        ciclo_id: string | number;
        grupo_id: string | number;
        materia_id: string | number;
        docente_id: string | number;
        assignments: { materia_id: number | string, docente_id: number | string }[];
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function LoadFormModal({
    isOpen,
    onClose,
    mode,
    periods,
    groups,
    courses,
    teachers,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    load,
    existingLoads = []
}: LoadFormModalProps) {
    const [currentStep, setCurrentStep] = React.useState(1);

    useEffect(() => {
        if (isOpen) setCurrentStep(mode === 'create' ? 1 : 4); // 4 es modo edición
    }, [isOpen, mode]);

    // 1. Identificar paridad y filtrar materias sugeridas
    const selectedCycle = periods.find(p => p.id.toString() === data.ciclo_id.toString());
    const isOddCycle = selectedCycle?.mes_inicio ? (selectedCycle.mes_inicio >= 8 || selectedCycle.mes_inicio === 1) : true;

    const selectedGroup = groups.find(g => g.id.toString() === data.grupo_id.toString());
    const groupMajor = selectedGroup?.especialidad || '';
    const groupSemester = selectedGroup?.codigo ? parseInt(selectedGroup.codigo.charAt(0)) : null;

    const suggestedCourses = useMemo(() => {
        if (!data.grupo_id) return [];
        return courses.filter(course => {
            if (groupSemester && course.semestre !== groupSemester) return false;
            if (course.tipo === 'General') return true;
            return course.especialidades?.some(s => s.toLowerCase() === groupMajor.toLowerCase());
        });
    }, [courses, data.grupo_id, groupMajor, groupSemester]);

    const generalCourses = useMemo(() => suggestedCourses.filter(c => c.tipo === 'General'), [suggestedCourses]);
    const specialtyCourses = useMemo(() => suggestedCourses.filter(c => c.tipo === 'Especialidad'), [suggestedCourses]);

    // 2. Inicializar asignaciones
    useEffect(() => {
        if (isOpen && mode === 'create' && data.grupo_id && suggestedCourses.length > 0) {
            const currentAssignments = data.assignments || [];
            if (currentAssignments.length === 0) {
                const initial = suggestedCourses.map(c => ({ materia_id: c.id, docente_id: '' }));
                setData('assignments', initial);
            }
        }
    }, [data.grupo_id, suggestedCourses, isOpen, mode]);

    const handleTeacherChange = (materiaId: number | string, docenteId: string | number) => {
        const newAssignments = (data.assignments || []).map(a =>
            a.materia_id === materiaId ? { ...a, docente_id: docenteId } : a
        );
        setData('assignments', newAssignments);
    };

    // 3. FILTRO MAESTRO: Por Área (General) o Especialidad + Exclusión de ya seleccionados
    const getFilteredTeachersForCourse = (course: CourseCatalogItem) => {
        // Profesores que ya han sido seleccionados en OTROS selects de este mismo wizard
        const selectedTeacherIds = (data.assignments || [])
            .filter(a => a.materia_id !== course.id && a.docente_id !== '')
            .map(a => a.docente_id.toString());

        return (teachers || []).filter(t => {
            // No mostrar si ya está seleccionado en otra materia de este grupo
            if (selectedTeacherIds.includes(t.id.toString())) return false;

            if (course.tipo === 'General') {
                const isGeneralTeacher = !t.especialidad || t.especialidad.toLowerCase() === 'general';
                if (!isGeneralTeacher) return false;

                // Si la materia tiene área definida (ej: MATEMÁTICAS, HUMANIDADES)
                if (course.area) {
                    const cArea = course.area.toLowerCase();
                    const teacherAreas = (t.areas || []).map(a => a.toLowerCase());
                    const singleArea = (t.area || '').toLowerCase();
                    
                    if (teacherAreas.length > 0) {
                        return teacherAreas.includes(cArea);
                    }
                    if (singleArea) {
                        return singleArea === cArea;
                    }
                }
                return true;
            } else {
                // Materia de Especialidad
                const tEsp = (t.especialidad || '').toLowerCase();
                const gEsp = groupMajor.toLowerCase();
                return tEsp === gEsp || tEsp === 'general';
            }
        });
    };

    const isFormValid = useMemo(() => {
        if (mode === 'edit') return !!data.docente_id;

        // Para creación, validar que todas las asignaturas tengan un docente seleccionado
        // antes de permitir el guardado final
        return data.grupo_id &&
               data.assignments.length > 0 &&
               data.assignments.every(a => a.docente_id !== '');
    }, [mode, data]);

    const renderSubjectList = (list: CourseCatalogItem[], title: string) => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-2 md:mb-4">
                <h3 className="text-lg md:text-xl font-bold text-slate-700">{title}</h3>
                <p className="text-[11px] md:text-xs text-slate-400">Asigna a los profesores responsables de estas asignaturas.</p>
            </div>
            <div className="space-y-3 max-h-[40vh] md:max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {list.length === 0 ? (
                    <div className="py-8 md:py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 text-xs md:text-sm font-medium text-center px-4 md:px-6">No hay materias registradas en esta categoría para el {groupSemester}° semestre.</p>
                    </div>
                ) : list.map(course => {
                    const currentAssign = (data.assignments || []).find(a => a.materia_id === course.id);
                    const filteredTeachers = getFilteredTeachersForCourse(course);
                    return (
                        <div key={course.id} className="p-3 md:p-4 rounded-lg border border-slate-200 bg-white flex flex-col lg:flex-row lg:items-center gap-3 md:gap-4 transition-all hover:border-blue-100">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[13px] md:text-[13.5px] font-bold text-slate-700 truncate">{course.nombre}</span>
                                    <span className="text-[8px] md:text-[9px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 font-black uppercase tracking-tight whitespace-nowrap">
                                        {course.tipo === 'General' ? (course.area || 'General') : 'Especialidad'}
                                    </span>
                                </div>
                                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Clave: {course.codigo}</p>
                            </div>
                            <div className="w-full lg:w-60 xl:w-64">
                                <FormSelect
                                    required
                                    value={currentAssign?.docente_id || ''}
                                    onChange={e => handleTeacherChange(course.id, e.target.value)}
                                    className="h-9 md:h-10 w-full text-[11px] md:text-xs font-normal border-slate-200 focus:border-[#0266E0] bg-white rounded-lg"
                                >
                                    <option value="">-- Seleccionar Docente --</option>
                                    {filteredTeachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre_completo}</option>
                                    ))}
                                </FormSelect>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass={currentStep === 1 ? "max-w-2xl" : "max-w-4xl"}
            showFooter={false}
            fullBleed={true}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (currentStep === 3 || mode === 'edit') {
                        onSubmit(e);
                    }
                }}
                className="grid grid-cols-1 md:grid-cols-12 min-h-0 h-full text-left relative"
            >
                <button type="button" onClick={onClose} className="absolute top-5 right-5 z-20 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-all focus:outline-none">
                    <X size={18} className="stroke-[2.5]" />
                </button>

                {/* Sidebar Wizard */}
                <div className="col-span-1 md:col-span-4 bg-[#0266E0] p-5 md:p-7 text-white flex flex-col justify-between select-none rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none">
                    <div className="space-y-6 md:space-y-8">
                        <div>
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-7 md:h-9 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-base md:text-lg font-bold text-white leading-tight">Asignación de Cargas</h3>
                        </div>

                        {mode === 'create' && (
                            <div className="grid grid-cols-3 md:flex md:flex-col gap-3 md:gap-6 pt-2">
                                {[
                                    { step: 1, label: 'Grupo', sub: 'Aula', icon: Layers },
                                    { step: 2, label: 'Gral.', sub: 'Generales', icon: BookOpen },
                                    { step: 3, label: 'Esp.', sub: 'Especialidad', icon: GraduationCap }
                                ].map((item) => (
                                    <div key={item.step} className="flex md:gap-4 items-center md:items-start relative group">
                                        {/* Línea conectora solo en desktop */}
                                        {item.step < 3 && (
                                            <div className={`hidden md:block absolute left-4 top-8 w-0.5 h-6 -ml-[1px] ${currentStep > item.step ? 'bg-white' : 'bg-blue-400/30'}`} />
                                        )}
                                        <div className={`h-7 w-7 md:h-8 md:w-8 rounded-full border-2 flex items-center justify-center font-normal text-[10px] md:text-[11px] shrink-0 z-10 transition-all ${currentStep >= item.step ? 'bg-white text-blue-600 border-white' : 'border-blue-400/50 text-blue-400/50'}`}>
                                            {item.step}
                                        </div>
                                        <div className="ml-2 md:ml-0 min-w-0">
                                            <h4 className={`text-[11px] md:text-[13px] font-semibold ${currentStep >= item.step ? 'text-white' : 'text-blue-400/50'}`}>{item.label}</h4>
                                            <p className="hidden md:block text-[10px] text-blue-200 mt-0.5 truncate font-normal">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="hidden md:block text-[11px] text-blue-100/70 leading-relaxed font-medium">Configura la plantilla docente completa para el semestre.</p>
                    </div>
                    <div className="text-[9px] text-blue-200 font-medium pt-4 border-t border-white/15 hidden md:block mt-6">Prepahid Campus Escolar</div>
                </div>

                {/* Content Area */}
                <div className="col-span-1 md:col-span-8 p-5 md:p-10 flex flex-col min-h-0 md:min-h-[450px] relative bg-white md:rounded-r-[10px]">
                    {currentStep === 1 && mode === 'create' && (
                        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-5 md:space-y-8 animate-in fade-in slide-in-from-right-4 text-left">
                            <div className="text-center space-y-2">
                                <Layers size={32} className="md:size-42 mx-auto text-slate-300 mb-2 md:mb-4" />
                                <h3 className="text-lg md:text-xl font-bold text-slate-600">Selección de Grupo</h3>
                                <p className="text-slate-400 text-xs md:text-sm">Elige el grupo académico para cargar su plan.</p>
                            </div>
                            <div className="space-y-2">
                                <FormLabel className="text-slate-400 font-semibold uppercase text-[9px] md:text-[10px] tracking-widest ml-1">Grupo Escolar</FormLabel>
                                <FormSelect value={data.grupo_id} onChange={e => setData('grupo_id', e.target.value)} className="h-11 md:h-14 font-normal border-2 border-slate-100 rounded-xl text-sm">
                                    <option value="">Seleccionar grupo...</option>
                                    {groups.filter(g => {
                                        // 1. Filtrar por paridad de semestre
                                        const s = g.codigo ? parseInt(g.codigo.charAt(0)) : 0;
                                        const matchesParity = isOddCycle ? s % 2 !== 0 : s % 2 === 0;
                                        if (!matchesParity) return false;

                                        // 2. Ocultar si ya tiene asignaciones en este ciclo (Evitar duplicados)
                                        const alreadyAssigned = existingLoads.some(l =>
                                            l.grupo_id.toString() === g.id.toString() &&
                                            l.ciclo_id.toString() === data.ciclo_id.toString()
                                        );

                                        return !alreadyAssigned;
                                    }).map(g => <option key={g.id} value={g.id}>{g.nombre} ({g.especialidad})</option>)}
                                </FormSelect>
                            </div>
                            <button type="button" disabled={!data.grupo_id} onClick={() => setCurrentStep(2)} className="w-full bg-[#0266E0] hover:bg-blue-700 text-white h-11 md:h-14 rounded-lg font-bold uppercase text-xs tracking-widest transition-all">Continuar</button>
                        </div>
                    )}

                    {(currentStep === 2 || currentStep === 3) && (
                        <div className="flex-1 flex flex-col min-h-0 text-left">
                            {currentStep === 2 && renderSubjectList(generalCourses, "Materias Generales")}
                            {currentStep === 3 && renderSubjectList(specialtyCourses, "Materias de Especialidad")}
                        </div>
                    )}

                    {/* Step Navigation */}
                    {mode === 'create' && currentStep > 1 && (
                        <div className="mt-5 md:mt-8 flex flex-row justify-between items-center gap-4 border-t border-slate-100 pt-5">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentStep(currentStep - 1);
                                }}
                                className="flex items-center gap-2 text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
                            >
                                <ChevronLeft size={16}/> <span className="hidden sm:inline">Atrás</span>
                            </button>
                            <div className="flex-1 flex justify-end">
                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentStep(currentStep + 1);
                                        }}
                                        className="bg-slate-800 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg font-bold uppercase text-[10px] md:text-xs tracking-widest hover:bg-slate-900 flex items-center gap-2 transition-all"
                                    >
                                        Siguiente <ChevronRight size={16}/>
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing || !isFormValid}
                                        className="bg-[#0266E0] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-bold uppercase text-[10px] md:text-xs tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        {processing ? 'Guardando...' : 'Confirmar'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Modo Edición Simple */}
                    {mode === 'edit' && (
                         <div className="flex-1 flex flex-col justify-center space-y-6">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-600">Actualizar Profesor</h3>
                            <div className="bg-slate-50 p-5 md:p-6 rounded-lg space-y-4">
                                <div><span className="text-[10px] text-slate-400 font-semibold uppercase block">Asignatura</span><span className="text-base md:text-lg font-normal text-slate-700">{load?.nombre_materia}</span></div>
                                <div className="h-px bg-slate-200" />
                                <div><span className="text-[10px] text-slate-400 font-semibold uppercase block">Nuevo Docente</span>
                                <FormSelect value={data.docente_id} onChange={e => setData('docente_id', e.target.value)} className="h-12 border-slate-200 rounded-xl mt-2 bg-white w-full">
                                    <option value="">Seleccionar docente...</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.nombre_completo}</option>)}
                                </FormSelect></div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase order-2 sm:order-1">Cancelar</button>
                                <button type="submit" disabled={processing || !data.docente_id} className="bg-[#0266E0] text-white px-8 py-3 rounded-lg font-bold uppercase text-xs tracking-widest transition-all order-1 sm:order-2">Guardar</button>
                            </div>
                         </div>
                    )}
                </div>
            </form>
        </BaseModal>
    );
}
