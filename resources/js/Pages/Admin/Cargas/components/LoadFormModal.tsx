import React, { useEffect, useMemo } from 'react';
import { X, CheckCircle2, UserPlus, BookOpen, Layers } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormSelect } from '@/Components/forms/FormSelect';
import { CatalogItem, GroupCatalogItem, CourseCatalogItem, TeacherCatalogItem } from '../types';

interface LoadFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    load: any;
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
    load,
    periods,
    groups,
    courses,
    teachers,
    data,
    setData,
    errors,
    processing,
    onSubmit,
}: LoadFormModalProps) {
    const [currentStep, setCurrentStep] = React.useState(1);

    // Resetear al primer paso al cerrar/abrir
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(mode === 'create' ? 1 : 2);
        }
    }, [isOpen, mode]);

    // 1. Identificar especialidad y semestre del grupo seleccionado
    const selectedGroup = groups.find(g => g.id.toString() === data.grupo_id.toString());
    const groupMajor = selectedGroup?.especialidad || '';
    const groupSemester = selectedGroup?.codigo ? parseInt(selectedGroup.codigo.charAt(0)) : null;

    // 2. Filtrar materias sugeridas para el grupo (Mismo Semestre + General/Especialidad)
    const suggestedCourses = useMemo(() => {
        if (!data.grupo_id) return [];
        return courses.filter(course => {
            const matchesSemester = groupSemester ? course.semestre === groupSemester : true;
            if (!matchesSemester) return false;
            if (course.tipo === 'General') return true;
            return course.especialidades?.some(sName => sName.toLowerCase() === groupMajor.toLowerCase());
        });
    }, [courses, data.grupo_id, groupMajor, groupSemester]);

    // 3. Inicializar asignaciones al cambiar el grupo en modo 'create'
    useEffect(() => {
        if (isOpen && mode === 'create' && data.grupo_id && suggestedCourses.length > 0) {
            const initialAssignments = suggestedCourses.map(c => ({
                materia_id: c.id,
                docente_id: ''
            }));
            setData('assignments', initialAssignments);
        }
    }, [data.grupo_id, suggestedCourses, isOpen, mode]);

    // 4. Función para actualizar un docente específico en el lote
    const handleTeacherChange = (materiaId: number | string, docenteId: string | number) => {
        const newAssignments = (data.assignments || []).map(a =>
            a.materia_id === materiaId ? { ...a, docente_id: docenteId } : a
        );
        setData('assignments', newAssignments);
    };

    // 5. Filtrar docentes para cada materia
    const getFilteredTeachersForCourse = (course: CourseCatalogItem) => {
        const filtered = (teachers || []).filter(teacher => {
            if (course.tipo === 'General') return true;
            const courseSpecs = course.especialidades || [];
            return courseSpecs.some(
                sName => sName.toLowerCase() === (teacher.especialidad || '').toLowerCase()
            );
        });
        return filtered.length > 0 ? filtered : teachers;
    };

    useEffect(() => {
        if (isOpen && mode === 'create') {
            if (periods.length > 0 && !data.ciclo_id) {
                const activePeriod = periods.find(p => p.activo) || periods[0];
                setData('ciclo_id', activePeriod.id);
            }
        }
    }, [isOpen, mode]);

    const isFormValid = mode === 'create'
        ? data.grupo_id && data.assignments.some(a => a.docente_id !== '')
        : data.grupo_id && data.materia_id && data.docente_id;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass={mode === 'create' ? "max-w-5xl" : "max-w-3xl"}
            onSubmit={onSubmit}
            isConfirmDisabled={processing || !isFormValid}
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-0 md:min-h-[520px] h-full text-left relative">
                <button type="button" onClick={onClose} className="absolute top-5 right-5 z-20 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-all focus:outline-none">
                    <X size={18} className="stroke-[2.5]" />
                </button>

                {/* Left Side: Step Indicator (4 Cols) */}
                <div className="col-span-1 md:col-span-4 bg-[#0266E0] p-8 text-white flex flex-col justify-between select-none rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none">
                    <div className="space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-7 w-auto object-contain" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Prepahid</span>
                        </div>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 transition-all ${currentStep >= 1 ? 'bg-white text-blue-600 border-white' : 'border-blue-400 text-blue-400'}`}>
                                    1
                                </div>
                                <div>
                                    <h4 className={`text-sm font-black transition-all ${currentStep >= 1 ? 'text-white' : 'text-blue-400'}`}>Selección de Grupo</h4>
                                    <p className="text-[10px] text-blue-200 mt-1 leading-relaxed">Elige el grupo para cargar su plan de estudios.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 transition-all ${currentStep >= 2 ? 'bg-white text-blue-600 border-white' : 'border-blue-400 text-blue-400'}`}>
                                    2
                                </div>
                                <div>
                                    <h4 className={`text-sm font-black transition-all ${currentStep >= 2 ? 'text-white' : 'text-blue-400'}`}>Asignación de Plantilla</h4>
                                    <p className="text-[10px] text-blue-200 mt-1 leading-relaxed">Asigna un profesor titular a cada materia del semestre.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[11px] text-blue-100 leading-relaxed italic">
                            "Configura el cuerpo docente completo para este grupo en un solo paso."
                        </p>
                    </div>
                </div>

                {/* Right Side: Content Area (8 Cols) */}
                <div className="col-span-1 md:col-span-8 p-8 md:p-12 flex flex-col min-h-0 relative bg-white md:rounded-r-[10px]">

                    {/* STEP 1: GROUP SELECTION */}
                    {currentStep === 1 && mode === 'create' && (
                        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center space-y-2">
                                <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <BookOpen size={32} className="stroke-[2.5]" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Asignación de Grupos</h3>
                                <p className="text-slate-400 text-sm">Comienza eligiendo el grupo académico al que deseas asignar materias.</p>
                            </div>

                            <div className="space-y-2 text-left">
                                <FormLabel className="text-slate-500 font-bold ml-1 uppercase text-[10px] tracking-widest">Grupo Académico</FormLabel>
                                <FormSelect
                                    value={data.grupo_id}
                                    onChange={e => setData('grupo_id', e.target.value)}
                                    className="h-14 text-sm font-bold border-2 border-slate-100 hover:border-blue-200 focus:border-blue-500 rounded-2xl transition-all shadow-sm"
                                >
                                    <option value="">Seleccionar grupo...</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.nombre} ({g.especialidad})</option>
                                    ))}
                                </FormSelect>
                            </div>

                            <button
                                type="button"
                                disabled={!data.grupo_id}
                                onClick={() => setCurrentStep(2)}
                                className="w-full bg-[#0266E0] hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
                            >
                                Configurar Materias
                            </button>
                        </div>
                    )}

                    {/* STEP 2: BULK ASSIGNMENT */}
                    {currentStep === 2 && mode === 'create' && (
                        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Plantilla de Profesores</h3>
                                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-0.5">
                                        {selectedGroup?.nombre} • {groupSemester}° Semestre
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="text-blue-600 text-xs font-black uppercase hover:underline"
                                >
                                    Cambiar Grupo
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar">
                                {(suggestedCourses || []).map(course => {
                                    const currentAssign = (data.assignments || []).find(a => a.materia_id === course.id);
                                    const isAssigned = currentAssign && currentAssign.docente_id !== '';

                                    return (
                                        <div key={course.id} className={`group p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center gap-4 ${isAssigned ? 'bg-white border-blue-500/30 shadow-md shadow-blue-50' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-[13px] font-black tracking-tight ${isAssigned ? 'text-blue-700' : 'text-slate-700'}`}>{course.nombre}</span>
                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${course.tipo === 'General' ? 'bg-slate-200 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                                                        {course.tipo === 'General' ? 'Tronco Común' : 'Especialidad'}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Clave: {course.codigo}</p>
                                            </div>
                                            <div className="sm:w-64 shrink-0">
                                                <select
                                                    value={currentAssign?.docente_id || ''}
                                                    onChange={e => handleTeacherChange(course.id, e.target.value)}
                                                    className={`w-full h-10 text-[11px] rounded-xl border-2 focus:ring-0 focus:outline-none font-bold transition-all px-3 ${
                                                        isAssigned
                                                            ? 'border-blue-100 bg-white text-blue-700'
                                                            : 'border-slate-200 bg-white text-slate-500'
                                                    }`}
                                                >
                                                    <option value="">-- Seleccionar Docente --</option>
                                                    {getFilteredTeachersForCourse(course).map(t => (
                                                        <option key={t.id} value={t.id}>
                                                            {t.nombre_completo} {t.area ? `(${t.area})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex justify-end items-center gap-3 border-t border-slate-100 pt-6">
                                <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-700">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={processing || !isFormValid}
                                    className="px-8 py-3 bg-[#0266E0] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
                                >
                                    {processing ? 'Procesando...' : 'Confirmar Plantilla'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* EDIT MODE: SINGLE ASSIGNMENT */}
                    {mode === 'edit' && (
                        <div className="flex-1 flex flex-col justify-center space-y-8 animate-in fade-in duration-300">
                             <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Actualizar Asignación</h3>
                                <p className="text-slate-400 text-sm mt-1">Reasigna un profesor a la materia en el grupo seleccionado.</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 space-y-6 text-left">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-white text-blue-600 rounded-2xl border-2 border-slate-200 flex items-center justify-center font-black text-xs shadow-sm">
                                            {load?.codigo_materia?.substring(0,2)}
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Asignatura</span>
                                            <span className="text-base font-black text-slate-800">{load?.nombre_materia}</span>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-200 w-full" />
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center font-black text-[10px]">
                                            GR
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Grupo Académico</span>
                                            <span className="text-sm font-bold text-slate-600">{(load?.nombre_group || load?.nombre_grupo)} • {load?.nombre_ciclo}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <FormLabel required className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nuevo Profesor Titular</FormLabel>
                                    <FormSelect
                                        value={data.docente_id}
                                        onChange={e => setData('docente_id', e.target.value)}
                                        className="h-12 text-sm font-bold rounded-2xl border-2 border-slate-200 focus:border-blue-500 bg-white"
                                    >
                                        <option value="">Seleccionar nuevo docente...</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre_completo} ({t.especialidad})</option>
                                        ))}
                                    </FormSelect>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.docente_id}
                                    className="px-10 py-3 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 transition-all"
                                >
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </BaseModal>
    );
}
