import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Filter, X, Users } from "lucide-react";

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

interface GruposProps {
    grupos: GrupoBackend[];
    profesores: ProfesorSelect[];
}

export default function Index({ grupos = [], profesores = [] }: GruposProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Formulario reactivo de Inertia
    const { data, setData, post, put, reset, errors } = useForm({
        code: '',
        name: '',
        shift: 'Horario único',
        specialty: 'TI',
        teacher_id: '' as string | number
    });

    const filteredGrupos = grupos.filter(g => 
        g.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.profesor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (grupo: GrupoBackend) => {
        setModalMode('edit');
        setSelectedId(grupo.id);
        setData({
            code: grupo.codigo,
            name: grupo.nombre,
            shift: grupo.turno,
            specialty: grupo.especialidad,
            teacher_id: grupo.teacher_id ?? ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'create') {
            post(route('groups.store'), { onSuccess: () => setIsModalOpen(false) });
        } else {
            put(route('groups.update', selectedId!), { onSuccess: () => setIsModalOpen(false) });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Grupos" />

            <div className="p-6 bg-[#f8fafc] min-h-screen">
                {/* Filtros superiores idénticos a la imagen */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar grupo..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-12 pr-4 h-12 w-full bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none"
                        />
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="bg-[#1e88e5] hover:bg-blue-700 text-white font-semibold h-12 px-6 rounded-lg text-sm transition-all"
                    >
                        Buscar materias
                    </button>
                    <button className="h-12 border border-slate-200 bg-white text-slate-600 font-medium rounded-lg px-6 text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                </div>

                {/* Tabla de Grupos Académicos (Diseño image_075d6d.png) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-4 px-6">Código</th>
                                <th className="py-4 px-6">Nombre del Grupo</th>
                                <th className="py-4 px-6">Turno</th>
                                <th className="py-4 px-6">Profesor Asignado</th>
                                <th className="py-4 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredGrupos.map((grupo) => (
                                <tr key={grupo.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-5 px-6 font-semibold text-slate-500 font-mono">{grupo.codigo}</td>
                                    <td className="py-5 px-6">
                                        <div className="font-bold text-slate-700">{grupo.nombre}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{grupo.especialidad}</div>
                                    </td>
                                    <td className="py-5 px-6 text-slate-500">{grupo.turno}</td>
                                    <td className="py-5 px-6">
                                        <div className="font-semibold text-slate-600">{grupo.profesor}</div>
                                        <div className="text-[11px] text-slate-400">Tutor titular</div>
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                        <button
                                            onClick={() => openEditModal(grupo)}
                                            className="bg-[#1e88e5] hover:bg-blue-700 text-white font-medium py-1.5 px-5 rounded-lg text-xs transition-all"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Grupo (Estructura exacta image_0760ca.png) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {modalMode === 'create' ? 'Crear Nuevo Grupo' : `Editar Grupo ${data.name}`}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Código del Grupo</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value)}
                                    placeholder="Ej: TI001"
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400"
                                    required
                                />
                                {errors.code && <p className="text-rose-500 text-xs mt-1">{errors.code}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Nombre del Grupo</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Ej: 1er Año TI"
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Turno</label>
                                    <select
                                        value={data.shift}
                                        onChange={e => setData('shift', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                                    >
                                        <option value="Horario único">Horario único</option>
                                        <option value="Matutino">Matutino</option>
                                        <option value="Vespertino">Vespertino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Especialidad</label>
                                    <select
                                        value={data.specialty}
                                        onChange={e => setData('specialty', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                                    >
                                        <option value="TI">TI</option>
                                        <option value="Gastronomía">Gastronomía</option>
                                        <option value="Administración">Administración</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Profesor Asignado</label>
                                <select
                                    value={data.teacher_id}
                                    onChange={e => setData('teacher_id', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                                >
                                    <option value="">Selecciona un tutor...</option>
                                    {profesores.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-all"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}