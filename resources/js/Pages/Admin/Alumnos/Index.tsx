import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Layers, Home } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import { RiFileExcel2Fill } from "react-icons/ri";
import { useForm, router } from '@inertiajs/react';
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
import { StudentFormatted, BackendStudent } from './types';

export default function AlumnosIndex({ alumnos, groups = [], availableCycles = [], filters = { search: '', group: 'all', cycle: null }, isCycleActive, canRegister }: any) {
    const { toastMessage } = useToast();
    const { exportToExcel } = useExportExcel();
    const { exportToPDF } = useExportPDF();

    // Soportar tanto array directo como objeto de paginación de Laravel
    const studentPage = alumnos?.items ?? alumnos;
    const studentData = useMemo(() => Array.isArray(studentPage) ? studentPage : studentPage?.data || [], [studentPage]);
    const isStudentsLoading = alumnos === null || alumnos === undefined;

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
    })), [studentData]);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [groupFilter, setGroupFilter] = useState(filters.group || 'all');
    const [cycleFilter, setCycleFilter] = useState(filters.cycle || '');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
    const [isTableRefreshing, setIsTableRefreshing] = useState(false);
    const isFirstFilterRender = useRef(true);

    // [BÚSQUEDA INSTANTÁNEA EN MEMORIA 0 MS] Filtrar reactivamente los alumnos descargados
    // Sincronización con servidor únicamente cuando cambian los selects de grupo o ciclo
    useEffect(() => {
        if (isFirstFilterRender.current) {
            isFirstFilterRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            setIsTableRefreshing(true);
            router.get(window.location.pathname, {
                search: searchQuery.trim() || undefined,
                group: groupFilter,
                cycle: cycleFilter,
            }, {
                preserveState: true,
                replace: true,
                only: ['alumnos'],
                onFinish: () => setIsTableRefreshing(false),
            });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [searchQuery, groupFilter, cycleFilter]);

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

    // Efecto de generación de matrícula/email
    useEffect(() => {
        const nombre = data.nombre.trim();
        const paterno = data.apellido_paterno.trim();
        const materno = data.apellido_materno.trim();

        if (nombre === '' && paterno === '') {
            if (modalMode === 'create' && (data.matricula !== '' || data.email !== '')) {
                setData(currentData => ({
                    ...currentData,
                    matricula: '',
                    email: '',
                }));
            }
            return;
        }

        const firstInit = nombre.charAt(0) || '';
        const paternalInit = paterno.charAt(0) || '';
        const maternalInit = materno.charAt(0) || '';

        let firstNamePart = nombre.split(/\s+/)[0]?.toLowerCase() || '';
        let paternalPart = paterno.split(/\s+/)[0]?.toLowerCase() || '';
        firstNamePart = firstNamePart.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        paternalPart = paternalPart.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

        const emailInitials = `${firstInit.toLowerCase()}${paternalInit.toLowerCase()}`;
        const initials = `${firstInit}${paternalInit}${maternalInit}`.toUpperCase().padEnd(3, 'X').substring(0, 3);
        const groupSelected = groups.find((g: any) => g.id === Number(data.grupo_id));
        const groupCode = groupSelected ? groupSelected.id : '00';
        const yearMatch = (data.matricula || '').match(/\d{4}$/);
        const yearPart = yearMatch ? yearMatch[0] : new Date().getFullYear();
        const generatedMatricula = `${initials}${groupCode}${yearPart}`;

        if (modalMode === 'create') {
            const generatedEmail = firstNamePart && paternalPart
                ? `${firstNamePart}.${paternalPart}.${emailInitials}${randomSuffix}@prepahidalgo.edu.mx`
                : '';

            if (data.matricula !== generatedMatricula || data.email !== generatedEmail) {
                setData(currentData => ({
                    ...currentData,
                    matricula: generatedMatricula,
                    email: generatedEmail,
                }));
            }
        } else if (modalMode === 'edit') {
            let generatedEmail = data.email;
            if (firstNamePart && paternalPart) {
                const existingPrefix = (data.email || '').split('@')[0] || '';
                const domain = (data.email || '').split('@')[1] || 'prepahidalgo.edu.mx';
                const numMatch = existingPrefix.match(/\d+$/);
                const numSuffix = numMatch ? numMatch[0] : '';
                generatedEmail = `${firstNamePart}.${paternalPart}${numSuffix ? '.' + numSuffix : ''}@${domain}`;
            }

            if (data.matricula !== generatedMatricula || data.email !== generatedEmail) {
                setData(currentData => ({
                    ...currentData,
                    matricula: generatedMatricula,
                    email: generatedEmail,
                }));
            }
        }
    }, [data.nombre, data.apellido_paterno, data.apellido_materno, data.grupo_id, modalMode, randomSuffix]);

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

    const totalCount = alumnos === null || alumnos === undefined ? null : alumnos?.summary?.total ?? studentPage?.total ?? formattedStudents.length;
    const activeCount = alumnos === null || alumnos === undefined ? null : alumnos?.summary?.active ?? 0;
    const inactiveCount = alumnos === null || alumnos === undefined ? null : alumnos?.summary?.suspended ?? 0;

    const goToPage = (page: number) => {
        if (page < 1 || page > (studentPage?.last_page || 1) || page === studentPage?.current_page) return;
        setIsTableRefreshing(true);
        router.get(window.location.pathname, {
            search: searchQuery.trim() || undefined,
            group: groupFilter,
            cycle: cycleFilter,
            page,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['alumnos'],
            onFinish: () => setIsTableRefreshing(false),
        });
    };


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
        setRandomSuffix(Math.floor(Math.random() * 90 + 10).toString());
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

        SwalHelper.toastLoading(modalMode === 'create' ? 'Inscribiendo alumno...' : 'Actualizando datos...');

        const serviceCallback = {
            onSuccess: () => {
                setIsFormModalOpen(false);
                reset();
                SwalHelper.toast(
                    modalMode === 'create' ? 'Alumno registrado correctamente.' : 'Datos del alumno actualizados.',
                    'success'
                );
            },
            onError: (errors: any) => {
                SwalHelper.toast('Error al guardar. Revisa los campos marcados.', 'error');
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
                SwalHelper.toastLoading('Cambiando estatus del alumno...');
                studentService.toggle(student.id, {
                    onSuccess: () => {
                        SwalHelper.toast(
                            isActivating ? 'Alumno reactivado correctamente.' : 'Alumno dado de baja correctamente.',
                            'success'
                        );
                    },
                    onError: () => {
                        SwalHelper.toast('No se pudo cambiar el estado del alumno.', 'error');
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
                SwalHelper.toastLoading('Eliminando expediente...');
                studentService.destroy(id, {
                    onSuccess: () => {
                        SwalHelper.toast('Alumno eliminado correctamente.', 'success');
                    },
                    onError: (err: any) => {
                        SwalHelper.toast(err.delete || 'No se pudo eliminar el alumno.', 'error');
                    }
                });
            }
        });
    };

    const currentCycleName = useMemo(() => {
        const cycle = availableCycles.find((c: any) => c.id.toString() === cycleFilter?.toString());
        return cycle ? cycle.nombre : '';
    }, [availableCycles, cycleFilter]);

    return (
        <AdminPageLayout
            headTitle="Gestión de Alumnos"
            title="Gestión de alumnos"
            subtitle={`Consultando expedientes e inscripciones para el periodo: ${currentCycleName}`}
            breadcrumb="Alumnos"
            toastMessage={toastMessage}
            isLoading={isStudentsLoading}
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

            <StudentTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                cycleFilter={cycleFilter}
                setCycleFilter={setCycleFilter}
                groups={groups}
                availableCycles={availableCycles}
                onOpenCreateModal={openCreateModal}
                showFiltersDropdown={showFiltersDropdown}
                setShowFiltersDropdown={setShowFiltersDropdown}
                isCycleActive={canRegister}
            />

            {isStudentsLoading || isTableRefreshing ? (
                <DotsLoader
                    label={isTableRefreshing ? "Actualizando alumnos" : "Cargando alumnos"}
                    sublabel={isTableRefreshing ? "Aplicando filtros..." : "Preparando expedientes..."}
                />
            ) : (
                <>
                    <StudentTable
                        students={formattedStudents}
                        onOpenEditModal={openEditModal}
                        onOpenBajaModal={handleToggleStatus}
                        onDelete={handleDeleteStudent}
                    />
                    {(studentPage?.last_page || 1) > 1 && (
                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <p className="text-xs font-medium text-slate-500">
                                Mostrando {studentPage.from}-{studentPage.to} de {studentPage.total} alumnos
                            </p>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => goToPage((studentPage.current_page || 1) - 1)} disabled={!studentPage.prev_page_url} aria-label="Página anterior" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button>
                                <span className="min-w-20 text-center text-xs font-semibold text-slate-600">Página {studentPage.current_page} de {studentPage.last_page}</span>
                                <button type="button" onClick={() => goToPage((studentPage.current_page || 1) + 1)} disabled={!studentPage.next_page_url} aria-label="Página siguiente" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </>
            )}

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
        </AdminPageLayout>
    );
}
