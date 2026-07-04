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
}: GroupFormModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Crear Nuevo Grupo' : 'Editar Grupo'}
            subtitle="Configura la información básica y el tutor asignado del grupo"
            maxWidthClass="max-w-md"
            onSubmit={onSubmit}
            confirmLabel={processing ? 'Guardando...' : mode === 'create' ? 'Crear Grupo' : 'Guardar'}
            isConfirmDisabled={processing}
        >
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

            <div className="space-y-1.5 text-left">
                <FormLabel required>Nombre del Grupo</FormLabel>
                <FormInput
                    required
                    placeholder="Ej: 1er Año TI"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                />
                {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
            </div>

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
        </BaseModal>
    );
}
