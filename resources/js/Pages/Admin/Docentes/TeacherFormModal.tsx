import React from 'react';
import { Phone } from "lucide-react";
import BaseModal from "@/Components/BaseModal";
import { FormLabel, FormInput, FormSelect } from '@/Components/FormFields';

interface TeacherFormModalProps {
    open: boolean;
    mode: "create" | "edit";
    data: {
        nombre: string;
        apellido_paterno: string;
        apellido_materno: string;
        phone: string;
        specialty: string;
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
}

export default function TeacherFormModal({
    open,
    mode,
    data,
    setData,
    errors,
    processing,
    onClose,
    onSubmit,
    saveStatus = 'idle',
}: TeacherFormModalProps) {
    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title={saveStatus !== 'idle' ? '' : mode === "create" ? "Registrar Nuevo Docente" : "Editar Expediente de Docente"}
            subtitle={saveStatus !== 'idle' ? '' : "Configura el nombre completo, teléfono y especialidad del docente"}
            maxWidthClass="max-w-lg"
            onSubmit={onSubmit}
            confirmLabel={processing ? "Guardando..." : mode === "create" ? "Registrar" : "Guardar"}
            isConfirmDisabled={processing}
            showFooter={saveStatus === 'idle'}
        >
            {saveStatus === 'saving' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#1e88e5]/20 border-t-[#1e88e5] animate-spin"></div>
                    <p className="font-extrabold text-slate-800 text-sm">
                        {mode === 'create' ? 'Registrando docente...' : 'Guardando cambios...'}
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
                        {mode === 'create' ? 'El docente ha sido registrado con éxito.' : 'El expediente ha sido actualizado correctamente.'}
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
                        No se pudo guardar la información. Por favor verifica los campos e intenta de nuevo.
                    </p>
                </div>
            )}

            {saveStatus === 'idle' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                        <div className="space-y-1.5">
                            <FormLabel required>Nombre(s)</FormLabel>
                            <FormInput
                                required
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                placeholder="Ej: Francisco Javier"
                            />
                            {errors.nombre && <span className="text-red-500 text-[10px] mt-1 block">{errors.nombre}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <FormLabel required>Apellido Paterno</FormLabel>
                            <FormInput
                                required
                                value={data.apellido_paterno}
                                onChange={e => setData('apellido_paterno', e.target.value)}
                                placeholder="Ej: Martínez"
                            />
                            {errors.apellido_paterno && <span className="text-red-500 text-[10px] mt-1 block">{errors.apellido_paterno}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <FormLabel>Apellido Materno</FormLabel>
                            <FormInput
                                value={data.apellido_materno}
                                onChange={e => setData('apellido_materno', e.target.value)}
                                placeholder="Ej: López"
                            />
                            {errors.apellido_materno && <span className="text-red-500 text-[10px] mt-1 block">{errors.apellido_materno}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left mt-4">
                        <div className="space-y-1.5">
                            <FormLabel required>Teléfono</FormLabel>
                            <FormInput
                                type="tel"
                                required
                                maxLength={10}
                                pattern="[0-9]{10}"
                                value={data.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setData('phone', val);
                                }}
                                placeholder="Ej: 7711234567"
                                icon={<Phone size={14} />}
                            />
                            {errors.phone && <span className="text-red-500 text-[10px] mt-1 block">{errors.phone}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <FormLabel required>Área de Especialidad</FormLabel>
                            <FormSelect
                                required
                                value={data.specialty}
                                onChange={e => setData('specialty', e.target.value)}
                            >
                                <option value="">Seleccionar área...</option>
                                <option value="Ciencias Exactas e Ingeniería">Ciencias Exactas e Ingeniería</option>
                                <option value="Lenguaje y Comunicación">Lenguaje y Comunicación</option>
                                <option value="Historia y Ciencias Sociales">Historia y Ciencias Sociales</option>
                                <option value="Química y Biología">Química y Biología</option>
                                <option value="General">General</option>
                            </FormSelect>
                            {errors.specialty && <span className="text-red-500 text-[10px] mt-1 block">{errors.specialty}</span>}
                        </div>
                    </div>
                </>
            )}
        </BaseModal>
    );
}