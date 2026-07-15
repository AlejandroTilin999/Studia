import React from 'react';
import { X } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormTextarea } from '@/Components/forms/FormTextarea';
import { FormSelect } from '@/Components/forms/FormSelect';

interface SubjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    subject: any;
    data: {
        code: string;
        name: string;
        description: string;
        tipo: 'General' | 'Especialidad';
        teacher_id: string | number;
        linked_groups: string[];
        specialty_ids: number[];
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
    profesores: any[];
    grupos: any[];
    specialties: any[];
    existingCodes?: string[];
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
    profesores = [],
    grupos = [],
    specialties = [],
    existingCodes = [],
}: SubjectFormModalProps) {
    console.log("SubjectFormModal - Specialties:", specialties);

    const generateSubjectCode = (name: string) => {
        if (!name) return '';
        
        // Split by whitespace
        const words = name.trim().split(/\s+/);
        
        // Spanish stop words to ignore
        const stopWords = ['y', 'e', 'o', 'u', 'de', 'la', 'el', 'los', 'las', 'en', 'para', 'con', 'por', 'a', 'del', 'i', 'ii', 'iii', 'iv', 'v'];
        
        // Clean each word by removing accents and non-letters
        const cleanWords = words
            .map(word => {
                return word
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-zA-Z]/g, "")
                    .toUpperCase();
            })
            .filter(word => word.length > 0);

        // Filter out stop words (but keep them if filtering results in empty array)
        let mainWords = cleanWords.filter(w => !stopWords.includes(w.toLowerCase()));
        if (mainWords.length === 0) {
            mainWords = cleanWords;
        }

        let prefix = '';
        if (mainWords.length === 1) {
            // Only 1 word: take first 3 letters
            prefix = mainWords[0].slice(0, 3);
            while (prefix.length < 3) {
                prefix += 'X';
            }
        } else if (mainWords.length === 2) {
            // 2 words: first 2 letters of first word, first letter of second word (e.g. "Cálculo Diferencial" -> CAD)
            const w1 = mainWords[0];
            const w2 = mainWords[1];
            prefix = w1.slice(0, 2) + w2.slice(0, 1);
        } else {
            // 3 or more words: first letter of each of the first 3 words (e.g. "Temas Selectos de Física" -> TSF)
            prefix = mainWords[0].slice(0, 1) + mainWords[1].slice(0, 1) + mainWords[2].slice(0, 1);
        }

        // Pad if somehow less than 3 chars
        while (prefix.length < 3) {
            prefix += 'X';
        }
        
        let suffix = 1;
        let candidate = `${prefix}-${suffix.toString().padStart(3, '0')}`;
        while (existingCodes.includes(candidate)) {
            suffix++;
            candidate = `${prefix}-${suffix.toString().padStart(3, '0')}`;
        }
        
        return candidate;
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setData('name', newName);
        
        if (mode === 'create') {
            const autoCode = generateSubjectCode(newName);
            setData('code', autoCode);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidthClass="max-w-3xl"
            onSubmit={onSubmit}
            isConfirmDisabled={processing}
            showFooter={false}
            fullBleed={true}
        >
            {saveStatus === 'saving' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#1e88e5]/20 border-t-[#1e88e5] animate-spin"></div>
                    <p className="font-extrabold text-slate-800 text-sm">
                        {mode === 'create' ? 'Registrando asignatura...' : 'Guardando cambios...'}
                    </p>
                    <p className="text-xs text-slate-455 font-bold">Por favor, espera un momento.</p>
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
                    <p className="text-xs text-slate-550 font-medium text-center">
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
                <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 md:min-h-[280px] h-full text-left relative">
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
                                    {mode === 'create' ? 'Registrar Nueva Materia' : 'Modificar Información de la Materia'}
                                </h3>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                    {mode === 'create' 
                                        ? 'Crea una nueva materia. Configura el temario, asígnale un profesor y vincúlala con los grupos escolares correspondientes.'
                                        : 'Actualiza la clave, el temario o la vinculación con grupos y profesores.'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 shrink-0 hidden md:block">
                            Prepahid Campus Escolar
                        </div>
                    </div>

                    {/* Right Form Panel (col-span-3) */}
                    <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[260px] relative">
                        <div className="space-y-4 flex-1 pr-2">
                            <div className="grid grid-cols-3 gap-4 text-left">
                                <div className="space-y-1.5 col-span-1">
                                    <FormLabel required>Código</FormLabel>
                                    <FormInput
                                        readOnly
                                        placeholder="AUTOGENERADO"
                                        value={data.code || 'PROCESANDO...'}
                                        className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 font-mono focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none"
                                    />
                                    {errors.code && <span className="text-red-500 text-[10px] mt-1 block">{errors.code}</span>}
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <FormLabel required>Nombre de la Asignatura</FormLabel>
                                    <FormInput
                                        required
                                        placeholder="Ej: Matemáticas I"
                                        value={data.name}
                                        onChange={handleNameChange}
                                    />
                                    {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <FormLabel>Descripción / Temario resumido</FormLabel>
                                <FormTextarea
                                    placeholder="Escribe el alcance o temas clave..."
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={2}
                                />
                                {errors.description && <span className="text-red-500 text-[10px] mt-1 block">{errors.description}</span>}
                            </div>

                            {/* Tipo de Materia Selector */}
                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Tipo de Materia</FormLabel>
                                <FormSelect
                                    value={data.tipo}
                                    onChange={e => {
                                        const val = e.target.value as 'General' | 'Especialidad';
                                        setData('tipo', val);
                                        if (val === 'General') {
                                            setData('specialty_ids', []);
                                        }
                                    }}
                                >
                                    <option value="General">General</option>
                                    <option value="Especialidad">Especialidad</option>
                                </FormSelect>
                                {errors.tipo && <span className="text-red-500 text-[10px] mt-1 block">{errors.tipo}</span>}
                            </div>

                            {/* Selector de Especialidades/Carreras */}
                            {data.tipo === 'Especialidad' && (
                                <div className="space-y-1.5 text-left pt-1">
                                    <FormLabel required>Carreras / Especialidades asociadas</FormLabel>
                                    {specialties.length === 0 ? (
                                        <p className="text-[11px] text-slate-450 italic">Crea especialidades en el panel de control para vincularlas.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[90px] overflow-y-auto border border-slate-100 p-2.5 rounded-lg bg-slate-50/50">
                                            {specialties.map(spec => {
                                                const isChecked = data.specialty_ids.includes(spec.id);
                                                return (
                                                    <label key={spec.id} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {
                                                                if (isChecked) {
                                                                    setData('specialty_ids', data.specialty_ids.filter(id => id !== spec.id));
                                                                } else {
                                                                    setData('specialty_ids', [...data.specialty_ids, spec.id]);
                                                                }
                                                            }}
                                                            className="rounded border-slate-200 text-[#1e88e5] focus:ring-[#1e88e5] h-3.5 w-3.5"
                                                        />
                                                        <span className="truncate">{spec.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {errors.specialty_ids && <span className="text-red-500 text-[10px] mt-1 block">{errors.specialty_ids}</span>}
                                </div>
                            )}
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
            )}
        </BaseModal>
    );
}
