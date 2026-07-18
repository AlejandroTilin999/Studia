import React, { useEffect } from 'react';
import { X, Layers } from 'lucide-react';
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
    // 1. Identificar especialidad y semestre del grupo seleccionado
    const selectedGroup = groups.find(g => g.id.toString() === data.grupo_id.toString());
    const groupMajor = selectedGroup?.especialidad || '';
    const groupSemester = selectedGroup?.codigo ? parseInt(selectedGroup.codigo.charAt(0)) : null;

    // 2. Filtrar materias: Generales o Especialidad + Mismo Semestre
    const filteredCourses = React.useMemo(() => {
        if (!groupMajor && !groupSemester) return courses;

        return courses.filter(course => {
            // Regla 1: Debe ser del mismo semestre que el grupo
            const matchesSemester = groupSemester ? course.semestre === groupSemester : true;
            if (!matchesSemester) return false;

            // Regla 2: Debe ser General o de la especialidad del grupo
            if (course.tipo === 'General') return true;
            return course.especialidades?.some(sName => sName.toLowerCase() === groupMajor.toLowerCase());
        });
    }, [courses, groupMajor, groupSemester]);

    // 3. Filtrar profesores según la materia seleccionada
    const selectedCourse = courses.find(c => c.id.toString() === data.materia_id.toString());

    const filteredTeachers = React.useMemo(() => {
        if (!selectedCourse) return teachers;

        const filtered = teachers.filter(teacher => {
            const teacherSpec = (teacher.especialidad || '').toLowerCase();

            if (selectedCourse.tipo === 'General') {
                // Para materias generales, permitimos a todos los docentes o priorizamos
                // pero por ahora mostraremos a todos para evitar listas vacías
                return true;
            }

            // Para materias de especialidad, buscamos coincidencia
            return selectedCourse.especialidades?.some(
                sName => sName.toLowerCase() === teacherSpec
            );
        });

        // Si el filtro es tan estricto que no deja a nadie, mostramos a todos
        return filtered.length > 0 ? filtered : teachers;
    }, [teachers, selectedCourse]);

    // 4. Resetear materia si el grupo cambia y la materia seleccionada ya no es válida
    useEffect(() => {
        if (isOpen && data.materia_id && groupMajor) {
            const isStillValid = filteredCourses.some(c => c.id.toString() === data.materia_id.toString());
            if (!isStillValid) {
                setData('materia_id', '');
            }
        }
    }, [data.grupo_id, filteredCourses]);

    // 5. Resetear profesor si la materia cambia y el profesor ya no es válido
    useEffect(() => {
        if (isOpen && data.docente_id && selectedCourse) {
            const isStillValid = filteredTeachers.some(t => t.id.toString() === data.docente_id.toString());
            if (!isStillValid) {
                setData('docente_id', '');
            }
        }
    }, [data.materia_id, filteredTeachers]);

    useEffect(() => {
        if (isOpen && mode === 'create') {
            // Inicializar con primer elemento de catálogo si aplica
            if (periods.length > 0 && !data.ciclo_id) {
                const activePeriod = periods.find(p => p.activo) || periods[0];
                setData('ciclo_id', activePeriod.id);
            }
            if (groups.length > 0 && !data.grupo_id) {
                setData('grupo_id', groups[0].id);
            }
            if (courses.length > 0 && !data.materia_id) {
                setData('materia_id', courses[0].id);
            }
            if (teachers.length > 0 && !data.docente_id) {
                setData('docente_id', teachers[0].id);
            }
        }
    }, [isOpen, mode]);


    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-3xl"
            onSubmit={onSubmit}
            isConfirmDisabled={processing}
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[460px] h-full text-left relative">
                {/* Windows Close button */}
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
                                {mode === 'create' ? 'Crear Asignación Académica' : 'Modificar Asignación'}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Vincula una asignatura con un grupo escolar y un profesor titular. Esta asignación permitirá al docente gestionar su Classroom y asentar calificaciones.'
                                    : 'Actualiza la relación entre la materia, el grupo o el profesor asignado para este periodo escolar.'}
                            </p>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block">
                        Prepahid Campus Escolar
                    </div>
                </div>

                {/* Right Form Panel (col-span-3) */}
                <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[440px] relative">
                    <div className="space-y-5 flex-1 flex flex-col justify-center">

                        {/* Grupo */}
                        <div className="space-y-1.5">
                            <FormLabel required>Grupo Académico</FormLabel>
                            <FormSelect
                                value={data.grupo_id}
                                onChange={e => setData('grupo_id', e.target.value)}
                                className="h-10 text-xs"
                            >
                                <option value="">Selecciona un grupo...</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>
                                        {g.nombre}
                                    </option>
                                ))}
                            </FormSelect>
                            {errors.grupo_id && (
                                <span className="text-red-500 text-[10px] mt-1 block font-bold">{errors.grupo_id}</span>
                            )}
                        </div>

                        {/* Materia */}
                        <div className="space-y-1.5">
                            <FormLabel required>Materia (Asignatura)</FormLabel>
                            <FormSelect
                                value={data.materia_id}
                                onChange={e => setData('materia_id', e.target.value)}
                                className="h-10 text-xs"
                            >
                                <option value="">Selecciona una materia...</option>
                                {filteredCourses.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre} ({c.codigo})
                                    </option>
                                ))}
                            </FormSelect>
                            {filteredCourses.length === 0 && groupMajor && (
                                <p className="text-[10px] text-amber-600 font-bold mt-1">
                                    No hay materias para {groupSemester}° Semestre de {groupMajor}.
                                </p>
                            )}
                            {errors.materia_id && (
                                <span className="text-red-500 text-[10px] mt-1 block font-bold">{errors.materia_id}</span>
                            )}
                        </div>

                        {/* Profesor */}
                        <div className="space-y-1.5">
                            <FormLabel required>Profesor / Docente</FormLabel>
                            <FormSelect
                                value={data.docente_id}
                                onChange={e => setData('docente_id', e.target.value)}
                                className="h-10 text-xs"
                            >
                                <option value="">Selecciona un docente...</option>
                                {filteredTeachers.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombre_completo} ({t.especialidad})
                                    </option>
                                ))}
                            </FormSelect>
                            {filteredTeachers.length === 0 && selectedCourse && (
                                <p className="text-[10px] text-amber-600 font-bold mt-1">
                                    No hay docentes disponibles para {selectedCourse.tipo === 'General' ? 'materias generales' : `la especialidad: ${selectedCourse.especialidades?.join(', ')}`}.
                                </p>
                            )}
                            {errors.docente_id && (
                                <span className="text-red-500 text-[10px] mt-1 block font-bold">{errors.docente_id}</span>
                            )}
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
                            disabled={processing}
                            className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all focus:outline-none active:scale-[0.98] shadow-sm shadow-blue-100"
                        >
                            {processing ? 'Guardando...' : mode === 'create' ? 'Confirmar Asignación' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
