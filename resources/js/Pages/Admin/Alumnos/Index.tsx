import { useState, useEffect } from 'react';
import { Download, Layers, FileText } from "lucide-react";
import { useForm, router } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { studentService } from './services/studentService';
import StudentTable from './components/StudentTable';
import StudentTableControls from './components/StudentTableControls';
import StudentFormModal from './components/StudentFormModal';
import StudentKardexModal from './components/StudentKardexModal';
import { AlumnosIndexProps, StudentFormatted, BackendStudent, BackendGrade } from './types';

export default function AlumnosIndex({ alumnos = [], groups = [] }: AlumnosIndexProps) {
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();

    // Mapeamos los datos simplificados directamente de la tabla única de alumnos
    const formattedStudents: StudentFormatted[] = alumnos.map((student: BackendStudent) => ({
        id: student.id,
        matricula: student.matricula || 'S/M',
        name: student.name || 'Sin nombre asignado',
        email: student.email || 'sin-correo@prepahidalgo.edu.mx',
        groupId: student.academic_group?.id || 0,
        groupName: student.academic_group?.name || 'Sin grupo',
        status: student.status || 'active',
        telefono: student.telefono || '',
        fecha_nacimiento: student.fecha_nacimiento || '',
        rawNombre: student.rawNombre || '',
        rawPaterno: student.rawPaterno || '',
        rawMaterno: student.rawMaterno || '',
        grades: student.grades?.map((g: any) => ({
            subject: g.subject || g.course?.name || 'Materia Desconocida',
            code: g.code || g.course?.code || 'S/C',
            score: g.score,
            period: g.period || '2026-A'
        })) || []
    }));



    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    // FORMULARIO INTEGRADO A LAS TABLAS USERS Y ENROLLMENTS
    const { data, setData, reset, processing, errors } = useForm({
        matricula: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        academic_group_id: '',
        status: 'active' as 'active' | 'inactive' | 'suspended'
    });
    useEffect(() => {
        if (modalMode === 'create') {
            if (data.nombre.trim() === '' && data.apellido_paterno.trim() === '') {
                if (data.matricula !== '' || data.email !== '') {
                    setData(currentData => ({
                        ...currentData,
                        matricula: '',
                        email: ''
                    }));
                }
            } else {
                const firstInit = data.nombre.trim().charAt(0) || '';
                const paternalInit = data.apellido_paterno.trim().charAt(0) || '';
                const maternalInit = data.apellido_materno.trim().charAt(0) || '';
                const initials = `${firstInit}${paternalInit}${maternalInit}`.toUpperCase().padEnd(3, 'X').substring(0, 3);
                const groupSelected = groups.find(g => g.id === Number(data.academic_group_id));
                const groupCode = groupSelected ? groupSelected.id : '00';
                const currentYear = new Date().getFullYear();
                const generatedMatricula = `${initials}${groupCode}${currentYear}`;

                let firstNamePart = data.nombre.trim().split(/\s+/)[0]?.toLowerCase() || '';
                let paternalPart = data.apellido_paterno.trim().split(/\s+/)[0]?.toLowerCase() || '';
                let emailBase = `${firstNamePart}.${paternalPart}`.trim();
                emailBase = emailBase.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const generatedEmail = emailBase && emailBase !== '.' ? `${emailBase}@prepahid.edu.mx` : '';

                if (data.matricula !== generatedMatricula || data.email !== generatedEmail) {
                    setData(currentData => ({
                        ...currentData,
                        matricula: generatedMatricula,
                        email: generatedEmail
                    }));
                }
            }
        }
    }, [data.nombre, data.apellido_paterno, data.apellido_materno, data.academic_group_id, modalMode, groups]);;

    const handleExportExcel = () => {
        const rows = filteredStudents.map(s => [
            s.matricula,
            s.name,
            s.email,
            s.groupName,
            s.status === 'active' ? 'Activo' : 'Inactivo'
        ]);

        exportToExcel(
            "Reporte de Alumnos - PrepaHid",
            "Listado de Alumnos",
            ["Matrícula", "Nombre Completo", "Correo Electrónico", "Grupo Asignado", "Estado Matrícula"],
            rows,
            "reporte_alumnos",
            (msg) => triggerToast("Reporte de alumnos exportado a Excel con éxito.")
        );
    };

    const filteredStudents = formattedStudents.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.matricula.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || student.groupId.toString() === groupFilter;
        return matchesSearch && matchesGroup;
    });

    const activeCount = formattedStudents.filter(s => s.status === 'active').length;
    const inactiveCount = formattedStudents.filter(s => s.status === 'suspended').length;
    const totalCount = formattedStudents.length;

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        setIsFormModalOpen(true);
    };

    const openEditModal = (student: any) => {
        setModalMode('edit');
        setSelectedStudent(student);
        setData({
            matricula: student.matricula,
            nombre: student.rawNombre || '',
            apellido_paterno: student.rawPaterno || '',
            apellido_materno: student.rawMaterno || '',
            email: student.email,
            telefono: student.telefono,
            fecha_nacimiento: student.fecha_nacimiento,
            academic_group_id: student.groupId,
            status: student.status
        });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        SwalHelper.loading(
            modalMode === 'create' ? 'Inscribiendo alumno...' : 'Actualizando datos...',
            'Estamos procesando la información en el servidor.'
        );

        const serviceCallback = {
            onSuccess: () => {
                setIsFormModalOpen(false);
                reset();
                SwalHelper.success(
                    '¡Operación Exitosa!',
                    modalMode === 'create' ? 'El alumno ha sido registrado y matriculado correctamente.' : 'Los datos del alumno han sido actualizados.'
                );
            },
            onError: (errors: any) => {
                SwalHelper.error(
                    'Error de validación',
                    'Por favor, revisa los campos marcados en rojo.'
                );
            }
        };

        if (modalMode === 'create') {
            studentService.store(data, serviceCallback);
        } else if (modalMode === 'edit' && selectedStudent) {
            studentService.update(selectedStudent.id, data, serviceCallback);
        }
    };

    const handleToggleStatus = (student: any) => {
        const isActivating = student.status !== 'active';

        SwalHelper.confirm(
            isActivating ? '¿Reactivar Alumno?' : '¿Suspender Alumno?',
            `¿Estás seguro de que deseas ${isActivating ? 'activar' : 'dar de baja'} a ${student.name}?`,
            isActivating ? 'Sí, Continuar' : 'Sí, Dar de Baja',
            'Cancelar',
            isActivating ? 'info' : 'warning'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Procesando...', 'Cambiando el estado de la matrícula.');

                studentService.toggle(student.id, {
                    onSuccess: () => {
                        SwalHelper.success(
                            isActivating ? '¡Alumno Reactivado!' : '¡Alumno Suspendido!',
                            `El alumno ha sido ${isActivating ? 'reactivado' : 'dado de baja'} correctamente.`
                        );
                    },
                    onError: () => {
                        SwalHelper.error('Error', 'No se pudo cambiar el estado del alumno.');
                    }
                });
            }
        });
    };

    const handleDeleteStudent = (id: number, name: string) => {
        SwalHelper.confirm(
            '¿Eliminar Expediente?',
            `¿Estás seguro de que deseas eliminar permanentemente a ${name}? Esta acción no se puede deshacer.`,
            'Sí, Eliminar Todo',
            'Cancelar',
            'error'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Eliminando...', 'Borrando expediente y cuenta de usuario');
                studentService.destroy(id, {
                    onSuccess: () => {
                        SwalHelper.success('¡Eliminado!', 'El alumno ha sido removido del sistema.');
                    },
                    onError: (err: any) => {
                        SwalHelper.error('Error', err.delete || 'No se pudo eliminar el alumno (podría tener historial académico).');
                    }
                });
            }
        });
    };

    const openKardexModal = (student: any) => {
        setSelectedStudent(student);
        setIsKardexModalOpen(true);
    };

    return (
        <AdminPageLayout
            headTitle="Gestión de Alumnos"
            title={`Gestión de alumnos (${totalCount})`}
            subtitle="Consulta, edita y registra expedientes e inscripciones escolares"
            breadcrumb="Alumnos"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Alumnos totales", value: totalCount },
                { code: "T3", label: "Activos", value: activeCount },
                { code: "T4", label: "De baja", value: inactiveCount }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: Download },
                { label: "Estructurar grupos", onClick: () => router.visit('/admin/grupos'), icon: Layers },
                { label: "Ver reportes escolares", onClick: () => router.visit('/admin/reportes'), icon: FileText }
            ]}
            donutChartLabel="alumnos"
            donutChartSegments={[
                { name: "Activos", count: activeCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "De baja", count: inactiveCount, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {/* Controls: Search and Actions */}
            <StudentTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                groups={groups}
                onOpenCreateModal={openCreateModal}
                showFiltersDropdown={showFiltersDropdown}
                setShowFiltersDropdown={setShowFiltersDropdown}
            />

            {/* Table */}
            <StudentTable
                students={filteredStudents}
                onOpenEditModal={openEditModal}
                onOpenBajaModal={handleToggleStatus}
                onOpenKardexModal={openKardexModal}
                onDelete={handleDeleteStudent}
            />

            {/* Modal: Add/Edit student */}
            <StudentFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                mode={modalMode}
                student={selectedStudent}
                groups={groups}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleFormSubmit}
            />

            {/* Modal: Kardex View */}
            <StudentKardexModal
                isOpen={isKardexModalOpen}
                onClose={() => setIsKardexModalOpen(false)}
                student={selectedStudent}
                onDownloadKardex={(student) => {
                    triggerToast(`Descargando Kardex oficial de ${student.name}...`);
                }}
            />
        </AdminPageLayout>
    );
}
