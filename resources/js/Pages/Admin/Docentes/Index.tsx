import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppTable from '@/Components/AppTable';
import { 
    Search, 
    Filter, 
    Plus, 
    Calendar, 
    Phone, 
    Mail, 
    Hash, 
    GraduationCap, 
    X, 
    Check,
    BookOpen,
    Eye,
    Trash2
} from "lucide-react";

// Reusable components
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import QuickSummaryWidget from '@/Components/QuickSummaryWidget';
import QuickActionsWidget from '@/Components/QuickActionsWidget';
import DonutChartWidget from '@/Components/DonutChartWidget';

interface MockTeacher {
    id: number;
    matricula: string;
    name: string;
    email: string;
    phone: string;
    specialty: string;
    assignments: { subject: string; groupName: string }[];
}

export default function DocentesIndex() {
    // 1. Initial teachers mock database keeping the original records
    const [teachers, setTeachers] = useState<MockTeacher[]>([
        { 
            id: 1, 
            matricula: 'P001',
            name: 'Francisco Javier Martínez', 
            email: 'f.martinez@prepahidalgo.edu.mx', 
            phone: '7711234567', 
            specialty: 'Ciencias Exactas e Ingeniería',
            assignments: [
                { subject: 'Matemáticas I', groupName: '1-A' },
                { subject: 'Física I', groupName: '2-B' },
            ]
        },
        { 
            id: 2, 
            matricula: 'P002',
            name: 'María Elena Rodríguez', 
            email: 'm.rodriguez@prepahidalgo.edu.mx', 
            phone: '7712223344', 
            specialty: 'Lenguaje y Comunicación',
            assignments: [
                { subject: 'Español I', groupName: '1-A' },
            ]
        },
        { 
            id: 3, 
            matricula: 'P003',
            name: 'Humberto Soler Castro', 
            email: 'h.soler@prepahidalgo.edu.mx', 
            phone: '7715556677', 
            specialty: 'Historia y Ciencias Sociales',
            assignments: [
                { subject: 'Historia I', groupName: '1-A' },
            ]
        },
        { 
            id: 4, 
            matricula: 'P004',
            name: 'Luisa Fernanda Vega', 
            email: 'l.vega@prepahidalgo.edu.mx', 
            phone: '7719998877', 
            specialty: 'Química y Biología',
            assignments: [
                { subject: 'Química I', groupName: '2-B' },
            ]
        }
    ]);

    // 2. React state for search & filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    // 3. Form & Assignments Modals State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTeacher, setSelectedTeacher] = useState<MockTeacher | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: ''
    });

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filter Logic
    const filteredTeachers = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        teacher.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dynamic stats
    const totalTeachersCount = teachers.length;

    // Handlers
    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', phone: '', specialty: '' });
        setIsFormModalOpen(true);
    };

    const openEditModal = (teacher: MockTeacher) => {
        setModalMode('edit');
        setSelectedTeacher(teacher);
        setFormData({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone,
            specialty: teacher.specialty
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'create') {
            const nextId = teachers.length + 1;
            const newTeacher: MockTeacher = {
                id: Date.now(),
                matricula: `P${nextId < 10 ? '00' + nextId : nextId < 100 ? '0' + nextId : nextId}`,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                specialty: formData.specialty,
                assignments: []
            };
            setTeachers([...teachers, newTeacher]);
            triggerToast(`Docente "${formData.name}" registrado correctamente.`);
        } else if (modalMode === 'edit' && selectedTeacher) {
            setTeachers(teachers.map(t => t.id === selectedTeacher.id ? {
                ...t,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                specialty: formData.specialty
            } : t));
            triggerToast(`Datos de "${formData.name}" actualizados.`);
        }
        setIsFormModalOpen(false);
    };

    const handleDelete = (teacherId: number, name: string) => {
        if (confirm(`¿Estás seguro de eliminar al docente "${name}"? Se perderán todas sus asignaciones académicas.`)) {
            setTeachers(teachers.filter(t => t.id !== teacherId));
            triggerToast(`Docente "${name}" eliminado del sistema.`);
        }
    };

    const openAssignmentsModal = (teacher: MockTeacher) => {
        setSelectedTeacher(teacher);
        setIsAssignmentsModalOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Profesores" />

            {/* Toast Alert */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none">
                    <div className="bg-[#1e88e5] p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Layout Wrapper split into Main Content and Right Sidebar */}
            <div className="flex flex-col lg:flex-row bg-[#f5f7fb] min-h-[calc(100vh-64px)] font-body overflow-x-hidden -m-6 md:-m-8">
                
                {/* Main Content Column */}
                <div className="flex-1 flex flex-col min-w-0">
                    
                    {/* Header Banner */}
                    <PageHeaderBanner 
                        title={`Gestión de profesores (${totalTeachersCount})`}
                        subtitle="Consulta, edita y registra"
                        breadcrumb="Profesores"
                    />

                    {/* Table Filters & Content Area */}
                    <div className="p-0 md:p-6 flex-1 overflow-hidden flex flex-col">
                        <div className="bg-white rounded-none md:rounded-xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 flex-1 flex flex-col min-h-0">
                            
                            {/* Controls: Search and Actions */}
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar profesor"
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
                                        Registrar profesor
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
                                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Especialidad</span>
                                            <select
                                                value={searchQuery}
                                                onChange={e => {
                                                    setSearchQuery(e.target.value === 'all' ? '' : e.target.value);
                                                    setShowFiltersDropdown(false);
                                                }}
                                                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 focus:outline-none"
                                            >
                                                <option value="all">Todas las especialidades</option>
                                                <option value="Ciencias">Ciencias</option>
                                                <option value="Lenguaje">Lenguaje</option>
                                                <option value="Historia">Historia</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
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
                                        header: "Materia asignada",
                                        accessor: (row) => (
                                            <div className="flex flex-col text-left">
                                                <span className="text-[13px] text-slate-700 font-bold">
                                                    {row.assignments.map(a => a.subject).join(', ') || 'Sin materias'}
                                                </span>
                                                {row.assignments.length > 0 && (
                                                    <button 
                                                        onClick={() => openAssignmentsModal(row)}
                                                        className="text-[10.5px] text-[#1e88e5] font-extrabold hover:underline text-left mt-0.5"
                                                    >
                                                        Ver asignaciones ({row.assignments.length})
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
                                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{row.phone}</span>
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
                                                    className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px] shadow-none transition-all"
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(row.id, row.name)}
                                                    className="font-bold h-8 px-5 rounded-lg text-[12px] transition-all bg-rose-50 hover:bg-rose-100 text-rose-600"
                                                    title="Eliminar Registro"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="w-full lg:w-[320px] bg-white border-l border-slate-100 p-6 space-y-8 shrink-0">

                    {/* Quick Summary Widget */}
                    <QuickSummaryWidget 
                        metrics={[
                            { code: "T1", label: "Profesores", value: 20 },
                            { code: "T2", label: "Por Horas", value: 5 },
                            { code: "T4", label: "Tiempo Completo", value: 15 }
                        ]}
                    />

                    {/* Quick Actions Widget */}
                    <QuickActionsWidget 
                        actions={[
                            { label: "Registrar profesor", onClick: openCreateModal },
                            { 
                                label: "Configuración de Ciclo", 
                                onClick: () => alert("Módulo de configuración de Ciclo Escolar disponible en Inicio.") 
                            }
                        ]}
                    />

                    {/* Donut Chart Widget */}
                    <DonutChartWidget 
                        title="Entrega de Calificaciones"
                        centerLabel="Totales"
                        segments={[
                            { name: "Profesores Al Corriente", count: 16, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                            { name: "Profesores Pendientes", count: 4, color: "#e2e8f0", bulletClass: "bg-slate-200" }
                        ]}
                    />
                </div>
            </div>

            {/* Modal: Create/Edit Teacher */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base">
                                {modalMode === 'create' ? 'Registrar Nuevo Docente' : 'Editar Expediente de Docente'}
                            </h3>
                            <button onClick={() => setIsFormModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Francisco Javier Martínez"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                            <Mail size={14} />
                                        </span>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="correo.docente@prepahidalgo.edu.mx"
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                                <Phone size={14} />
                                            </span>
                                            <input
                                                type="text"
                                                required
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="Ej: 7711234567"
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Área de Especialidad</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.specialty}
                                            onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                                            placeholder="Ciencias, Humanidades..."
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm">
                                    {modalMode === 'create' ? 'Registrar' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Asignaciones Académicas */}
            {isAssignmentsModalOpen && selectedTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-5 bg-[#1e88e5] text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/10 rounded-lg text-white">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-white text-base">Asignación Académica</h3>
                                    <p className="text-[10px] text-blue-100 font-medium">Materias e integrantes asignados.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAssignmentsModalOpen(false)} className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 bg-slate-50 border-b border-slate-100 text-[11px]">
                            <span className="text-slate-400 font-bold uppercase tracking-wider block">Profesor</span>
                            <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{selectedTeacher.name}</span>
                            <span className="text-[10.5px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-100 inline-block mt-2">{selectedTeacher.specialty}</span>
                        </div>

                        <div className="p-6 space-y-4">
                            <h4 className="font-bold text-slate-800 text-xs">Materias y Grupos a Cargo</h4>
                            
                            {selectedTeacher.assignments.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedTeacher.assignments.map((asg, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-lg text-slate-600 border border-slate-100">
                                                    <GraduationCap size={16} />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 block text-xs">{asg.subject}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Ciclo Escolar 2026-A</span>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg">
                                                Grupo {asg.groupName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    Este profesor aún no cuenta con materias asignadas para el ciclo actual.
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setIsAssignmentsModalOpen(false)} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold">
                                Cerrar Ventana
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
