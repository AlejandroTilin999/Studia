import { useState } from 'react';
import { GroupRecord } from './GroupTable';
import BaseModal from '@/Components/BaseModal';
import { FormLabel, FormSelect } from '@/Components/FormFields';

interface AssignTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: GroupRecord[];
    teachersList: string[];
    onSubmit: (data: { groupCode: string; teacherName: string }) => void;
}

export default function AssignTeacherModal({
    isOpen,
    onClose,
    groups,
    teachersList,
    onSubmit,
}: AssignTeacherModalProps) {
    const [formData, setFormData] = useState({
        groupCode: groups[0]?.code || 'MAT1',
        teacherName: teachersList[0] || 'Ing. Uriel Cambron',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Asignar Profesor Titular"
            subtitle="Asigna un tutor responsable para coordinar un grupo de alumnos"
            maxWidthClass="max-w-md"
            onSubmit={handleSubmit}
            confirmLabel="Asignar Profesor"
        >
            <div className="space-y-1.5 text-left">
                <FormLabel required>Seleccionar Grupo</FormLabel>
                <FormSelect
                    value={formData.groupCode}
                    onChange={e => setFormData({ ...formData, groupCode: e.target.value })}
                >
                    {groups.map((g, idx) => (
                        <option key={idx} value={g.code}>{g.name} ({g.code})</option>
                    ))}
                </FormSelect>
            </div>
            <div className="space-y-1.5 text-left">
                <FormLabel required>Seleccionar Profesor</FormLabel>
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
