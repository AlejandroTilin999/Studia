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
}: TeacherFormModalProps) {
    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title={mode === "create" ? "Registrar Nuevo Docente" : "Editar Expediente de Docente"}
            subtitle="Configura el nombre completo, teléfono y especialidad del docente"
            maxWidthClass="max-w-lg"
            onSubmit={onSubmit}
            confirmLabel={processing ? "Guardando..." : mode === "create" ? "Registrar" : "Guardar"}
            isConfirmDisabled={processing}
        >
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

            <div className="grid grid-cols-2 gap-4 text-left">
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
        </BaseModal>
    );
}