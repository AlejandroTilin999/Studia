import { useState } from 'react';
import SubjectTable, { MockSubject } from './SubjectTable';
import SubjectTableControls from './SubjectTableControls';
import SubjectFormModal from './SubjectFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';

export default function MateriasIndex() {
    // 1. Datos simulados de materias
    const [subjects, setSubjects] = useState<MockSubject[]>([
        { 
            id: 1, 
            code: 'MAT-101', 
            name: 'Matemáticas I', 
            teacherName: 'Francisco Javier Martínez', 
            linkedGroups: ['1-A', '2-B'], 
            description: 'Álgebra básica, funciones y sistemas de ecuaciones lineales.' 
        },
        { 
            id: 2, 
            code: 'ESP-101', 
            name: 'Español I', 
            teacherName: 'María Elena Rodríguez', 
            linkedGroups: ['1-A'], 
            description: 'Redacción, análisis de textos literarios y gramática básica.' 
        },
        { 
            id: 3, 
            code: 'HIS-101', 
            name: 'Historia I', 
            teacherName: 'Humberto Soler Castro', 
            linkedGroups: ['1-A'], 
            description: 'Historia universal contemporánea y procesos sociales.' 
        },
        { 
            id: 4, 
            code: 'QMC-101', 
            name: 'Química I', 
            teacherName: 'Luisa Fernanda Vega', 
            linkedGroups: ['2-B'], 
            description: 'Introducción a la tabla periódica, enlaces y reacciones químicas.' 
        }
    ]);

    // Lista de profesores disponibles en el sistema (Mock)
    const teachersList = [
        'Francisco Javier Martínez',
        'María Elena Rodríguez',
        'Humberto Soler Castro',
        'Luisa Fernanda Vega',
        'Pendiente de Asignación'
    ];

    // Lista de grupos disponibles en el sistema (Mock)
    const groupsList = ['1-A', '2-B', '3-A'];

    // 2. Control de filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');

    // 3. Modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedSubject, setSelectedSubject] = useState<MockSubject | null>(null);

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filtrar Materias
    const filteredSubjects = subjects.filter(subject => {
        const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || subject.linkedGroups.includes(groupFilter);
        return matchesSearch && matchesGroup;
    });

    // Abrir agregar
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedSubject(null);
        setIsModalOpen(true);
    };

    // Abrir editar
    const openEditModal = (subject: MockSubject) => {
        setModalMode('edit');
        setSelectedSubject(subject);
        setIsModalOpen(true);
    };

    // Guardar
    const handleFormSubmit = (formData: any) => {
        if (modalMode === 'create') {
            // Validar código duplicado
            if (subjects.some(s => s.code.toUpperCase() === formData.code.toUpperCase())) {
                alert('Ya existe una materia con ese código.');
                return;
            }
            const newSubject: MockSubject = {
                id: Date.now(),
                code: formData.code.toUpperCase(),
                name: formData.name,
                teacherName: formData.teacherName,
                linkedGroups: formData.linkedGroups,
                description: formData.description
            };
            setSubjects([newSubject, ...subjects]);
            triggerToast(`Materia "${formData.name}" dada de alta correctamente.`);
        } else if (modalMode === 'edit' && selectedSubject) {
            setSubjects(subjects.map(s => s.id === selectedSubject.id ? {
                ...s,
                code: formData.code.toUpperCase(),
                name: formData.name,
                teacherName: formData.teacherName,
                linkedGroups: formData.linkedGroups,
                description: formData.description
            } : s));
            triggerToast(`Materia "${formData.name}" actualizada.`);
        }
        setIsModalOpen(false);
    };

    // Eliminar
    const handleDelete = (subjectId: number, name: string) => {
        if (confirm(`¿Estás seguro de eliminar la materia "${name}"? Se perderán todas las asignaciones y calificaciones vinculadas.`)) {
            setSubjects(subjects.filter(s => s.id !== subjectId));
            triggerToast(`Materia "${name}" eliminada.`);
        }
    };

    // Estadísticas
    const totalCount = subjects.length;
    const withTeacherCount = subjects.filter(s => s.teacherName !== 'Pendiente de Asignación').length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Materias"
            title={`Gestión de materias (${totalCount})`}
            subtitle="Registra asignaturas del plan de estudios y asocia docentes y grupos"
            breadcrumb="Materias"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Materias activas", value: totalCount },
                { code: "T3", label: "Con docente", value: withTeacherCount }
            ]}
            quickActions={[
                { label: "Alta nueva materia", onClick: openCreateModal }
            ]}
            donutChartTitle="Asignación docente"
            donutChartLabel="materias"
            donutChartSegments={[
                { name: "Con docente", count: withTeacherCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "Sin docente", count: totalCount - withTeacherCount, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {/* Controls: Search and Actions */}
            <SubjectTableControls 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                groupsList={groupsList}
                onOpenCreateModal={openCreateModal}
            />

            {/* Table */}
            <SubjectTable 
                subjects={filteredSubjects}
                onOpenEditModal={openEditModal}
                onDelete={handleDelete}
            />

            {/* Modal: Agregar / Editar */}
            <SubjectFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                subject={selectedSubject}
                teachersList={teachersList}
                groupsList={groupsList}
                onSubmit={handleFormSubmit}
            />
        </AdminPageLayout>
    );
}
