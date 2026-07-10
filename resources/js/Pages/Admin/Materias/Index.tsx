import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    X,
    Check,
    Hash
} from "lucide-react";

import PageHeaderBanner from '@/Components/PageHeaderBanner';
import QuickSummaryWidget from '@/Components/QuickSummaryWidget';
import QuickActionsWidget from '@/Components/QuickActionsWidget';

interface MateriaBackend {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    profesor: string;
    grupos: string[];
}

interface MateriasIndexProps {
    materias: MateriaBackend[];
}

export default function Index({ materias = [] }: MateriasIndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Formulario de InertiaJS
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        code: '',
        name: '',
        description: '',
        teacher_id: '', 
        linked_groups: [] as string[] 
    });

    // Autogeneración automática del código de la asignatura (solo al crear)
    useEffect(() => {
        if (modalMode === 'create' && data.name.trim().length >= 3) {
            const prefix = data.name.trim().substring(0, 3).toUpperCase();
            const suffix = data.teacher_id ? `-${data.teacher_id}` : '-00';
            setData('code', `${prefix}${suffix}`);
        }
    }, [data.name, data.teacher_id, modalMode]);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filtros de búsqueda en tiempo real en el cliente
    const filteredCourses = materias.filter(course => {
        const matchesSearch = 
            course.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.profesor.toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesGroup = groupFilter === 'all' || course.grupos.includes(groupFilter);
        return matchesSearch && matchesGroup;
    });

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (course: MateriaBackend) => {
        setModalMode('edit');
        setSelectedId(course.id);
        setData({
            code: course.codigo,
            name: course.nombre,
            description: course.descripcion === 'Sin descripción disponible' ? '' : course.descripcion,
            teacher_id: '1', // ID referencial simulado para tu select de docentes
            linked_groups: course.grupos || []
        });
        setIsModalOpen(true);
    };

    // Agregar o remover del array reactivo los grupos seleccionados/deseleccionados
    const toggleGroupSelection = (groupCode: string) => {
        if (data.linked_groups.includes(groupCode)) {
            setData('linked_groups', data.linked_groups.filter(g => g !== groupCode));
        } else {
            setData('linked_groups', [...data.linked_groups, groupCode]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (modalMode === 'create') {
            post(route('materias.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    triggerToast(`Materia "${data.name}" creada con éxito.`);
                    reset();
                }
            });
        } else {
            put(route('materias.update', selectedId!), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    triggerToast(`Materia "${data.name}" actualizada con éxito.`);
                }
            });
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar la materia de ${name}?`)) {
            destroy(route('materias.destroy', id), {
                onSuccess: () => triggerToast(`Materia "${name}" eliminada correctamente.`)
            });
        }
    };

    // Listado único de grupos extraído de las materias cargadas para filtros y checkboxes
    const todosLosGrupos = Array.from(new Set(materias.flatMap(m => m.grupos || [])));
    const gruposDisponiblesModal = todosLosGrupos.length > 0 ? todosLosGrupos : ["1-A", "2-B", "3-A"];

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Materias" />

            {/* Notificaciones Toast */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none">
                    <div className="bg-[#1e88e5] p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row bg-[#f5f7fb] min-h-[calc(100vh-64px)] overflow-x-hidden -m-6 md:-m-8">
                {/* Contenido Principal */}
                <div className="flex-1 flex flex-col min-w-0">
                    <PageHeaderBanner
                        title={`Gestión de materias (${materias.length})`}
                        subtitle="Configura el mapa curricular, asignaturas y profesores"
                        breadcrumb="Materias"
                    />

                    <div className="p-0 md:p-6 flex-1 overflow-hidden flex flex-col">
                        <div className="bg-white rounded-none md:rounded-xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 flex-1 flex flex-col min-h-0">
                            
                            {/* Herramientas superiores */}
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

                                    {showFiltersDropdown && (
                                        <div className="absolute right-0 top-14 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-3.5 space-y-2">
                                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Filtrar por Grupo</span>
                                            <select
                                                value={groupFilter}
                                                onChange={e => {
                                                    setGroupFilter(e.target.value);
                                                    setShowFiltersDropdown(false);
                                                }}
                                                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 focus:outline-none"
                                            >
                                                <option value="all">Todos los Grupos</option>
                                                {todosLosGrupos.map(g => (
                                                    <option key={g} value={g}>Grupo {g}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tabla de Resultados */}
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-transparent border-b border-slate-100">
                                        <tr>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2 w-[15%]">Código</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2 w-[35%]">Materia</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2 w-[25%]">Profesor Asignado</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2 w-[13%]">Grupos Vinculados</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 text-right px-2 w-[12%]">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredCourses.length > 0 ? (
                                            filteredCourses.map((course) => (
                                                <tr key={course.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="text-slate-500 font-medium h-20 text-[13px] px-2 font-mono">
                                                        {course.codigo}
                                                    </td>
                                                    <td className="px-2 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-700 font-bold text-[15px] leading-snug">
                                                                {course.nombre}
                                                            </span>
                                                            <span className="text-slate-400 text-xs font-normal mt-0.5 max-w-sm line-clamp-2">
                                                                {course.descripcion}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-600 font-semibold text-[14px]">
                                                                {course.profesor}
                                                            </span>
                                                            <span className="text-slate-400 text-[11px] mt-0.5">
                                                                Docente titular
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-4">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {course.grupos && course.grupos.map((group, i) => (
                                                                <span key={i} className="bg-slate-50 border border-slate-200 text-slate-600 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight">
                                                                    {group}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="text-right px-2 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openEditModal(course)}
                                                                className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px] shadow-none transition-all"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(course.id, course.nombre)}
                                                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold h-8 px-4 rounded-lg text-[12px] transition-all"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-2 py-12 text-center text-slate-400 text-xs">
                                                    No se encontraron asignaturas registradas en la base de datos.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lateral derecha */}
                <div className="w-full lg:w-[320px] bg-white border-l border-slate-100 p-6 space-y-8 shrink-0">
                    <QuickSummaryWidget
                        metrics={[
                            { code: "M1", label: "Materias Totales", value: materias.length },
                            { code: "M2", label: "Profesores Con Carga", value: new Set(materias.map(c => c.profesor).filter(p => p !== 'Sin profesor asignado')).size },
                            { code: "M3", label: "Grupos Atendidos", value: todosLosGrupos.length }
                        ]}
                    />

                    <QuickActionsWidget
                        actions={[
                            { label: "Dar de alta materia", onClick: openCreateModal }
                        ]}
                    />
                </div>
            </div>

            {/* Modal Formulario */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-xl rounded-xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base">
                                {modalMode === 'create' ? 'Dar de Alta Nueva Materia' : 'Editar Información de Materia'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-5">
                                
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5 col-span-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                                <Hash size={13} />
                                            </span>
                                            <input
                                                type="text"
                                                value={data.code}
                                                onChange={e => setData('code', e.target.value)}
                                                placeholder="Ej: MAT-1"
                                                required
                                                disabled={modalMode === 'edit'} 
                                                className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-100 rounded-lg font-mono text-xs font-bold text-slate-600 focus:bg-white focus:ring-1 focus:ring-[#1e88e5] disabled:opacity-60"
                                            />
                                        </div>
                                        {errors.code && <p className="text-rose-500 text-[11px] font-semibold">{errors.code}</p>}
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre de Materia</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Ej: Matemáticas I"
                                            className="w-full h-[38px] px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs text-slate-700"
                                        />
                                        {errors.name && <p className="text-rose-500 text-[11px] font-semibold">{errors.name}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descripción / Temario</label>
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Descripción corta de la asignatura..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs text-slate-700 resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profesor Asignado</label>
                                    <select
                                        value={data.teacher_id}
                                        onChange={e => setData('teacher_id', e.target.value)}
                                        className="w-full py-2.5 px-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs text-slate-700"
                                    >
                                        <option value="">Seleccionar un docente...</option>
                                        <option value="1">Francisco Javier Martínez</option>
                                        <option value="2">María Elena Rodríguez</option>
                                        <option value="3">Humberto Soler Castro</option>
                                        <option value="4">Luisa Fernanda Vega</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vincular con Grupos</label>
                                    <div className="flex items-center gap-2">
                                        {gruposDisponiblesModal.map((groupCode) => {
                                            const isSelected = data.linked_groups.includes(groupCode);
                                            return (
                                                <button
                                                    type="button"
                                                    key={groupCode}
                                                    onClick={() => toggleGroupSelection(groupCode)}
                                                    className={`h-9 px-4 rounded-lg text-xs font-bold transition-all border ${
                                                        isSelected
                                                            ? 'bg-blue-50 border-[#1e88e5] text-[#1e88e5]'
                                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    Grupo {groupCode}
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
                                <button type="submit" className="px-6 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all">
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