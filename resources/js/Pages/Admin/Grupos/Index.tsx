import { useState } from 'react';
import GroupTable, { GroupRecord } from './GroupTable';
import GroupTableControls from './GroupTableControls';
import GroupFormModal from './GroupFormModal';
import AssignTeacherModal from './AssignTeacherModal';
import AdminPageLayout from '@/Components/AdminPageLayout';

export default function GruposIndex() {
    // 1. Datos iniciales simulados que coinciden exactamente con la maqueta
    const [groups, setGroups] = useState<GroupRecord[]>([
        { id: 1, code: 'MAT1', name: '1er Año TI', shift: 'Horario único', teacherName: 'Ing. Uriel Cambron', specialty: 'TI' },
        { id: 2, code: 'TI001', name: '1er Año gastronomía', shift: 'Horario único', teacherName: 'DP. Ana Karen', specialty: 'Gastronomía' },
        { id: 3, code: 'GAS01', name: '2do año TI', shift: 'Horario único', teacherName: 'Chef Ana', specialty: 'TI' },
        { id: 4, code: 'TI001', name: '2do Año gastronomía', shift: 'Horario único', teacherName: 'Ing. Uriel Cambron', specialty: 'Gastronomía' },
        { id: 5, code: 'TI001', name: '1er Año TI', shift: 'Horario único', teacherName: 'DP. Ana Karen', specialty: 'TI' },
        { id: 6, code: 'MAT1', name: '1er Año gastronomía', shift: 'Horario único', teacherName: 'Chef Ana', specialty: 'Gastronomía' },
        { id: 7, code: 'TI001', name: '1er Año gastronomía', shift: 'Horario único', teacherName: 'Chef Ana', specialty: 'Gastronomía' },
        { id: 8, code: 'GAS01', name: '2do año TI', shift: 'Horario único', teacherName: 'Chef Ana', specialty: 'TI' },
        { id: 9, code: 'BIO01', name: '1er Año Biotecnología', shift: 'Horario único', teacherName: 'Dra. Carmen Solís', specialty: 'Biotecnología' },
        { id: 10, code: 'BIO02', name: '2do Año Biotecnología', shift: 'Horario único', teacherName: 'Dr. Luis Morales', specialty: 'Biotecnología' }
    ]);

    const teachersList = [
        'Ing. Uriel Cambron',
        'DP. Ana Karen',
        'Chef Ana',
        'Dra. Carmen Solís',
        'Dr. Luis Morales',
        'Pendiente de Asignación'
    ];

    // 2. Control de filtros y búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');

    // 3. Modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupRecord | null>(null);

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filtrar Grupos
    const filteredGroups = groups.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = specialtyFilter === 'all' || g.specialty === specialtyFilter;
        return matchesSearch && matchesSpecialty;
    });

    // Crear grupo
    const handleCreateGroup = (formData: any) => {
        const newRecord: GroupRecord = {
            id: Date.now(),
            code: formData.code.toUpperCase(),
            name: formData.name,
            shift: formData.shift,
            teacherName: formData.teacherName,
            specialty: formData.specialty
        };
        setGroups([...groups, newRecord]);
        setIsCreateModalOpen(false);
        triggerToast(`Grupo "${formData.name}" creado correctamente.`);
    };

    // Abrir modal de edición
    const openEditModal = (group: GroupRecord) => {
        setSelectedGroup(group);
        setIsEditModalOpen(true);
    };

    // Editar grupo
    const handleEditGroup = (formData: any) => {
        if (selectedGroup) {
            setGroups(groups.map(g => g.id === selectedGroup.id ? {
                ...g,
                code: formData.code.toUpperCase(),
                name: formData.name,
                shift: formData.shift,
                teacherName: formData.teacherName,
                specialty: formData.specialty
            } : g));
            setIsEditModalOpen(false);
            triggerToast(`Grupo "${formData.name}" actualizado.`);
        }
    };

    // Asignar Profesor
    const handleAssignTeacherSubmit = (formData: any) => {
        setGroups(groups.map(g => g.code === formData.groupCode ? {
            ...g,
            teacherName: formData.teacherName
        } : g));
        setIsAssignTeacherModalOpen(false);
        triggerToast(`Profesor asignado al grupo con éxito.`);
    };

    // Estadísticas
    const totalCount = groups.length;
    const gastroCount = groups.filter(g => g.specialty === 'Gastronomía').length;
    const bioCount = groups.filter(g => g.specialty === 'Biotecnología').length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Grupos"
            title="Administración de grupos"
            subtitle="Consulta y gestiona todos los grupos de la universidad"
            breadcrumb="Grupos"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Grupos totales", value: totalCount },
                { code: "T4", label: "Gastronomía", value: gastroCount },
                { code: "T2", label: "Biotecnología", value: bioCount }
            ]}
            quickActions={[
                { label: "Crear nuevo grupo", onClick: () => setIsCreateModalOpen(true) },
                { label: "Asignar profesor", onClick: () => setIsAssignTeacherModalOpen(true) }
            ]}
        >
            {/* Controls: Search and Actions */}
            <GroupTableControls 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                specialtyFilter={specialtyFilter}
                setSpecialtyFilter={setSpecialtyFilter}
            />

            {/* Table */}
            <GroupTable 
                groups={filteredGroups}
                onOpenEditModal={openEditModal}
            />

            {/* Modal: Crear Grupo */}
            <GroupFormModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                mode="create"
                group={null}
                teachersList={teachersList}
                onSubmit={handleCreateGroup}
            />

            {/* Modal: Editar Grupo */}
            <GroupFormModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                group={selectedGroup}
                teachersList={teachersList}
                onSubmit={handleEditGroup}
            />

            {/* Modal: Asignar Profesor */}
            <AssignTeacherModal 
                isOpen={isAssignTeacherModalOpen}
                onClose={() => setIsAssignTeacherModalOpen(false)}
                groups={groups}
                teachersList={teachersList}
                onSubmit={handleAssignTeacherSubmit}
            />
        </AdminPageLayout>
    );
}
