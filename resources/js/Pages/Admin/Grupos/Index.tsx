import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Download, Layers, Users } from 'lucide-react';
import GroupTable from './GroupTable';
import GroupTableControls from './GroupTableControls';
import GroupFormModal from './GroupFormModal';
import AdminPageLayout from '@/Components/AdminPageLayout';

interface GrupoBackend {
    id: number;
    codigo: string;
    nombre: string;
    turno: string;
    especialidad: string;
    teacher_id: number | null;
    profesor: string;
}

interface ProfesorSelect {
    id: number;
    nombre_completo: string;
}

interface GruposIndexProps {
    grupos?: GrupoBackend[];
    profesores?: ProfesorSelect[];
}

export default function GruposIndex({ grupos = [], profesores = [] }: GruposIndexProps) {
    const formattedGroups = grupos.map(g => ({
        id: g.id,
        code: g.codigo || 'S/C',
        name: g.nombre || 'Sin nombre',
        shift: g.turno || 'Horario único',
        teacherName: g.profesor || 'Pendiente de Asignación',
        teacher_id: g.teacher_id,
        specialty: g.especialidad || 'TI'
    }));

    const [searchQuery, setSearchQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Formulario reactivo de Inertia
    const { data, setData, post, put, reset, processing, errors } = useForm({
        code: '',
        name: '',
        shift: 'Horario único',
        specialty: 'TI',
        teacher_id: '' as string | number
    });

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleExportExcel = () => {
        const rows = filteredGroups.map(g => [
            g.code,
            g.name,
            g.shift,
            g.teacherName,
            g.specialty
        ]);
        
        const htmlTemplate = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
                <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Grupos Escolares</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; }
                    th { background-color: #1565c0; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                </style>
            </head>
            <body>
                <h2>Reporte de Grupos Académicos - PrepaHid</h2>
                <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre del Grupo</th>
                            <th>Turno</th>
                            <th>Tutor / Profesor Asignado</th>
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
        link.setAttribute("download", `reporte_grupos_${new Date().toISOString().slice(0,10)}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast("Reporte de grupos exportado a Excel con éxito.");
    };

    const filteredGroups = formattedGroups.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = specialtyFilter === 'all' || g.specialty === specialtyFilter;
        return matchesSearch && matchesSpecialty;
    });

    const openCreateModal = () => {
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (group: any) => {
        setSelectedGroup(group);
        setData({
            code: group.code,
            name: group.name,
            shift: group.shift,
            specialty: group.specialty,
            teacher_id: group.teacher_id ?? ''
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        post(route('groups.store'), {
            onSuccess: () => {
                setSaveStatus('success');
                reset();
                setTimeout(() => {
                    setIsCreateModalOpen(false);
                    setSaveStatus('idle');
                }, 2000);
            },
            onError: () => {
                setSaveStatus('error');
                setTimeout(() => {
                    setSaveStatus('idle');
                }, 2500);
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGroup) {
            setSaveStatus('saving');
            put(route('groups.update', selectedGroup.id), {
                onSuccess: () => {
                    setSaveStatus('success');
                    reset();
                    setTimeout(() => {
                        setIsEditModalOpen(false);
                        setSaveStatus('idle');
                    }, 2000);
                },
                onError: () => {
                    setSaveStatus('error');
                    setTimeout(() => {
                        setSaveStatus('idle');
                    }, 2500);
                }
            });
        }
    };

    const totalGroupsCount = formattedGroups.length;
    const shiftCount = Array.from(new Set(formattedGroups.map(g => g.shift))).length;

    return (
        <AdminPageLayout
            headTitle="Gestión de Grupos"
            title={`Gestión de grupos (${totalGroupsCount})`}
            subtitle="Consulta, edita y registra grupos académicos y tutores"
            breadcrumb="Grupos"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Grupos totales", value: totalGroupsCount },
                { code: "T3", label: "Turnos", value: shiftCount },
                { code: "T4", label: "Asignados", value: formattedGroups.filter(g => g.teacherName !== 'Pendiente de Asignación').length }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: Download },
                { label: "Gestionar materias", onClick: () => router.visit('/admin/materias'), icon: Layers },
                { label: "Gestionar profesores", onClick: () => router.visit('/admin/docentes'), icon: Users }
            ]}
            donutChartLabel="grupos"
            donutChartSegments={[
                { name: "Asignados", count: formattedGroups.filter(g => g.teacherName !== 'Pendiente de Asignación').length, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "Sin tutor", count: formattedGroups.filter(g => g.teacherName === 'Pendiente de Asignación').length, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {/* Controls */}
            <GroupTableControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                specialtyFilter={specialtyFilter}
                setSpecialtyFilter={setSpecialtyFilter}
                onOpenCreateModal={openCreateModal}
            />

            {/* Table */}
            <GroupTable
                groups={filteredGroups}
                onOpenEditModal={openEditModal}
            />

            {/* Create Modal */}
            <GroupFormModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    if (saveStatus === 'idle') {
                        setIsCreateModalOpen(false);
                    }
                }}
                mode="create"
                group={null}
                profesores={profesores}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleCreateSubmit}
                saveStatus={saveStatus}
            />

            {/* Edit Modal */}
            <GroupFormModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    if (saveStatus === 'idle') {
                        setIsEditModalOpen(false);
                    }
                }}
                mode="edit"
                group={selectedGroup}
                profesores={profesores}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleEditSubmit}
                saveStatus={saveStatus}
            />
        </AdminPageLayout>
    );
}
