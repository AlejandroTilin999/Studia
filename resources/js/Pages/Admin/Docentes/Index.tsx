import { useState, useEffect } from 'react';
import { useForm, router, Deferred } from '@inertiajs/react';
import { Download, Layers, FileText } from 'lucide-react';
import DotsLoader from '@/Components/ui/DotsLoader';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { SwalHelper } from '@/utils/SwalHelper';
import { teacherService } from './services/teacherService';
import TeacherFormModal from './components/TeacherFormModal';
import TeacherAssignmentsModal from './components/TeacherAssignmentsModal';
import TeacherTableControls from "./components/TeacherTableControls";
import TeacherTable from "./components/TeacherTable";
import AdminPageLayout from '@/Components/AdminPageLayout';
import { DocentesIndexProps, TeacherFormatted, TeacherFromBackend } from './types';

export default function DocentesIndex({ teachers: backendTeachers = [] }: DocentesIndexProps) {
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();

    const formattedTeachers: TeacherFormatted[] = backendTeachers.map((t: TeacherFromBackend) => {
        const nombreCompleto = `${t.nombre || ''} ${t.apellido_paterno || ''} ${t.apellido_materno || ''}`.trim() || 'Sin nombre';
        const correoDocente = t.usuario?.email || t.email || (t.codigo_empleado ? `${t.codigo_empleado.toLowerCase()}@prepahidalgo.edu.mx` : 'docente@prepahidalgo.edu.mx');

        return {
            id: t.id,
            matricula: t.codigo_empleado || 'S/M',
            name: nombreCompleto,
            rawNombre: t.nombre || '',
            rawPaterno: t.apellido_paterno || '',
            rawMaterno: t.apellido_materno || '',
            email: correoDocente,
            phone: t.telefono || 'Sin teléfono',
            specialty: t.especialidad || 'General',
            area: t.area || '',
            assignments: t.materias?.map(m => ({
                subject: m.nombre,
                groupName: m.nombre_group || m.nombre_grupo || 'Asignado'
            })) || []
        };
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [randomSuffix, setRandomSuffix] = useState('');

    // FORMULARIO DE INERTIA (Campos en Español)
    const { data, setData, reset, processing, errors } = useForm({
        matricula: '',
        email: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        telefono: '',
        especialidad: '',
        area: '',
    });

    // Auto-generar matrícula y correo
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
            ? `${primerNombre}.${primerPaterno}.${randomSuffix}@prepahidalgo.edu.mx`
            : '';

        if (data.matricula !== generatedMatricula || data.email !== generatedEmail) {
            setData(d => ({ ...d, matricula: generatedMatricula, email: generatedEmail }));
        }
    }, [data.nombre, data.apellido_paterno, data.apellido_materno, modalMode, randomSuffix]);

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
        setRandomSuffix(Math.random().toString(36).substring(2, 6).toUpperCase());
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
            telefono: teacher.phone === 'Sin teléfono' ? '' : teacher.phone,
            especialidad: teacher.specialty,
            area: teacher.area || '',
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        SwalHelper.loading(
            modalMode === 'create' ? 'Registrando docente...' : 'Actualizando datos...',
            'Estamos procesando la información del profesor.'
        );

        const serviceCallback = {
            onSuccess: () => {
                setIsFormModalOpen(false);
                reset();
                SwalHelper.success(
                    '¡Operación Exitosa!',
                    modalMode === 'create' ? 'El docente ha sido registrado correctamente.' : 'Los datos del docente han sido actualizados.'
                );
            },
            onError: () => {
                SwalHelper.error(
                    'Error de validación',
                    'Por favor, revisa que todos los campos sean correctos.'
                );
            }
        };

        if (modalMode === 'create') {
            teacherService.store(data, serviceCallback);
        } else {
            teacherService.update(selectedTeacher.id, data, serviceCallback);
        }
    };

    const handleDeleteTeacher = (teacher: any) => {
        SwalHelper.confirm(
            '¿Eliminar Docente?',
            `¿Estás seguro de que deseas eliminar a ${teacher.name}? Esta acción no se puede deshacer.`,
            'Sí, Eliminar',
            'Cancelar',
            'error'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Eliminando...', 'Borrando expediente del servidor.');
                teacherService.destroy(teacher.id, {
                    onSuccess: () => {
                        SwalHelper.success('¡Eliminado!', 'El docente ha sido removido del sistema.');
                    },
                    onError: (err: any) => {
                        SwalHelper.error('Error', err.delete || 'No se pudo eliminar al docente.');
                    }
                });
            }
        });
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
                { name: "Asignados", count: totalTeachersCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" }
            ]}
        >
            <TeacherTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onCreate={openCreateModal}
                showFiltersDropdown={showFiltersDropdown}
                setShowFiltersDropdown={setShowFiltersDropdown}
            />

            <Deferred data="teachers" fallback={
                <DotsLoader
                    label="Cargando profesores"
                    sublabel="Por favor espera un momento..."
                />
            }>
                <TeacherTable
                    teachers={filteredTeachers}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTeacher}
                />
            </Deferred>

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
        </AdminPageLayout>
    );
}
