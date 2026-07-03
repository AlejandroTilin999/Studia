import { useState } from 'react';
import TeacherFormModal from './TeacherFormModal';
import TeacherAssignmentsModal from './TeacherAssignmentsModal';
import TeacherTableControls from "./TeacherTableControls";
import TeacherTable from "./TeacherTable";
import AdminPageLayout from '@/Components/AdminPageLayout';

interface MockTeacher {
    id: number;
    matricula: string;
    name: string;
    email: string;
    phone: string;
    specialty: string;
    assignments: { subject: string; groupName: string }[];
}

export default function DocentesIndex() {
    // 1. Initial teachers mock database keeping the original records
    const [teachers, setTeachers] = useState<MockTeacher[]>([
        { 
            id: 1, matricula: 'P001', name: 'Francisco Javier Martínez', 
            email: 'f.martinez@prepahidalgo.edu.mx', phone: '7711234567', 
            specialty: 'Ciencias Exactas e Ingeniería', 
            assignments: [
                { subject: 'Matemáticas I', groupName: '1-A' },
                { subject: 'Física I', groupName: '2-B' },
            ]
        },
        { 
            id: 2, matricula: 'P002',name: 'María Elena Rodríguez', 
            email: 'm.rodriguez@prepahidalgo.edu.mx', phone: '7712223344', 
            specialty: 'Lenguaje y Comunicación',
            assignments: [
                { subject: 'Español I', groupName: '1-A' },
            ]
        },
        { 
            id: 3, matricula: 'P003',name: 'Humberto Soler Castro', email: 'h.soler@prepahidalgo.edu.mx', 
            phone: '7715556677', specialty: 'Historia y Ciencias Sociales',
            assignments: [
                { subject: 'Historia I', groupName: '1-A' },
            ]
        },
        { 
            id: 4, matricula: 'P004',name: 'Luisa Fernanda Vega', 
            email: 'l.vega@prepahidalgo.edu.mx', phone: '7719998877', 
            specialty: 'Química y Biología',
            assignments: [
                { subject: 'Química I', groupName: '2-B' },
            ]
        }
    ]);

    // 2. React state for search & filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    // 3. Form & Assignments Modals State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTeacher, setSelectedTeacher] = useState<MockTeacher | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: ''
    });

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filter Logic
    const filteredTeachers = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        teacher.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handlers
    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', phone: '', specialty: '' });
        setIsFormModalOpen(true);
    };

    const openEditModal = (teacher: MockTeacher) => {
        setModalMode('edit');
        setSelectedTeacher(teacher);
        setFormData({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone,
            specialty: teacher.specialty
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'create') {
            const nextId = teachers.length + 1;
            const newTeacher: MockTeacher = {
                id: Date.now(),
                matricula: `P${nextId < 10 ? '00' + nextId : nextId < 100 ? '0' + nextId : nextId}`,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                specialty: formData.specialty,
                assignments: []
            };
            setTeachers([...teachers, newTeacher]);
            triggerToast(`Docente "${formData.name}" registrado correctamente.`);
        } else if (modalMode === 'edit' && selectedTeacher) {
            setTeachers(teachers.map(t => t.id === selectedTeacher.id ? {
                ...t,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                specialty: formData.specialty
            } : t));
            triggerToast(`Datos de "${formData.name}" actualizados.`);
        }
        setIsFormModalOpen(false);
    };

    const handleDelete = (teacherId: number, name: string) => {
        if (confirm(`¿Estás seguro de eliminar al docente "${name}"? Se perderán todas sus asignaciones académicas.`)) {
            setTeachers(teachers.filter(t => t.id !== teacherId));
            triggerToast(`Docente "${name}" eliminado del sistema.`);
        }
    };

    const openAssignmentsModal = (teacher: MockTeacher) => {
        setSelectedTeacher(teacher);
        setIsAssignmentsModalOpen(true);
    };
    // Dynamic stats
    const totalTeachersCount = teachers.length;
    const tiempoCompletoCount = teachers.filter(t => t.assignments.length >= 2).length;
    const porHorasCount = teachers.filter(t => t.assignments.length < 2).length;
    const alCorrienteCount = teachers.filter(t => t.assignments.length > 0).length;
    const pendienteCount = teachers.filter(t => t.assignments.length === 0).length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Profesores"
            title={`Gestión de profesores (${totalTeachersCount})`}
            subtitle="Consulta, registra y administra la información de los profesores."
            breadcrumb="Profesores"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Profesores", value: totalTeachersCount, },
                { code: "T2", label: "Por Horas", value: porHorasCount, },
                { code: "T4", label: "Tiempo Completo", value: tiempoCompletoCount, },
            ]}
            quickActions={[
                { label: "Registrar profesor", onClick: openCreateModal },
                { label: "Configuración de Ciclo", onClick: () => alert("Módulo de configuración de Ciclo Escolar disponible en Inicio."), },
            ]}
            donutChartTitle="Entrega de Calificaciones"
            donutChartLabel="Totales"
            donutChartSegments={[
                { name: "Profesores Al Corriente", count: alCorrienteCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]", },
                { name: "Profesores Pendientes", count: pendienteCount, color: "#e2e8f0", bulletClass: "bg-slate-200", },
            ]}
        >
            <TeacherTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showFiltersDropdown={showFiltersDropdown}
                setShowFiltersDropdown={setShowFiltersDropdown}
                onCreate={openCreateModal}
            />
          
            <TeacherTable
                teachers={filteredTeachers}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onViewAssignments={openAssignmentsModal}
            />

            {/* Modal: Create/Edit Teacher */}
            {isFormModalOpen && (
                <TeacherFormModal
                    open={isFormModalOpen}
                    mode={modalMode}
                    formData={formData}
                    setFormData={setFormData}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleSubmit}
                />  
            )}
             
            {/* Modal: Asignaciones Académicas */}
            {isAssignmentsModalOpen && selectedTeacher && (
                <TeacherAssignmentsModal
                    open={isAssignmentsModalOpen}
                    teacher={selectedTeacher}
                    onClose={() => setIsAssignmentsModalOpen(false)}
                />
            )}
        </AdminPageLayout>
    );
}
