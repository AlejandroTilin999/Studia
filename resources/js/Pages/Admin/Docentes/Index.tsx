import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Download, Layers, FileText } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { teacherService } from './services/teacherService';
import TeacherFormModal from './components/TeacherFormModal';
import TeacherAssignmentsModal from './components/TeacherAssignmentsModal';
import TeacherTableControls from "./components/TeacherTableControls";
import TeacherTable from "./components/TeacherTable";
import AdminPageLayout from '@/Components/AdminPageLayout';
import ConfirmActionModal from '@/Components/ConfirmActionModal';
import { DocentesIndexProps, TeacherFormatted, TeacherFromBackend } from './types';

export default function DocentesIndex({ teachers: backendTeachers = [] }: DocentesIndexProps) {
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();

    const formattedTeachers: TeacherFormatted[] = backendTeachers.map((t: TeacherFromBackend) => {
        const nombreCompleto = `${t.nombre || ''} ${t.apellido_paterno || ''} ${t.apellido_materno || ''}`.trim() || 'Sin nombre';
        const correoDocente = t.user?.email || t.email || (t.employee_code ? `${t.employee_code.toLowerCase()}@prepahidalgo.edu.mx` : 'docente@prepahidalgo.edu.mx');

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
                groupName: c.groupName || 'Asignado'
            })) || []
        };
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [teacherToDelete, setTeacherToDelete] = useState<any>(null);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

    // FORMULARIO DE INERTIA CONECTADO AL BACKEND
    const { data, setData, reset, processing, errors } = useForm({
        matricula: '',
        email: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        phone: '',
        specialty: ''
    });

    // Auto-generar matrícula y correo igual que en alumnos
    useEffect(() => {
        if (modalMode !== 'create') return;
        if (!data.nombre.trim() && !data.apellido_paterno.trim()) {
            if (data.matricula !== '' || data.email !== '') {
                setData(d => ({ ...d, matricula: '', email: '' }));
            }
            return;
        }
        const firstInit   = data.nombre.trim().charAt(0).toUpperCase();
        const paternoInit = data.apellido_paterno.trim().charAt(0).toUpperCase();
        const maternoInit = (data.apellido_materno?.trim().charAt(0).toUpperCase()) || 'X';
        const year = new Date().getFullYear();
        const generatedMatricula = `DOC-${firstInit}${paternoInit}${maternoInit}${year}`;

        let primerNombre  = data.nombre.trim().split(/\s+/)[0]?.toLowerCase() || '';
        let primerPaterno = data.apellido_paterno.trim().split(/\s+/)[0]?.toLowerCase() || '';
        primerNombre  = primerNombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        primerPaterno = primerPaterno.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const generatedEmail = primerNombre && primerPaterno
            ? `${primerNombre}.${primerPaterno}@prepahidalgo.edu.mx`
            : '';

        if (data.matricula !== generatedMatricula || data.email !== generatedEmail) {
            setData(d => ({ ...d, matricula: generatedMatricula, email: generatedEmail }));
        }
    }, [data.nombre, data.apellido_paterno, data.apellido_materno, modalMode]);

    const handleExportExcel = () => {
        const rows = filteredTeachers.map(t => [
            t.matricula,
            t.name,
            t.email,
            t.phone,
            t.specialty
        ]);
        
        exportToExcel(
            "Reporte de Docentes - PrepaHid",
            "Listado de Docentes",
            ["Matrícula", "Nombre Completo", "Correo Electrónico", "Teléfono", "Especialidad"],
            rows,
            "reporte_docentes",
            (msg) => triggerToast("Reporte de docentes exportado a Excel con éxito.")
        );
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
            matricula: teacher.matricula === 'S/M' ? '' : teacher.matricula,
            email: teacher.email,
            nombre: teacher.rawNombre,
            apellido_paterno: teacher.rawPaterno,
            apellido_materno: teacher.rawMaterno ?? '',
            phone: teacher.phone === 'Sin teléfono' ? '' : teacher.phone,
            specialty: teacher.specialty
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');

        const serviceCallback = {
            onSuccess: () => {
                setSaveStatus('success');
                reset();
                setTimeout(() => {
                    setIsFormModalOpen(false);
                    setSaveStatus('idle');
                }, 2000);
            },
            onError: () => {
                setSaveStatus('error');
                setTimeout(() => {
                    setSaveStatus('idle');
                }, 2500);
            },
            onFinish: () => {
                setSaveStatus(current => {
                    if (current === 'saving') {
                        setTimeout(() => setSaveStatus('idle'), 3000);
                        return 'error';
                    }
                    return current;
                });
            }
        };

        if (modalMode === 'create') {
            teacherService.store(data, serviceCallback);
        } else {
            teacherService.update(selectedTeacher.id, data, serviceCallback);
        }
    };

    const triggerDeleteConfirm = (teacher: any) => {
        setDeleteErrorMessage(null);
        setTeacherToDelete(teacher);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTeacher = () => {
        if (teacherToDelete) {
            setDeleteStatus('saving');
            teacherService.destroy(teacherToDelete.id, {
                onSuccess: () => {
                    setDeleteStatus('success');
                    setTimeout(() => {
                        setIsDeleteModalOpen(false);
                        setDeleteStatus('idle');
                        setTeacherToDelete(null);
                    }, 2000);
                },
                onError: (err: any) => {
                    setDeleteStatus('error');
                    setDeleteErrorMessage(err.delete || "No se pudo realizar la acción.");
                    setTimeout(() => {
                        setDeleteStatus('idle');
                    }, 4000);
                },
                onFinish: () => {
                    setDeleteStatus(current => {
                        if (current === 'saving') {
                            setTimeout(() => setDeleteStatus('idle'), 3000);
                            return 'error';
                        }
                        return current;
                    });
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
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: Download },
                { label: "Estructurar grupos", onClick: () => router.visit('/admin/grupos'), icon: Layers },
                { label: "Ver materias activas", onClick: () => router.visit('/admin/materias'), icon: FileText }
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
                onDelete={triggerDeleteConfirm}
            />

            {/* Form Modal */}
            <TeacherFormModal
                open={isFormModalOpen}
                mode={modalMode}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onClose={() => {
                    if (saveStatus === 'idle') {
                        setIsFormModalOpen(false);
                    }
                }}
                onSubmit={handleSubmit}
                saveStatus={saveStatus}
            />

            {/* Assignments Modal */}
            <TeacherAssignmentsModal
                open={isAssignmentsModalOpen}
                onClose={() => setIsAssignmentsModalOpen(false)}
                teacher={selectedTeacher}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmActionModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    if (deleteStatus === 'idle') {
                        setIsDeleteModalOpen(false);
                        setTeacherToDelete(null);
                    }
                }}
                onConfirm={confirmDeleteTeacher}
                title="Eliminar Profesor del Sistema"
                description={`Esta acción eliminará el expediente de ${teacherToDelete?.name || 'este profesor'} del sistema escolar de forma inmediata.`}
                confirmText={teacherToDelete?.matricula || ''}
                actionPhrase="eliminar profesor"
                warningMessage="Al eliminar al profesor, este perderá acceso completo al portal escolar de PrepaHid y sus materias asignadas quedarán sin docente titular."
                confirmLabel="Eliminar Profesor"
                saveStatus={deleteStatus}
                processingLabel="Eliminando profesor del sistema..."
                successLabel="¡Profesor eliminado!"
                errorLabel={deleteErrorMessage || undefined}
            />
        </AdminPageLayout>
    );
}
