import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import TeacherFormModal from './TeacherFormModal';
import TeacherAssignmentsModal from './TeacherAssignmentsModal';
import TeacherTableControls from "./TeacherTableControls";
import TeacherTable from "./TeacherTable";
import AdminPageLayout from '@/Components/AdminPageLayout';

interface TeacherFromBackend {
    id: number;
    employee_code: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    specialty: string;
    phone: string | null;
    email?: string;
    courses?: {
        id: number;
        name: string;
        code: string;
    }[];
}

interface DocentesIndexProps {
    teachers?: TeacherFromBackend[];
}

export default function DocentesIndex({ teachers: backendTeachers = [] }: DocentesIndexProps) {
    const formattedTeachers = backendTeachers.map((t) => {
        const nombreCompleto = `${t.nombre || ''} ${t.apellido_paterno || ''} ${t.apellido_materno || ''}`.trim() || 'Sin nombre';
        const correoDocente = t.email || (t.employee_code ? `${t.employee_code.toLowerCase()}@studia.edu.mx` : 'docente@studia.edu.mx');

        return {
            id: t.id,
            matricula: t.employee_code || 'S/M',
            name: nombreCompleto,
            rawNombre: t.nombre || '',
            rawPaterno: t.apellido_paterno || '',
            rawMaterno: t.apellido_materno || '',
            email: correoDocente,
            phone: t.phone || 'Sin teléfono',
            specialty: t.specialty || 'General',
            assignments: t.courses?.map(c => ({
                subject: c.name,
                groupName: 'Asignado'
            })) || []
        };
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // FORMULARIO DE INERTIA CONECTADO AL BACKEND
    const { data, setData, post, put, reset, processing, errors } = useForm({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        phone: '',
        specialty: ''
    });

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredTeachers = formattedTeachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        teacher.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.matricula.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalTeachersCount = formattedTeachers.length;
    const specialtyCount = Array.from(new Set(formattedTeachers.map(t => t.specialty))).length;

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        setIsFormModalOpen(true);
    };

    const openEditModal = (teacher: any) => {
        setModalMode('edit');
        setSelectedTeacher(teacher);
        setData({
            nombre: teacher.rawNombre,
            apellido_paterno: teacher.rawPaterno,
            apellido_materno: teacher.rawMaterno,
            phone: teacher.phone === 'Sin teléfono' ? '' : teacher.phone,
            specialty: teacher.specialty
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'create') {
            post(route('admin.docentes.store'), {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    triggerToast("¡Profesor registrado con éxito!");
                }
            });
        } else {
            put(route('admin.docentes.update', selectedTeacher.id), {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    triggerToast("¡Expediente actualizado con éxito!");
                }
            });
        }
    };

    const openAssignmentsModal = (teacher: any) => {
        setSelectedTeacher(teacher);
        setIsAssignmentsModalOpen(true);
    };

    return (
        <AdminPageLayout
            headTitle="Gestión de Profesores"
            title={`Gestión de profesores (${totalTeachersCount})`}
            subtitle="Consulta, edita y registra expedientes de personal docente"
            breadcrumb="Profesores"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Docentes totales", value: totalTeachersCount },
                { code: "T3", label: "Especialidades", value: specialtyCount },
                { code: "T4", label: "Activos en ciclo", value: totalTeachersCount }
            ]}
            quickActions={[
                { label: "Registrar profesor", onClick: openCreateModal }
            ]}
            donutChartLabel="profesores"
            donutChartSegments={[
                { name: "Activos", count: totalTeachersCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" }
            ]}
        >
            {/* Controls */}
            <TeacherTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onCreate={openCreateModal}
                showFiltersDropdown={showFiltersDropdown}
                setShowFiltersDropdown={setShowFiltersDropdown}
            />

            {/* Table */}
            <TeacherTable
                teachers={filteredTeachers}
                onEdit={openEditModal}
                onViewAssignments={openAssignmentsModal}
            />

            {/* Form Modal */}
            <TeacherFormModal
                open={isFormModalOpen}
                mode={modalMode}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleSubmit}
            />

            {/* Assignments Modal */}
            <TeacherAssignmentsModal
                open={isAssignmentsModalOpen}
                onClose={() => setIsAssignmentsModalOpen(false)}
                teacher={selectedTeacher}
            />
        </AdminPageLayout>
    );
}
