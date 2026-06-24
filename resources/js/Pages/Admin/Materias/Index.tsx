import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppTable from '@/Components/AppTable';
import { 
    Plus, 
    Trash2,
    BookOpen, 
    GraduationCap, 
    Briefcase, 
    X,
    Check,
    Hash,
    Search,
    Link2,
    Filter
} from 'lucide-react';

// Reusable components
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import QuickSummaryWidget from '@/Components/QuickSummaryWidget';
import QuickActionsWidget from '@/Components/QuickActionsWidget';
import DonutChartWidget from '@/Components/DonutChartWidget';

interface MockSubject {
    id: number;
    code: string;
    name: string;
    teacherName: string;
    linkedGroups: string[];
    description: string;
}

export default function MateriasIndex() {
    // 1. Datos simulados de materias
    const [subjects, setSubjects] = useState<MockSubject[]>([
        { 
            id: 1, 
            code: 'MAT-101', 
            name: 'Matemáticas I', 
            teacherName: 'Francisco Javier Martínez', 
            linkedGroups: ['1-A', '2-B'], 
            description: 'Álgebra básica, funciones y sistemas de ecuaciones lineales.' 
        },
        { 
            id: 2, 
            code: 'ESP-101', 
            name: 'Español I', 
            teacherName: 'María Elena Rodríguez', 
            linkedGroups: ['1-A'], 
            description: 'Redacción, análisis de textos literarios y gramática básica.' 
        },
        { 
            id: 3, 
            code: 'HIS-101', 
            name: 'Historia I', 
            teacherName: 'Humberto Soler Castro', 
            linkedGroups: ['1-A'], 
            description: 'Historia universal contemporánea y procesos sociales.' 
        },
        { 
            id: 4, 
            code: 'QMC-101', 
            name: 'Química I', 
            teacherName: 'Luisa Fernanda Vega', 
            linkedGroups: ['2-B'], 
            description: 'Introducción a la tabla periódica, enlaces y reacciones químicas.' 
        }
    ]);

    // Lista de profesores disponibles en el sistema (Mock)
    const teachersList = [
        'Francisco Javier Martínez',
        'María Elena Rodríguez',
        'Humberto Soler Castro',
        'Luisa Fernanda Vega',
        'Pendiente de Asignación'
    ];

    // Lista de grupos disponibles en el sistema (Mock)
    const groupsList = ['1-A', '2-B', '3-A'];

    // 2. Control de filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    // 3. Modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedSubject, setSelectedSubject] = useState<MockSubject | null>(null);

    // 4. Formulario
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        teacherName: 'Francisco Javier Martínez',
        linkedGroups: [] as string[],
        description: ''
    });

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filtrar Materias
    const filteredSubjects = subjects.filter(subject => {
        const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || subject.linkedGroups.includes(groupFilter);
        return matchesSearch && matchesGroup;
    });

    // Abrir agregar
    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ code: '', name: '', teacherName: teachersList[0], linkedGroups: [], description: '' });
        setIsModalOpen(true);
    };

    // Abrir editar
    const openEditModal = (subject: MockSubject) => {
        setModalMode('edit');
        setSelectedSubject(subject);
        setFormData({
            code: subject.code,
            name: subject.name,
            teacherName: subject.teacherName,
            linkedGroups: [...subject.linkedGroups],
            description: subject.description
        });
        setIsModalOpen(true);
    };

    // Guardar
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'create') {
            // Validar código duplicado
            if (subjects.some(s => s.code.toUpperCase() === formData.code.toUpperCase())) {
                alert('Ya existe una materia con ese código.');
                return;
            }
            const newSubject: MockSubject = {
                id: Date.now(),
                code: formData.code.toUpperCase(),
                name: formData.name,
                teacherName: formData.teacherName,
                linkedGroups: formData.linkedGroups,
                description: formData.description
            };
            setSubjects([newSubject, ...subjects]);
            triggerToast(`Materia "${formData.name}" dada de alta correctamente.`);
        } else if (modalMode === 'edit' && selectedSubject) {
            setSubjects(subjects.map(s => s.id === selectedSubject.id ? {
                ...s,
                code: formData.code.toUpperCase(),
                name: formData.name,
                teacherName: formData.teacherName,
                linkedGroups: formData.linkedGroups,
                description: formData.description
            } : s));
            triggerToast(`Materia "${formData.name}" actualizada.`);
        }
        setIsModalOpen(false);
    };

    // Eliminar
    const handleDelete = (subjectId: number, name: string) => {
        if (confirm(`¿Estás seguro de eliminar la materia "${name}"? Se perderán todas las asignaciones y calificaciones vinculadas.`)) {
            setSubjects(subjects.filter(s => s.id !== subjectId));
            triggerToast(`Materia "${name}" eliminada.`);
        }
    };

    // Toggle grupo seleccionado en el formulario
    const toggleGroupSelection = (group: string) => {
        if (formData.linkedGroups.includes(group)) {
            setFormData({
                ...formData,
                linkedGroups: formData.linkedGroups.filter(g => g !== group)
            });
        } else {
            setFormData({
                ...formData,
                linkedGroups: [...formData.linkedGroups, group]
            });
        }
    };

    // Estadísticas
    const totalCount = subjects.length;
    const withTeacherCount = subjects.filter(s => s.teacherName !== 'Pendiente de Asignación').length;
    const pendingTeacherCount = subjects.filter(s => s.teacherName === 'Pendiente de Asignación').length;

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Materias" />

            {/* Toast Alerta */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none animate-in fade-in slide-in-from-bottom-5">
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
                        title={`Gestión de materias (${totalCount})`}
                        subtitle="Registra asignaturas del plan de estudios y asocia docentes y grupos"
                        breadcrumb="Materias"
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
                                        placeholder="Buscar materia por código, nombre o docente..."
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
                                        Registrar Materia
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
                                                <option value="all">Todos los grupos</option>
                                                {groupsList.map((g, idx) => (
                                                    <option key={idx} value={g}>Grupo {g}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <AppTable
                                data={filteredSubjects}
                                keyExtractor={(item) => item.id}
                                emptyMessage="No se encontraron materias."
                                columns={[
                                    {
                                        header: "Código",
                                        accessor: (row) => row.code,
                                        className: "text-slate-500 font-mono text-[13px] font-bold",
                                    },
                                    {
                                        header: "Materia",
                                        accessor: (row) => (
                                            <div className="leading-tight max-w-xs text-left">
                                                <span className="text-slate-700 font-bold text-[15px] block">{row.name}</span>
                                                <span className="text-[10.5px] text-slate-400 font-medium block mt-0.5 truncate">{row.description || 'Sin descripción'}</span>
                                            </div>
                                        ),
                                    },
                                    {
                                        header: "Profesor Asignado",
                                        accessor: (row) => (
                                            <div className="leading-tight text-left">
                                                <span className={`text-[13px] font-bold block ${row.teacherName === 'Pendiente de Asignación' ? 'text-amber-505' : 'text-slate-700'}`}>
                                                    {row.teacherName}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                                    {row.teacherName === 'Pendiente de Asignación' ? 'Sin docente' : 'Docente titular'}
                                                </span>
                                            </div>
                                        ),
                                    },
                                    {
                                        header: "Grupos Vinculados",
                                        accessor: (row) => (
                                            <div className="flex flex-wrap gap-1.5 justify-start">
                                                {row.linkedGroups.length > 0 ? (
                                                    row.linkedGroups.map((g, idx) => (
                                                        <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                                            {g}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 text-xs font-medium italic">Sin vincular</span>
                                                )}
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
                            { code: "T1", label: "Materias totales", value: totalCount },
                            { code: "T2", label: "Asignadas", value: withTeacherCount },
                            { code: "T4", label: "Sin Docente", value: pendingTeacherCount }
                        ]}
                    />

                    {/* Quick Actions Widget */}
                    <QuickActionsWidget 
                        actions={[
                            { label: "Registrar Materia", onClick: openCreateModal },
                            { 
                                label: "Asignar Docente", 
                                onClick: () => alert("Haz clic en el botón 'Editar' que se encuentra en la columna 'Acciones' de la tabla para cambiar o asignar el profesor titular de la materia.") 
                            }
                        ]}
                    />

                    {/* Donut Chart Widget */}
                    <DonutChartWidget 
                        title="Distribución de Docentes"
                        centerLabel="materias"
                        segments={[
                            { name: "Asignadas", count: withTeacherCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                            { name: "Sin Asignar", count: pendingTeacherCount, color: "#e2e8f0", bulletClass: "bg-slate-200" }
                        ]}
                    />
                </div>
            </div>

            {/* Modal Formulario (Alta / Edición y Relaciones) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base">
                                {modalMode === 'create' ? 'Dar de Alta Nueva Materia' : 'Editar Configuración de Materia'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                {/* Código y Nombre */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5 col-span-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                                <Hash size={13} />
                                            </span>
                                            <input
                                                type="text"
                                                required
                                                placeholder="MAT-101"
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                                className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700 font-bold font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre de Materia</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ej: Matemáticas I"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700 font-bold"
                                        />
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descripción / Temario</label>
                                    <textarea
                                        rows={2}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descripción corta de la asignatura..."
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700 resize-none"
                                    />
                                </div>

                                {/* Docente Asignado */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profesor Asignado</label>
                                    <select
                                        value={formData.teacherName}
                                        onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                                        className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                    >
                                        {teachersList.map((t, idx) => (
                                            <option key={idx} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Vincular con Grupos */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-body">Vincular con Grupos</label>
                                    <div className="flex flex-wrap gap-2">
                                        {groupsList.map((g, idx) => {
                                            const isSelected = formData.linkedGroups.includes(g);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => toggleGroupSelection(g)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                                        isSelected 
                                                            ? 'bg-[#1e88e5] border-[#1e88e5] text-white shadow-none' 
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {isSelected && <Link2 size={12} />}
                                                    Grupo {g}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm">
                                    {modalMode === 'create' ? 'Dar de Alta' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
