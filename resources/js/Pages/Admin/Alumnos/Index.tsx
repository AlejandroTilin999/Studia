import { useState } from 'react';
import { Search, Filter, Plus } from "lucide-react";
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

interface BackendEnrollment {
    id: number;
    student_code: string;
    status: 'active' | 'suspended';
    user?: {
        id: number;
        name: string;
        email: string;
    };
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
    alumnos?: BackendEnrollment[];
    groups?: AcademicGroupProp[];
}

export default function AlumnosIndex({ alumnos = [], groups = [] }: AlumnosIndexProps) {
    // Mapeamos los datos unificando la inscripción del alumno (enrollment) y la cuenta global (user)
    const formattedStudents = alumnos.map(enrollment => ({
        id: enrollment.id,
        matricula: enrollment.student_code || 'S/M',
        name: enrollment.user?.name || 'Sin nombre asignado',
        email: enrollment.user?.email || 'sin-correo@studia.edu.mx',
        groupId: enrollment.academic_group?.id || 0,
        groupName: enrollment.academic_group?.name || 'Sin grupo',
        status: enrollment.status || 'active',
        grades: enrollment.grades?.map(g => ({
            subject: g.course?.name || 'Materia Desconocida',
            score: g.score,
            period: g.period || '2026-A'
        })) || []
    }));

    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isConfirmBajaOpen, setIsConfirmBajaOpen] = useState(false);
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
        if (modalMode === 'create') {
            post(route('admin.alumnos.store'), {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    triggerToast(`Estudiante registrado exitosamente.`);
                }
            });
        } else if (modalMode === 'edit' && selectedStudent) {
            put(route('admin.alumnos.update', selectedStudent.id), {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    triggerToast(`Datos actualizados correctamente.`);
                }
            });
        }
    };

    const toggleStatus = (student: any) => {
        router.post(route('admin.alumnos.toggle', student.id), {}, {
            onSuccess: () => {
                triggerToast(`Estatus modificado con éxito.`);
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
            align: "right",
            headerClassName: "text-right",
            accessor: (student) => (
                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => openEditModal(student)}
                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px] shadow-none transition-all"
                    >
                        Editar
                    </button>
                    <button 
                        onClick={() => {
                            if (student.status === 'active') {
                                setStudentToBaja(student);
                                setIsConfirmBajaOpen(true);
                            } else {
                                toggleStatus(student);
                            }
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
                { label: "Registrar alumno", onClick: openCreateModal }
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
                className="flex-1 border-none shadow-none rounded-none scrollbar-hide"
            />

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
                calculateGPA={calculateGPA}
            />

            {/* Modal de confirmación de Baja */}
            <ConfirmActionModal
                isOpen={isConfirmBajaOpen}
                onClose={() => {
                    setIsConfirmBajaOpen(false);
                    setStudentToBaja(null);
                }}
                onConfirm={() => toggleStatus(studentToBaja)}
                title="Suspender Alumno del Sistema"
                description={`Esta acción cambiará el estado de la matrícula de ${studentToBaja?.name || 'este alumno'} a 'Baja' (inactivo) de forma inmediata.`}
                confirmText={studentToBaja?.matricula || ''}
                actionPhrase="dar de baja"
                warningMessage="Al dar de baja al alumno, este perderá acceso completo al portal escolar de Studia y sus expedientes se pausarán."
                confirmLabel="Dar de Baja"
            />
        </AdminPageLayout>
    );
}