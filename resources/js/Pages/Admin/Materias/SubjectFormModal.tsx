import { useEffect, useState } from 'react';
import { MockSubject } from './SubjectTable';
import BaseModal from '@/Components/BaseModal';
import { FormLabel, FormInput, FormSelect, FormTextarea } from '@/Components/FormFields';

interface SubjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    subject: MockSubject | null;
    teachersList: string[];
    groupsList: string[];
    onSubmit: (data: {
        code: string;
        name: string;
        teacherName: string;
        linkedGroups: string[];
        description: string;
    }) => void;
}

export default function SubjectFormModal({
    isOpen,
    onClose,
    mode,
    subject,
    teachersList,
    groupsList,
    onSubmit,
}: SubjectFormModalProps) {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        teacherName: '',
        linkedGroups: [] as string[],
        description: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && subject) {
                setFormData({
                    code: subject.code,
                    name: subject.name,
                    teacherName: subject.teacherName,
                    linkedGroups: [...subject.linkedGroups],
                    description: subject.description,
                });
            } else {
                setFormData({
                    code: '',
                    name: '',
                    teacherName: teachersList[0] || 'Francisco Javier Martínez',
                    linkedGroups: [],
                    description: '',
                });
            }
        }
    }, [isOpen, mode, subject, teachersList]);

    const toggleGroupSelection = (group: string) => {
        if (formData.linkedGroups.includes(group)) {
            setFormData({
                ...formData,
                linkedGroups: formData.linkedGroups.filter(g => g !== group)
            });
        } else {
            setFormData({
                ...formData,
                linkedGroups: [...formData.linkedGroups, group]
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Registrar Nueva Materia' : 'Editar Materia'}
            subtitle="Configura el temario, el docente a cargo y los grupos vinculados"
            maxWidthClass="max-w-md"
            onSubmit={handleSubmit}
            confirmLabel={mode === 'create' ? 'Registrar' : 'Guardar'}
        >
            <div className="space-y-1.5 text-left">
                <FormLabel required>Código de la Materia</FormLabel>
                <FormInput
                    required
                    placeholder="Ej: MAT-101"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                />
            </div>
            <div className="space-y-1.5 text-left">
                <FormLabel required>Nombre de la Asignatura</FormLabel>
                <FormInput
                    required
                    placeholder="Ej: Matemáticas I"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div className="space-y-1.5 text-left">
                <FormLabel required>Profesor Asignado</FormLabel>
                <FormSelect
                    value={formData.teacherName}
                    onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                >
                    {teachersList.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                    ))}
                </FormSelect>
            </div>
            <div className="space-y-1.5 text-left">
                <FormLabel required>Vincular Grupos</FormLabel>
                <div className="flex flex-wrap gap-2 pt-1">
                    {groupsList.map((group, idx) => {
                        const isSelected = formData.linkedGroups.includes(group);
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
            </div>
            <div className="space-y-1.5 text-left">
                <FormLabel required>Descripción / Temario resumido</FormLabel>
                <FormTextarea
                    placeholder="Escribe el alcance o temas clave..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                />
            </div>
        </BaseModal>
    );
}
