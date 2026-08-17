import { useState, useEffect, useMemo } from 'react';
import { useForm, router, Deferred } from '@inertiajs/react';
import { FileSpreadsheet, Layers, FileText, Home, Folder } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import { RiFileExcel2Fill } from 'react-icons/ri';
import DotsLoader from '@/Components/ui/DotsLoader';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useExportPDF } from '@/hooks/useExportPDF';
import { SwalHelper } from '@/utils/SwalHelper';
import { teacherService } from './services/teacherService';
import TeacherFormModal from './components/TeacherFormModal';
import TeacherAssignmentsModal from './components/TeacherAssignmentsModal';
import TeacherTableControls from "./components/TeacherTableControls";
import TeacherTable from "./components/TeacherTable";
import AdminPageLayout from '@/Components/AdminPageLayout';
import { DocentesIndexProps, TeacherFormatted, TeacherFromBackend } from './types';

export default function DocentesIndex({ teachers, especialidades = [], availableCycles = [], filters = { search: '', cycle: null }, activeCycleTeachersCount, isCycleActive, canRegister }: any) {
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();
    const { exportToPDF } = useExportPDF();

    // [OPTIMIZACIÓN v2.3] Soportar paginación y búsqueda en servidor
    const teacherData = useMemo(() => {
        if (Array.isArray(teachers)) return teachers;
        return teachers?.data || [];
    }, [teachers]);

    const formattedTeachers: TeacherFormatted[] = useMemo(() => teacherData.map((t: TeacherFromBackend) => {
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
            areas: (t as any).areas || [],
            assignments: t.materias?.map(m => ({
                subject: m.nombre,
                groupName: (m as any).nombre_group || m.nombre_grupo || 'Asignado'
            })) || []
        };
    }), [teacherData]);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [cycleFilter, setCycleFilter] = useState(filters.cycle || '');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    // Sincronización con el servidor (Debounce)
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (
                searchQuery !== (filters.search || '') ||
                cycleFilter?.toString() !== (filters.cycle || '').toString()
            ) {
                router.get(window.location.pathname, {
                    search: searchQuery,
                    cycle: cycleFilter
                }, {
                    preserveState: true,
                    replace: true,
                    only: ['teachers']
                });
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery, cycleFilter]);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [randomSuffix, setRandomSuffix] = useState('');

    // FORMULARIO DE INERTIA
    const { data, setData, reset, processing, errors } = useForm({
        matricula: '',
        email: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        telefono: '',
        especialidad: '',
        areas: [] as string[],
    });

    // Auto-generar matrícula y correo
    useEffect(() => {
        if (!data.nombre.trim() && !data.apellido_paterno.trim()) {
            if (modalMode === 'create' && (data.matricula !== '' || data.email !== '')) {
                setData(d => ({ ...d, matricula: '', email: '' }));
            }
            return;
        }

        let primerNombre  = data.nombre.trim().split(/\s+/)[0]?.toLowerCase() || '';
        let primerPaterno = data.apellido_paterno.trim().split(/\s+/)[0]?.toLowerCase() || '';
        primerNombre  = primerNombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
        primerPaterno = primerPaterno.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

        if (modalMode === 'create') {
            const firstInit   = data.nombre.trim().charAt(0).toUpperCase();
            const paternoInit = data.apellido_paterno.trim().charAt(0).toUpperCase();
            const maternoInit = (data.apellido_materno?.trim().charAt(0).toUpperCase()) || 'X';
            const year = new Date().getFullYear();
            const generatedMatricula = `DOC-${firstInit}${paternoInit}${maternoInit}${year}`;

            const initials = `${firstInit.toLowerCase()}${paternoInit.toLowerCase()}`;
            const generatedEmail = primerNombre && primerPaterno
                ? `${primerNombre}.${primerPaterno}.${initials}${randomSuffix}@prepahidalgo.edu.mx`
                : '';

            if (data.matricula !== generatedMatricula || data.email !== generatedEmail) {
                setData(d => ({ ...d, matricula: generatedMatricula, email: generatedEmail }));
            }
        } else if (modalMode === 'edit') {
            if (primerNombre && primerPaterno) {
                const existingPrefix = (data.email || '').split('@')[0] || '';
                const domain = (data.email || '').split('@')[1] || 'prepahidalgo.edu.mx';
                const numMatch = existingPrefix.match(/\d+$/);
                const numSuffix = numMatch ? numMatch[0] : '';
                const generatedEmail = `${primerNombre}.${primerPaterno}${numSuffix ? '.' + numSuffix : ''}@${domain}`;

                if (data.email !== generatedEmail && generatedEmail.length > 5) {
                    setData(d => ({ ...d, email: generatedEmail }));
                }
            }
        }
    }, [data.nombre, data.apellido_paterno, data.apellido_materno, modalMode, randomSuffix]);

    const handleExportExcel = () => {
        const rows = formattedTeachers.map(t => [
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
            (msg) => SwalHelper.success("¡Reporte Generado!", "El listado de docentes se ha descargado correctamente.")
        );
    };

    const handleExportPDF = () => {
        const headers = ["Matrícula", "Nombre Completo", "Correo Electrónico", "Teléfono", "Especialidad"];
        const rows = filteredTeachers.map(t => [
            t.matricula,
            t.name,
            t.email,
            t.phone,
            t.specialty
        ]);

        exportToPDF("Reporte de Personal Docente", headers, rows, "reporte_docentes");
    };

    const filteredTeachers = useMemo(() => formattedTeachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.matricula.toLowerCase().includes(searchQuery.toLowerCase())
    ), [formattedTeachers, searchQuery]);

    const totalTeachersCount = useMemo(() => (teachers === null || teachers === undefined ? null : (Array.isArray(teachers) ? teachers.length : teachers?.total || 0)), [teachers]);
    const specialtyCount = useMemo(() => (teachers === null || teachers === undefined) ? null : Array.from(new Set(formattedTeachers.map(t => t.specialty))).length, [formattedTeachers, teachers]);

    const openCreateModal = () => {
        setModalMode('create');
        setRandomSuffix(Math.floor(Math.random() * 90 + 10).toString());
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
            areas: teacher.areas || [],
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        SwalHelper.toastLoading(modalMode === 'create' ? 'Registrando docente...' : 'Actualizando datos...');

        const serviceCallback = {
            onSuccess: () => {
                setIsFormModalOpen(false);
                reset();
                SwalHelper.toast(
                    modalMode === 'create' ? 'Docente registrado correctamente.' : 'Datos del docente actualizados.',
                    'success'
                );
            },
            onError: () => {
                SwalHelper.toast('Error al guardar. Revisa los campos.', 'error');
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
                SwalHelper.toastLoading('Eliminando docente...');
                teacherService.destroy(teacher.id, {
                    onSuccess: () => {
                        SwalHelper.toast('Docente eliminado correctamente.', 'success');
                    },
                    onError: (err: any) => {
                        SwalHelper.toast(err.delete || 'No se pudo eliminar al docente.', 'error');
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
            headTitle="Gestión de Docentes"
            title="Gestión de docentes"
            subtitle={`Consultando plantilla y asignaciones para el periodo: ${currentCycleName}`}
            breadcrumb="Docentes"
            toastMessage={toastMessage}
            isLoading={teachers === null || teachers === undefined}
            metrics={[
                { code: "T1", label: "Docentes totales", value: totalTeachersCount },
                { code: "T3", label: "Especialidades", value: specialtyCount },
                { code: "T4", label: "Activos en ciclo", value: activeCycleTeachersCount }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: RiFileExcel2Fill },
                { label: "Exportar listado (PDF)", onClick: handleExportPDF, icon: FaFilePdf },
                { label: "Panel de Control", onClick: () => router.visit(route('admin.dashboard')), icon: Home },
                { label: "Asignar Materias", onClick: () => router.visit(route('admin.loads.index')), icon: Folder }
            ]}
            donutChartLabel="profesores"
            donutChartSegments={[
                { name: "Asignados", count: totalTeachersCount || 0, color: "#0266E0", bulletClass: "bg-[#0266E0]" }
            ]}
        >
            {/* Cycle Alerts */}
            {!isCycleActive && canRegister && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center animate-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-black text-blue-800 uppercase tracking-widest leading-none mb-1">Modo Planeación</p>
                        <p className="text-[11px] text-blue-700 font-medium">Preparando la plantilla docente para el próximo ciclo. Los registros están habilitados para organizar las asignaciones, pero el periodo aún no es vigente.</p>
                    </div>
                </div>
            )}

            {!canRegister && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center animate-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">Modo Solo Catálogo</p>
                        <p className="text-[11px] text-amber-700 font-medium">No existe un Ciclo Escolar activo ni en planeación. Los registros de plantilla docente y asignaciones están deshabilitados.</p>
                    </div>
                    <button
                        onClick={() => router.visit(route('admin.dashboard'))}
                        className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-700 transition-all shrink-0"
                    >
                        Crear Ciclo
                    </button>
                </div>
            )}

            <TeacherTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                cycleFilter={cycleFilter}
                setCycleFilter={setCycleFilter}
                availableCycles={availableCycles}
                onCreate={openCreateModal}
                showFiltersDropdown={showFiltersDropdown}
                setShowFiltersDropdown={setShowFiltersDropdown}
                isCycleActive={canRegister}
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
                specialties={especialidades}
            />
        </AdminPageLayout>
    );
}
