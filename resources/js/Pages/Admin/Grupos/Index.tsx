import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppTable from '@/Components/AppTable';
import { 
    Plus, 
    X,
    Check,
    Search,
    Filter,
    ArrowRight
} from 'lucide-react';
import { router } from '@inertiajs/react';

// Reusable components
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import QuickSummaryWidget from '@/Components/QuickSummaryWidget';
import QuickActionsWidget from '@/Components/QuickActionsWidget';

interface GroupRecord {
    id: number;
    code: string;
    name: string;
    shift: string;
    teacherName: string;
    specialty: 'TI' | 'Gastronomía' | 'Biotecnología';
}

export default function GruposIndex() {
    // 1. Datos iniciales simulados que coinciden exactamente con la maqueta
    const [groups, setGroups] = useState<GroupRecord[]>([
        { id: 1, code: 'MAT1', name: '1er Año TI', shift: 'Horario único', teacherName: 'Ing. Uriel Cambron', specialty: 'TI' },
        { id: 2, code: 'TI001', name: '1er Año gastronomía', shift: 'Horario único', teacherName: 'DP. Ana Karen', specialty: 'Gastronomía' },
        { id: 3, code: 'GAS01', name: '2do año TI', shift: 'Horario único', teacherName: 'Chef Ana', specialty: 'TI' },
        { id: 4, code: 'TI001', name: '2do Año gastronomía', shift: 'Horario único', teacherName: 'Ing. Uriel Cambron', specialty: 'Gastronomía' },
        { id: 5, code: 'TI001', name: '1er Año TI', shift: 'Horario único', teacherName: 'DP. Ana Karen', specialty: 'TI' },
        { id: 6, code: 'MAT1', name: '1er Año gastronomía', shift: 'Horario único', teacherName: 'Chef Ana', specialty: 'Gastronomía' },
        { id: 7, code: 'TI001', name: '1er Año gastronomía', shift: 'Horario único', teacherName: 'Chef Ana', specialty: 'Gastronomía' },
        { id: 8, code: 'GAS01', name: '2do año TI', shift: 'Horario único', teacherName: 'Chef Ana', specialty: 'TI' },
        { id: 9, code: 'BIO01', name: '1er Año Biotecnología', shift: 'Horario único', teacherName: 'Dra. Carmen Solís', specialty: 'Biotecnología' },
        { id: 10, code: 'BIO02', name: '2do Año Biotecnología', shift: 'Horario único', teacherName: 'Dr. Luis Morales', specialty: 'Biotecnología' }
    ]);

    const teachersList = [
        'Ing. Uriel Cambron',
        'DP. Ana Karen',
        'Chef Ana',
        'Dra. Carmen Solís',
        'Dr. Luis Morales',
        'Pendiente de Asignación'
    ];

    // 2. Control de filtros y búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    // 3. Modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupRecord | null>(null);

    // 4. Formulario de Grupo
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        shift: 'Horario único',
        specialty: 'TI' as 'TI' | 'Gastronomía' | 'Biotecnología',
        teacherName: 'Ing. Uriel Cambron'
    });

    // Formulario de Asignación de Profesor
    const [assignTeacherData, setAssignTeacherData] = useState({
        groupCode: 'MAT1',
        teacherName: 'Ing. Uriel Cambron'
    });

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filtrar Grupos
    const filteredGroups = groups.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = specialtyFilter === 'all' || g.specialty === specialtyFilter;
        return matchesSearch && matchesSpecialty;
    });

    // Crear grupo
    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        const newRecord: GroupRecord = {
            id: Date.now(),
            code: formData.code.toUpperCase(),
            name: formData.name,
            shift: formData.shift,
            teacherName: formData.teacherName,
            specialty: formData.specialty
        };
        setGroups([...groups, newRecord]);
        setIsCreateModalOpen(false);
        triggerToast(`Grupo "${formData.name}" creado correctamente.`);
    };

    // Abrir modal de edición
    const openEditModal = (group: GroupRecord) => {
        setSelectedGroup(group);
        setFormData({
            code: group.code,
            name: group.name,
            shift: group.shift,
            specialty: group.specialty,
            teacherName: group.teacherName
        });
        setIsEditModalOpen(true);
    };

    // Editar grupo
    const handleEditGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGroup) {
            setGroups(groups.map(g => g.id === selectedGroup.id ? {
                ...g,
                code: formData.code.toUpperCase(),
                name: formData.name,
                shift: formData.shift,
                teacherName: formData.teacherName,
                specialty: formData.specialty
            } : g));
            setIsEditModalOpen(false);
            triggerToast(`Grupo "${formData.name}" actualizado.`);
        }
    };

    // Asignar Profesor
    const handleAssignTeacherSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setGroups(groups.map(g => g.code === assignTeacherData.groupCode ? {
            ...g,
            teacherName: assignTeacherData.teacherName
        } : g));
        setIsAssignTeacherModalOpen(false);
        triggerToast(`Profesor asignado al grupo con éxito.`);
    };

    // Estadísticas
    const totalCount = groups.length;
    const gastroCount = groups.filter(g => g.specialty === 'Gastronomía').length;
    const bioCount = groups.filter(g => g.specialty === 'Biotecnología').length;

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Grupos" />

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
                        title="Administración de grupos"
                        subtitle="Consulta y gestiona todos los grupos de la universidad"
                        breadcrumb="Grupos"
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
                                        placeholder="Buscar grupo..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-0 shadow-none text-slate-700 placeholder-slate-400"
                                    />
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto relative">
                                    <button 
                                        onClick={() => router.visit('/admin/materias')}
                                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-lg flex-1 md:flex-initial text-sm transition-all shadow-none flex items-center justify-center gap-2"
                                    >
                                        Buscar materias
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
                                                value={specialtyFilter}
                                                onChange={e => {
                                                    setSpecialtyFilter(e.target.value);
                                                    setShowFiltersDropdown(false);
                                                }}
                                                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 focus:outline-none"
                                            >
                                                <option value="all">Todas</option>
                                                <option value="TI">Tecnologías de la Información (TI)</option>
                                                <option value="Gastronomía">Gastronomía</option>
                                                <option value="Biotecnología">Biotecnología</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <AppTable
                                data={filteredGroups}
                                keyExtractor={(item) => item.id}
                                emptyMessage="No se encontraron grupos coincidentes."
                                columns={[
                                    {
                                        header: "Código",
                                        accessor: (row) => row.code,
                                        className: "text-slate-500 font-mono text-[13px] font-bold",
                                    },
                                    {
                                        header: "Nombre del grupo",
                                        accessor: (row) => (
                                            <div className="leading-tight text-left">
                                                <span className="text-slate-700 font-bold text-[15px] block">{row.name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{row.specialty}</span>
                                            </div>
                                        ),
                                    },
                                    {
                                        header: "Turno",
                                        accessor: "shift",
                                        className: "text-slate-500 font-medium text-[13px]",
                                    },
                                    {
                                        header: "Profesor Asignado",
                                        accessor: (row) => (
                                            <div className="leading-tight text-left">
                                                <span className={`text-[13px] font-bold block ${row.teacherName === 'Pendiente de Asignación' ? 'text-amber-505' : 'text-slate-700'}`}>
                                                    {row.teacherName}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Tutor titular</span>
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
                            { code: "T1", label: "Grupos totales", value: totalCount },
                            { code: "T4", label: "Gastronomía", value: gastroCount },
                            { code: "T2", label: "Biotecnología", value: bioCount }
                        ]}
                    />

                    {/* Quick Actions Widget */}
                    <QuickActionsWidget 
                        actions={[
                            { label: "Crear nuevo grupo", onClick: () => setIsCreateModalOpen(true) },
                            { label: "Asignar profesor", onClick: () => setIsAssignTeacherModalOpen(true) }
                        ]}
                    />
                </div>
            </div>

            {/* Modal: Crear Grupo */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base">Crear Nuevo Grupo</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateGroup}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código del Grupo</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: MAT1, TI001"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700 font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre del Grupo</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: 1er Año TI"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700 font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Turno</label>
                                        <select
                                            value={formData.shift}
                                            onChange={e => setFormData({ ...formData, shift: e.target.value })}
                                            className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                        >
                                            <option value="Horario único">Horario único</option>
                                            <option value="Matutino">Matutino</option>
                                            <option value="Vespertino">Vespertino</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Especialidad</label>
                                        <select
                                            value={formData.specialty}
                                            onChange={e => setFormData({ ...formData, specialty: e.target.value as any })}
                                            className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                        >
                                            <option value="TI">TI</option>
                                            <option value="Gastronomía">Gastronomía</option>
                                            <option value="Biotecnología">Biotecnología</option>
                                        </select>
                                    </div>
                                </div>
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
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm">
                                    Crear Grupo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Grupo */}
            {isEditModalOpen && selectedGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base">Editar Grupo {selectedGroup.name}</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleEditGroup}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código del Grupo</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700 font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre del Grupo</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700 font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Turno</label>
                                        <select
                                            value={formData.shift}
                                            onChange={e => setFormData({ ...formData, shift: e.target.value })}
                                            className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                        >
                                            <option value="Horario único">Horario único</option>
                                            <option value="Matutino">Matutino</option>
                                            <option value="Vespertino">Vespertino</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Especialidad</label>
                                        <select
                                            value={formData.specialty}
                                            onChange={e => setFormData({ ...formData, specialty: e.target.value as any })}
                                            className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                        >
                                            <option value="TI">TI</option>
                                            <option value="Gastronomía">Gastronomía</option>
                                            <option value="Biotecnología">Biotecnología</option>
                                        </select>
                                    </div>
                                </div>
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
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Asignar Profesor */}
            {isAssignTeacherModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base">Asignar Profesor a Grupo</h3>
                            <button onClick={() => setIsAssignTeacherModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAssignTeacherSubmit}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seleccionar Grupo (Código)</label>
                                    <select
                                        value={assignTeacherData.groupCode}
                                        onChange={e => setAssignTeacherData({ ...assignTeacherData, groupCode: e.target.value })}
                                        className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                    >
                                        {groups.map((g) => (
                                            <option key={g.id} value={g.code}>{g.name} ({g.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profesor Titular</label>
                                    <select
                                        value={assignTeacherData.teacherName}
                                        onChange={e => setAssignTeacherData({ ...assignTeacherData, teacherName: e.target.value })}
                                        className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                    >
                                        {teachersList.map((t, idx) => (
                                            <option key={idx} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsAssignTeacherModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm">
                                    Asignar Profesor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
