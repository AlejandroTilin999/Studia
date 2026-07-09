import React from 'react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormTextarea } from '@/Components/forms/FormTextarea';

interface SubjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    subject: any;
    data: {
        code: string;
        name: string;
        description: string;
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
}

export default function SubjectFormModal({
    isOpen,
    onClose,
    mode,
    subject,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    saveStatus = 'idle',
}: SubjectFormModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={saveStatus !== 'idle' ? '' : mode === 'create' ? 'Registrar Nueva Materia' : 'Editar Materia'}
            subtitle={saveStatus !== 'idle' ? '' : "Configura el temario de la materia"}
            maxWidthClass="max-w-md"
            onSubmit={onSubmit}
            confirmLabel={processing ? 'Guardando...' : mode === 'create' ? 'Registrar' : 'Guardar'}
            isConfirmDisabled={processing}
            showFooter={saveStatus === 'idle'}
        >
            {saveStatus === 'saving' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#1e88e5]/20 border-t-[#1e88e5] animate-spin"></div>
                    <p className="font-extrabold text-slate-800 text-sm">
                        {mode === 'create' ? 'Registrando asignatura...' : 'Guardando cambios...'}
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
                        {mode === 'create' ? 'La materia ha sido registrada con éxito.' : 'Los cambios han sido guardados correctamente.'}
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
                        No se pudo guardar la materia. Por favor verifica los campos e intenta de nuevo.
                    </p>
                </div>
            )}

            {saveStatus === 'idle' && (
                <>
                    <div className="grid grid-cols-3 gap-4 text-left">
                        <div className="space-y-1.5 col-span-1">
                            <FormLabel required>Código</FormLabel>
                            <FormInput
                                required
                                placeholder="Ej: MAT-101"
                                value={data.code}
                                onChange={e => setData('code', e.target.value)}
                            />
                            {errors.code && <span className="text-red-500 text-[10px] mt-1 block">{errors.code}</span>}
                        </div>
                        <div className="space-y-1.5 col-span-2">
                            <FormLabel required>Nombre de la Asignatura</FormLabel>
                            <FormInput
                                required
                                placeholder="Ej: Matemáticas I"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left mt-4">
                        <FormLabel>Descripción / Temario resumido</FormLabel>
                        <FormTextarea
                            placeholder="Escribe el alcance o temas clave..."
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                        />
                        {errors.description && <span className="text-red-500 text-[10px] mt-1 block">{errors.description}</span>}
                    </div>
                </>
            )}
        </BaseModal>
    );
}
