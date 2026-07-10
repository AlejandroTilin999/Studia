import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppTable from '@/Components/AppTable';
import { 
    Search, 
    Plus, 
    X, 
    Check,
    BookOpen,
    GraduationCap
} from "lucide-react";

import PageHeaderBanner from '@/Components/PageHeaderBanner';
import QuickSummaryWidget from '@/Components/QuickSummaryWidget';
import DonutChartWidget from '@/Components/DonutChartWidget';

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

export default function DocentesIndex({ teachers: backendTeachers = [] }: { teachers: TeacherFromBackend[] }) {
    
    const formattedTeachers = backendTeachers.map((t) => {
        const nombreCompleto = `${t.nombre || ''} ${t.apellido_paterno || ''} ${t.apellido_materno || ''}`.trim() || 'Sin nombre';
        const correoDocente = t.email || (t.employee_code ? `${t.employee_code.toLowerCase()}@studia.edu.mx` : 'docente@studia.edu.mx');

        return {
            id: t.id,
            matricula: t.employee_code || 'S/M',
            name: nombreCompleto,
            rawNombre: t.nombre,
            rawPaterno: t.apellido_paterno,
            rawMaterno: t.apellido_materno || '',
            email: correoDocente,
            phone: t.phone || '',
            specialty: t.specialty || 'General',
            assignments: t.courses?.map(c => ({
                id: c.id, 
                subject: c.name,
                groupName: 'Asignado'
            })) || []
        };
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        phone: '',
        specialty: '',
        course_ids: [] as number[]
    });

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredTeachers = formattedTeachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        teacher.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.matricula.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalTeachersCount = filteredTeachers.length;

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        setIsFormModalOpen(true);
    };

    const openEditModal = (teacher: any) => {
        setModalMode('edit');
        setSelectedTeacher(teacher);
        
        const currentCourseIds = teacher.assignments ? teacher.assignments.map((a: any) => a.id) : [];

        setData({
            nombre: teacher.rawNombre,
            apellido_paterno: teacher.rawPaterno,
            apellido_materno: teacher.rawMaterno,
            phone: teacher.phone,
            specialty: teacher.specialty,
            course_ids: currentCourseIds
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (modalMode === 'create') {
            post(route('admin.docentes.store'), {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    triggerToast("¡Profesor registrado con éxito!");
                }
            });
        } else {
            put(route('admin.docentes.update', selectedTeacher.id), {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    triggerToast("¡Expediente actualizado con éxito!");
                }
            });
        }
    };

    const openAssignmentsModal = (teacher: any) => {
        setSelectedTeacher(teacher);
        setIsAssignmentsModalOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Profesores - Studia" />

            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm">
                    <div className="bg-[#1e88e5] p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row bg-[#f5f7fb] min-h-[calc(100vh-64px)] font-body overflow-x-hidden -m-6 md:-m-8">
                <div className="flex-1 flex flex-col min-w-0">
                    <PageHeaderBanner 
                        title={`Gestión de profesores (${totalTeachersCount})`}
                        subtitle="Consulta, edita y registra expedientes de personal docente"
                        breadcrumb="Profesores"
                    />

                    <div className="p-0 md:p-6 flex-1 overflow-hidden flex flex-col">
                        <div className="bg-white rounded-none md:rounded-xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 flex-1 flex flex-col min-h-0">
                            
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar profesor por nombre, matrícula o especialidad..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-0 shadow-none text-slate-700 text-left"
                                    />
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button 
                                        onClick={openCreateModal}
                                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-lg flex-1 md:flex-initial text-sm flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Registrar profesor
                                    </button>
                                </div>
                            </div>

                            <AppTable
                                data={filteredTeachers}
                                keyExtractor={(item) => item.id}
                                emptyMessage="No se encontraron profesores coincidentes."
                                columns={[
                                    {
                                        header: "Matrícula",
                                        accessor: (row) => row.matricula,
                                        className: "text-slate-500 font-medium text-[13px]",
                                    },
                                    {
                                        header: "Nombre",
                                        accessor: (row) => (
                                            <div className="leading-tight text-left">
                                                <span className="text-slate-700 font-bold text-[15px] block">{row.name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{row.specialty}</span>
                                            </div>
                                        ),
                                    },
                                    {
                                        header: "Materias asignadas",
                                        accessor: (row) => (
                                            <div className="flex flex-col text-left">
                                                <span className="text-[13px] text-slate-700 font-bold">
                                                    {row.assignments.length > 0 
                                                        ? row.assignments.map(a => a.subject).join(', ') 
                                                        : 'Sin materias asignadas'}
                                                </span>
                                                {row.assignments.length > 0 && (
                                                    <button 
                                                        onClick={() => openAssignmentsModal(row)}
                                                        className="text-[10.5px] text-[#1e88e5] font-extrabold hover:underline text-left mt-0.5"
                                                    >
                                                        Ver todas ({row.assignments.length})
                                                    </button>
                                                )}
                                            </div>
                                        ),
                                    },
                                    {
                                        header: "Contacto",
                                        accessor: (row) => (
                                            <div className="leading-tight text-left">
                                                <span className="text-slate-500 font-medium text-[13px] block">{row.email}</span>
                                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{row.phone || 'Sin teléfono'}</span>
                                            </div>
                                        ),
                                    },
                                    {
                                        header: "Acciones",
                                        align: "right",
                                        accessor: (row) => (
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openEditModal(row)}
                                                    className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px] shadow-none"
                                                >
                                                    Editar
                                                </button>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[320px] bg-white border-l border-slate-100 p-6 space-y-8 shrink-0">
                    <QuickSummaryWidget 
                        metrics={[
                            { code: "T1", label: "Profesores Totales", value: totalTeachersCount },
                            { code: "T2", label: "Por Horas / Adjuntos", value: 0 },
                            { code: "T4", label: "Tiempo Completo", value: totalTeachersCount }
                        ]}
                    />
                    <DonutChartWidget 
                        title="Entrega de Calificaciones"
                        centerLabel="Cierres"
                        segments={[
                            { name: "Al Corriente", count: totalTeachersCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                            { name: "Pendientes", count: 0, color: "#e2e8f0", bulletClass: "bg-slate-200" }
                        ]}
                    />
                </div>
            </div>

            {/* MODAL DEL FORMULARIO CONECTADO */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base">
                                {modalMode === 'create' ? 'Registrar Nuevo Docente' : 'Editar Expediente de Docente'}
                            </h3>
                            <button onClick={() => setIsFormModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4 text-left">
                                {/* Nombre */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                                        Nombre(s) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.nombre}
                                        onChange={e => setData('nombre', e.target.value)}
                                        className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-xs text-slate-700 text-left ${errors.nombre ? 'border-red-500' : 'border-slate-100'}`}
                                    />
                                    {errors.nombre && <span className="text-red-500 text-[10px] font-semibold block">{errors.nombre}</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Apellido Paterno */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                                            Apellido Paterno <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.apellido_paterno}
                                            onChange={e => setData('apellido_paterno', e.target.value)}
                                            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-xs text-slate-700 text-left ${errors.apellido_paterno ? 'border-red-500' : 'border-slate-100'}`}
                                        />
                                        {errors.apellido_paterno && <span className="text-red-500 text-[10px] font-semibold block">{errors.apellido_paterno}</span>}
                                    </div>

                                    {/* Apellido Materno */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">Apellido Materno</label>
                                        <input
                                            type="text"
                                            value={data.apellido_materno}
                                            onChange={e => setData('apellido_materno', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 text-left"
                                        />
                                        {errors.apellido_materno && <span className="text-red-500 text-[10px] font-semibold block">{errors.apellido_materno}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Celular / Teléfono (10 Dígitos obligatorios) */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                                            Celular (10 dígitos) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            maxLength={10}
                                            pattern="[0-9]{10}"
                                            title="El número de teléfono debe constar de exactamente 10 dígitos numéricos."
                                            placeholder="Ej. 5512345678"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value.replace(/\D/g, ''))}
                                            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-xs text-slate-700 text-left ${errors.phone ? 'border-red-500' : 'border-slate-100'}`}
                                        />
                                        {errors.phone && <span className="text-red-500 text-[10px] font-semibold block">{errors.phone}</span>}
                                    </div>

                                    {/* Especialidad */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                                            Especialidad / Área <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.specialty}
                                            onChange={e => setData('specialty', e.target.value)}
                                            className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-xs text-slate-700 text-left ${errors.specialty ? 'border-red-500' : 'border-slate-100'}`}
                                        />
                                        {errors.specialty && <span className="text-red-500 text-[10px] font-semibold block">{errors.specialty}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold">
                                    {processing ? 'Procesando...' : modalMode === 'create' ? 'Registrar Profesor' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Asignaciones */}
            {isAssignmentsModalOpen && selectedTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 bg-[#1e88e5] text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <BookOpen size={20} />
                                <div className="text-left">
                                    <h3 className="font-extrabold text-white text-base">Materias a Cargo</h3>
                                    <p className="text-[10px] text-blue-100 font-medium">Asignaciones académicas activas del docente</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAssignmentsModalOpen(false)} className="text-blue-100 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 bg-slate-50 border-b border-slate-100 text-left">
                            <span className="text-slate-400 text-[10px] font-bold uppercase block">Profesor</span>
                            <span className="font-extrabold text-slate-800 text-sm block mt-0.5">{selectedTeacher.name}</span>
                        </div>

                        <div className="p-6 space-y-3 max-h-60 overflow-y-auto">
                            {selectedTeacher.assignments && selectedTeacher.assignments.length > 0 ? (
                                selectedTeacher.assignments.map((assignment: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <GraduationCap className="text-slate-500" size={18} />
                                            <span className="font-bold text-slate-800 text-xs">{assignment.subject}</span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-extrabold rounded">Ciclo Escolar</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs">
                                    Este profesor aún no cuenta con asignaciones académicas.
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setIsAssignmentsModalOpen(false)} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}