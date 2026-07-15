import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';

interface SpecialtyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    data: {
        name: string;
        code: string;
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
}

export default function SpecialtyFormModal({
    isOpen,
    onClose,
    mode,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    saveStatus = 'idle',
}: SpecialtyFormModalProps) {

    useEffect(() => {
        if (isOpen && mode === 'create') {
            setData('name', '');
            setData('code', '');
        }
    }, [isOpen, mode]);

    const isFormValid = data.name.trim() !== '' && data.code.trim() !== '';

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-3xl"
            onSubmit={onSubmit}
            isConfirmDisabled={processing || !isFormValid}
            showFooter={false}
            fullBleed={true}
        >
            {saveStatus === 'saving' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#1e88e5]/20 border-t-[#1e88e5] animate-spin"></div>
                    <p className="font-extrabold text-slate-800 text-sm">
                        {mode === 'create' ? 'Creando especialidad...' : 'Guardando cambios...'}
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
                        {mode === 'create' ? 'La especialidad ha sido registrada.' : 'Los cambios han sido guardados correctamente.'}
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
                        {errors.name || errors.code || 'No se pudo guardar la especialidad. Por favor verifica los campos e intenta de nuevo.'}
                    </p>
                </div>
            )}

            {saveStatus === 'idle' && (
                <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[280px] h-full text-left relative">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                    >
                        <X size={16} className="stroke-[2.5]" />
                    </button>

                    <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none">
                        <div className="space-y-6">
                            <div>
                                <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-10 w-auto object-contain mb-4 md:mb-6" />
                                <h3 className="text-xl font-bold text-white leading-tight">
                                    {mode === 'create' ? 'Nueva Especialidad' : 'Modificar Especialidad'}
                                </h3>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                    Define una nueva carrera técnica o especialidad. Las asignaturas y grupos se organizarán bajo esta especialidad.
                                </p>
                            </div>
                        </div>
                        
                        <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block">
                            Prepahid Campus Escolar
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[260px] relative">
                        <div className="space-y-4 flex-1 pr-2">
                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Nombre de la Especialidad</FormLabel>
                                <FormInput
                                    type="text"
                                    placeholder="Ej: Informática"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    maxLength={50}
                                />
                                {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
                            </div>

                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Código / Abreviación</FormLabel>
                                <FormInput
                                    type="text"
                                    placeholder="Ej: INF"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase())}
                                    maxLength={10}
                                />
                                <p className="text-[9px] text-slate-400 font-medium leading-none">Abreviación corta de 3 letras recomendada. Se usará para generar códigos de grupo.</p>
                                {errors.code && <span className="text-red-500 text-[10px] mt-1 block">{errors.code}</span>}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-white border border-slate-350 hover:bg-slate-55 text-slate-700 rounded-lg text-xs font-semibold transition-all focus:outline-none"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={processing || !isFormValid}
                                className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all focus:outline-none active:scale-[0.98]"
                            >
                                {processing ? 'Guardando...' : mode === 'create' ? 'Crear Especialidad' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </BaseModal>
    );
}
