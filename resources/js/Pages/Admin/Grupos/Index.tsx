import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Search, Filter, X } from "lucide-react";

interface GrupoBackend {
    id: number;
    codigo: string;
    nombre: string;
    turno: string;
    especialidad: string;
    tutor_teacher_id: number | null;
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

    // Formulario reactivo adaptado a tu DB
    const { data, setData, post, put, reset, errors } = useForm({
        code: '',
        name: '',
        semester: '1', 
        letter: 'A',   
        shift: 'Matutino',
        major: 'TI', 
        tutor_teacher_id: '' as string | number 
    });

    // Autogeneración del Nombre (Semestre-Letra) y del Código en tiempo real
    useEffect(() => {
        if (modalMode === 'create') {
            const compositeName = `${data.semester}-${data.letter.toUpperCase()}`;
            
            // Generar código limpio usando iniciales: Carrera + Turno + Nombre compuesto (Ej: TI-M-1A)
            const majorKey = data.major.substring(0, 3).toUpperCase();
            const shiftKey = data.shift.substring(0, 1).toUpperCase();
            const compositeCode = `${majorKey}-${shiftKey}-${data.semester}${data.letter.toUpperCase()}`;

            setData(prev => ({
                ...prev,
                name: compositeName,
                code: compositeCode
            }));
        }
    }, [data.semester, data.letter, data.shift, data.major, modalMode]);

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

        // Separar el nombre "3-A" en semestre "3" y letra "A" para los inputs del formulario
        const parts = grupo.nombre.split('-');
        const currentSemester = parts[0] || '1';
        const currentLetter = parts[1] || 'A';

        setData({
            code: grupo.codigo,
            name: grupo.nombre,
            semester: currentSemester,
            letter: currentLetter,
            shift: grupo.turno,
            major: grupo.especialidad,
            tutor_teacher_id: grupo.tutor_teacher_id ?? ''
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
                        Registrar grupo
                    </button>
                </div>

                {/* Tabla de Grupos */}
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
                                        {/* Aquí se formatea el texto de forma dinámica */}
                                        <div className="font-bold text-slate-700">
                                            {(() => {
                                                const parts = grupo.nombre.split('-');
                                                const semestre = parts[0] || '';
                                                const letra = parts[1] || '';
                                                return `Grupo ${semestre}° Semestre - Grupo ${letra}`;
                                            })()}
                                        </div>
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

            {/* Modal de Formulario */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {modalMode === 'create' ? 'Crear Nuevo Grupo' : `Editar Grupo`}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            
                            {/* Inputs separados para Semestre y Letra */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Semestre</label>
                                    <select
                                        value={data.semester}
                                        onChange={e => setData('semester', e.target.value)}
                                        disabled={modalMode === 'edit'}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none"
                                    >
                                        {[1,2,3,4,5,6,7,8].map(n => (
                                            <option key={n} value={n}>{n}° Semestre</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Letra / Grupo</label>
                                    <input
                                        type="text"
                                        maxLength={1}
                                        value={data.letter}
                                        onChange={e => setData('letter', e.target.value.toUpperCase())}
                                        disabled={modalMode === 'edit'}
                                        placeholder="Ej: A"
                                        required
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 font-bold uppercase"
                                    />
                                </div>
                            </div>

                            {/* Nombre Combinado Resultante (Se enviará a la DB como "1-A") */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Nombre en Base de Datos</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    disabled
                                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold"
                                />
                                {errors.name && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.name}</p>}
                            </div>

                            {/* Código Autogenerado */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Código Autogenerado</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    disabled
                                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-sm font-mono"
                                />
                                {errors.code && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.code}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Turno</label>
                                    <select
                                        value={data.shift}
                                        onChange={e => setData('shift', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                                    >
                                        <option value="Matutino">Matutino</option>
                                        <option value="Vespertino">Vespertino</option>
                                        <option value="Horario único">Horario único</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Especialidad (Carrera)</label>
                                    <select
                                        value={data.major}
                                        onChange={e => setData('major', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                                    >
                                        <option value="TI">TI</option>
                                        <option value="Gastronomía">Gastronomía</option>
                                        <option value="Administración">Administración</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Profesor Tutor</label>
                                <select
                                    value={data.tutor_teacher_id}
                                    onChange={e => setData('tutor_teacher_id', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                                >
                                    <option value="">Selecciona un tutor...</option>
                                    {profesores.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-all">
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