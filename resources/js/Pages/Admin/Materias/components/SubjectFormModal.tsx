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
        semestre: number;
        description: string;
        tipo: 'General' | 'Especialidad';
        linked_groups: string[];
        specialty_ids: number[];
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
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

        // Generar sufijo aleatorio de 4 caracteres (letras y números)
        const generateRandomSuffix = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 4; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        let candidate = `${prefix}-${generateRandomSuffix()}`;

        // Asegurar que sea único (aunque con 4 chars aleatorios es casi seguro)
        let attempts = 0;
        while (existingCodes.includes(candidate) && attempts < 10) {
            candidate = `${prefix}-${generateRandomSuffix()}`;
            attempts++;
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
                <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[280px] relative">
                    <div className="space-y-4 flex-1 pr-2">
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Código / Clave</FormLabel>
                                <FormInput
                                    readOnly
                                    placeholder="AUTOGENERADO"
                                    value={data.code || 'PROCESANDO...'}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 font-mono focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs"
                                />
                                {errors.code && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.code}</span>}
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel required>Semestre</FormLabel>
                                <FormSelect
                                    value={data.semestre}
                                    onChange={e => setData('semestre', Number(e.target.value))}
                                    className="h-9 text-xs"
                                >
                                    <option value="1">1° Semestre</option>
                                    <option value="2">2° Semestre</option>
                                    <option value="3">3° Semestre</option>
                                    <option value="4">4° Semestre</option>
                                    <option value="5">5° Semestre</option>
                                    <option value="6">6° Semestre</option>
                                </FormSelect>
                                {errors.semestre && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.semestre}</span>}
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Nombre de la Asignatura</FormLabel>
                            <FormInput
                                required
                                placeholder="Ej: Matemáticas I"
                                value={data.name}
                                onChange={handleNameChange}
                                className="h-9 text-xs"
                            />
                            {errors.name && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.name}</span>}
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel>Descripción / Temario resumido</FormLabel>
                            <FormTextarea
                                placeholder="Escribe el alcance o temas clave..."
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={2}
                                className="text-xs"
                            />
                            {errors.description && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.description}</span>}
                        </div>

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
                                className="h-9 text-xs"
                            >
                                <option value="General">General</option>
                                <option value="Especialidad">Especialidad</option>
                            </FormSelect>
                            {errors.tipo && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.tipo}</span>}
                        </div>

                        {/* Selector de Especialidades/Carreras */}
                        {data.tipo === 'Especialidad' && (
                            <div className="space-y-1.5 text-left pt-1 animate-in slide-in-from-top-1 duration-200">
                                <FormLabel required>Carreras / Especialidades asociadas</FormLabel>
                                <div className="grid grid-cols-2 gap-3 max-h-[100px] overflow-y-auto border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                                    {specialties.length === 0 ? (
                                        <p className="col-span-2 text-[10px] text-slate-400 italic">No hay especialidades registradas.</p>
                                    ) : (
                                        specialties.map(spec => {
                                            const isChecked = data.specialty_ids.includes(spec.id);
                                            return (
                                                <label key={spec.id} className="flex items-center gap-2 cursor-pointer group">
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
                                                        className="rounded-md border-slate-300 text-[#1e88e5] focus:ring-[#1e88e5] h-4 w-4 transition-all"
                                                    />
                                                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 truncate">
                                                        {spec.name}
                                                    </span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                                {errors.specialty_ids && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.specialty_ids}</span>}
                            </div>
                        )}
                    </div>

                    {/* Footer de Navegación Aligned Right */}
                    <div className="mt-6 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 h-9 bg-white border border-slate-350 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all focus:outline-none flex items-center justify-center"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 h-9 bg-[#1e88e5] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all focus:outline-none active:scale-[0.98] flex items-center justify-center"
                        >
                            {processing ? 'Guardando...' : mode === 'create' ? 'Registrar' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
