import { useState, useEffect, useMemo } from 'react';
import { FileSpreadsheet, Layers, FileText, Home, Users } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import { RiFileExcel2Fill } from "react-icons/ri";
import { useForm, router, Deferred } from '@inertiajs/react';
import DotsLoader from '@/Components/ui/DotsLoader';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useExportPDF } from '@/hooks/useExportPDF';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { studentService } from './services/studentService';
import StudentTable from './components/StudentTable';
import StudentTableControls from './components/StudentTableControls';
import StudentFormModal from './components/StudentFormModal';
import StudentKardexModal from './components/StudentKardexModal';
import { AlumnosIndexProps, StudentFormatted, BackendStudent, BackendGrade } from './types';

export default function AlumnosIndex({ alumnos, groups = [], filters = { search: '', group: 'all' }, isCycleActive, canRegister }: any) {
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();
    const { exportToPDF } = useExportPDF();

    // Soportar tanto array directo como objeto de paginación de Laravel
    const studentData = useMemo(() => {
        if (Array.isArray(alumnos)) return alumnos;
        return alumnos?.data || [];
    }, [alumnos]);

    // Mapeamos los datos simplificados directamente de la tabla única de alumnos
    const formattedStudents: StudentFormatted[] = useMemo(() => studentData.map((student: BackendStudent) => ({
        id: student.id,
        matricula: student.matricula || 'S/M',
        name: student.nombre || 'Sin nombre asignado',
        email: student.email || 'sin-correo@prepahidalgo.edu.mx',
        groupId: student.grupo?.id || 0,
        groupName: student.grupo?.nombre || 'Sin grupo',
        status: student.estatus || 'active',
        telefono: student.telefono || '',
        fecha_nacimiento: student.fecha_nacimiento || '',
        rawNombre: student.rawNombre || '',
        rawPaterno: student.rawPaterno || '',
        rawMaterno: student.rawMaterno || '',
        grades: student.calificaciones?.map((g: any) => ({
            subject: g.subject || g.course?.nombre || 'Materia Desconocida',
            code: g.code || g.course?.codigo || 'S/C',
            score: g.score,
            period: g.period || '2026-A'
        })) || []
    })), [studentData]);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [groupFilter, setGroupFilter] = useState(filters.group || 'all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    // [OPTIMIZACIÓN] Sincronización con el servidor para búsqueda y filtrado
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchQuery !== (filters.search || '') || groupFilter !== (filters.group || 'all')) {
                router.get(window.location.pathname, {
                    search: searchQuery,
                    group: groupFilter
                }, {
                    preserveState: true,
                    replace: true,
                    only: ['alumnos']
                });
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery, groupFilter]);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [randomSuffix, setRandomSuffix] = useState('');

    // FORMULARIO INTEGRADO A LAS TABLAS USERS Y ENROLLMENTS
    const { data, setData, reset, processing, errors } = useForm({
        matricula: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        grupo_id: '',
        estatus: 'active' as 'active' | 'inactive' | 'suspended'
    });

    // ... (Efecto de generación de matrícula/email se mantiene igual) ...
    useEffect(() => {
        if (modalMode === 'create') {
            const nombre = data.nombre.trim();
            const paterno = data.apellido_paterno.trim();
            const materno = data.apellido_materno.trim();
            const fecha = data.fecha_nacimiento;

            if (nombre === '' && paterno === '') {
                if (data.matricula !== '' || data.email !== '') {
                    setData(currentData => ({
                        ...currentData,
                        matricula: '',
                        email: '',
                    }));
                }
            } else {
                const firstInit = nombre.charAt(0) || '';
                const paternalInit = paterno.charAt(0) || '';
                const maternalInit = materno.charAt(0) || '';
                const initials = `${firstInit}${paternalInit}${maternalInit}`.toUpperCase().padEnd(3, 'X').substring(0, 3);

                const groupSelected = groups.find(g => g.id === Number(data.grupo_id));
                const groupCode = groupSelected ? groupSelected.id : '00';
                const currentYear = new Date().getFullYear();
                const generatedMatricula = `${initials}${groupCode}${currentYear}`;

                let firstNamePart = nombre.split(/\s+/)[0]?.toLowerCase() || '';
                let paternalPart = paterno.split(/\s+/)[0]?.toLowerCase() || '';
                firstNamePart = firstNamePart.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                paternalPart = paternalPart.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                // Usamos el sufijo aleatorio generado al abrir el modal
                const generatedEmail = firstNamePart && paternalPart
                    ? `${firstNamePart}.${paternalPart}.${randomSuffix}@prepahidalgo.edu.mx`
                    : '';

                if (data.matricula !== generatedMatricula || data.email !== generatedEmail) {
                    setData(currentData => ({
                        ...currentData,
                        matricula: generatedMatricula,
                        email: generatedEmail,
                    }));
                }
            }
        }
    }, [data.nombre, data.apellido_paterno, data.apellido_materno, data.grupo_id, data.fecha_nacimiento, modalMode, groups, randomSuffix]);

    const handleExportExcel = () => {
        const rows = formattedStudents.map(s => [
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
            (msg) => SwalHelper.success("¡Listado Generado!", "El reporte de alumnos se ha descargado correctamente.")
        );
    };

    const handleExportPDF = () => {
        const headers = ["Matrícula", "Nombre Completo", "Correo Electrónico", "Grupo", "Estado"];
        const rows = formattedStudents.map(s => [
            s.matricula,
            s.name,
            s.email,
            s.groupName,
            s.status === 'active' ? 'Activo' : 'De Baja'
        ]);

        exportToPDF("Reporte General de Alumnos", headers, rows, "reporte_alumnos");
    };

    // [OPTIMIZACIÓN] Las métricas y el filtrado local se memorizan
    const totalCount = useMemo(() => (alumnos === null || alumnos === undefined ? null : (Array.isArray(alumnos) ? alumnos.length : alumnos?.total || 0)), [alumnos]);
    const activeCount = useMemo(() => alumnos === null || alumnos === undefined ? null : formattedStudents.filter(s => s.status === 'active').length, [formattedStudents, alumnos]);
    const inactiveCount = useMemo(() => alumnos === null || alumnos === undefined ? null : formattedStudents.filter(s => s.status === 'suspended').length, [formattedStudents, alumnos]);


    const openCreateModal = () => {
        if (!groups || groups.length === 0) {
            SwalHelper.alert(
                'Sin Grupos Académicos',
                'No puedes inscribir un alumno porque no existen grupos registrados en el sistema. Por favor, crea un grupo primero.',
                'warning'
            );
            return;
        }
        setModalMode('create');
        setRandomSuffix(Math.random().toString(36).substring(2, 6).toUpperCase());
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
            grupo_id: student.groupId,
            estatus: student.status
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

    const openKardexModal = async (student: any) => {
        setSelectedStudent(student);
        setIsKardexModalOpen(true);

        // Cargar Kardex real desde el servidor solo cuando se abre el modal
        try {
            const response = await fetch(`/admin/alumnos/${student.id}/kardex`);
            const result = await response.json();
            if (result.kardex) {
                setSelectedStudent((prev: any) => ({
                    ...prev,
                    grades: result.kardex.map((g: any) => ({
                        subject: g.subject,
                        code: g.code,
                        score: g.score,
                        period: g.period
                    }))
                }));
            }
        } catch (error) {
            console.error("Error al cargar el kardex:", error);
        }
    };

    return (
        <AdminPageLayout
            headTitle="Gestión de Alumnos"
            title="Gestión de alumnos"
            subtitle="Consulta, edita y registra expedientes e inscripciones escolares"
            breadcrumb="Alumnos"
            toastMessage={toastMessage}
            isLoading={alumnos === null || alumnos === undefined}
            metrics={[
                { code: "T1", label: "Alumnos totales", value: totalCount },
                { code: "T3", label: "Activos", value: activeCount },
                { code: "T4", label: "De baja", value: inactiveCount }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: RiFileExcel2Fill },
                { label: "Exportar listado (PDF)", onClick: handleExportPDF, icon: FaFilePdf },
                { label: "Panel de Control", onClick: () => router.visit(route('admin.dashboard')), icon: Home },
                { label: "Gestionar Grupos", onClick: () => router.visit(route('groups.index')), icon: Layers }
            ]}
            donutChartLabel="alumnos"
            donutChartSegments={[
                { name: "Activos", count: activeCount || 0, color: "#0266E0", bulletClass: "bg-[#0266E0]" },
                { name: "De baja", count: inactiveCount || 0, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {!isCycleActive && canRegister && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center animate-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-black text-blue-800 uppercase tracking-widest leading-none mb-1">Modo Planeación</p>
                        <p className="text-[11px] text-blue-700 font-medium">El ciclo escolar se encuentra en preparación. Las inscripciones están habilitadas para organizar el periodo, pero la operación académica iniciará al activar el ciclo.</p>
                    </div>
                </div>
            )}

            {!canRegister && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center animate-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">Modo Solo Catálogo</p>
                        <p className="text-[11px] text-amber-700 font-medium">No existe un Ciclo Escolar activo ni en planeación. Las inscripciones y registros operativos están deshabilitados hasta que se cree un nuevo periodo.</p>
                    </div>
                    <button
                        onClick={() => router.visit(route('admin.dashboard'))}
                        className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-700 transition-all shrink-0"
                    >
                        Crear Ciclo
                    </button>
                </div>
            )}

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
                isCycleActive={canRegister}
            />

            <Deferred data="alumnos" fallback={
                <DotsLoader
                    label="Cargando alumnos"
                    sublabel="Por favor espera un momento..."
                />
            }>
                <StudentTable
                    students={formattedStudents}
                    onOpenEditModal={openEditModal}
                    onOpenBajaModal={handleToggleStatus}
                    onOpenKardexModal={openKardexModal}
                    onDelete={handleDeleteStudent}
                />
            </Deferred>

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
