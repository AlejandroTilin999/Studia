import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import SubjectTable from './SubjectTable';
import SubjectTableControls from './SubjectTableControls';
import SubjectFormModal from './SubjectFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';

interface MateriaBackend {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    profesor: string;
    grupos: string[];
}

interface MateriasIndexProps {
    materias?: MateriaBackend[];
}

export default function MateriasIndex({ materias = [] }: MateriasIndexProps) {
    const formattedSubjects = materias.map(course => ({
        id: course.id,
        code: course.codigo || 'S/C',
        name: course.nombre || 'Sin nombre',
        teacherName: course.profesor || 'Pendiente de Asignación',
        linkedGroups: course.grupos || [],
        description: course.descripcion || 'Sin descripción disponible.'
    }));

    // List of teachers (hardcoded to align with DB IDs on main)
    const teachersList = [
        { id: '1', name: 'Francisco Javier Martínez' },
        { id: '2', name: 'María Elena Rodríguez' },
        { id: '3', name: 'Humberto Soler Castro' },
        { id: '4', name: 'Luisa Fernanda Vega' },
    ];

    const groupsList = ['1-A', '2-B', '3-A'];

    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Formulario de Inertia
    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        code: '',
        name: '',
        description: '',
        teacher_id: '' as string | number,
        linked_groups: [] as string[]
    });

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredSubjects = formattedSubjects.filter(subject => {
        const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || subject.linkedGroups.includes(groupFilter);
        return matchesSearch && matchesGroup;
    });

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (subject: any) => {
        setModalMode('edit');
        setSelectedSubject(subject);
        // Find teacher ID from hardcoded list matching name
        const matchTeacher = teachersList.find(t => t.name === subject.teacherName);
        setData({
            code: subject.code,
            name: subject.name,
            description: subject.description === 'Sin descripción disponible.' ? '' : subject.description,
            teacher_id: matchTeacher ? matchTeacher.id : '',
            linked_groups: subject.linkedGroups
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'create') {
            post(route('materias.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    triggerToast(`Materia "${data.name}" creada con éxito.`);
                    reset();
                }
            });
        } else if (modalMode === 'edit' && selectedSubject) {
            put(route('materias.update', selectedSubject.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    triggerToast(`Materia "${data.name}" actualizada con éxito.`);
                }
            });
        }
    };

    const handleDeleteSubject = (id: number, name: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar la materia "${name}"?`)) {
            destroy(route('materias.destroy', id), {
                onSuccess: () => {
                    triggerToast(`Materia "${name}" eliminada correctamente.`);
                }
            });
        }
    };

    const totalSubjectsCount = formattedSubjects.length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Materias"
            title={`Gestión de materias (${totalSubjectsCount})`}
            subtitle="Consulta, edita y registra planes de estudio y materias del ciclo"
            breadcrumb="Materias"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Materias totales", value: totalSubjectsCount },
                { code: "T3", label: "Activas en ciclo", value: totalSubjectsCount },
                { code: "T4", label: "Sin docente", value: formattedSubjects.filter(s => s.teacherName === 'Pendiente de Asignación').length }
            ]}
            quickActions={[
                { label: "Registrar materia", onClick: openCreateModal }
            ]}
            donutChartLabel="materias"
            donutChartSegments={[
                { name: "Con docente", count: formattedSubjects.filter(s => s.teacherName !== 'Pendiente de Asignación').length, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "Sin docente", count: formattedSubjects.filter(s => s.teacherName === 'Pendiente de Asignación').length, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {/* Controls */}
            <SubjectTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenCreateModal={openCreateModal}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                groupsList={groupsList}
            />

            {/* Table */}
            <SubjectTable
                subjects={filteredSubjects}
                onOpenEditModal={openEditModal}
                onDelete={handleDeleteSubject}
            />

            {/* Form Modal */}
            <SubjectFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                subject={selectedSubject}
                teachersList={teachersList}
                groupsList={groupsList}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
            />
        </AdminPageLayout>
    );
}
