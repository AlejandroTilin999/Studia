import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Clock,
    ArrowRight,
    Layers,
    BookOpen
} from 'lucide-react';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import TeacherInfoCard from '@/Components/TeacherInfoCard';
import TeacherRightSidebar from '@/Components/TeacherRightSidebar';

interface AssignedLoadItem {
    id: string | number;
    code: string;
    subject: string;
    groupName: string;
    studentsCount: number;
    schedule: string;
    status: string;
}

interface DocenteDashboardProps {
    teacherInfo?: {
        name: string;
        specialty: string;
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
        name: propTeacherInfo?.name || 'Docente',
        specialty: propTeacherInfo?.specialty || 'General',
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

                    {/* Ficha Resumen del Profesor (Ahora fuera del contenedor para alinear ancho) */}
                    <TeacherInfoCard
                        name={teacherInfo.name}
                        specialty={teacherInfo.specialty}
                        email={teacherInfo.email}
                    />

                    {/* Carga Académica Asignada */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em] flex items-center gap-2.5 text-left">
                                <div className="w-1.5 h-6 bg-[#1e88e5] rounded-full" />
                                Grupos y Materias Asignadas
                            </h4>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50 uppercase tracking-wider">
                                Ciclo Escolar 2026-A
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {assignedLoad.length > 0 ? assignedLoad.map((load) => (
                                <Link
                                    key={load.id}
                                    href={`/docente/grupos/show?id=${load.id}`}
                                    className="group relative bg-white border border-slate-100 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(30,136,229,0.08)] transition-all duration-500 rounded-[32px] p-7 flex flex-col justify-between overflow-hidden"
                                >
                                    {/* Decoración de fondo */}
                                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-50/30 rounded-full group-hover:scale-110 transition-transform duration-700" />

                                    <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <div className="w-10 h-10 rounded-2xl bg-[#0266E0] text-white flex items-center justify-center shadow-lg shadow-blue-200">
                                            <ArrowRight size={20} strokeWidth={2.5} />
                                        </div>
                                    </div>

                                    <div className="relative z-10 space-y-5 text-left">
                                        <div className="space-y-2">
                                            <span className="inline-block font-mono text-[10px] font-black text-[#1e88e5] bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-100/50 uppercase text-left">
                                                ID: {load.code}
                                            </span>
                                            <h4 className="font-black text-slate-800 text-xl leading-tight tracking-tight group-hover:text-[#0266E0] transition-colors pr-8 text-left">
                                                {load.subject}
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl ${
                                                load.status === 'completed'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                                {load.status === 'completed' ? 'Notas Cargadas' : 'Notas Pendientes'}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                                                <Clock size={14} className="text-slate-300" />
                                                {load.schedule || 'Sin horario definido'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-50">
                                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-transparent hover:border-slate-100 transition-colors text-left">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Alumnos</span>
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-[#1e88e5]" />
                                                    <span className="text-lg font-black text-slate-700">{load.studentsCount}</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-transparent hover:border-slate-100 transition-colors text-left">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Aula / Grupo</span>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={16} className="text-purple-500" />
                                                    <span className="text-lg font-black text-slate-700 truncate">{load.groupName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="md:col-span-2 p-20 text-center bg-slate-50/30 rounded-[40px] border-2 border-dashed border-slate-200">
                                    <div className="w-20 h-20 bg-white rounded-[28px] shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-5 text-slate-200 text-left">
                                        <Layers size={40} />
                                    </div>
                                    <p className="text-xl text-slate-500 font-black tracking-tight text-left">Carga académica vacía</p>
                                    <p className="text-sm text-slate-400 font-medium mt-1 text-left">Aún no tienes grupos asignados para este ciclo.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha */}
                <TeacherRightSidebar tasks={upcomingTasks} />

            </div>
        </AuthenticatedLayout>
    );
}
