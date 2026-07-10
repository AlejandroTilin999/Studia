import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Save, 
    Check, 
    AlertCircle,
    Plus,
    ClipboardList,
    FileText,
    CheckCircle2,
    Calendar,
    Users
} from 'lucide-react';
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import TeacherRightSidebar from '@/Components/TeacherRightSidebar';
import AppTable from '@/Components/AppTable';
import BaseModal from '@/Components/BaseModal';
import { Label } from '@/Components/Label';
import { Input } from '@/Components/Input';

interface StudentGrade {
    id: number;
    matricula: string;
    name: string;
    score: string;
    remarks: string;
}

interface Task {
    id: number;
    title: string;
    desc: string;
    deadline: string;
}

interface Submission {
    id: number;
    studentName: string;
    matricula: string;
    taskTitle: string;
    fileName: string;
    submittedAt: string;
    status: 'Pendiente' | 'Calificado';
    grade: string;
}

export default function DocenteGruposShow() {
    // 1. Leer parámetros del grupo y materia de la URL de manera segura
    const [grupo, setGrupo] = useState('1-A');
    const [materia, setMateria] = useState('Matemáticas I');
    const [activeTab, setActiveTab] = useState<'grades' | 'tasks' | 'submissions'>('grades');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const groupParam = params.get('grupo');
        const subjectParam = params.get('materia');
        if (groupParam) setGrupo(groupParam);
        if (subjectParam) setMateria(subjectParam);
    }, []);

    // 2. Estado de alumnos y calificaciones
    const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([
        { id: 1, matricula: 'PH2026-001', name: 'José Eduardo Gómez', score: '9.3', remarks: 'Excelente desempeño en álgebra' },
        { id: 2, matricula: 'PH2026-002', name: 'Ana Sofía López', score: '10.0', remarks: 'Examen perfecto' },
        { id: 3, matricula: 'PH2026-007', name: 'Beto Benítez Juárez', score: '7.5', remarks: 'Falta entregar algunas tareas' },
        { id: 4, matricula: 'PH2026-008', name: 'Karla Castillo Vega', score: '6.0', remarks: 'Justo a tiempo en proyecto' }
    ]);

    // 3. Estado de Tareas Asignadas
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, title: 'Ensayo sobre Revolución Industrial', desc: 'Redactar un ensayo individual de mínimo 3 cuartillas en formato APA sobre causas y consecuencias.', deadline: '2026-07-15' },
        { id: 2, title: 'Proyecto de Física: Rampa Hidráulica', desc: 'Construcción física y entrega de reporte de cálculos aplicando la Ley de Pascal.', deadline: '2026-07-20' }
    ]);

    // 4. Estado de Entregas por calificar
    const [submissions, setSubmissions] = useState<Submission[]>([
        { id: 1, studentName: 'José Eduardo Gómez', matricula: 'PH2026-001', taskTitle: 'Proyecto de Física: Rampa Hidráulica', fileName: 'proyecto_eduardo_rampa.pdf', submittedAt: 'Hoy, 10:14 AM', status: 'Pendiente', grade: '' },
        { id: 2, studentName: 'Ana Sofía López', matricula: 'PH2026-002', taskTitle: 'Proyecto de Física: Rampa Hidráulica', fileName: 'sofia_rampa_hidraulica.docx', submittedAt: 'Ayer, 6:30 PM', status: 'Calificado', grade: '10.0' },
        { id: 3, studentName: 'Beto Benítez Juárez', matricula: 'PH2026-007', taskTitle: 'Ensayo sobre Revolución Industrial', fileName: 'ensayo_revolucion_beto.pdf', submittedAt: 'Hace 2 días', status: 'Pendiente', grade: '' }
    ]);

    // Modales y formularios
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskDeadline, setNewTaskDeadline] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Cambios locales en la planilla de calificaciones
    const handleScoreChange = (id: number, val: string) => {
        setStudentGrades(studentGrades.map(sg => sg.id === id ? { ...sg, score: val } : sg));
    };

    const handleRemarksChange = (id: number, val: string) => {
        setStudentGrades(studentGrades.map(sg => sg.id === id ? { ...sg, remarks: val } : sg));
    };

    // Crear nueva tarea
    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle || !newTaskDeadline) return;

        const newTask: Task = {
            id: tasks.length + 1,
            title: newTaskTitle,
            desc: newTaskDesc,
            deadline: newTaskDeadline
        };

        setTasks([...tasks, newTask]);
        setIsCreateTaskModalOpen(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskDeadline('');
        triggerToast(`¡Tarea "${newTaskTitle}" creada y asignada al grupo!`);
    };

    // Calificar una entrega (e integrar con la planilla general)
    const handleGradeSubmission = (submissionId: number, gradeVal: string) => {
        const num = parseFloat(gradeVal);
        if (isNaN(num) || num < 0 || num > 10) {
            alert('Por favor, ingresa una calificación válida de 0 a 10.');
            return;
        }

        // Actualizar estado de entregas
        setSubmissions(submissions.map(sub => 
            sub.id === submissionId ? { ...sub, status: 'Calificado', grade: gradeVal } : sub
        ));

        // Encontrar alumno para sincronizar con la planilla general
        const sub = submissions.find(s => s.id === submissionId);
        if (sub) {
            setStudentGrades(studentGrades.map(sg => 
                sg.matricula === sub.matricula ? { ...sg, score: gradeVal, remarks: `Calificación de: ${sub.taskTitle}` } : sg
            ));
            triggerToast(`Calificación de ${gradeVal} asentada para ${sub.studentName}`);
        }
    };

    // Guardar planilla de calificaciones
    const handleSaveGrades = (e: React.FormEvent) => {
        e.preventDefault();
        let hasErrors = false;
        studentGrades.forEach(sg => {
            const num = parseFloat(sg.score);
            if (isNaN(num) || num < 0 || num > 10) {
                hasErrors = true;
            }
        });

        if (hasErrors) {
            alert('Por favor, ingresa calificaciones válidas en el rango de 0.00 a 10.00.');
            return;
        }

        triggerToast('Calificaciones oficiales asentadas y consolidadas en el sistema.');
    };

    const upcomingTasks = [
        { id: 1, title: 'Límite de captura del Primer Parcial', date: 'En 3 días', urgent: true },
        { id: 2, title: 'Reunión de Academia de Ciencias', date: 'Viernes 26 de Junio', urgent: false }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Detalles del Grupo" />

            {/* Layout de Dos Columnas */}
            <div className="flex flex-col lg:flex-row bg-[#f5f7fb] min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-hidden font-body -m-6 md:-m-8">
                
                {/* Columna Izquierda: Planilla de captura */}
                <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto lg:h-full">
                    
                    {/* Header Banner */}
                    <PageHeaderBanner 
                        title="Detalles y Control del Grupo"
                        subtitle={materia}
                        breadcrumb={`Docente / Grupos / ${grupo}`}
                    />

                    {/* Contenedor Principal */}
                    <div className="p-0 md:p-6 flex-1 overflow-hidden lg:overflow-visible flex flex-col">
                        <div className="bg-white rounded-none md:rounded-xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 flex-1 flex flex-col min-h-0 lg:min-h-fit space-y-6">

                            {/* Fila superior: Botón Regresar e Indicadores */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <Link 
                                        href="/docente/dashboard"
                                        className="p-2 hover:bg-slate-150 rounded-xl text-slate-500 hover:text-slate-800 transition-all border border-slate-200 bg-slate-50"
                                    >
                                        <ArrowLeft size={16} />
                                    </Link>
                                    <div className="text-left">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Regresar</span>
                                        <span className="font-extrabold text-slate-700 text-xs">Panel Docente</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-650 flex items-center gap-2 border border-slate-200">
                                        Grupo: <span className="text-slate-800 font-extrabold">{grupo}</span>
                                    </div>
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-650 flex items-center gap-2 border border-slate-200">
                                        Materia: <span className="text-slate-800 font-extrabold">{materia}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Selector de Pestañas (Diseño Premium) */}
                            <div className="flex border-b border-slate-200 gap-1 overflow-x-auto select-none">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('grades')}
                                    className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                                        activeTab === 'grades'
                                            ? 'border-[#1e88e5] text-[#1e88e5]'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <Users size={14} />
                                    Planilla de Calificaciones
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('tasks')}
                                    className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                                        activeTab === 'tasks'
                                            ? 'border-[#1e88e5] text-[#1e88e5]'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <ClipboardList size={14} />
                                    Tareas Asignadas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('submissions')}
                                    className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                                        activeTab === 'submissions'
                                            ? 'border-[#1e88e5] text-[#1e88e5]'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <FileText size={14} />
                                    Revisión de Entregas
                                    {submissions.filter(s => s.status === 'Pendiente').length > 0 && (
                                        <span className="bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                            {submissions.filter(s => s.status === 'Pendiente').length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* CONTENIDO DE LAS PESTAÑAS */}

                            {/* Pestaña 1: Planilla de Calificaciones */}
                            {activeTab === 'grades' && (
                                <div className="space-y-6 flex-1 flex flex-col justify-between">
                                    <div className="bg-slate-50 border border-slate-200/60 text-slate-600 p-4 rounded-xl flex items-start gap-3 text-left">
                                        <AlertCircle size={20} className="text-[#1e88e5] mt-0.5 flex-shrink-0" />
                                        <div className="text-xs space-y-1">
                                            <span className="font-extrabold block text-slate-800 text-sm">Lineamientos de Captura</span>
                                            <p>Ingresa las calificaciones oficiales en el rango de **0.00 a 10.00**.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSaveGrades} className="space-y-6 flex-1 flex flex-col justify-between">
                                        <AppTable
                                            data={studentGrades}
                                            keyExtractor={(item) => item.id}
                                            columns={[
                                                {
                                                    header: "Matrícula",
                                                    accessor: (row) => row.matricula,
                                                    className: "font-mono font-bold text-slate-900",
                                                },
                                                {
                                                    header: "Alumno",
                                                    accessor: (row) => row.name,
                                                    className: "font-extrabold text-slate-800",
                                                },
                                                {
                                                    header: "Calificación (0 - 10)",
                                                    align: "center",
                                                    headerClassName: "w-40",
                                                    accessor: (row) => (
                                                        <div className="flex justify-center">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                max="10"
                                                                required
                                                                value={row.score}
                                                                onChange={e => handleScoreChange(row.id, e.target.value)}
                                                                className="w-20 text-center font-extrabold text-sm py-2 px-1 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-slate-800 transition-all outline-none"
                                                            />
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    header: "Observaciones / Retroalimentación",
                                                    accessor: (row) => (
                                                        <input
                                                            type="text"
                                                            value={row.remarks}
                                                            onChange={e => handleRemarksChange(row.id, e.target.value)}
                                                            placeholder="Ej: Excelente avance..."
                                                            className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-slate-600 transition-all outline-none"
                                                        />
                                                    ),
                                                },
                                            ]}
                                        />

                                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                            <Link
                                                href="/docente/dashboard"
                                                className="px-5 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                                            >
                                                Cancelar
                                            </Link>
                                            <button
                                                type="submit"
                                                className="flex items-center gap-2 bg-[#1e88e5] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-[0.98]"
                                            >
                                                <Save size={14} />
                                                Asentar Calificaciones
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Pestaña 2: Tareas Asignadas */}
                            {activeTab === 'tasks' && (
                                <div className="space-y-6 text-left flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700">Actividades creadas en el ciclo</h4>
                                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Define las tareas para que los alumnos suban sus respuestas</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateTaskModalOpen(true)}
                                            className="bg-[#1e88e5] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
                                        >
                                            <Plus size={14} />
                                            Asignar Tarea
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 flex-1">
                                        {tasks.map((task) => (
                                            <div key={task.id} className="bg-slate-50 border border-slate-150 rounded-xl p-5 flex justify-between items-start gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-extrabold text-slate-800 text-base leading-tight">{task.title}</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                        {task.desc}
                                                    </p>
                                                    <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            Límite: {task.deadline}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pestaña 3: Revisión de Entregas */}
                            {activeTab === 'submissions' && (
                                <div className="space-y-6 text-left flex-1 flex flex-col">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">Revisión y Calificación de Entregas</h4>
                                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Asigna notas directamente desde los archivos recibidos de los alumnos</p>
                                    </div>

                                    <AppTable
                                        data={submissions}
                                        keyExtractor={(item) => item.id}
                                        columns={[
                                            {
                                                header: "Alumno",
                                                accessor: (row) => (
                                                    <div className="text-left">
                                                        <span className="font-extrabold text-slate-800 block leading-tight">{row.studentName}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{row.matricula}</span>
                                                    </div>
                                                ),
                                            },
                                            {
                                                header: "Tarea",
                                                accessor: (row) => row.taskTitle,
                                                className: "font-semibold text-slate-700 text-xs",
                                            },
                                            {
                                                header: "Archivo Subido",
                                                accessor: (row) => (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-[#1e88e5] font-extrabold underline cursor-pointer hover:text-blue-700">
                                                        <FileText size={14} />
                                                        {row.fileName}
                                                    </span>
                                                ),
                                            },
                                            {
                                                header: "Entregado",
                                                accessor: (row) => row.submittedAt,
                                                className: "text-slate-400 text-[11px] font-bold",
                                            },
                                            {
                                                header: "Estado",
                                                accessor: (row) => (
                                                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                                                        row.status === 'Calificado'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                ),
                                            },
                                            {
                                                header: "Calificar",
                                                align: "right",
                                                accessor: (row) => {
                                                    const [localGrade, setLocalGrade] = useState(row.grade);
                                                    return (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                max="10"
                                                                disabled={row.status === 'Calificado'}
                                                                value={localGrade}
                                                                onChange={e => setLocalGrade(e.target.value)}
                                                                placeholder="0.0"
                                                                className="w-16 text-center font-extrabold text-xs py-1 px-1 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-slate-800 transition-all outline-none disabled:opacity-60"
                                                            />
                                                            {row.status === 'Pendiente' ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleGradeSubmission(row.id, localGrade)}
                                                                    className="bg-[#1e88e5] hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                                                                >
                                                                    Calificar
                                                                </button>
                                                            ) : (
                                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                                            )}
                                                        </div>
                                                    );
                                                },
                                            },
                                        ]}
                                    />
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Avisos y Calendario */}
                <TeacherRightSidebar />
            </div>

            {/* Modal: Crear Tarea */}
            <BaseModal
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                title="Asignar Nueva Tarea"
                subtitle="Crea una actividad para el grupo y especifica los lineamientos de entrega"
                onSubmit={handleCreateTask}
                confirmLabel="Asignar"
                cancelLabel="Cerrar"
            >
                <div className="space-y-4 text-left">
                    <div className="space-y-1.5">
                        <Label htmlFor="task-title" className="text-xs font-bold text-slate-500 uppercase">Título de la Tarea</Label>
                        <Input 
                            id="task-title"
                            required
                            type="text"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            placeholder="Ej: Proyecto Final, Ensayo de Investigación..."
                            className="w-full text-sm font-semibold rounded-xl border-slate-200"
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <Label htmlFor="task-desc" className="text-xs font-bold text-slate-500 uppercase">Instrucciones / Descripción</Label>
                        <textarea 
                            id="task-desc"
                            value={newTaskDesc}
                            onChange={e => setNewTaskDesc(e.target.value)}
                            placeholder="Redacta los lineamientos, bibliografía sugerida y formato de entrega..."
                            rows={4}
                            className="w-full text-xs font-medium rounded-xl border-slate-200 p-3 outline-none focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="task-deadline" className="text-xs font-bold text-slate-500 uppercase">Fecha Límite</Label>
                        <Input 
                            id="task-deadline"
                            required
                            type="date"
                            value={newTaskDeadline}
                            onChange={e => setNewTaskDeadline(e.target.value)}
                            className="w-full text-sm font-semibold rounded-xl border-slate-200"
                        />
                    </div>
                </div>
            </BaseModal>

            {/* Toast Alerta */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 text-sm select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-emerald-500 p-1 rounded-full text-white">
                        <Check size={12} />
                    </div>
                    <span className="font-semibold">{toastMessage}</span>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
