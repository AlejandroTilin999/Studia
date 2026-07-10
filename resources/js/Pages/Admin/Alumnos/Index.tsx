import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    X,
    Check,
    Mail,
    Hash,
    Phone,
    Calendar
} from "lucide-react";

import PageHeaderBanner from '@/Components/PageHeaderBanner';
import QuickSummaryWidget from '@/Components/QuickSummaryWidget';
import DonutChartWidget from '@/Components/DonutChartWidget';

interface BackendStudent {
    id: number;
    user_id: number;
    matricula: string;
    name: string;
    email: string;
    telefono?: string;
    fecha_nacimiento?: string;
    status?: 'active' | 'inactive' | 'suspended';
    groupName?: string;
    groupId?: number;
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
    
    const formattedStudents = alumnos.map(student => ({
        id: student.id,
        user_id: student.user_id,
        matricula: student.matricula || 'S/M',
        name: student.name || 'Sin nombre asignado',
        email: student.email || 'sin-correo@studia.edu.mx',
        telefono: student.telefono || 'Sin teléfono',
        fecha_nacimiento: student.fecha_nacimiento || '',
        groupId: student.groupId || 0,
        groupName: student.groupName || 'Sin grupo',
        status: student.status || 'active',
    }));

    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Formulario controlado por Inertia con fecha_nacimiento añadida
    const { data, setData, post, put, reset, processing, errors } = useForm({
        matricula: '',
        nombre: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        academic_group_id: groups[0]?.id || '',
        status: 'active' as 'active' | 'inactive' | 'suspended'
    });

    useEffect(() => {
        if (modalMode === 'create' && data.nombre.trim() !== '') {
            const nameParts = data.nombre.trim().toUpperCase().split(/\s+/);
            const initials = nameParts.map(part => part[0] || '').join('').substring(0, 3);
            const groupSelected = groups.find(g => g.id === Number(data.academic_group_id));
            const groupCode = groupSelected ? groupSelected.id : '00';
            const currentYear = new Date().getFullYear();
            const generatedMatricula = `${initials}${groupCode}${currentYear}`;
            
            let emailBase = data.nombre.trim().toLowerCase();
            emailBase = emailBase.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
            emailBase = emailBase.replace(/\s+/g, '.');
            const generatedEmail = emailBase ? `${emailBase}@studia.edu.mx` : '';

            if (data.matricula !== generatedMatricula || data.email !== generatedEmail) {
                setData(currentData => ({
                    ...currentData,
                    matricula: generatedMatricula,
                    email: generatedEmail
                }));
            }
        }
    }, [data.nombre, data.academic_group_id, modalMode, groups]);

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
    const inactiveCount = formattedStudents.filter(s => s.status === 'inactive' || s.status === 'suspended').length;
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
            matricula: student.matricula,
            nombre: student.name,
            email: student.email,
            telefono: student.telefono === 'Sin teléfono' ? '' : student.telefono,
            fecha_nacimiento: student.fecha_nacimiento,
            academic_group_id: student.groupId || groups[0]?.id || '',
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

    // 🔄 Función corregida que detona la ruta toggle en tu web.php
    const toggleStatus = (student: any) => {
        router.post(route('admin.alumnos.toggle', student.id), {}, {
            onSuccess: () => {
                triggerToast(`Estatus de ${student.name} modificado con éxito.`);
            }
        });
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

                    <div className="p-0 md:p-6 flex-1 overflow-visible flex flex-col">
                        <div className="bg-white rounded-none md:rounded-xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 flex-1 flex flex-col min-h-0 overflow-visible">

                            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0 relative z-20">
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
                                        <div className="absolute right-0 top-14 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-4 space-y-2">
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

                            <div className="flex-1 overflow-x-auto relative z-10">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-transparent border-b border-slate-100">
                                        <tr>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2">Matrícula</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2">Nombre / Email</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2">Teléfono</th>
                                            <th className="font-bold text-slate-400 uppercase text-[12px] tracking-wider h-12 px-2">Estatus</th>
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
                                                    <td className="text-slate-500 font-medium text-[13px] px-2">{student.telefono}</td>
                                                    <td className="px-2">
                                                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                                                            student.status === 'active' 
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                        }`}>
                                                            {student.status === 'active' ? 'Activo' : 'Inactivo'}
                                                        </span>
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
                                                                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-700' 
                                                                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                                                                }`}
                                                            >
                                                                {student.status === 'active' ? 'Dar de Baja' : 'Dar de Alta'}
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
                
                    <DonutChartWidget
                        centerLabel="alumnos"
                        segments={[
                            { name: "Activos", count: activeCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                            { name: "De baja", count: inactiveCount, color: "#e2e8f0", bulletClass: "bg-slate-200" }
                        ]}
                    />
                </div>
            </div>

            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-visible">
                    <div className="bg-white w-full max-w-lg rounded-xl border border-slate-100 shadow-2xl overflow-visible">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base">
                                {modalMode === 'create' ? 'Inscribir Nuevo Alumno' : 'Modificar Datos de Alumno'}
                            </h3>
                            <button onClick={() => setIsFormModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-visible">
                            <div className="p-6 space-y-4 text-left overflow-visible">
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
                                                value={data.matricula || 'PROCESANDO...'}
                                                className="w-full pl-8 pr-2 py-2 bg-slate-100 border-0 rounded-lg font-mono text-xs font-bold text-slate-600 focus:ring-0 select-all"
                                            />
                                        </div>
                                        {errors.matricula && <span className="text-red-500 text-[10px] block mt-1">{errors.matricula}</span>}
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre Completo</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.nombre}
                                            onChange={e => setData('nombre', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-400"
                                        />
                                        {errors.nombre && <span className="text-red-500 text-[10px] block mt-1">{errors.nombre}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico (Automático)</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                                <Mail size={14} />
                                            </span>
                                            <input
                                                type="email"
                                                required
                                                readOnly={modalMode === 'create'}
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-xs focus:outline-none focus:border-blue-400 ${
                                                    modalMode === 'create' ? 'bg-slate-100 text-slate-500 font-medium border-transparent cursor-not-allowed' : 'bg-slate-50 text-slate-700 border-slate-200'
                                                }`}
                                            />
                                        </div>
                                        {errors.email && <span className="text-red-500 text-[10px] block mt-1">{errors.email}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                                <Phone size={14} />
                                            </span>
                                            <input
                                                type="tel"
                                                value={data.telefono}
                                                onChange={e => setData('telefono', e.target.value)}
                                                placeholder="Ej. 4432123456"
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-400"
                                            />
                                        </div>
                                        {errors.telefono && <span className="text-red-500 text-[10px] block mt-1">{errors.telefono}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 overflow-visible">
                                    {/* 📅 NUEVO CAMPO: FECHA DE NACIMIENTO */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha de Nacimiento</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                                <Calendar size={14} />
                                            </span>
                                            <input
                                                type="date"
                                                value={data.fecha_nacimiento}
                                                onChange={e => setData('fecha_nacimiento', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-400"
                                            />
                                        </div>
                                        {errors.fecha_nacimiento && <span className="text-red-500 text-[10px] block mt-1">{errors.fecha_nacimiento}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estatus Inicial</label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value as any)}
                                            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-400"
                                        >
                                            <option value="active">Alta (Activo)</option>
                                            <option value="inactive">Baja (Inactivo)</option>
                                        </select>
                                        {errors.status && <span className="text-red-500 text-[10px] block mt-1">{errors.status}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 relative z-10">
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
        </AuthenticatedLayout>
    );
}