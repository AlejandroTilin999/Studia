import { useState, useEffect, useMemo } from 'react';
import { useForm, router, Deferred } from '@inertiajs/react';
import { FileSpreadsheet, Layers, Users, Home, Layout } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import { RiFileExcel2Fill } from 'react-icons/ri';
import DotsLoader from '@/Components/ui/DotsLoader';
import SubjectTable from './components/SubjectTable';
import SubjectTableControls from './components/SubjectTableControls';
import SubjectFormModal from './components/SubjectFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useExportPDF } from '@/hooks/useExportPDF';
import { subjectService } from './services/subjectService';
import { MateriasIndexProps, SubjectFormatted } from './types';

export default function MateriasIndex({ materias, profesores = [], grupos = [], especialidades = [], activePeriod, filters = { search: '' }, isCycleActive, canRegister }: any) {
    // [OPTIMIZACIÓN v2.3] Soportar paginación y búsqueda en servidor
    const subjectDataList = useMemo(() => {
        if (Array.isArray(materias)) return materias;
        return materias?.data || [];
    }, [materias]);

    const formattedSubjects: SubjectFormatted[] = useMemo(() => subjectDataList.map((course: any) => ({
        id: course.id,
        code: course.codigo || 'S/C',
        name: course.nombre || 'Sin nombre',
        semestre: course.semestre || 1,
        tipo: course.tipo || 'General',
        area: course.area || '',
        teacherName: course.profesor || 'Pendiente de Asignación',
        teacher_id: course.docente_id,
        linkedGroups: course.grupos || [],
        description: course.descripcion || '',
        specialties: course.especialidades?.map((e: any) => ({ id: e.id, name: e.nombre })) || []
    })), [subjectDataList]);

    const groupsList = useMemo(() => grupos.map((g: any) => g.codigo), [grupos]);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [groupFilter, setGroupFilter] = useState('all');

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchQuery !== (filters.search || '')) {
                router.get(window.location.pathname, {
                    search: searchQuery
                }, {
                    preserveState: true,
                    replace: true,
                    only: ['materias']
                });
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedSubject, setSelectedSubject] = useState<SubjectFormatted | null>(null);

    const { triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();
    const { exportToPDF } = useExportPDF();

    // Formulario de Inertia (Campos en Español)
    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        codigo: '',
        nombre: '',
        semestre: (activePeriod?.es_nones ? 1 : 2) as number,
        descripcion: '',
        tipo: 'General' as 'General' | 'Especialidad',
        area: '',
        linked_groups: [] as string[],
        specialty_ids: [] as number[]
    });

    const handleExportExcel = () => {
        const headers = ["Código", "Nombre de la Materia", "Tipo", "Área", "Especialidades", "Profesor Asignado", "Grupos Vinculados"];
        const rows = filteredSubjects.map(s => [
            s.code,
            s.name,
            s.tipo,
            (s as any).area || 'N/A',
            s.tipo === 'General' ? 'Todas' : s.specialties.map(sp => sp.name).join(', '),
            s.teacherName,
            s.linkedGroups.join(', ') || 'Sin grupos'
        ]);

        exportToExcel(
            "Reporte de Materias - PrepaHid",
            "Catálogo Académico",
            headers,
            rows,
            "reporte_materias",
            (msg) => SwalHelper.success("¡Catálogo Exportado!", "El catálogo de materias se ha descargado correctamente en Excel.")
        );
    };

    const handleExportPDF = () => {
        const headers = ["Código", "Asignatura", "Tipo", "Área", "Profesor"];
        const rows = filteredSubjects.map(s => [
            s.code,
            s.name,
            s.tipo,
            (s as any).area || 'N/A',
            s.teacherName
        ]);

        exportToPDF("Catálogo Académico de Materias", headers, rows, "reporte_materias");
    };

    const filteredSubjects = useMemo(() => formattedSubjects.filter(subject => {
        const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || subject.linkedGroups.includes(groupFilter);

        // [AUTO-FILTRO v2.4] Solo mostrar materias que corresponden a la paridad del ciclo activo (Nones/Pares)
        let matchesParity = true;
        if (activePeriod) {
            matchesParity = activePeriod.es_nones ? subject.semestre % 2 !== 0 : subject.semestre % 2 === 0;
        }

        return matchesSearch && matchesGroup && matchesParity;
    }), [formattedSubjects, searchQuery, groupFilter, activePeriod]);

    const openCreateModal = () => {
        if (!especialidades || especialidades.length === 0) {
            SwalHelper.alert(
                'Sin Especialidades',
                'No puedes registrar materias porque no existen bachilleratos o especialidades técnicas en el sistema. Por favor, agrega al menos una primero.',
                'warning'
            );
            return;
        }
        setModalMode('create');
        reset();
        if (activePeriod) setData('semestre', activePeriod.es_nones ? 1 : 2);
        setIsModalOpen(true);
    };

    const openEditModal = (subject: SubjectFormatted) => {
        setModalMode('edit');
        setSelectedSubject(subject);
        setData({
            codigo: subject.code,
            nombre: subject.name,
            semestre: subject.semestre || 1,
            descripcion: subject.description || '',
            tipo: subject.tipo || 'General',
            area: (subject as any).area || '',
            linked_groups: subject.linkedGroups || [],
            specialty_ids: subject.specialties ? subject.specialties.map((s:any) => s.id) : []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        SwalHelper.loading(
            modalMode === 'create' ? 'Registrando materia...' : 'Actualizando datos...',
            'Procesando en el servidor'
        );

        const submitOptions = {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                SwalHelper.success(
                    '¡Hecho!',
                    modalMode === 'create' ? 'La materia ha sido creada correctamente.' : 'La materia ha sido actualizada.'
                );
            },
            onError: (errors: any) => {
                const firstError = Object.values(errors)[0] as string;
                SwalHelper.error('Error de validación', firstError || 'No se pudieron guardar los cambios.');
            }
        };

        if (modalMode === 'create') {
            subjectService.store(data, submitOptions);
        } else if (modalMode === 'edit' && selectedSubject) {
            subjectService.update(selectedSubject.id, data, submitOptions);
        }
    };

    const handleDeleteSubject = (id: number, name: string) => {
        SwalHelper.confirm(
            '¿Eliminar Materia?',
            `¿Estás seguro de que deseas eliminar "${name}"? Esta acción no se puede deshacer.`,
            'Sí, Eliminar',
            'Cancelar',
            'error'
        ).then((result) => {
            if (result.isConfirmed) {
                SwalHelper.loading('Eliminando...', 'Borrando materia del catálogo.');
                subjectService.destroy(id, {
                    onSuccess: () => {
                        SwalHelper.success('¡Eliminada!', 'La materia ha sido removida del sistema.');
                    },
                    onError: (err: any) => {
                        SwalHelper.error('Error', err.delete || 'No se pudo eliminar la materia.');
                    }
                });
            }
        });
    };

    const totalSubjectsCount = useMemo(() => (materias === null || materias === undefined ? null : (Array.isArray(materias) ? materias.length : materias?.total || 0)), [materias]);
    const subjectsInCycleCount = useMemo(() => (materias === null || materias === undefined) ? null : formattedSubjects.filter(s => activePeriod ? (activePeriod.es_nones ? s.semestre % 2 !== 0 : s.semestre % 2 === 0) : false).length, [formattedSubjects, materias, activePeriod]);
    const subjectsWithoutTeacherCount = useMemo(() => (materias === null || materias === undefined) ? null : formattedSubjects.filter(s => s.teacherName === 'Pendiente de Asignación').length, [formattedSubjects, materias]);

    return (
        <AdminPageLayout
            headTitle="Gestión de Materias"
            title="Gestión de materias"
            subtitle={activePeriod ? `Ciclo Activo: ${activePeriod.nombre} (${activePeriod.es_nones ? 'Semestres Nones' : 'Semestres Pares'})` : "Consulta, edita y registra planes de estudio"}
            breadcrumb="Materias"
            isLoading={materias === null || materias === undefined}

            metrics={[
                { code: "T1", label: "Materias totales", value: totalSubjectsCount },
                { code: "T3", label: "En ciclo actual", value: subjectsInCycleCount },
                { code: "T4", label: "Sin docente", value: subjectsWithoutTeacherCount }
            ]}

            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: RiFileExcel2Fill },
                { label: "Exportar listado (PDF)", onClick: handleExportPDF, icon: FaFilePdf },
                { label: "Panel de Control", onClick: () => router.visit(route('admin.dashboard')), icon: Home },
                { label: "Gestionar Especialidades", onClick: () => router.visit(route('admin.especialidades.index')), icon: Layout }
            ]}
            donutChartLabel="materias"
            donutChartSegments={[
                { name: "Con docente", count: formattedSubjects.filter(s => s.teacherName !== 'Pendiente de Asignación').length, color: "#0266E0", bulletClass: "bg-[#0266E0]" },
                { name: "Sin docente", count: formattedSubjects.filter(s => s.teacherName === 'Pendiente de Asignación').length, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {!isCycleActive && canRegister && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center animate-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-black text-blue-800 uppercase tracking-widest leading-none mb-1">Modo Planeación</p>
                        <p className="text-[11px] text-blue-700 font-medium">Configurando el próximo periodo escolar. Puedes gestionar el catálogo de materias y preparar la oferta académica, pero el ciclo aún no está vigente.</p>
                    </div>
                </div>
            )}

            {!canRegister && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center animate-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">Modo Solo Catálogo</p>
                        <p className="text-[11px] text-amber-700 font-medium">No existe un Ciclo Escolar activo ni en planeación. Puedes gestionar el catálogo de materias, pero las asignaciones y configuraciones de grupos están suspendidas.</p>
                    </div>
                    <button
                        onClick={() => router.visit(route('admin.dashboard'))}
                        className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-700 transition-all shrink-0"
                    >
                        Crear Ciclo
                    </button>
                </div>
            )}

            <SubjectTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenCreateModal={openCreateModal}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                groupsList={groupsList}
            />

            <Deferred data="materias" fallback={
                <DotsLoader
                    label="Cargando materias"
                    sublabel="Por favor espera un momento..."
                />
            }>
                <SubjectTable
                    subjects={filteredSubjects}
                    onOpenEditModal={openEditModal}
                    onDelete={handleDeleteSubject}
                />
            </Deferred>

            <SubjectFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
                specialties={especialidades}
            />
        </AdminPageLayout>
    );
}
