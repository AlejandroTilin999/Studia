import React from 'react';
import { Phone, X, Hash, Mail } from "lucide-react";
import BaseModal from "@/Components/BaseModal";
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormSelect } from '@/Components/forms/FormSelect';
import { SpecialtySelect } from '@/Components/SpecialtySelect';

interface TeacherFormModalProps {
    open: boolean;
    mode: "create" | "edit";
    data: {
        matricula: string;
        email: string;
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
            maxWidthClass="max-w-3xl"
            onSubmit={onSubmit}
            isConfirmDisabled={processing}
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[380px] h-full text-left relative">
                {/* Windows Close button relative to the entire grid modal container */}
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
                                {mode === "create" ? "Registrar Nuevo Docente" : "Modificar Información del Docente"}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Al registrar al docente, se generará automáticamente su matrícula y correo institucional de acceso al portal.'
                                    : 'Modifica la información básica o el área de especialidad del docente. La matrícula y correo no pueden editarse.'}
                            </p>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 shrink-0 hidden md:block">
                        Prepahid Campus Escolar
                    </div>
                </div>

                {/* Right Form Panel (col-span-3) */}
                <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[420px] relative">
                    <div className="space-y-4 flex-1">
                        {/* Credenciales Auto-generadas */}
                        <div className="grid grid-cols-2 gap-4 text-left">
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

                            <div className="grid grid-cols-2 gap-4">
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
                                        className="h-9 text-xs"
                                    />
                                    {errors.phone && <span className="text-red-500 text-[10px] mt-1 block">{errors.phone}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <FormLabel required>Área de Especialidad</FormLabel>
                                    <SpecialtySelect
                                        required
                                        value={data.specialty}
                                        onChange={e => setData('specialty', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    {errors.specialty && <span className="text-red-500 text-[10px] mt-1 block">{errors.specialty}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Footer de Navegación Aligned Right */}
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
