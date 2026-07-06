import React from 'react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel, FormInput, FormSelect } from '@/Components/FormFields';

interface ProfesorSelect {
    id: number;
    nombre_completo: string;
}

interface GroupFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    group: any;
    profesores: ProfesorSelect[];
    data: {
        code: string;
        name: string;
        shift: string;
        specialty: string;
        teacher_id: number | string;
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
    data,
    setData,
    errors,
    processing,
    onSubmit,
    saveStatus = 'idle',
}: GroupFormModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={saveStatus !== 'idle' ? '' : mode === 'create' ? 'Crear Nuevo Grupo' : 'Editar Grupo'}
            subtitle={saveStatus !== 'idle' ? '' : "Configura la información básica y el tutor asignado del grupo"}
            maxWidthClass="max-w-md"
            onSubmit={onSubmit}
            confirmLabel={processing ? 'Guardando...' : mode === 'create' ? 'Crear Grupo' : 'Guardar'}
            isConfirmDisabled={processing}
            showFooter={saveStatus === 'idle'}
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
                    <p className="text-xs text-rose-500 font-bold text-center max-w-[280px]">
                        No se pudo guardar el grupo escolar. Por favor verifica los campos e intenta de nuevo.
                    </p>
                </div>
            )}

            {saveStatus === 'idle' && (
                <>
                    <div className="space-y-1.5 text-left">
                        <FormLabel required>Código del Grupo</FormLabel>
                        <FormInput
                            required
                            placeholder="Ej: MAT1, TI001"
                            value={data.code}
                            onChange={e => setData('code', e.target.value)}
                        />
                        {errors.code && <span className="text-red-500 text-[10px] mt-1 block">{errors.code}</span>}
                    </div>

                    <div className="space-y-1.5 text-left mt-4">
                        <FormLabel required>Nombre del Grupo</FormLabel>
                        <FormInput
                            required
                            placeholder="Ej: 1er Año TI"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left mt-4">
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

                    <div className="space-y-1.5 text-left mt-4">
                        <FormLabel required>Profesor Titular</FormLabel>
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
                </>
            )}
        </BaseModal>
    );
}
