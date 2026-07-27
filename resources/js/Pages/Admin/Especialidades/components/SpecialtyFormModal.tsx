import React, { useEffect } from 'react';
import { X, Layers, Hash } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';

interface SpecialtyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    data: {
        nombre: string;
        codigo: string;
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
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
}: SpecialtyFormModalProps) {

    useEffect(() => {
        if (isOpen && mode === 'create') {
            setData('nombre', '');
            setData('codigo', '');
        }
    }, [isOpen, mode]);

    const isFormValid = data.nombre.trim() !== '' && data.codigo.trim() !== '';

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
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[300px] h-full text-left relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Left Panel */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-xl font-bold text-white leading-tight flex items-center gap-2">
                                <Layers size={22} />
                                {mode === 'create' ? 'Nueva Carrera' : 'Editar Especialidad'}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] md:text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Define un nuevo bachillerato técnico o especialidad académica para la oferta educativa.'
                                    : 'Actualiza el nombre oficial o la clave de identificación del bachillerato.'}
                            </p>
                        </div>
                    </div>
                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block mt-6">
                        Oferta Educativa Prepahid
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[280px] relative bg-white">
                    <div className="space-y-5 flex-1 flex flex-col justify-center">
                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Nombre del Bachillerato</FormLabel>
                            <FormInput
                                placeholder="Ej: Gastronomía"
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                className="h-10 text-sm font-normal"
                            />
                            {errors.nombre && <span className="text-red-500 text-[10px] mt-1 block">{errors.nombre}</span>}
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Clave / Abreviación (3-4 letras)</FormLabel>
                            <FormInput
                                placeholder="Ej: GAS"
                                value={data.codigo}
                                onChange={e => setData('codigo', e.target.value.toUpperCase())}
                                className="h-10 text-sm font-black font-mono tracking-widest"
                                icon={<Hash size={14} />}
                            />
                            {errors.codigo && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.codigo}</span>}
                        </div>
                    </div>

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
                            disabled={processing || !isFormValid}
                            className="px-6 py-2 bg-[#0266E0] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all focus:outline-none flex items-center gap-2"
                        >
                            {processing ? 'Guardando...' : (mode === 'create' ? 'Registrar Carrera' : 'Guardar')}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
