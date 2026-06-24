import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    Clock, 
    ArrowRight
} from 'lucide-react';
import DashboardWelcomeBanner from '@/Components/DashboardWelcomeBanner';
import TeacherInfoCard from '@/Components/TeacherInfoCard';
import TeacherRightSidebar from '@/Components/TeacherRightSidebar';

export default function DocenteDashboard() {
    // 1. Datos simulados del docente autenticado
    const teacherInfo = {
        name: 'Mtro. Francisco Javier Hernández',
        specialty: 'Ciencias Exactas e Ingeniería',
        email: 'f.martinez@prepahidalgo.edu.mx'
    };

    // Materias y grupos asignados para el ciclo activo
    const assignedLoad = [
        { 
            id: 1, 
            code: 'MAT-101', 
            subject: 'Matemáticas I', 
            groupName: '1-A', 
            studentsCount: 22, 
            schedule: 'Lunes y Miércoles 07:00 - 08:40',
            status: 'completed' // Notas completas del parcial
        },
        { 
            id: 2, 
            code: 'FIS-101', 
            subject: 'Física I', 
            groupName: '2-B', 
            studentsCount: 18, 
            schedule: 'Martes y Jueves 08:40 - 10:20',
            status: 'pending' // Notas pendientes de asentar
        }
    ];

    const upcomingTasks = [
        { id: 1, title: 'Límite de captura del Primer Parcial', date: 'En 3 días', urgent: true },
        { id: 2, title: 'Reunión de Academia de Ciencias', date: 'Viernes 26 de Junio', urgent: false },
        { id: 3, title: 'Subir planeación semestral de Física II', date: 'Próxima semana', urgent: false }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Panel del Docente" />

            {/* Layout de Dos Columnas */}
            <div className="flex flex-col lg:flex-row bg-[#f5f7fb] min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-hidden font-body -m-6 md:-m-8">
                
                {/* Columna Izquierda: Panel Principal */}
                <div className="flex-1 p-6 md:p-8 space-y-6 min-w-0 lg:overflow-y-auto lg:h-full">
                    
                    {/* Banner de Bienvenida */}
                    <DashboardWelcomeBanner 
                        greeting={`Hola ${teacherInfo.name}`}
                        subtitle="Portal Docente"
                        wrapperClassName="pb-2"
                    />

                    {/* Contenedor Unificado (Cuadro Principal) */}
                    <div className="bg-white rounded-none md:rounded-2xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 space-y-8">
                        
                        {/* Ficha Resumen del Profesor */}
                        <TeacherInfoCard 
                            name={teacherInfo.name}
                            specialty={teacherInfo.specialty}
                            email={teacherInfo.email}
                        />

                        {/* Carga Académica Asignada */}
                        <div className="space-y-4 text-left">
                            <h4 className="text-sm font-bold text-slate-700">Grupos y Materias Asignadas</h4>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {assignedLoad.map((load) => (
                                    <div key={load.id} className="bg-slate-50 border border-slate-150 hover:border-[#1e88e5]/40 hover:bg-slate-50/80 transition-all duration-300 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] font-bold text-slate-400">{load.code}</span>
                                                <span className={`inline-flex px-2 py-0.5 text-[9px] font-extrabold rounded-md ${
                                                    load.status === 'completed' 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                }`}>
                                                    {load.status === 'completed' ? 'Notas Cargadas' : 'Notas Pendientes'}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-slate-800 text-base leading-tight">{load.subject}</h4>
                                                <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                                                    <Clock size={12} className="text-slate-400" />
                                                    {load.schedule}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 justify-between sm:justify-start">
                                            {/* Total Alumnos */}
                                            <div className="text-left sm:text-center space-y-0.5">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Alumnos</span>
                                                <span className="text-base font-black text-slate-800 block flex items-center gap-1">
                                                    <Users size={15} className="text-slate-400" />
                                                    {load.studentsCount}
                                                </span>
                                            </div>

                                            {/* Grupo Badge */}
                                            <div className="text-left sm:text-center space-y-0.5">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Grupo</span>
                                                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg block">
                                                    {load.groupName}
                                                </span>
                                            </div>

                                            {/* Acción Capturar */}
                                            <Link 
                                                href={`/docente/grupos/show?grupo=${load.groupName}&materia=${encodeURIComponent(load.subject)}`}
                                                className="h-10 w-10 bg-slate-100 hover:bg-[#1e88e5] text-slate-650 hover:text-white rounded-xl flex items-center justify-center transition-all border border-slate-150 shadow-sm"
                                            >
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Columna Derecha: Avisos y Calendario */}
                <TeacherRightSidebar tasks={upcomingTasks} />

            </div>
        </AuthenticatedLayout>
    );
}
