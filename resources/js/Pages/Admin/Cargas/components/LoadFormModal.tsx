import React, { useEffect } from 'react';
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
        academic_period_id: string | number;
        academic_group_id: string | number;
        course_id: string | number;
        teacher_id: string | number;
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
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
    saveStatus = 'idle',
}: LoadFormModalProps) {
    useEffect(() => {
        if (isOpen && mode === 'create') {
            // Inicializar con primer elemento de catálogo si aplica
            if (periods.length > 0 && !data.academic_period_id) {
                const activePeriod = periods.find(p => p.is_active) || periods[0];
                setData('academic_period_id', activePeriod.id);
            }
            if (groups.length > 0 && !data.academic_group_id) {
                setData('academic_group_id', groups[0].id);
            }
            if (courses.length > 0 && !data.course_id) {
                setData('course_id', courses[0].id);
            }
            if (teachers.length > 0 && !data.teacher_id) {
                setData('teacher_id', teachers[0].id);
            }
        }
    }, [isOpen, mode]);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={saveStatus !== 'idle' ? '' : mode === 'create' ? 'Crear Asignación de Materia' : 'Editar Asignación de Materia'}
            subtitle={saveStatus !== 'idle' ? '' : "Relaciona un ciclo, grupo, materia y docente"}
            maxWidthClass="max-w-md"
            onSubmit={onSubmit}
            confirmLabel={processing ? 'Guardando...' : mode === 'create' ? 'Crear Asignación' : 'Guardar'}
            isConfirmDisabled={processing}
            showFooter={false}
        >
            {saveStatus === 'saving' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#1e88e5]/20 border-t-[#1e88e5] animate-spin"></div>
                    <p className="font-extrabold text-slate-800 text-sm">
                        {mode === 'create' ? 'Registrando asignación de materia...' : 'Guardando cambios...'}
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
                        {mode === 'create' ? 'La asignación de materia ha sido creada.' : 'Los cambios han sido guardados correctamente.'}
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
                        No se pudo guardar la asignación de materia. Por favor verifica que la materia no esté asignada en el mismo grupo y ciclo, e intenta de nuevo.
                    </p>
                </div>
            )}

            {saveStatus === 'idle' && (
                <div className="space-y-4 text-left">
                    {/* Ciclo Escolar */}
                    <div className="space-y-1.5">
                        <FormLabel required>Ciclo Escolar</FormLabel>
                        <FormSelect
                            value={data.academic_period_id}
                            onChange={e => setData('academic_period_id', e.target.value)}
                        >
                            <option value="">Selecciona un ciclo</option>
                            {periods.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} {p.is_active ? '(Activo)' : ''}
                                </option>
                            ))}
                        </FormSelect>
                        {errors.academic_period_id && (
                            <span className="text-red-500 text-[10px] mt-1 block font-bold">{errors.academic_period_id}</span>
                        )}
                    </div>

                    {/* Grupo */}
                    <div className="space-y-1.5">
                        <FormLabel required>Grupo Académico</FormLabel>
                        <FormSelect
                            value={data.academic_group_id}
                            onChange={e => setData('academic_group_id', e.target.value)}
                        >
                            <option value="">Selecciona un grupo</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>
                                    {g.name} - {g.major} ({g.code})
                                </option>
                            ))}
                        </FormSelect>
                        {errors.academic_group_id && (
                            <span className="text-red-500 text-[10px] mt-1 block font-bold">{errors.academic_group_id}</span>
                        )}
                    </div>

                    {/* Materia */}
                    <div className="space-y-1.5">
                        <FormLabel required>Materia (Asignatura)</FormLabel>
                        <FormSelect
                            value={data.course_id}
                            onChange={e => setData('course_id', e.target.value)}
                        >
                            <option value="">Selecciona una materia</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.code})
                                </option>
                            ))}
                        </FormSelect>
                        {errors.course_id && (
                            <span className="text-red-500 text-[10px] mt-1 block font-bold">{errors.course_id}</span>
                        )}
                    </div>

                    {/* Profesor */}
                    <div className="space-y-1.5">
                        <FormLabel required>Profesor / Docente</FormLabel>
                        <FormSelect
                            value={data.teacher_id}
                            onChange={e => setData('teacher_id', e.target.value)}
                        >
                            <option value="">Selecciona un docente</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre_completo}
                                </option>
                            ))}
                        </FormSelect>
                        {errors.teacher_id && (
                            <span className="text-red-500 text-[10px] mt-1 block font-bold">{errors.teacher_id}</span>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-[#1e88e5] text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl text-xs font-bold"
                        >
                            {processing ? 'Guardando...' : mode === 'create' ? 'Crear Asignación' : 'Guardar'}
                        </button>
                    </div>
                </div>
            )}
        </BaseModal>
    );
}
