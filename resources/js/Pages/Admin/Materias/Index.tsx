import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Download, Layers, Users } from 'lucide-react';
import SubjectTable from './components/SubjectTable';
import SubjectTableControls from './components/SubjectTableControls';
import SubjectFormModal from './components/SubjectFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import ConfirmActionModal from '@/Components/ConfirmActionModal';
import { useToast } from '@/hooks/useToast';
import { useExportExcel } from '@/hooks/useExportExcel';
import { subjectService } from './services/subjectService';
import { MateriasIndexProps, SubjectFormatted } from './types';

export default function MateriasIndex({ materias = [], profesores = [], grupos = [] }: MateriasIndexProps) {
    const formattedSubjects: SubjectFormatted[] = materias.map(course => ({
        id: course.id,
        code: course.codigo || 'S/C',
        name: course.nombre || 'Sin nombre',
        teacherName: course.profesor || 'Pendiente de Asignación',
        linkedGroups: course.grupos || [],
        description: course.descripcion || 'Sin descripción disponible.'
    }));

    // Cargamos los grupos directamente desde la base de datos
    const groupsList = grupos.map(g => g.code);

    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedSubject, setSelectedSubject] = useState<SubjectFormatted | null>(null);
    
    const { toastMessage, triggerToast } = useToast();
    const { exportToExcel } = useExportExcel();
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [subjectToDelete, setSubjectToDelete] = useState<{ id: number; name: string } | null>(null);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

    // Formulario de Inertia
    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        code: '',
        name: '',
        description: '',
    });

    const handleExportExcel = () => {
        const headers = ["Código", "Nombre de la Materia", "Profesor Asignado", "Grupos Vinculados"];
        const rows = filteredSubjects.map(s => [
            s.code,
            s.name,
            s.teacherName,
            s.linkedGroups.join(', ') || 'Sin grupos'
        ]);

        exportToExcel(
            "Reporte de Materias - PrepaHid",
            "Plan de Estudios",
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
        return matchesSearch && matchesGroup;
    });

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (subject: SubjectFormatted) => {
        setModalMode('edit');
        setSelectedSubject(subject);
        setData({
            code: subject.code,
            name: subject.name,
            description: subject.description === 'Sin descripción disponible.' ? '' : subject.description,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');

        const submitOptions = {
            onSuccess: () => {
                setSaveStatus('success');
                reset();
                setTimeout(() => {
                    setIsModalOpen(false);
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
            subjectService.store(data, submitOptions);
        } else if (modalMode === 'edit' && selectedSubject) {
            subjectService.update(selectedSubject.id, data, submitOptions);
        }
    };

    const triggerDeleteConfirm = (id: number, name: string) => {
        setDeleteErrorMessage(null);
        setSubjectToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSubject = () => {
        if (subjectToDelete) {
            setDeleteStatus('saving');
            subjectService.destroy(subjectToDelete.id, {
                onSuccess: () => {
                    setDeleteStatus('success');
                    setTimeout(() => {
                        setIsDeleteModalOpen(false);
                        setDeleteStatus('idle');
                        setSubjectToDelete(null);
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

    const totalSubjectsCount = formattedSubjects.length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Materias"
            title={`Gestión de materias (${totalSubjectsCount})`}
            subtitle="Consulta, edita y registra planes de estudio y materias del ciclo"
            breadcrumb="Materias"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Materias totales", value: totalSubjectsCount },
                { code: "T3", label: "Activas en ciclo", value: totalSubjectsCount },
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
            {/* Controls */}
            <SubjectTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenCreateModal={openCreateModal}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                groupsList={groupsList}
            />

            {/* Table */}
            <SubjectTable
                subjects={filteredSubjects}
                onOpenEditModal={openEditModal}
                onDelete={triggerDeleteConfirm}
            />

            {/* Form Modal */}
            <SubjectFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    if (saveStatus === 'idle') {
                        setIsModalOpen(false);
                    }
                }}
                mode={modalMode}
                subject={selectedSubject}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
                saveStatus={saveStatus}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmActionModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    if (deleteStatus === 'idle') {
                        setIsDeleteModalOpen(false);
                        setSubjectToDelete(null);
                    }
                }}
                onConfirm={confirmDeleteSubject}
                title="¿Deseas eliminar esta materia?"
                description={`La materia "${subjectToDelete?.name || ''}" se eliminará permanentemente del plan de estudios escolar y no se podrá recuperar.`}
                confirmLabel="Eliminar materia"
                saveStatus={deleteStatus}
                processingLabel="Eliminando materia..."
                successLabel="¡Materia eliminada!"
                errorLabel={deleteErrorMessage || undefined}
            />
        </AdminPageLayout>
    );
}
