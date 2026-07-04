import React from 'react';
import { Hash, Mail } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel, FormInput, FormSelect } from '@/Components/FormFields';

interface GroupProp {
    id: number;
    name: string;
    code: string;
}

interface StudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    student: any;
    groups: GroupProp[];
    data: {
        nombre: string;
        email: string;
        academic_group_id: number | string;
        status: 'active' | 'suspended';
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function StudentFormModal({
    isOpen,
    onClose,
    mode,
    student,
    groups,
    data,
    setData,
    errors,
    processing,
    onSubmit,
}: StudentFormModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Inscribir Nuevo Alumno' : 'Modificar Matrícula de Alumno'}
            subtitle="Configura los datos del usuario e inscripción académica"
            maxWidthClass="max-w-lg"
            onSubmit={onSubmit}
            confirmLabel={processing ? 'Guardando...' : mode === 'create' ? 'Registrar Matrícula' : 'Guardar Cambios'}
            isConfirmDisabled={processing}
        >
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-1 text-left">
                    <FormLabel>Matrícula</FormLabel>
                    <FormInput
                        readOnly
                        value={mode === 'create' ? 'AUTO' : student?.matricula || ''}
                        className="bg-slate-100 border-0 text-slate-500 font-mono"
                        icon={<Hash size={13} />}
                    />
                </div>
                <div className="space-y-1.5 col-span-2 text-left">
                    <FormLabel required>Nombre Completo</FormLabel>
                    <FormInput
                        required
                        value={data.nombre}
                        onChange={e => setData('nombre', e.target.value)}
                        placeholder="Nombre completo del alumno"
                    />
                    {errors.nombre && <span className="text-red-500 text-[10px] mt-1 block">{errors.nombre}</span>}
                </div>
            </div>

            <div className="space-y-1.5 text-left">
                <FormLabel required>Correo Electrónico (Acceso)</FormLabel>
                <FormInput
                    type="email"
                    required
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    placeholder="correo.alumno@alumno.prepahidalgo.edu.mx"
                    icon={<Mail size={14} />}
                />
                {errors.email && <span className="text-red-500 text-[10px] mt-1 block">{errors.email}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                    <FormLabel required>Grupo Asignado</FormLabel>
                    <FormSelect
                        value={data.academic_group_id}
                        onChange={e => setData('academic_group_id', Number(e.target.value))}
                    >
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </FormSelect>
                    {errors.academic_group_id && <span className="text-red-500 text-[10px] mt-1 block">{errors.academic_group_id}</span>}
                </div>

                <div className="space-y-1.5 text-left">
                    <FormLabel required>Estatus Inicial</FormLabel>
                    <FormSelect
                        value={data.status}
                        onChange={e => setData('status', e.target.value as any)}
                    >
                        <option value="active">Alta (Activo)</option>
                        <option value="suspended">Baja (Suspendido)</option>
                    </FormSelect>
                    {errors.status && <span className="text-red-500 text-[10px] mt-1 block">{errors.status}</span>}
                </div>
            </div>
        </BaseModal>
    );
}
