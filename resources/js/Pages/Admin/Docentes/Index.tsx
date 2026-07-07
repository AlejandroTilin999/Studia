import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Download, Layers, FileText } from 'lucide-react';
import TeacherFormModal from './TeacherFormModal';
import TeacherAssignmentsModal from './TeacherAssignmentsModal';
import TeacherTableControls from "./TeacherTableControls";
import TeacherTable from "./TeacherTable";
import AdminPageLayout from '@/Components/AdminPageLayout';
import ConfirmActionModal from '@/Components/ConfirmActionModal';

interface TeacherFromBackend {
    id: number;
    employee_code: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    specialty: string;
    phone: string | null;
    email?: string;
    courses?: {
        id: number;
        name: string;
        code: string;
    }[];
}

interface DocentesIndexProps {
    teachers?: TeacherFromBackend[];
}

export default function DocentesIndex({ teachers: backendTeachers = [] }: DocentesIndexProps) {
    const formattedTeachers = backendTeachers.map((t) => {
        const nombreCompleto = `${t.nombre || ''} ${t.apellido_paterno || ''} ${t.apellido_materno || ''}`.trim() || 'Sin nombre';
        const correoDocente = t.email || (t.employee_code ? `${t.employee_code.toLowerCase()}@prepahidalgo.edu.mx` : 'docente@prepahidalgo.edu.mx');

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
                groupName: 'Asignado'
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
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [teacherToDelete, setTeacherToDelete] = useState<any>(null);

    // FORMULARIO DE INERTIA CONECTADO AL BACKEND
    const { data, setData, post, put, reset, processing, errors } = useForm({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        phone: '',
        specialty: ''
    });

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleExportExcel = () => {
        const rows = filteredTeachers.map(t => [
            t.matricula,
            t.name,
            t.email,
            t.phone,
            t.specialty
        ]);
        
        const htmlTemplate = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
                <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Listado de Docentes</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; }
                    th { background-color: #1565c0; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                </style>
            </head>
            <body>
                <h2>Reporte de Docentes - PrepaHid</h2>
                <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Matrícula</th>
                            <th>Nombre Completo</th>
                            <th>Correo Electrónico</th>
                            <th>Teléfono</th>
                            <th>Especialidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => `
                            <tr>
                                <td>${r[0]}</td>
                                <td>${r[1]}</td>
                                <td>${r[2]}</td>
                                <td>${r[3]}</td>
                                <td>${r[4]}</td>
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
        link.setAttribute("download", `reporte_docentes_${new Date().toISOString().slice(0,10)}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast("Reporte de docentes exportado a Excel con éxito.");
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
            nombre: teacher.rawNombre,
            apellido_paterno: teacher.rawPaterno,
            apellido_materno: teacher.rawMaterno,
            phone: teacher.phone === 'Sin teléfono' ? '' : teacher.phone,
            specialty: teacher.specialty
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        if (modalMode === 'create') {
            post(route('admin.docentes.store'), {
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
            });
        } else {
            put(route('admin.docentes.update', selectedTeacher.id), {
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
            });
        }
    };

    const triggerDeleteConfirm = (teacher: any) => {
        setTeacherToDelete(teacher);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTeacher = () => {
        if (teacherToDelete) {
            setDeleteStatus('saving');
            router.delete(route('admin.docentes.destroy', teacherToDelete.id), {
                onSuccess: () => {
                    setDeleteStatus('success');
                    setTimeout(() => {
                        setIsDeleteModalOpen(false);
                        setDeleteStatus('idle');
                        setTeacherToDelete(null);
                    }, 2000);
                },
                onError: () => {
                    setDeleteStatus('error');
                    setTimeout(() => {
                        setDeleteStatus('idle');
                    }, 2550);
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
                onViewAssignments={openAssignmentsModal}
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
            />
        </AdminPageLayout>
    );
}
