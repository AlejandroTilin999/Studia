import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    X,
    Check,
    Download,
    Folder,
    Mail,
    Hash
} from "lucide-react";

import PageHeaderBanner from '@/Components/PageHeaderBanner';
import QuickSummaryWidget from '@/Components/QuickSummaryWidget';
import QuickActionsWidget from '@/Components/QuickActionsWidget';
import DonutChartWidget from '@/Components/DonutChartWidget';

interface BackendGrade {
    id: number;
    score: number;
    period: string;
    course?: {
        id: number;
        name: string;
    };
}

// ✅ Modificado para coincidir con el nuevo modelo unificado de Students
interface BackendStudent {
    id: number;
    matricula: string;
    name: string;
    email: string;
    status: 'active' | 'suspended';
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
    alumnos?: BackendStudent[]; // ✅ Ahora recibe directamente el arreglo de estudiantes
    groups?: AcademicGroupProp[];
}

export default function AlumnosIndex({ alumnos = [], groups = [] }: AlumnosIndexProps) {
    
    // ✅ Mapeo simplificado directo desde la tabla única de alumnos
    const formattedStudents = alumnos.map(student => ({
        id: student.id,
        matricula: student.matricula || 'S/M',
        name: student.name || 'Sin nombre asignado',
        email: student.email || 'sin-correo@studia.edu.mx',
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
    const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // ✅ Formulario sincronizado con las propiedades nativas de la tabla única
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

    const handleSubmit = (e: React.FormEvent) => {
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

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Alumnos - Studia" />

            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none">
                    <div className="bg-[#1e88e5] p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row bg-[#f5f7fb] min-h-[calc(100vh-64px)] font-body overflow-x-hidden -m-6 md:-m-8">
                <div className="flex-1 flex flex-col min-w-0">
                    <PageHeaderBanner
                        title={`Gestión de alumnos (${totalCount})`}
                        subtitle="Consulta, edita y registra expedientes e inscripciones escolares"
                        breadcrumb="Alumnos"
                    />

                    <div className="p-0 md:p-6 flex-1 overflow-hidden flex flex-col">
                        <div className="bg-white rounded-none md:rounded-xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 flex-1 flex flex-col min-h-0">

                            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, matrícula o correo..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-0 text-slate-700 placeholder-slate-400"
                                    />
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto relative">
                                    <button
                                        onClick={openCreateModal}
                                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-lg flex-1 md:flex-initial text-sm flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Registrar alumno
                                    </button>

                                    <button
                                        onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                                        className="h-12 border border-slate-200 text-slate-500 font-bold rounded-lg flex-1 md:flex-initial gap-2 px-8 text-sm hover:bg-slate-50 flex items-center justify-center"
                                    >
                                        <Filter className="w-4 h-4" />
                                        Filtros
                                    </button>

                                    {showFiltersDropdown && (
                                        <div className="absolute right-0 top-14 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-4 space-y-2">
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
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-transparent border-b border-slate-100">
                                        <tr>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2">Matrícula</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2">Nombre</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2">Grado y grupo</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 text-center px-2">Kardex</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 text-right px-2">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => (
                                                <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="text-slate-500 font-medium h-16 text-[13px] px-2">{student.matricula}</td>
                                                    <td className="px-2 leading-tight">
                                                        <span className="text-slate-700 font-bold text-[15px] block">{student.name}</span>
                                                        <span className="text-[10.5px] text-slate-400 font-medium">{student.email}</span>
                                                    </td>
                                                    <td className="text-slate-500 font-medium text-[13px] px-2">{student.groupName}</td>
                                                    <td className="text-center px-2">
                                                        <button 
                                                            onClick={() => openKardexModal(student)}
                                                            className="bg-[#e3f2fd] hover:bg-[#bbdefb] text-[#1e88e5] font-black h-8 px-4 rounded-lg text-[12px]"
                                                        >
                                                            Ver historial
                                                        </button>
                                                    </td>
                                                    <td className="text-right px-2">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => openEditModal(student)}
                                                                className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px]"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button 
                                                                onClick={() => toggleStatus(student)}
                                                                className={`font-bold h-8 px-5 rounded-lg text-[12px] ${
                                                                    student.status === 'active' 
                                                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' 
                                                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                                                                }`}
                                                            >
                                                                {student.status === 'active' ? 'Baja' : 'Alta'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-2 py-12 text-center text-slate-400 text-xs">
                                                    No se encontraron alumnos registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[320px] bg-white border-l border-slate-100 p-6 space-y-8 shrink-0 text-left">
                    <QuickSummaryWidget
                        metrics={[
                            { code: "T1", label: "Alumnos totales", value: totalCount },
                            { code: "T3", label: "Activos (Alta)", value: activeCount },
                            { code: "T4", label: "Inactivos (Baja)", value: inactiveCount }
                        ]}
                    />
                    <QuickActionsWidget
                        actions={[
                            { label: "Registrar nuevo alumno", onClick: openCreateModal }
                        ]}
                    />
                    <DonutChartWidget
                        centerLabel="alumnos"
                        segments={[
                            { name: "Activos", count: activeCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                            { name: "De baja", count: inactiveCount, color: "#e2e8f0", bulletClass: "bg-slate-200" }
                        ]}
                    />
                </div>
            </div>

            {/* Modal de Registro / Edición */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base">
                                {modalMode === 'create' ? 'Inscribir Nuevo Alumno' : 'Modificar Matrícula de Alumno'}
                            </h3>
                            <button onClick={() => setIsFormModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4 text-left">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5 col-span-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Matrícula</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                                <Hash size={13} />
                                            </span>
                                            <input
                                                type="text"
                                                readOnly
                                                value={modalMode === 'create' ? 'AUTO' : selectedStudent?.matricula}
                                                className="w-full pl-8 pr-2 py-2 bg-slate-100 border-0 rounded-lg font-mono text-xs font-bold text-slate-500 focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre Completo</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.nombre}
                                            onChange={e => setData('nombre', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico (Acceso)</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                            <Mail size={14} />
                                        </span>
                                        <input
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700"
                                        />
                                    </div>
                                    {errors.email && <span className="text-red-500 text-[10px]">{errors.email}</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grupo Asignado</label>
                                        <select
                                            value={data.academic_group_id}
                                            onChange={e => setData('academic_group_id', Number(e.target.value))}
                                            className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700"
                                        >
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estatus Inicial</label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value as any)}
                                            className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700"
                                        >
                                            <option value="active">Alta (Activo)</option>
                                            <option value="suspended">Baja (Suspendido)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold">
                                    {processing ? 'Guardando...' : modalMode === 'create' ? 'Registrar Matrícula' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Kardex */}
            {isKardexModalOpen && selectedStudent && (() => {
                const displayGrades = selectedStudent.grades;
                const gpa = calculateGPA(displayGrades);
                const approvedCount = displayGrades.filter((g: any) => g.score >= 6).length;
                const totalGrades = displayGrades.length;

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-4xl rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
                            <div className="px-6 py-5 bg-[#1e88e5] text-white flex justify-between items-center">
                                <h3 className="font-black text-white text-lg tracking-tight">Kardex Académico Oficial</h3>
                                <button onClick={() => setIsKardexModalOpen(false)} className="text-white/80 hover:text-white bg-white/10 p-2 rounded-lg">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 bg-white space-y-6 text-left">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-3 bg-[#f8fafc] border-l-4 border-l-[#1e88e5] border border-slate-200/60 rounded-xl p-5 flex flex-col justify-between">
                                        <h4 className="text-xl font-black text-slate-800 leading-tight">{selectedStudent.name}</h4>
                                        <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
                                            <div>
                                                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Matrícula</span>
                                                <span className="font-extrabold text-slate-700 text-sm block">{selectedStudent.matricula}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Grado y grupo</span>
                                                <span className="font-extrabold text-slate-700 text-sm block">{selectedStudent.groupName}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Estatus</span>
                                                <span className="font-extrabold text-slate-700 text-sm block">
                                                    {selectedStudent.status === 'active' ? 'Activo' : 'Baja'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#f8fafc] border border-slate-200/60 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Promedio General</span>
                                        <span className="text-5xl font-black text-[#1e88e5] mt-2 block leading-none">{gpa}</span>
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase h-11 text-[11px]">
                                                <th className="px-6 py-2.5">Ciclo Escolar</th>
                                                <th className="px-6 py-2.5">Materia</th>
                                                <th className="px-6 py-2.5">Calificación</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                                            {displayGrades.length > 0 ? (
                                                displayGrades.map((grade: any, idx: number) => (
                                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/20 h-12">
                                                        <td className="px-6 py-2.5 font-extrabold text-[#1e88e5]">{grade.period}</td>
                                                        <td className="px-6 py-2.5 text-slate-600 font-semibold">{grade.subject}</td>
                                                        <td className="px-6 py-2.5 text-slate-700 font-medium">{grade.score}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-xs">
                                                        Sin calificaciones asentadas en el sistema.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                        <Folder size={18} className="text-[#1e88e5]" />
                                        <span>Materias Evaluadas: ({approvedCount}/{totalGrades})</span>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <button 
                                            type="button" 
                                            onClick={() => triggerToast(`Descargando PDF de Kardex de ${selectedStudent.name}...`)}
                                            className="px-6 h-10 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <span>Descargar kardex oficial</span>
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </AuthenticatedLayout>
    );
}