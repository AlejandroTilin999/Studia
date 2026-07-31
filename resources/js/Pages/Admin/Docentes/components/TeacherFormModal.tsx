import React from 'react';
import { Phone, X, Hash, Mail, GraduationCap } from "lucide-react";
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
        areas: string[];
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    specialties: any[];
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
    specialties = []
}: TeacherFormModalProps) {
    // Buscar la especialidad seleccionada para obtener sus sub_areas
    const selectedSpecObj = specialties.find(s => s.nombre === data.especialidad);

    // [LÓGICA v6.1] Soporte para Especialidad General y Áreas Múltiples
    const availableSubAreas = data.especialidad.toLowerCase() === 'general'
        ? GENERAL_AREAS
        : (selectedSpecObj?.sub_areas || []);

    const toggleArea = (area: string) => {
        const currentAreas = [...data.areas];
        const index = currentAreas.indexOf(area);
        if (index > -1) {
            currentAreas.splice(index, 1);
        } else {
            currentAreas.push(area);
        }
        setData('areas', currentAreas);
    };
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
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[460px] max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible h-full text-left relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="fixed md:absolute top-4 right-4 z-50 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Panel */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none shrink-0">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.webp" alt="Prepa Hidalgo" className="h-8 md:h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight flex items-center gap-2">
                                <GraduationCap size={22} />
                                {mode === "create" ? "Registrar Docente" : "Modificar Perfil"}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] md:text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Crea una cuenta institucional para un nuevo profesor. Se generará automáticamente su matrícula y correo de acceso.'
                                    : 'Actualiza los datos personales, de contacto o el área de adscripción del docente.'}
                            </p>
                        </div>
                    </div>
                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 shrink-0 hidden md:block mt-6 uppercase tracking-widest">
                        Prepahid · Campus Digital
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-1 md:col-span-3 p-5 md:p-6 flex flex-col justify-between min-h-0 md:min-h-[440px] relative bg-white rounded-b-[10px] md:rounded-r-[10px] md:rounded-bl-none">
                    <div className="space-y-5 flex-1 flex flex-col justify-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel>Matrícula / ID</FormLabel>
                                <FormInput
                                    readOnly
                                    value={data.matricula || 'PROCESANDO...'}
                                    className="bg-slate-50 border border-slate-200 text-slate-500 font-mono focus:ring-0 cursor-not-allowed h-9 text-xs"
                                    icon={<Hash size={13} />}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel>Correo Institucional</FormLabel>
                                <FormInput
                                    type="email"
                                    readOnly
                                    value={data.email || 'PROCESANDO...'}
                                    className="bg-slate-50 border border-slate-200 text-slate-500 font-mono focus:ring-0 cursor-not-allowed h-9 text-xs"
                                    icon={<Mail size={13} />}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Nombre(s)</FormLabel>
                            <FormInput
                                required
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                placeholder="Ej: Roberto Carlos"
                                className="h-9 text-xs font-normal"
                            />
                            {errors.nombre && <span className="text-red-500 text-[10px] mt-1 block">{errors.nombre}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Apellido Paterno</FormLabel>
                                <FormInput
                                    required
                                    value={data.apellido_paterno}
                                    onChange={e => setData('apellido_paterno', e.target.value)}
                                    placeholder="Ej: Silva"
                                    className="h-9 text-xs"
                                />
                                {errors.apellido_paterno && <span className="text-red-500 text-[10px] mt-1 block">{errors.apellido_paterno}</span>}
                            </div>
                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Apellido Materno</FormLabel>
                                <FormInput
                                    required
                                    value={data.apellido_materno}
                                    onChange={e => setData('apellido_materno', e.target.value)}
                                    placeholder="Ej: Pérez"
                                    className="h-9 text-xs"
                                />
                                {errors.apellido_materno && <span className="text-red-500 text-[10px] mt-1 block">{errors.apellido_materno}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Teléfono Móvil</FormLabel>
                                <FormInput
                                    type="tel"
                                    required
                                    maxLength={10}
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="10 dígitos"
                                    icon={<Phone size={14} />}
                                    className="h-9 text-xs"
                                />
                                {errors.telefono && <span className="text-red-500 text-[10px] mt-1 block">{errors.telefono}</span>}
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel required>Especialidad</FormLabel>
                                <FormSelect
                                    required
                                    value={data.especialidad}
                                    onChange={e => {
                                        setData('especialidad', e.target.value);
                                        setData('areas', []); // Limpiar áreas al cambiar especialidad
                                    }}
                                    className="h-9 text-xs font-normal text-slate-700"
                                >
                                    <option value="">Seleccionar especialidad...</option>
                                    <option value="General">General</option>
                                    {specialties.filter(s => s.nombre.toLowerCase() !== 'general').map(s => (
                                        <option key={s.id} value={s.nombre}>{s.nombre}</option>
                                    ))}
                                </FormSelect>
                            </div>
                        </div>

                        {availableSubAreas.length > 0 && (
                            <div className="space-y-3 text-left animate-in slide-in-from-top-1 duration-200">
                                <FormLabel>Ramas Técnicas / Áreas de Dominio</FormLabel>
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {availableSubAreas.map((area: string) => (
                                        <label key={area} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={data.areas.includes(area)}
                                                onChange={() => toggleArea(area)}
                                                className="w-4 h-4 rounded border-slate-300 text-[#0266E0] focus:ring-[#0266E0]"
                                            />
                                            <span className={`text-xs transition-colors ${data.areas.includes(area) ? 'text-[#0266E0]' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                                {area}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-none pl-1">Selecciona todas las áreas que el docente puede impartir.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none">
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
                            className="px-5 py-2 bg-[#0266E0] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all focus:outline-none flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                mode === 'create' ? 'Registrar Docente' : 'Actualizar Perfil'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
