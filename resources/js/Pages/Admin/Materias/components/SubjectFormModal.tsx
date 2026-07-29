import React from 'react';
import { X, BookOpen, Hash, Layers } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel } from '@/Components/forms/FormLabel';
import { FormInput } from '@/Components/forms/FormInput';
import { FormTextarea } from '@/Components/forms/FormTextarea';
import { FormSelect } from '@/Components/forms/FormSelect';
import { GENERAL_AREAS } from '../../Alumnos/constants';

interface SubjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    data: {
        codigo: string;
        nombre: string;
        semestre: number | string;
        descripcion: string;
        tipo: 'General' | 'Especialidad';
        area: string;
        specialty_ids: number[];
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    specialties: any[];
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

        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${suffix}`;
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setData('nombre', newName);
        // [SINCRONIZACIÓN v3.18] Actualizar código automáticamente al cambiar nombre
        const autoCode = generateSubjectCode(newName);
        setData('codigo', autoCode);
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
                            <img src="/assets/logo-ph-blanco.png" alt="Prepa Hidalgo" className="h-8 md:h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight flex items-center gap-2">
                                <BookOpen size={20} />
                                {mode === 'create' ? 'Nueva Materia' : 'Editar Materia'}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] md:text-xs text-blue-100 leading-relaxed font-normal">
                                {mode === 'create'
                                    ? 'Registra una asignatura oficial en el catálogo. Define su tipo, área y los bachilleratos donde se imparte.'
                                    : 'Modifica la estructura curricular o el temario de la asignatura.'}
                            </p>
                        </div>
                    </div>
                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block mt-6 uppercase tracking-widest">
                        Catálogo Curricular PH
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-1 md:col-span-3 p-5 md:p-6 flex flex-col justify-between min-h-0 md:min-h-[440px] relative bg-white rounded-b-[10px] md:rounded-r-[10px] md:rounded-bl-none">
                    <div className="space-y-5 flex-1 flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <FormLabel required>Código / Clave</FormLabel>
                                <FormInput
                                    readOnly
                                    value={data.codigo || 'PROCESANDO...'}
                                    className="bg-slate-50 border border-slate-200 text-slate-500 font-normal focus:ring-0 cursor-not-allowed h-9 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FormLabel required>Grado / Semestre</FormLabel>
                                <FormSelect
                                    value={data.semestre}
                                    onChange={e => setData('semestre', e.target.value)}
                                    className="h-9 text-xs font-normal"
                                >
                                    <option value="">Selecciona...</option>
                                    {[1, 2, 3, 4, 5, 6].map(s => (
                                        <option key={s} value={s}>{s}° Semestre</option>
                                    ))}
                                </FormSelect>
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel required>Nombre de la Asignatura</FormLabel>
                            <FormInput
                                placeholder="Ej: Álgebra Superior"
                                value={data.nombre}
                                onChange={handleNameChange}
                                className="h-9 text-xs font-normal"
                            />
                            {errors.nombre && <span className="text-red-500 text-[10px] mt-1 block">{errors.nombre}</span>}
                        </div>

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
                                <option value="General">General (Tronco Común)</option>
                                <option value="Especialidad">De Especialidad</option>
                            </FormSelect>
                        </div>

                        {data.tipo === 'Especialidad' && (
                            <div className="space-y-1.5 text-left pt-1 animate-in slide-in-from-top-1 duration-200">
                                <FormLabel required>Bachilleratos Asociados</FormLabel>
                                <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto border border-slate-100 p-3 rounded-xl bg-slate-50/50">
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
                                                    className="rounded border-slate-300 text-[#0266E0] focus:ring-[#0266E0] h-3.5 w-3.5 transition-all"
                                                />
                                                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-800 truncate">{spec.nombre}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5 text-left">
                            {data.tipo === 'General' ? (
                                <div className="animate-in slide-in-from-top-1 duration-200">
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
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-top-1 duration-200">
                                    <FormLabel required>Rama / Área Técnica</FormLabel>
                                    <FormSelect
                                        value={data.area}
                                        onChange={e => setData('area', e.target.value)}
                                        className="h-9 text-xs"
                                        disabled={data.specialty_ids.length === 0}
                                    >
                                        <option value="">{data.specialty_ids.length === 0 ? 'Elige bachillerato primero...' : 'Seleccionar área técnica...'}</option>
                                        {Array.from(new Set(
                                            specialties
                                                .filter(s => data.specialty_ids.includes(s.id))
                                                .flatMap(s => s.sub_areas || [])
                                        )).map((area: string) => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </FormSelect>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5 text-left">
                            <FormLabel>Descripción / Objetivo</FormLabel>
                            <FormTextarea
                                placeholder="Alcance de la materia..."
                                value={data.descripcion}
                                onChange={e => setData('descripcion', e.target.value)}
                                rows={2}
                                className="text-xs"
                            />
                        </div>
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
                            disabled={processing || !isFormValid}
                            className="px-5 py-2 bg-[#0266E0] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all focus:outline-none flex items-center gap-2"
                        >
                            {processing ? 'Guardando...' : (mode === 'create' ? 'Crear Materia' : 'Guardar')}
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
