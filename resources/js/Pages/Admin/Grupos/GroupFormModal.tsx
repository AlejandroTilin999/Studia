import { useEffect, useState } from 'react';
import { GroupRecord } from './GroupTable';
import BaseModal from '@/Components/BaseModal';
import { FormLabel, FormInput, FormSelect } from '@/Components/FormFields';

interface GroupFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    group: GroupRecord | null;
    teachersList: string[];
    onSubmit: (data: {
        code: string;
        name: string;
        shift: string;
        specialty: 'TI' | 'Gastronomía' | 'Biotecnología';
        teacherName: string;
    }) => void;
}

export default function GroupFormModal({
    isOpen,
    onClose,
    mode,
    group,
    teachersList,
    onSubmit,
}: GroupFormModalProps) {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        shift: 'Horario único',
        specialty: 'TI' as 'TI' | 'Gastronomía' | 'Biotecnología',
        teacherName: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && group) {
                setFormData({
                    code: group.code,
                    name: group.name,
                    shift: group.shift,
                    specialty: group.specialty,
                    teacherName: group.teacherName,
                });
            } else {
                setFormData({
                    code: '',
                    name: '',
                    shift: 'Horario único',
                    specialty: 'TI',
                    teacherName: teachersList[0] || 'Ing. Uriel Cambron',
                });
            }
        }
    }, [isOpen, mode, group, teachersList]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Crear Nuevo Grupo' : 'Editar Grupo'}
            subtitle="Configura la información básica y el tutor asignado del grupo"
            maxWidthClass="max-w-md"
            onSubmit={handleSubmit}
            confirmLabel={mode === 'create' ? 'Crear Grupo' : 'Guardar'}
        >
            <div className="space-y-1.5 text-left">
                <FormLabel required>Código del Grupo</FormLabel>
                <FormInput
                    required
                    placeholder="Ej: MAT1, TI001"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                />
            </div>
            <div className="space-y-1.5 text-left">
                <FormLabel required>Nombre del Grupo</FormLabel>
                <FormInput
                    required
                    placeholder="Ej: 1er Año TI"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5">
                    <FormLabel required>Turno</FormLabel>
                    <FormSelect
                        value={formData.shift}
                        onChange={e => setFormData({ ...formData, shift: e.target.value })}
                    >
                        <option value="Horario único">Horario único</option>
                        <option value="Matutino">Matutino</option>
                        <option value="Vespertino">Vespertino</option>
                    </FormSelect>
                </div>
                <div className="space-y-1.5">
                    <FormLabel required>Especialidad</FormLabel>
                    <FormSelect
                        value={formData.specialty}
                        onChange={e => setFormData({ ...formData, specialty: e.target.value as any })}
                    >
                        <option value="TI">TI</option>
                        <option value="Gastronomía">Gastronomía</option>
                        <option value="Biotecnología">Biotecnología</option>
                    </FormSelect>
                </div>
            </div>
            <div className="space-y-1.5 text-left">
                <FormLabel required>Profesor Titular</FormLabel>
                <FormSelect
                    value={formData.teacherName}
                    onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                >
                    {teachersList.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                    ))}
                </FormSelect>
            </div>
        </BaseModal>
    );
}
