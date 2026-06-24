import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    Calendar,
    Phone,
    Mail,
    Hash,
    X,
    Check,
    Download,
    Folder
} from "lucide-react";

// Reusable components
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import QuickSummaryWidget from '@/Components/QuickSummaryWidget';
import QuickActionsWidget from '@/Components/QuickActionsWidget';
import DonutChartWidget from '@/Components/DonutChartWidget';

interface MockStudent {
    id: number;
    matricula: string;
    name: string;
    birthdate: string;
    email: string;
    phone: string;
    groupName: string;
    status: 'active' | 'suspended';
    grades: { subject: string; score: number; period: string }[];
}

interface AlumnosIndexProps {
    alumnos?: {
        id: number;
        matricula: string;
        nombre: string;
        grado_grupo: string;
    }[];
}

export default function AlumnosIndex({ alumnos = [] }: AlumnosIndexProps) {
    // 1. Initial State mapping from DB data, falling back to mock data if empty
    const initialStudents: MockStudent[] = alumnos.map(item => ({
        id: item.id,
        matricula: item.matricula,
        name: item.nombre,
        groupName: item.grado_grupo || "1°A",
        birthdate: "2008-01-01",
        email: `${item.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '.')}@alumno.prepahidalgo.edu.mx`,
        phone: "7710000000",
        status: 'active',
        grades: []
    }));

    const [students, setStudents] = useState<MockStudent[]>(
        initialStudents.length > 0 ? initialStudents : [
            { id: 1, matricula: "P001", name: "Alejandro Bautista Beltrán", birthdate: "2008-04-12", email: "alejandro.bautista@alumno.prepahidalgo.edu.mx", phone: "7712345678", groupName: "1°A", status: 'active', grades: [{ subject: 'Matemáticas I', score: 9.5, period: '2026-A' }] },
            { id: 2, matricula: "P002", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [{ subject: 'Matemáticas I', score: 10.0, period: '2026-A' }] },
            { id: 3, matricula: "P003", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
            { id: 4, matricula: "P004", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
            { id: 5, matricula: "P005", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
            { id: 6, matricula: "P006", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
            { id: 7, matricula: "P007", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
            { id: 8, matricula: "P008", name: "Edson Velazques Vazques", birthdate: "2008-09-22", email: "edson.velazquez@alumno.prepahidalgo.edu.mx", phone: "7719876543", groupName: "1°A", status: 'active', grades: [] },
        ]
    );

    // 2. React state for search & filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

    // 3. Form & Kardex Modals State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedStudent, setSelectedStudent] = useState<MockStudent | null>(null);

    const [formData, setFormData] = useState({
        matricula: '',
        name: '',
        birthdate: '',
        email: '',
        phone: '',
        groupName: '1°A',
        status: 'active' as 'active' | 'suspended'
    });

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filters logic
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.matricula.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || student.groupName === groupFilter;
        return matchesSearch && matchesGroup;
    });

    // Stats calculations
    const activeCount = students.filter(s => s.status === 'active').length;
    const inactiveCount = students.filter(s => s.status === 'suspended').length;
    const totalCount = students.length;

    // Actions
    const openCreateModal = () => {
        setModalMode('create');
        const nextId = students.length + 1;
        const generatedMatricula = `P${nextId < 10 ? '00' + nextId : nextId < 100 ? '0' + nextId : nextId}`;
        setFormData({
            matricula: generatedMatricula,
            name: '',
            birthdate: '',
            email: '',
            phone: '',
            groupName: '1°A',
            status: 'active'
        });
        setIsFormModalOpen(true);
    };

    const openEditModal = (student: MockStudent) => {
        setModalMode('edit');
        setSelectedStudent(student);
        setFormData({
            matricula: student.matricula,
            name: student.name,
            birthdate: student.birthdate,
            email: student.email,
            phone: student.phone,
            groupName: student.groupName,
            status: student.status
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'create') {
            const newStudent: MockStudent = {
                id: Date.now(),
                matricula: formData.matricula,
                name: formData.name,
                birthdate: formData.birthdate,
                email: formData.email,
                phone: formData.phone,
                groupName: formData.groupName,
                status: formData.status,
                grades: []
            };
            setStudents([...students, newStudent]);
            triggerToast(`Estudiante "${formData.name}" registrado correctamente.`);
        } else if (modalMode === 'edit' && selectedStudent) {
            setStudents(students.map(s => s.id === selectedStudent.id ? {
                ...s,
                name: formData.name,
                birthdate: formData.birthdate,
                email: formData.email,
                phone: formData.phone,
                groupName: formData.groupName,
                status: formData.status
            } : s));
            triggerToast(`Datos de "${formData.name}" actualizados.`);
        }
        setIsFormModalOpen(false);
    };

    const toggleStatus = (student: MockStudent) => {
        const newStatus = student.status === 'active' ? 'suspended' : 'active';
        setStudents(students.map(s => s.id === student.id ? { ...s, status: newStatus } : s));
        triggerToast(`Estado de "${student.name}" cambiado a ${newStatus === 'active' ? 'Activo' : 'Baja'}.`);
    };

    const openKardexModal = (student: MockStudent) => {
        setSelectedStudent(student);
        setIsKardexModalOpen(true);
    };

    const calculateGPA = (grades: { score: number }[]) => {
        if (grades.length === 0) return '0.0';
        const sum = grades.reduce((acc, curr) => acc + curr.score, 0);
        return (sum / grades.length).toFixed(1);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Alumnos" />

            {/* Toast Alerta */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none">
                    <div className="bg-[#1e88e5] p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Layout Wrapper mirroring specification */}
            <div className="flex flex-col lg:flex-row bg-[#f5f7fb] min-h-[calc(100vh-64px)] font-body overflow-x-hidden -m-6 md:-m-8">

                {/* Main Content Column */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Banner Azul de Gestión */}
                    <PageHeaderBanner
                        title={`Gestión de alumnos (${totalCount})`}
                        subtitle="Consulta, edita y registra"
                        breadcrumb="Alumnos"
                    />

                    {/* Content Table and Filters Section */}
                    <div className="p-0 md:p-6 flex-1 overflow-hidden flex flex-col">
                        <div className="bg-white rounded-none md:rounded-xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 flex-1 flex flex-col min-h-0">

                            {/* Controls: Search and Actions */}
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 shrink-0">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar Alumno"
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
                                                <option value="1°A">Grupo 1°A</option>
                                                <option value="2-B">Grupo 2-B</option>
                                                <option value="3-A">Grupo 3-A</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-transparent border-b border-slate-100">
                                        <tr className="hover:bg-transparent border-none">
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
                                                    <td className="text-slate-700 font-bold text-[15px] px-2 leading-tight">{student.name}</td>
                                                    <td className="text-slate-500 font-medium text-[13px] px-2">{student.groupName}</td>
                                                    <td className="text-center px-2">
                                                        <button 
                                                            onClick={() => openKardexModal(student)}
                                                            className="bg-[#e3f2fd] hover:bg-[#bbdefb] text-[#1e88e5] font-black h-8 px-4 rounded-lg text-[12px] transition-all"
                                                        >
                                                            Ver
                                                        </button>
                                                    </td>
                                                    <td className="text-right px-2">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => openEditModal(student)}
                                                                className="bg-[#1e88e5] hover:bg-blue-700 text-white font-bold h-8 px-5 rounded-lg text-[12px] shadow-none transition-all"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button 
                                                                onClick={() => toggleStatus(student)}
                                                                className={`font-bold h-8 px-5 rounded-lg text-[12px] transition-all ${
                                                                    student.status === 'active' 
                                                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' 
                                                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                                                                }`}
                                                                title={student.status === 'active' ? "Dar de baja" : "Dar de alta"}
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
                                                    No se encontraron alumnos coincidentes.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="w-full lg:w-[320px] bg-white border-l border-slate-100 p-6 space-y-8 shrink-0">

                    {/* Quick Summary Widget */}
                    <QuickSummaryWidget
                        metrics={[
                            { code: "T1", label: "Alumnos totales", value: totalCount },
                            { code: "T3", label: "Activos", value: activeCount },
                            { code: "T4", label: "De baja", value: inactiveCount }
                        ]}
                    />

                    {/* Quick Actions Widget */}
                    <QuickActionsWidget
                        actions={[
                            { label: "Registrar alumnos", onClick: openCreateModal },
                            {
                                label: "Dar de baja/alta",
                                onClick: () => {
                                    alert("Haz clic en el botón 'Baja'/'Alta' que se encuentra en la columna 'Acciones' de la tabla para cambiar el estado del alumno.");
                                }
                            }
                        ]}
                    />

                    {/* Donut Chart Widget */}
                    <DonutChartWidget
                        centerLabel="alumnos"
                        segments={[
                            { name: "Activos", count: activeCount, color: "#1e88e5", bulletClass: "bg-[#1e88e5]" },
                            { name: "De baja", count: inactiveCount, color: "#e2e8f0", bulletClass: "bg-slate-200" }
                        ]}
                    />
                </div>
            </div>

            {/* Modal: Add/Edit student */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base">
                                {modalMode === 'create' ? 'Registrar Nuevo Alumno' : 'Editar Expediente de Alumno'}
                            </h3>
                            <button onClick={() => setIsFormModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
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
                                                value={formData.matricula}
                                                className="w-full pl-8 pr-2 py-2 bg-slate-100 border-0 rounded-lg font-mono text-xs font-bold text-slate-500 focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre Completo</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Nombre completo del estudiante"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                        />
                                    </div>
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
                                            placeholder="correo.alumno@alumno.prepahidalgo.edu.mx"
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha de Nacimiento</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                                <Calendar size={14} />
                                            </span>
                                            <input
                                                type="date"
                                                required
                                                value={formData.birthdate}
                                                onChange={e => setFormData({ ...formData, birthdate: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono de Contacto</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                                <Phone size={14} />
                                            </span>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="Ej: 7712345678"
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grupo Asignado</label>
                                        <select
                                            value={formData.groupName}
                                            onChange={e => setFormData({ ...formData, groupName: e.target.value })}
                                            className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                        >
                                            <option value="1°A">Grupo 1°A</option>
                                            <option value="2-B">Grupo 2-B</option>
                                            <option value="3-A">Grupo 3-A</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-xs transition-all text-slate-700"
                                        >
                                            <option value="active">Activo</option>
                                            <option value="suspended">Suspendido</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm">
                                    {modalMode === 'create' ? 'Registrar Alumno' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Kardex View */}
            {isKardexModalOpen && selectedStudent && (() => {
                const displayGrades = selectedStudent.grades.length > 0 ? selectedStudent.grades : [
                    { subject: 'Matemáticas', score: 10, period: '2° Semestre (Ene-Jun 2026)' },
                    { subject: 'Inglés', score: 10, period: '2° Semestre (Ene-Jun 2026)' },
                    { subject: 'Redes', score: 10, period: '2° Semestre (Ene-Jun 2026)' },
                    { subject: 'Literatura', score: 10, period: '2° Semestre (Ene-Jun 2026)' }
                ];
                const gpa = calculateGPA(displayGrades);
                const approvedCount = displayGrades.filter(g => g.score >= 6).length;
                const totalGrades = displayGrades.length;

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-4xl rounded-xl border border-slate-200/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            {/* Header: vibrant primary blue */}
                            <div className="px-6 py-5 bg-[#1e88e5] text-white flex justify-between items-center select-none">
                                <h3 className="font-black text-white text-lg font-body tracking-tight">Kardex ({selectedStudent.matricula})</h3>
                                <button onClick={() => setIsKardexModalOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-lg">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Details Container with Grid */}
                            <div className="p-6 bg-white space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-body">
                                    {/* Left Info Card */}
                                    <div className="md:col-span-3 bg-[#f8fafc] border-l-4 border-l-[#1e88e5] border border-slate-200/60 rounded-xl p-5 flex flex-col justify-between shadow-sm">
                                        <h4 className="text-xl font-black text-slate-800 leading-tight">{selectedStudent.name}</h4>
                                        <div className="grid grid-cols-3 gap-4 mt-6 text-xs">
                                            <div className="space-y-1">
                                                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Matrícula</span>
                                                <span className="font-extrabold text-slate-700 text-sm block">{selectedStudent.matricula}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Grado y grupo</span>
                                                <span className="font-extrabold text-slate-700 text-sm block">{selectedStudent.groupName}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Estatus</span>
                                                <span className="font-extrabold text-slate-700 text-sm block">
                                                    {selectedStudent.status === 'active' ? 'Activo' : 'Baja'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right GPA Card */}
                                    <div className="bg-[#f8fafc] border border-slate-200/60 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/5 rounded-bl-full pointer-events-none" />
                                        <span className="text-xs font-bold text-slate-400 block leading-tight uppercase tracking-wider">Promedio General</span>
                                        <span className="text-5xl font-black text-[#1e88e5] mt-2 block leading-none tracking-tight">
                                            {gpa}
                                        </span>
                                    </div>
                                </div>

                                {/* Grades Table */}
                                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider h-11 text-[11px]">
                                                <th className="px-6 py-2.5 w-1/3">Semestre/Ciclo</th>
                                                <th className="px-6 py-2.5 w-1/3">Materia</th>
                                                <th className="px-6 py-2.5 w-1/3">Calificación</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                                            {displayGrades.map((grade, idx) => {
                                                const isFirstOfPeriod = idx === 0 || displayGrades[idx - 1].period !== grade.period;
                                                return (
                                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors h-12">
                                                        <td className="px-6 py-2.5 text-slate-500 font-medium">
                                                            {isFirstOfPeriod ? (
                                                                <div>
                                                                    <span className="text-[#1e88e5] font-extrabold block">{grade.period}</span>
                                                                    <span className="text-[10px] text-slate-400 font-normal block mt-0.5">Ciclo escolar: 2025-2026</span>
                                                                </div>
                                                            ) : null}
                                                        </td>
                                                        <td className="px-6 py-2.5 text-slate-600 font-semibold">{grade.subject}</td>
                                                        <td className="px-6 py-2.5 text-slate-700 font-medium">{grade.score.toFixed(0)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Bottom Info & Actions */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                        <Folder size={18} className="text-[#1e88e5]" />
                                        <span>Calificación: ({approvedCount}/{totalGrades})</span>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setIsKardexModalOpen(false);
                                                openEditModal(selectedStudent);
                                            }}
                                            className="px-6 h-10 border border-[#1e88e5] text-[#1e88e5] hover:bg-[#1e88e5]/5 rounded-lg text-xs font-bold transition-all shadow-none"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                triggerToast(`Descargando Kardex oficial de ${selectedStudent.name}...`);
                                            }}
                                            className="px-6 h-10 bg-[#1e88e5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-none"
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