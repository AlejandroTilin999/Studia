import React, { useEffect, useState } from 'react';
import { X, Layers, Hash, Plus, Trash2 } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { cn } from '@/lib/utils';

interface SpecialtyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    data: {
        nombre: string;
        codigo: string;
        sub_areas: string[];
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
    const [newArea, setNewArea] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (mode === 'create') {
                setData('nombre', '');
                setData('codigo', '');
                setData('sub_areas', []);
            }
        }
    }, [isOpen, mode]);

    const addArea = () => {
        if (newArea.trim() && !data.sub_areas.includes(newArea.trim())) {
            setData('sub_areas', [...data.sub_areas, newArea.trim()]);
            setNewArea('');
        }
    };

    const removeArea = (index: number) => {
        setData('sub_areas', data.sub_areas.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addArea();
        }
    };

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
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[400px] h-full text-left relative">
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
                            <img src="/assets/logo-ph-blanco.webp" alt="Prepa Hidalgo" className="h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-xl font-bold text-white leading-tight flex items-center gap-2">
                                <Layers size={22} />
                                {mode === 'create' ? 'Nueva Carrera' : 'Editar Especialidad'}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] md:text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Define un nuevo bachillerato técnico y agrega sus áreas o ramas de especialidad.'
                                    : 'Actualiza la información de la especialidad y gestiona sus áreas técnicas.'}
                            </p>
                        </div>
                    </div>
                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block mt-6 uppercase tracking-widest">
                        Prepahid · Campus Digital
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[380px] relative bg-white overflow-y-auto">
                    <div className="space-y-6 flex-1 flex flex-col">
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
                                className="h-10 text-sm font-normal"
                            />
                            {errors.codigo && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.codigo}</span>}
                        </div>

                        {/* [REDiseño v3.16] Gestión de Sub-áreas */}
                        <div className="space-y-3 pt-2">
                            <FormLabel className="text-slate-400 font-normal">Áreas Técnicas / Ramas de Especialidad</FormLabel>

                            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-4">
                                <div className="flex gap-2">
                                    <FormInput
                                        placeholder="Nueva área (ej: Programación)"
                                        value={newArea}
                                        onChange={e => setNewArea(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="h-10 text-xs bg-white border-slate-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={addArea}
                                        className="px-4 bg-[#0266E0] text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center shadow-sm active:scale-95"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {data.sub_areas && data.sub_areas.length > 0 ? (
                                        data.sub_areas.map((area, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 pl-3 pr-1 py-1.5 bg-white border border-slate-100 text-slate-600 rounded-xl text-[11px] font-normal transition-all hover:border-blue-200 hover:shadow-sm animate-in zoom-in duration-300 group"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#0266E0]/40 group-hover:bg-[#0266E0] transition-colors" />
                                                <span className="uppercase tracking-normal">{area}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeArea(idx)}
                                                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-1"
                                                >
                                                    <X size={13} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-full py-4 text-center">
                                            <p className="text-[11px] text-slate-400 font-normal">
                                                No has definido ramas técnicas todavía.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
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
