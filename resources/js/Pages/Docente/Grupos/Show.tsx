import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Save, 
    Check, 
    AlertCircle
} from 'lucide-react';
import PageHeaderBanner from '@/Components/PageHeaderBanner';
import TeacherRightSidebar from '@/Components/TeacherRightSidebar';
import AppTable from '@/Components/AppTable';

interface StudentGrade {
    id: number;
    matricula: string;
    name: string;
    score: string;
    remarks: string;
}

export default function DocenteGruposShow() {
    // 1. Leer parámetros del grupo y materia de la URL de manera segura
    const [grupo, setGrupo] = useState('1-A');
    const [materia, setMateria] = useState('Matemáticas I');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const groupParam = params.get('grupo');
        const subjectParam = params.get('materia');
        if (groupParam) setGrupo(groupParam);
        if (subjectParam) setMateria(subjectParam);
    }, []);

    // 2. Estado local de alumnos y calificaciones asignadas para este grupo/materia
    const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([
        { id: 1, matricula: 'PH2026-001', name: 'José Eduardo Gómez', score: '9.5', remarks: 'Excelente desempeño en álgebra' },
        { id: 2, matricula: 'PH2026-002', name: 'Ana Sofía López', score: '10.0', remarks: 'Examen perfecto' },
        { id: 3, matricula: 'PH2026-007', name: 'Beto Benítez Juárez', score: '7.5', remarks: 'Falta entregar algunas tareas' },
        { id: 4, matricula: 'PH2026-008', name: 'Karla Castillo Vega', score: '6.0', remarks: 'Justo a tiempo en proyecto' }
    ]);

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // 3. Manejo de cambios locales en inputs
    const handleScoreChange = (id: number, val: string) => {
        setStudentGrades(studentGrades.map(sg => sg.id === id ? { ...sg, score: val } : sg));
    };

    const handleRemarksChange = (id: number, val: string) => {
        setStudentGrades(studentGrades.map(sg => sg.id === id ? { ...sg, remarks: val } : sg));
    };

    // 4. Guardar calificaciones (Simulado)
    const handleSaveGrades = (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
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

        triggerToast('Calificaciones guardadas y consolidadas en el sistema.');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Captura de Calificaciones" />

            {/* Layout de Dos Columnas */}
            <div className="flex flex-col lg:flex-row bg-[#f5f7fb] min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-hidden font-body -m-6 md:-m-8">
                
                {/* Columna Izquierda: Planilla de captura */}
                <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto lg:h-full">
                    
                    {/* Header Banner */}
                    <PageHeaderBanner 
                        title="Captura de Calificaciones"
                        subtitle={materia}
                        breadcrumb={`Docente / Grupos / ${grupo}`}
                    />

                    {/* Table Filters & Content Area */}
                    <div className="p-0 md:p-6 flex-1 overflow-hidden lg:overflow-visible flex flex-col">
                        <div className="bg-white rounded-none md:rounded-xl p-6 md:p-8 shadow-sm border-none md:border md:border-slate-100 flex-1 flex flex-col min-h-0 lg:min-h-fit space-y-6">

                            {/* Back Button and Group Badge */}
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
                                        <span className="font-extrabold text-slate-700 text-xs">Panel del Docente</span>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-650 flex items-center gap-2 border border-slate-200">
                                    Grupo: <span className="text-slate-800 font-extrabold">{grupo}</span>
                                </div>
                            </div>

                            {/* Panel de Ayuda / Info */}
                            <div className="bg-slate-50 border border-slate-200/60 text-slate-600 p-4 rounded-xl flex items-start gap-3 text-left">
                                <AlertCircle size={20} className="text-[#1e88e5] mt-0.5 flex-shrink-0" />
                                <div className="text-xs space-y-1">
                                    <span className="font-extrabold block text-slate-800 text-sm">Lineamientos de Captura</span>
                                    <p>Las calificaciones deben ser asentadas con valores numéricos entre **0.00 y 10.00**.</p>
                                    <p className="text-slate-400 font-semibold">Los cambios realizados aquí son temporales y se guardan al hacer click en el botón "Asentar Calificaciones" al final de la planilla.</p>
                                </div>
                            </div>

                            {/* Planilla de Captura */}
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
                                            className: "font-extrabold text-slate-855",
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
                                                        placeholder="0.0"
                                                        className="w-20 text-center font-extrabold text-sm py-2 px-1 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-slate-800 transition-all placeholder-slate-300"
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
                                                    placeholder="Ej: Excelente desempeño, requiere apoyo..."
                                                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#1e88e5] text-slate-600 transition-all placeholder-slate-300"
                                                />
                                            ),
                                        },
                                    ]}
                                />

                                {/* Botones de Acción */}
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
                    </div>
                </div>

                {/* Columna Derecha: Avisos y Calendario */}
                <TeacherRightSidebar />
            </div>

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
