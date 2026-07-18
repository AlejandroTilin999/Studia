import React from 'react';
import { X } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormTextarea } from '@/Components/forms/FormTextarea';
import { FormSelect } from '@/Components/forms/FormSelect';

import { AcademicGroupProp } from '../../Alumnos/types';
import { GENERAL_AREAS } from '../../Alumnos/constants';

interface SubjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    subject: any;
    data: {
        codigo: string;
        nombre: string;
        semestre: number;
        descripcion: string;
        tipo: 'General' | 'Especialidad';
        area: string;
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
    data,
    setData,
    errors,
    processing,
    onSubmit,
    specialties = [],
    existingCodes = [],
}: SubjectFormModalProps) {

    const generateSubjectCode = (name: string) => {
        if (!name) return '';
        const words = name.trim().split(/\s+/);
        const stopWords = ['y', 'e', 'o', 'u', 'de', 'la', 'el', 'los', 'las', 'en', 'para', 'con', 'por', 'a', 'del', 'i', 'ii', 'iii', 'iv', 'v'];
        const cleanWords = words
            .map(word => word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "").toUpperCase())
            .filter(word => word.length > 0);

        let mainWords = cleanWords.filter(w => !stopWords.includes(w.toLowerCase()));
        if (mainWords.length === 0) mainWords = cleanWords;

        let prefix = '';
        if (mainWords.length === 1) {
            prefix = mainWords[0].slice(0, 3).padEnd(3, 'X');
        } else if (mainWords.length === 2) {
            prefix = mainWords[0].slice(0, 2) + mainWords[1].slice(0, 1);
        } else {
            prefix = mainWords[0].slice(0, 1) + mainWords[1].slice(0, 1) + mainWords[2].slice(0, 1);
        }

        const generateRandomSuffix = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
            return result;
        };

        let candidate = `${prefix}-${generateRandomSuffix()}`;
        let attempts = 0;
        while (existingCodes.includes(candidate) && attempts < 10) {
            candidate = `${prefix}-${generateRandomSuffix()}`;
            attempts++;
        }
        return candidate;
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setData('nombre', newName);
        if (mode === 'create') {
            const autoCode = generateSubjectCode(newName);
            setData('codigo', autoCode);
        }
    };

    const isFormValid = data.codigo.trim() !== '' && data.nombre.trim() !== '';

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
                                {mode === 'create' ? 'Registrar Nueva Materia' : 'Modificar Información de la Materia'}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Crea una nueva materia escolar. Configura el temario y vincúlala con los grupos correspondientes.'
                                    : 'Actualiza la clave, el temario o la vinculación con la especialidad.'}
                            </p>
                        </div>
                    </div>
                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block">
                        Prepahid Campus Escolar
                    </div>
                </div>

                <div className="col-span-1 md:col-span-3 p-6 flex flex-col justify-between min-h-0 md:min-h-[280px] relative">
                    <div className="space-y-4 flex-1 pr-2">
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Código / Clave</FormLabel>
                                <FormInput
                                    readOnly
                                    placeholder="AUTOGENERADO"
                                    value={data.codigo || 'PROCESANDO...'}
                                    className="bg-slate-50 border border-slate-200 hover:border-slate-200 text-slate-500 font-mono focus:border-slate-200 focus:ring-0 cursor-not-allowed select-none h-9 text-xs"
                                />
                                {errors.codigo && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.codigo}</span>}
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel required>Semestre</FormLabel>
                                <FormSelect
                                    value={data.semestre}
                                    onChange={e => setData('semestre', Number(e.target.value))}
                                    className="h-9 text-xs"
                                >
                                    {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
                                </FormSelect>
                                {errors.semestre && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.semestre}</span>}
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Nombre de la Asignatura</FormLabel>
                            <FormInput
                                required
                                placeholder="Ej: Matemáticas I"
                                value={data.nombre}
                                onChange={handleNameChange}
                                className="h-9 text-xs"
                            />
                            {errors.nombre && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.nombre}</span>}
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel>Descripción / Temario resumido</FormLabel>
                            <FormTextarea
                                placeholder="Escribe el alcance o temas clave..."
                                value={data.descripcion}
                                onChange={e => setData('descripcion', e.target.value)}
                                rows={2}
                                className="text-xs"
                            />
                            {errors.descripcion && <span className="text-red-500 text-[10px] mt-1 block font-bold leading-tight">{errors.descripcion}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                                <FormLabel required>Tipo de Materia</FormLabel>
                                <FormSelect
                                    value={data.tipo}
                                    onChange={e => {
                                        const val = e.target.value as 'General' | 'Especialidad';
                                        setData('tipo', val);
                                        if (val === 'General') setData('specialty_ids', []);
                                        else setData('area', '');
                                    }}
                                    className="h-9 text-xs"
                                >
                                    <option value="General">General</option>
                                    <option value="Especialidad">Especialidad</option>
                                </FormSelect>
                            </div>

                            {data.tipo === 'General' && (
                                <div className="space-y-1.5 text-left animate-in slide-in-from-top-1 duration-200">
                                    <FormLabel required>Área de Conocimiento</FormLabel>
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

                        {data.tipo === 'Especialidad' && (
                            <div className="space-y-1.5 text-left pt-1 animate-in slide-in-from-top-1 duration-200">
                                <FormLabel required>Carreras / Especialidades asociadas</FormLabel>
                                <div className="grid grid-cols-2 gap-3 max-h-[100px] overflow-y-auto border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                                    {specialties.map(spec => {
                                        const isChecked = data.specialty_ids.includes(spec.id);
                                        return (
                                            <label key={spec.id} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) setData('specialty_ids', data.specialty_ids.filter(id => id !== spec.id));
                                                        else setData('specialty_ids', [...data.specialty_ids, spec.id]);
                                                    }}
                                                    className="rounded-md border-slate-300 text-[#1e88e5] focus:ring-[#1e88e5] h-4 w-4 transition-all"
                                                />
                                                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 truncate">{spec.nombre}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end items-center gap-2 border-t border-slate-100 pt-4 select-none">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 h-9 bg-white border border-slate-350 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all focus:outline-none"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !isFormValid}
                            className="px-5 h-9 bg-[#1e88e5] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all focus:outline-none active:scale-[0.98]"
                        >
                            {processing ? 'Guardando...' : mode === 'create' ? 'Registrar' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
