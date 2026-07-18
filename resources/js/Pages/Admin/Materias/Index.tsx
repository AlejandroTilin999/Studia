import { useState } from 'react';
import { useForm, router, Deferred } from '@inertiajs/react';
import { Download, Layers, Users } from 'lucide-react';
import DotsLoader from '@/Components/ui/DotsLoader';
import SubjectTable from './components/SubjectTable';
import SubjectTableControls from './components/SubjectTableControls';
import SubjectFormModal from './components/SubjectFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import { SwalHelper } from '@/utils/SwalHelper';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { subjectService } from './services/subjectService';
import { MateriasIndexProps, SubjectFormatted } from './types';

export default function MateriasIndex({ materias = [], profesores = [], grupos = [], especialidades = [], activePeriod }: any) {
    const formattedSubjects: SubjectFormatted[] = materias.map((course: any) => ({
        id: course.id,
        code: course.codigo || 'S/C',
        name: course.nombre || 'Sin nombre',
        semestre: course.semestre || 1,
        tipo: course.tipo || 'General',
        area: course.area || '',
        teacherName: course.profesor || 'Pendiente de Asignación',
        teacher_id: course.docente_id,
        linkedGroups: course.grupos || [],
        description: course.descripcion || 'Sin descripción disponible.',
        specialties: course.especialidades?.map((e: any) => ({ id: e.id, name: e.nombre })) || []
    }));

    const groupsList = grupos.map((g: any) => g.codigo);

    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [parityFilter, setParityFilter] = useState<'all' | 'current' | 'other'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedSubject, setSelectedSubject] = useState<SubjectFormatted | null>(null);

    const { triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();

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
            s.area || 'N/A',
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
            (msg) => triggerToast("Reporte de materias exportado a Excel con éxito.")
        );
    };

    const filteredSubjects = formattedSubjects.filter(subject => {
        const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || subject.linkedGroups.includes(groupFilter);

        let matchesParity = true;
        if (parityFilter === 'current' && activePeriod) {
            matchesParity = activePeriod.es_nones ? subject.semestre % 2 !== 0 : subject.semestre % 2 === 0;
        } else if (parityFilter === 'other' && activePeriod) {
            matchesParity = activePeriod.es_nones ? subject.semestre % 2 === 0 : subject.semestre % 2 !== 0;
        }

        return matchesSearch && matchesGroup && matchesParity;
    });

    const openCreateModal = () => {
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
            descripcion: subject.description === 'Sin descripción disponible.' ? '' : subject.description,
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

    const totalSubjectsCount = formattedSubjects.length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Materias"
            title={`Gestión de materias (${totalSubjectsCount})`}
            subtitle={activePeriod ? `Ciclo Activo: ${activePeriod.nombre} (${activePeriod.es_nones ? 'Semestres Nones' : 'Semestres Pares'})` : "Consulta, edita y registra planes de estudio"}
            breadcrumb="Materias"
            metrics={[
                { code: "T1", label: "Materias totales", value: totalSubjectsCount },
                { code: "T3", label: "En ciclo actual", value: formattedSubjects.filter(s => activePeriod ? (activePeriod.es_nones ? s.semestre % 2 !== 0 : s.semestre % 2 === 0) : true).length },
                { code: "T4", label: "Sin docente", value: formattedSubjects.filter(s => s.teacherName === 'Pendiente de Asignación').length }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: Download },
                { label: "Estructurar grupos", onClick: () => router.visit('/admin/grupos'), icon: Layers },
                { label: "Gestionar profesores", onClick: () => router.visit('/admin/docentes'), icon: Users }
            ]}
            donutChartLabel="materias"
            donutChartSegments={[
                { name: "Con docente", count: formattedSubjects.filter(s => s.teacherName !== 'Pendiente de Asignación').length, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "Sin docente", count: formattedSubjects.filter(s => s.teacherName === 'Pendiente de Asignación').length, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            <SubjectTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenCreateModal={openCreateModal}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                groupsList={groupsList}
                parityFilter={parityFilter === 'all' ? 'all' : 'current'}
                setParityFilter={(val) => setParityFilter(val as any)}
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
                subject={selectedSubject}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
                profesores={profesores}
                grupos={grupos}
                specialties={especialidades}
                existingCodes={formattedSubjects.map(s => s.code)}
                activePeriod={activePeriod}
            />
        </AdminPageLayout>
    );
}
