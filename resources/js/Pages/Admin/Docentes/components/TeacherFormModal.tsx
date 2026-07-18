import React from 'react';
import { Phone, X, Hash, Mail } from "lucide-react";
import BaseModal from "@/Components/BaseModal";
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormSelect } from '@/Components/forms/FormSelect';
import { SpecialtySelect } from '@/Components/SpecialtySelect';
import { GENERAL_AREAS } from '../../Alumnos/constants';

interface TeacherFormModalProps {
    open: boolean;
    mode: "create" | "edit";
    data: {
        matricula: string;
        email: string;
        nombre: string;
        apellido_paterno: string;
        apellido_materno: string;
        telefono: string;
        especialidad: string;
        area: string;
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
            maxWidthClass="max-w-3xl"
            onSubmit={onSubmit}
            isConfirmDisabled={processing}
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[380px] max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible h-full text-left relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="fixed md:absolute top-4 right-4 z-50 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none shrink-0">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-8 md:h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                                {mode === "create" ? "Registrar Nuevo Docente" : "Modificar Información del Docente"}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] md:text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Al registrar al docente, se generará automáticamente su matrícula y correo institucional de acceso al portal.'
                                    : 'Modifica la información básica o el área de especialidad del docente.'}
                            </p>
                        </div>
                    </div>
                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 shrink-0 hidden md:block mt-6">
                        Prepahid Campus Escolar
                    </div>
                </div>

                <div className="col-span-1 md:col-span-3 p-5 md:p-6 flex flex-col justify-between min-h-0 md:min-h-[420px] relative bg-white rounded-b-[10px] md:rounded-r-[10px] md:rounded-bl-none">
                    <div className="space-y-5 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel>Matrícula</FormLabel>
                                <FormInput
                                    readOnly
                                    value={data.matricula || 'PROCESANDO...'}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 font-mono focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs"
                                    icon={<Hash size={13} />}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel>Correo Electrónico (Acceso)</FormLabel>
                                <FormInput
                                    type="email"
                                    readOnly
                                    value={data.email || 'PROCESANDO...'}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 font-mono focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs"
                                    icon={<Mail size={13} />}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Nombre(s)</FormLabel>
                                <FormInput
                                    required
                                    value={data.nombre}
                                    onChange={e => setData('nombre', e.target.value)}
                                    placeholder="Ej: Francisco Javier"
                                    className="h-9 text-xs"
                                />
                                {errors.nombre && <span className="text-red-500 text-[10px] mt-1 block">{errors.nombre}</span>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <FormLabel required>Apellido Paterno</FormLabel>
                                    <FormInput
                                        required
                                        value={data.apellido_paterno}
                                        onChange={e => setData('apellido_paterno', e.target.value)}
                                        placeholder="Ej: Martínez"
                                        className="h-9 text-xs"
                                    />
                                    {errors.apellido_paterno && <span className="text-red-500 text-[10px] mt-1 block">{errors.apellido_paterno}</span>}
                                </div>
                                <div className="space-y-1.5">
                                    <FormLabel required>Apellido Materno</FormLabel>
                                    <FormInput
                                        required
                                        value={data.apellido_materno}
                                        onChange={e => setData('apellido_materno', e.target.value)}
                                        placeholder="Ej: López"
                                        className="h-9 text-xs"
                                    />
                                    {errors.apellido_materno && <span className="text-red-500 text-[10px] mt-1 block">{errors.apellido_materno}</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                <div className="space-y-1.5">
                                    <FormLabel required>Teléfono</FormLabel>
                                    <FormInput
                                        type="tel"
                                        required
                                        maxLength={10}
                                        pattern="[0-9]{10}"
                                        value={data.telefono}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setData('telefono', val);
                                        }}
                                        placeholder="Ej: 7711234567"
                                        icon={<Phone size={14} />}
                                        className="h-9 text-xs"
                                    />
                                    {errors.telefono && <span className="text-red-500 text-[10px] mt-1 block">{errors.telefono}</span>}
                                </div>
                                <div className="space-y-1.5">
                                    <FormLabel required>Área de Especialidad</FormLabel>
                                    <SpecialtySelect
                                        required
                                        value={data.especialidad}
                                        onChange={e => {
                                            setData('especialidad', e.target.value);
                                            if (e.target.value.toLowerCase() !== 'general') setData('area', '');
                                        }}
                                        className="h-9 text-xs"
                                    />
                                    {errors.especialidad && <span className="text-red-500 text-[10px] mt-1 block">{errors.especialidad}</span>}
                                </div>
                            </div>

                            {data.especialidad.toLowerCase() === 'general' && (
                                <div className="space-y-1.5 text-left animate-in slide-in-from-top-1 duration-200">
                                    <FormLabel required>Área de Conocimiento (Docente General)</FormLabel>
                                    <FormSelect
                                        value={data.area}
                                        onChange={e => setData('area', e.target.value)}
                                        className="h-9 text-xs"
                                    >
                                        <option value="">Seleccionar área...</option>
                                        {GENERAL_AREAS.map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </FormSelect>
                                    {errors.area && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.area}</span>}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none bg-white md:bg-transparent sticky bottom-0 md:relative">
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
                                className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all focus:outline-none active:scale-[0.98]"
                            >
                                {processing ? 'Guardando...' : mode === 'create' ? 'Registrar' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
