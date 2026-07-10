import React from 'react';
import { Hash, Mail } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormSelect } from '@/Components/forms/FormSelect';
import { AcademicGroupProp } from '../types';

interface StudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    student: any;
    groups: AcademicGroupProp[];
    data: {
        nombre: string;
        email: string;
        telefono: string;
        fecha_nacimiento: string;
        academic_group_id: number | string;
        status: 'active' | 'inactive' | 'suspended';
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
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
    saveStatus = 'idle',
}: StudentFormModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={saveStatus !== 'idle' ? '' : mode === 'create' ? 'Inscribir Nuevo Alumno' : 'Modificar Matrícula de Alumno'}
            subtitle={saveStatus !== 'idle' ? '' : "Configura los datos del usuario e inscripción académica"}
            maxWidthClass="max-w-lg"
            onSubmit={onSubmit}
            confirmLabel={processing ? 'Guardando...' : mode === 'create' ? 'Registrar Matrícula' : 'Guardar Cambios'}
            isConfirmDisabled={processing}
            showFooter={saveStatus === 'idle'}
        >
            {saveStatus === 'saving' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#1e88e5]/20 border-t-[#1e88e5] animate-spin"></div>
                    <p className="font-extrabold text-slate-800 text-sm">
                        {mode === 'create' ? 'Registrando alumno...' : 'Guardando cambios...'}
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
                        {mode === 'create' ? 'El alumno ha sido registrado y matriculado.' : 'Los cambios han sido guardados correctamente.'}
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
                        No se pudo completar el registro. Por favor verifica los campos e intenta de nuevo.
                    </p>
                </div>
            )}

            {saveStatus === 'idle' && (
                <>
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

                    <div className="space-y-1.5 text-left mt-4">
                        <FormLabel required>Correo Electrónico (Acceso)</FormLabel>
                        <FormInput
                            type="email"
                            required
                            readOnly
                            value={data.email}
                            className="bg-slate-100/50 border-0 text-slate-500 font-mono"
                            placeholder="correo.alumno@alumno.prepahidalgo.edu.mx"
                            icon={<Mail size={14} />}
                        />
                        {errors.email && <span className="text-red-500 text-[10px] mt-1 block">{errors.email}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
    <div className="space-y-1.5 text-left">
        <FormLabel>Teléfono</FormLabel>
        <FormInput
    type="tel"
    value={data.telefono}
    maxLength={10}
    onChange={e => {
        const value = e.target.value.replace(/\D/g, '');
        setData('telefono', value);
    }}
    placeholder="Ej. 4431234567"
/>
        {errors.telefono && (
            <span className="text-red-500 text-[10px] mt-1 block">
                {errors.telefono}
            </span>
        )}
    </div>

    <div className="space-y-1.5 text-left">
        <FormLabel>Fecha de nacimiento</FormLabel>
        <FormInput
            type="date"
            value={data.fecha_nacimiento}
            onChange={e => setData('fecha_nacimiento', e.target.value)}
        />
        {errors.fecha_nacimiento && (
            <span className="text-red-500 text-[10px] mt-1 block">
                {errors.fecha_nacimiento}
            </span>
        )}
    </div>
</div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        

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
                </>
            )}
        </BaseModal>
    );
}
