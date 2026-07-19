import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, Deferred } from '@inertiajs/react';
import {
    Users,
    Clock,
    ChevronRight,
    Layers,
    BookOpen
} from 'lucide-react';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import TeacherInfoCard from '@/Components/TeacherInfoCard';
import TeacherRightSidebar from '@/Components/TeacherRightSidebar';
import DotsLoader from '@/Components/ui/DotsLoader';

interface AssignedLoadItem {
    id: string | number;
    codigo: string;
    nombre_materia: string;
    nombre_grupo: string;
    cantidad_alumnos: number;
    turno: string;
    estatus: string;
}

interface DocenteDashboardProps {
    teacherInfo?: {
        nombre: string;
        especialidad: string;
        email: string;
    };
    assignedLoad?: AssignedLoadItem[];
}

export default function DocenteDashboard({
    teacherInfo: propTeacherInfo,
    assignedLoad: propAssignedLoad
}: DocenteDashboardProps) {
    // 1. Datos del docente con fallback seguro
    const teacherInfo = {
        name: propTeacherInfo?.nombre || 'Docente',
        specialty: propTeacherInfo?.especialidad || 'General',
        email: propTeacherInfo?.email || ''
    };

    // 2. Carga académica con fallback seguro
    const assignedLoad = Array.isArray(propAssignedLoad) ? propAssignedLoad : [];

    const upcomingTasks = [
        { id: 1, title: 'Límite de captura del Primer Parcial', date: 'En 3 días', urgent: true },
        { id: 2, title: 'Reunión de Academia de Ciencias', date: 'Viernes 26 de Junio', urgent: false },
        { id: 3, title: 'Subir planeación semestral de Física II', date: 'Próxima semana', urgent: false }
    ];

    return (
        <AuthenticatedLayout noPadding>
            <Head title="Panel del Docente" />

            <div className="flex flex-col lg:flex-row bg-white lg:h-full lg:overflow-hidden font-body w-full text-left">

                {/* Columna Izquierda: Panel Principal */}
                <div className="flex-1 p-6 md:p-8 space-y-8 min-w-0 lg:overflow-y-auto lg:h-full">

                    {/* Banner de Bienvenida */}
                    <DashboardWelcomeBanner
                        greeting={`Hola ${teacherInfo.name}`}
                        subtitle="Portal Docente"
                        wrapperClassName="pb-0"
                    />

                    <Deferred data={['teacherInfo', 'assignedLoad']} fallback={
                        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                            <DotsLoader
                                label="Cargando panel de control"
                                sublabel="Sincronizando tus grupos y expedientes..."
                            />
                        </div>
                    }>
                        {/* Ficha Resumen del Profesor */}
                        <TeacherInfoCard
                            name={teacherInfo.name}
                            specialty={teacherInfo.specialty}
                            email={teacherInfo.email}
                            groupsCount={assignedLoad.length}
                        />

                        {/* Carga Académica Asignada */}
                        <div className="space-y-6">
                            <div className="space-y-1 text-left px-2">
                                <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Carga Académica</h3>
                                <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-snug">Grupos y Materias Asignadas</h2>
                                <p className="text-xs md:text-[13px] text-slate-500 font-semibold leading-relaxed max-w-2xl mt-1.5">
                                    Gestiona tus clases vigentes, configura criterios de evaluación y realiza la captura de calificaciones de tus alumnos de forma organizada.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assignedLoad.length > 0 ? assignedLoad.map((load) => (
                                    <Link
                                        key={load.id}
                                        href={`/docente/grupos/show?id=${load.id}`}
                                        className="group flex items-center justify-between p-5 bg-white border border-slate-200 hover:border-[#1e88e5] hover:bg-slate-50 transition-all duration-200 rounded-2xl shadow-none"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="min-w-0 text-left">
                                                <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">
                                                    {load.nombre_materia}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                        Grupo {load.nombre_grupo}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {load.cantidad_alumnos} alumnos
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 ml-4">
                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md border ${
                                                load.estatus === 'completed'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {load.estatus === 'completed' ? 'Cargado' : 'Pendiente'}
                                            </span>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1e88e5] group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="md:col-span-2 p-12 text-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                                        <p className="text-sm text-slate-400 font-bold">Sin grupos asignados actualmente.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Deferred>
                </div>

                {/* Columna Derecha */}
                <TeacherRightSidebar tasks={upcomingTasks} />

            </div>
        </AuthenticatedLayout>
    );
}
