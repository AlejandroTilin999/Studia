import React from 'react';
import BaseModal from '@/Components/BaseModal';
import { FormLabel, FormInput, FormSelect, FormTextarea } from '@/Components/FormFields';

interface SubjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    subject: any;
    teachersList: { id: string; name: string }[];
    groupsList: string[];
    data: {
        code: string;
        name: string;
        description: string;
        teacher_id: string | number;
        linked_groups: string[];
    };
    setData: (key: any, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function SubjectFormModal({
    isOpen,
    onClose,
    mode,
    subject,
    teachersList,
    groupsList,
    data,
    setData,
    errors,
    processing,
    onSubmit,
}: SubjectFormModalProps) {
    const toggleGroupSelection = (group: string) => {
        if (data.linked_groups.includes(group)) {
            setData('linked_groups', data.linked_groups.filter(g => g !== group));
        } else {
            setData('linked_groups', [...data.linked_groups, group]);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Registrar Nueva Materia' : 'Editar Materia'}
            subtitle="Configura el temario, el docente a cargo y los grupos vinculados"
            maxWidthClass="max-w-md"
            onSubmit={onSubmit}
            confirmLabel={processing ? 'Guardando...' : mode === 'create' ? 'Registrar' : 'Guardar'}
            isConfirmDisabled={processing}
        >
            <div className="grid grid-cols-3 gap-4 text-left">
                <div className="space-y-1.5 col-span-1">
                    <FormLabel required>Código</FormLabel>
                    <FormInput
                        required
                        placeholder="Ej: MAT-101"
                        value={data.code}
                        onChange={e => setData('code', e.target.value)}
                    />
                    {errors.code && <span className="text-red-500 text-[10px] mt-1 block">{errors.code}</span>}
                </div>
                <div className="space-y-1.5 col-span-2">
                    <FormLabel required>Nombre de la Asignatura</FormLabel>
                    <FormInput
                        required
                        placeholder="Ej: Matemáticas I"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                    />
                    {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
                </div>
            </div>

            <div className="space-y-1.5 text-left">
                <FormLabel required>Profesor Asignado</FormLabel>
                <FormSelect
                    value={data.teacher_id}
                    onChange={e => setData('teacher_id', e.target.value)}
                >
                    <option value="">Seleccionar un docente...</option>
                    {teachersList.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </FormSelect>
                {errors.teacher_id && <span className="text-red-500 text-[10px] mt-1 block">{errors.teacher_id}</span>}
            </div>

            <div className="space-y-1.5 text-left">
                <FormLabel required>Vincular Grupos</FormLabel>
                <div className="flex flex-wrap gap-2 pt-1">
                    {groupsList.map((group, idx) => {
                        const isSelected = data.linked_groups.includes(group);
                        return (
                            <button
                                type="button"
                                key={idx}
                                onClick={() => toggleGroupSelection(group)}
                                className={`px-3 py-1.5 rounded-xl text-[10.5px] font-extrabold transition-all border ${
                                    isSelected 
                                        ? 'bg-blue-50 border-blue-200 text-[#1e88e5]' 
                                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                Grupo {group}
                            </button>
                        );
                    })}
                </div>
                {errors.linked_groups && <span className="text-red-500 text-[10px] mt-1 block">{errors.linked_groups}</span>}
            </div>

            <div className="space-y-1.5 text-left">
                <FormLabel>Descripción / Temario resumido</FormLabel>
                <FormTextarea
                    placeholder="Escribe el alcance o temas clave..."
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    rows={3}
                />
                {errors.description && <span className="text-red-500 text-[10px] mt-1 block">{errors.description}</span>}
            </div>
        </BaseModal>
    );
}
