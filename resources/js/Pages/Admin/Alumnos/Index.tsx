import { useState } from 'react';
import { Search, Filter, Plus, Download, Layers, FileText } from "lucide-react";
import { Head, useForm, router } from '@inertiajs/react';
import AppTable, { AppTableColumn } from '@/Components/AppTable';
import StudentFormModal from './StudentFormModal';
import StudentKardexModal from './StudentKardexModal';
import AdminPageLayout from '@/Components/AdminPageLayout';
import ConfirmActionModal from '@/Components/ConfirmActionModal';

interface BackendGrade {
    id: number;
    score: number;
    period: string;
    course?: {
        id: number;
        name: string;
    };
}

interface BackendStudent {
    id: number;
    matricula: string;
    name: string;
    email: string;
    status?: 'active' | 'suspended';
    academic_group?: {
        id: number;
        name: string;
    };
    grades?: BackendGrade[];
}

interface AcademicGroupProp {
    id: number;
    name: string;
    code: string;
}

interface AlumnosIndexProps {
    alumnos?: BackendStudent[];
    groups?: AcademicGroupProp[];
}

export default function AlumnosIndex({ alumnos = [], groups = [] }: AlumnosIndexProps) {
    // Mapeamos los datos simplificados directamente de la tabla única de alumnos
    const formattedStudents = alumnos.map(student => ({
        id: student.id,
        matricula: student.matricula || 'S/M',
        name: student.name || 'Sin nombre asignado',
        email: student.email || 'sin-correo@prepahidalgo.edu.mx',
        groupId: student.academic_group?.id || 0,
        groupName: student.academic_group?.name || 'Sin grupo',
        status: student.status || 'active',
        grades: student.grades?.map(g => ({
            subject: g.course?.name || 'Materia Desconocida',
            score: g.score,
            period: g.period || '2026-A'
        })) || []
    }));

    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isConfirmBajaOpen, setIsConfirmBajaOpen] = useState(false);
    const [bajaStatus, setBajaStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [studentToBaja, setStudentToBaja] = useState<any>(null);

    // FORMULARIO INTEGRADO A LAS TABLAS USERS Y ENROLLMENTS
    const { data, setData, post, put, reset, processing, errors } = useForm({
        nombre: '',
        email: '',
        academic_group_id: groups[0]?.id || '',
        status: 'active' as 'active' | 'suspended'
    });

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleExportExcel = () => {
        const rows = filteredStudents.map(s => [
            s.matricula,
            s.name,
            s.email,
            s.groupName,
            s.status === 'active' ? 'Activo' : 'Inactivo'
        ]);
        
        const htmlTemplate = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
                <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Listado de Alumnos</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; }
                    th { background-color: #1565c0; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                </style>
            </head>
            <body>
                <h2>Reporte de Alumnos - PrepaHid</h2>
                <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Matrícula</th>
                            <th>Nombre Completo</th>
                            <th>Correo Electrónico</th>
                            <th>Grupo Asignado</th>
                            <th>Estado Matrícula</th>
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
        link.setAttribute("download", `reporte_alumnos_${new Date().toISOString().slice(0,10)}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast("Reporte de alumnos exportado a Excel con éxito.");
    };

    const filteredStudents = formattedStudents.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.matricula.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || student.groupId.toString() === groupFilter;
        return matchesSearch && matchesGroup;
    });

    const activeCount = formattedStudents.filter(s => s.status === 'active').length;
    const inactiveCount = formattedStudents.filter(s => s.status === 'suspended').length;
    const totalCount = formattedStudents.length;

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        setIsFormModalOpen(true);
    };

    const openEditModal = (student: any) => {
        setModalMode('edit');
        setSelectedStudent(student);
        setData({
            nombre: student.name,
            email: student.email,
            academic_group_id: student.groupId,
            status: student.status
        });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        if (modalMode === 'create') {
            post(route('admin.alumnos.store'), {
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
                }
            });
        } else if (modalMode === 'edit' && selectedStudent) {
            put(route('admin.alumnos.update', selectedStudent.id), {
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
                }
            });
        }
    };

    const toggleStatus = (student: any) => {
        setBajaStatus('saving');
        router.post(route('admin.alumnos.toggle', student.id), {}, {
            onSuccess: () => {
                setBajaStatus('success');
                setTimeout(() => {
                    setIsConfirmBajaOpen(false);
                    setBajaStatus('idle');
                    setStudentToBaja(null);
                }, 2000);
            },
            onError: () => {
                setBajaStatus('error');
                setTimeout(() => {
                    setBajaStatus('idle');
                }, 2500);
            }
        });
    };

    const openKardexModal = (student: any) => {
        setSelectedStudent(student);
        setIsKardexModalOpen(true);
    };

    const calculateGPA = (grades: { score: number }[]) => {
        if (grades.length === 0) return '0.0';
        const sum = grades.reduce((acc, curr) => acc + Number(curr.score), 0);
        return (sum / grades.length).toFixed(1);
    };

    const mainColumns: AppTableColumn<any>[] = [
        {
            header: "Matrícula",
            accessor: (student) => student.matricula,
            align: "left",
            className: "text-slate-500 font-medium text-[13px] h-16",
        },
        {
            header: "Nombre",
            accessor: (student) => (
                <div className="leading-tight">
                    <span className="text-slate-700 font-bold text-[15px] block">{student.name}</span>
                    <span className="text-[10.5px] text-slate-400 font-medium">{student.email}</span>
                </div>
            ),
            align: "left",
            className: "px-2",
        },
        {
            header: "Grado y grupo",
            accessor: (student) => student.groupName,
            align: "left",
            className: "text-slate-500 font-medium text-[13px]",
        },
        {
            header: "Kardex",
            align: "center",
            headerClassName: "text-center",
            accessor: (student) => (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        openKardexModal(student);
                    }}
                    className="bg-[#e3f2fd] hover:bg-[#bbdefb] text-[#1e88e5] font-black h-8 px-4 rounded-lg text-[12px] transition-all"
                >
                    Ver
                </button>
            )
        },
        {
            header: "Acciones",
            align: "left",
            headerClassName: "text-left",
            accessor: (student) => (
                <div className="flex items-center justify-start gap-2" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => openEditModal(student)}
                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px] shadow-none transition-all"
                    >
                        Editar
                    </button>
                    <button 
                        onClick={() => {
                            setStudentToBaja(student);
                            setIsConfirmBajaOpen(true);
                        }}
                        className={`font-bold h-8 px-5 rounded-lg text-[12px] transition-all ${
                            student.status === 'active' 
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                        }`}
                    >
                        {student.status === 'active' ? 'Baja' : 'Alta'}
                    </button>
                </div>
            )
        }
    ];

    return (
        <AdminPageLayout
            headTitle="Gestión de Alumnos"
            title={`Gestión de alumnos (${totalCount})`}
            subtitle="Consulta, edita y registra expedientes e inscripciones escolares"
            breadcrumb="Alumnos"
            toastMessage={toastMessage}
            metrics={[
                { code: "T1", label: "Alumnos totales", value: totalCount },
                { code: "T3", label: "Activos", value: activeCount },
                { code: "T4", label: "De baja", value: inactiveCount }
            ]}
            quickActions={[
                { label: "Exportar listado (Excel)", onClick: handleExportExcel, icon: Download },
                { label: "Estructurar grupos", onClick: () => router.visit('/admin/grupos'), icon: Layers },
                { label: "Ver reportes escolares", onClick: () => router.visit('/admin/reportes'), icon: FileText }
            ]}
            donutChartLabel="alumnos"
            donutChartSegments={[
                { name: "Activos", count: activeCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                { name: "De baja", count: inactiveCount, color: "#e2e8f0", bulletClass: "bg-slate-200" }
            ]}
        >
            {/* Controls: Search and Actions */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, matrícula o correo..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-0 shadow-none text-slate-700 placeholder-slate-400"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto relative">
                    <button
                        onClick={openCreateModal}
                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-lg flex-1 md:flex-initial text-sm transition-all shadow-none flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Registrar alumno
                    </button>

                    <button
                        onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                        className="h-12 border border-slate-200 text-slate-500 font-bold rounded-lg flex-1 md:flex-initial gap-2 px-8 text-sm hover:bg-slate-50 transition-all flex items-center justify-center"
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>

                    {/* Dropdown Filters Selector */}
                    {showFiltersDropdown && (
                        <div className="absolute right-0 top-14 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-3.5 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Filtrar por grupo</span>
                            <select
                                value={groupFilter}
                                onChange={e => {
                                    setGroupFilter(e.target.value);
                                    setShowFiltersDropdown(false);
                                }}
                                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 focus:outline-none"
                            >
                                <option value="all">Todos los Grupos</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id.toString()}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <AppTable
                columns={mainColumns}
                data={filteredStudents}
                keyExtractor={(student) => student.id}
                emptyMessage="No se encontraron alumnos coincidentes."
                className="flex-1 scrollbar-hide"
            />

            {/* Modal: Add/Edit student */}
            <StudentFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    if (saveStatus === 'idle') {
                        setIsFormModalOpen(false);
                    }
                }}
                mode={modalMode}
                student={selectedStudent}
                groups={groups}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleFormSubmit}
                saveStatus={saveStatus}
            />

            {/* Modal: Kardex View */}
            <StudentKardexModal
                isOpen={isKardexModalOpen}
                onClose={() => setIsKardexModalOpen(false)}
                student={selectedStudent}
                onDownloadKardex={(student) => {
                    triggerToast(`Descargando Kardex oficial de ${student.name}...`);
                }}
                calculateGPA={calculateGPA}
            />

            {/* Modal de confirmación de Baja */}
            {/* Modal de confirmación de Baja / Alta */}
            <ConfirmActionModal
                isOpen={isConfirmBajaOpen}
                onClose={() => {
                    if (bajaStatus === 'idle') {
                        setIsConfirmBajaOpen(false);
                        setStudentToBaja(null);
                    }
                }}
                onConfirm={() => toggleStatus(studentToBaja)}
                title={studentToBaja?.status === 'active' ? "Suspender Alumno del Sistema" : "Reactivar Alumno en el Sistema"}
                description={
                    studentToBaja?.status === 'active'
                        ? `Esta acción cambiará el estado de la matrícula de ${studentToBaja?.name || 'este alumno'} a 'Baja' (inactivo) de forma inmediata.`
                        : `Esta acción reactivará la matrícula de ${studentToBaja?.name || 'este alumno'} a 'Activo' de forma inmediata.`
                }
                confirmText={studentToBaja?.matricula || ''}
                actionPhrase={studentToBaja?.status === 'active' ? "dar de baja" : "dar de alta"}
                warningMessage={
                    studentToBaja?.status === 'active'
                        ? "Al dar de baja al alumno, este perderá acceso completo al portal escolar de PrepaHid y sus expedientes se pausarán."
                        : "Al dar de alta al alumno, este recuperará su acceso completo al portal escolar y sus expedientes se reactivarán."
                }
                confirmLabel={studentToBaja?.status === 'active' ? "Dar de Baja" : "Dar de Alta"}
                confirmButtonVariant={studentToBaja?.status === 'active' ? 'danger' : 'primary'}
                saveStatus={bajaStatus}
                processingLabel={studentToBaja?.status === 'active' ? "Dando de baja al alumno..." : "Dando de alta al alumno..."}
                successLabel={studentToBaja?.status === 'active' ? "¡Alumno dado de baja!" : "¡Alumno reactivado!"}
            />
        </AdminPageLayout>
    );
}