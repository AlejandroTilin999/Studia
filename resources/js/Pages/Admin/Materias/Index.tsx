import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Download, Layers, Users } from 'lucide-react';
import SubjectTable from './SubjectTable';
import SubjectTableControls from './SubjectTableControls';
import SubjectFormModal from './SubjectFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import ConfirmActionModal from '@/Components/ConfirmActionModal';

interface MateriaBackend {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    profesor: string;
    grupos: string[];
}

interface MateriasIndexProps {
    materias?: MateriaBackend[];
}

export default function MateriasIndex({ materias = [] }: MateriasIndexProps) {
    const formattedSubjects = materias.map(course => ({
        id: course.id,
        code: course.codigo || 'S/C',
        name: course.nombre || 'Sin nombre',
        teacherName: course.profesor || 'Pendiente de Asignación',
        linkedGroups: course.grupos || [],
        description: course.descripcion || 'Sin descripción disponible.'
    }));

    // List of teachers (hardcoded to align with DB IDs on main)
    const teachersList = [
        { id: '1', name: 'Francisco Javier Martínez' },
        { id: '2', name: 'María Elena Rodríguez' },
        { id: '3', name: 'Humberto Soler Castro' },
        { id: '4', name: 'Luisa Fernanda Vega' },
    ];

    const groupsList = ['1-A', '2-B', '3-A'];

    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [subjectToDelete, setSubjectToDelete] = useState<{ id: number; name: string } | null>(null);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

    // Formulario de Inertia
    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        code: '',
        name: '',
        description: '',
        teacher_id: '' as string | number,
        linked_groups: [] as string[]
    });

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleExportExcel = () => {
        const rows = filteredSubjects.map(s => [
            s.code,
            s.name,
            s.teacherName,
            s.linkedGroups.join(', ') || 'Sin grupos'
        ]);
        
        const htmlTemplate = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
                <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Plan de Estudios</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; }
                    th { background-color: #1565c0; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                </style>
            </head>
            <body>
                <h2>Reporte de Materias - PrepaHid</h2>
                <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre de la Materia</th>
                            <th>Profesor Asignado</th>
                            <th>Grupos Vinculados</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => `
                            <tr>
                                <td>${r[0]}</td>
                                <td>${r[1]}</td>
                                <td>${r[2]}</td>
                                <td>${r[3]}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([htmlTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_materias_${new Date().toISOString().slice(0,10)}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast("Reporte de materias exportado a Excel con éxito.");
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

    const openEditModal = (subject: any) => {
        setModalMode('edit');
        setSelectedSubject(subject);
        // Find teacher ID from hardcoded list matching name
        const matchTeacher = teachersList.find(t => t.name === subject.teacherName);
        setData({
            code: subject.code,
            name: subject.name,
            description: subject.description === 'Sin descripción disponible.' ? '' : subject.description,
            teacher_id: matchTeacher ? matchTeacher.id : '',
            linked_groups: subject.linkedGroups
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        if (modalMode === 'create') {
            post(route('materias.store'), {
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
            });
        } else if (modalMode === 'edit' && selectedSubject) {
            put(route('materias.update', selectedSubject.id), {
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
            });
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
            destroy(route('materias.destroy', subjectToDelete.id), {
                onSuccess: () => {
                    setDeleteStatus('success');
                    setTimeout(() => {
                        setIsDeleteModalOpen(false);
                        setDeleteStatus('idle');
                        setSubjectToDelete(null);
                    }, 2000);
                },
                onError: (err) => {
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
                teachersList={teachersList}
                groupsList={groupsList}
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
