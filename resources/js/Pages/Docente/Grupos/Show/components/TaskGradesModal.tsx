import React from 'react';
import { ArrowLeft, Calendar, FileText, ChevronRight, X } from 'lucide-react';
import { Task, StudentGrade } from '../services/constants';

interface TaskGradesModalProps {
    selectedTaskId: number;
    setSelectedTaskId: (id: number | null) => void;
    tasks: Task[];
    studentGrades: StudentGrade[];
    selectedStudentId: number | null;
    setSelectedStudentId: (id: number | null) => void;
    privateMessages: Record<string, { sender: 'alumno' | 'docente', senderName: string, text: string, timestamp: string }[]>;
    chatInputText: string;
    setChatInputText: (text: string) => void;
    sendPrivateMessage: (key: string) => void;
    isPdfModalOpen: boolean;
    setIsPdfModalOpen: (open: boolean) => void;
    saveTasks: (newTasks: Task[]) => void;
}

export default function TaskGradesModal({
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    studentGrades,
    selectedStudentId,
    setSelectedStudentId,
    privateMessages,
    chatInputText,
    setChatInputText,
    sendPrivateMessage,
    isPdfModalOpen,
    setIsPdfModalOpen,
    saveTasks
}: TaskGradesModalProps) {
    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    if (!selectedTask) return null;

    // Tomar el alumno seleccionado actual, o el primero por defecto
    const currentStudentId = selectedStudentId || (studentGrades[0]?.id);
    const activeStudent = studentGrades.find(s => s.id === currentStudentId);

    // Mensajes privados para el alumno seleccionado
    const chatKey = `${selectedTask.id}:${currentStudentId}`;
    const chatList = privateMessages[chatKey] || [];

    // Archivo PDF simulado por alumno
    const fileNames = [
        "Reporte_Practica_Algebra.pdf",
        "Solucion_Polinomios_Geometria.pdf",
        "Calculo_Entregable_Final.pdf"
    ];
    const indexForStudent = studentGrades.findIndex(s => s.id === currentStudentId);
    const selectedFileName = fileNames[indexForStudent !== -1 ? indexForStudent % fileNames.length : 0];

    function handleTaskGradeChange(taskId: number, studentId: number, scoreVal: string) {
        const targetTask = tasks.find(t => t.id === taskId);
        const maxPoints = targetTask?.points ?? 10;
        const score = parseFloat(scoreVal);
        if (scoreVal !== "" && (isNaN(score) || score < 0 || score > maxPoints)) return;

        saveTasks(tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    grades: { ...t.grades, [studentId]: scoreVal }
                };
            }
            return t;
        }));
    }

    return (
        <div className="space-y-6">
            {/* Botón de retroceso */}
            <button
                onClick={() => setSelectedTaskId(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
                <ArrowLeft size={14} />
                Volver al Muro de Actividades
            </button>

            {/* Dropdown superior selector de alumnos */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200/60 p-5 rounded-2xl">
                <div className="flex-1 max-w-md text-left">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Revisando Alumno
                    </label>
                    <select
                        value={currentStudentId || ''}
                        onChange={e => setSelectedStudentId(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold outline-none focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                    >
                        {studentGrades.map(s => {
                            const gradeValue = selectedTask.grades[s.id];
                            const hasGrade = gradeValue !== "" && gradeValue !== undefined;
                            return (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({hasGrade ? `Calificado: ${gradeValue}` : 'Pendiente de calificar'})
                                </option>
                            );
                        })}
                    </select>
                </div>
                {activeStudent && (
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#1e88e5]/10 flex items-center justify-center text-xs font-black text-[#1e88e5]">
                            {activeStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="text-left">
                            <span className="text-[10px] font-bold text-slate-400 block">{activeStudent.matricula}</span>
                            <span className="text-xs font-black text-slate-750 block">{activeStudent.name}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid de 2 columnas estilo vista del alumno */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Columna Izquierda (7 cols) - Información & Foro de Mensajes Privados */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Ficha técnica e instrucciones */}
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="space-y-1 text-left">
                            <span className="text-[9px] font-black text-[#1e88e5] uppercase tracking-widest block">Actividad Académica</span>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">{selectedTask.name}</h4>
                        </div>

                        <div className="flex flex-wrap gap-3.5 text-xs text-slate-455 font-bold uppercase tracking-wide">
                            <span className="flex items-center gap-1">
                                <Calendar size={13} className="text-slate-400" />
                                Límite: {selectedTask.deadline}
                            </span>
                            <span className="text-slate-200">|</span>
                            <span className="flex items-center gap-1">
                                <FileText size={13} className="text-slate-400" />
                                Valor: {selectedTask.points || 10} pts
                            </span>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-100 text-left">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Instrucciones</span>
                            <div className="border-l-4 border-[#1e88e5] pl-4 py-1 text-slate-655 text-sm font-semibold leading-relaxed whitespace-pre-line">
                                {selectedTask.description || 'Sin instrucciones adicionales.'}
                            </div>
                        </div>
                    </div>

                    {/* Foro de mensajes privados */}
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-left">
                            <FileText size={14} className="text-slate-400" />
                            Foro de Mensajes Privados con el Alumno
                        </h3>

                        {/* Contenedor de mensajes */}
                        <div className="bg-slate-50 rounded-2xl p-4 h-64 overflow-y-auto space-y-3.5 border border-slate-100/50">
                            {chatList.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs font-medium">
                                    No hay mensajes en este foro privado. Envía un mensaje abajo para iniciar.
                                </div>
                            ) : (
                                chatList.map((msg, mIdx) => (
                                    <div
                                        key={mIdx}
                                        className={`flex flex-col max-w-[85%] ${
                                            msg.sender === 'docente' ? 'ml-auto items-end' : 'mr-auto items-start'
                                        }`}
                                    >
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                            {msg.senderName} · {msg.timestamp}
                                        </span>
                                        <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                                            msg.sender === 'docente'
                                                ? 'bg-[#1e88e5] text-white rounded-tr-none'
                                                : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Campo de envío de mensaje */}
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                if (currentStudentId) sendPrivateMessage(chatKey);
                            }}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                value={chatInputText}
                                onChange={e => setChatInputText(e.target.value)}
                                placeholder={`Escribe un mensaje privado para ${activeStudent?.name || 'el alumno'}...`}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                            />
                            <button
                                type="submit"
                                className="bg-[#1e88e5] hover:bg-blue-700 text-white px-5 rounded-xl font-extrabold text-xs transition-all active:scale-[0.98] shrink-0"
                            >
                                Enviar
                            </button>
                        </form>
                    </div>
                </div>

                {/* Columna Derecha (5 cols) - Calificación & Visualizador PDF */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Estado y Calificación */}
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-5">
                        {/* Estado de entrega */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado de Entrega</span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                Entregado
                            </span>
                        </div>

                        {/* Detalle de calificación */}
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Detalle de Calificación</span>

                            <div className="flex items-center justify-between text-xs font-bold text-slate-550">
                                <span>Escala de Rúbrica</span>
                                <span className="text-slate-800 font-extrabold">{selectedTask.points || 10} Puntos</span>
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-2">
                                <span className="text-xs font-black text-slate-655 uppercase tracking-wide">Calificación Obtenida</span>
                                <div className="flex items-center gap-1.5">
                                    <select
                                        value={activeStudent ? (selectedTask.grades[activeStudent.id] ?? '') : ''}
                                        onChange={e => activeStudent && handleTaskGradeChange(selectedTask.id, activeStudent.id, e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 outline-none focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all cursor-pointer"
                                    >
                                        <option value="">— Sin Calificar —</option>
                                        {(() => {
                                            const pts = selectedTask.points || 10;
                                            const opts = [];
                                            for (let i = pts; i >= 0; i -= 0.5) {
                                                opts.push(i);
                                            }
                                            return opts.map(val => (
                                                <option key={val} value={val}>
                                                    {val}
                                                </option>
                                            ));
                                        })()}
                                    </select>
                                    <span className="text-xs font-bold text-slate-400">/ {selectedTask.points || 10}</span>
                                </div>
                            </div>

                            {/* Caja de archivo adjunto integrada en la misma tarjeta */}
                            <div className="pt-4 border-t border-slate-100 mt-4 space-y-2 text-left">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Archivo Adjunto por el Alumno</span>
                                <div
                                    onClick={() => setIsPdfModalOpen(true)}
                                    className="flex items-center justify-between border border-slate-150 hover:border-[#1e88e5] hover:bg-blue-50/25 p-3.5 rounded-xl cursor-pointer transition-all duration-200 group bg-slate-50/40"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <FileText size={15} className="text-rose-500" />
                                        <div className="text-left">
                                            <span className="text-xs font-bold text-slate-755 block truncate max-w-[130px]" title={selectedFileName}>
                                                {selectedFileName}
                                            </span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase block">PDF · 1.4 MB · Clic para abrir</span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-extrabold text-[#1e88e5] hover:text-blue-755 flex items-center gap-0.5">
                                        <span>Visualizar</span>
                                        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Otras actividades del curso */}
                    {(() => {
                        const otherTasks = tasks.filter(t => t.id !== selectedTask.id);
                        if (otherTasks.length === 0) return null;
                        return (
                            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Otras Actividades del Curso</span>
                                <div className="space-y-2">
                                    {otherTasks.map(ot => (
                                        <button
                                            key={ot.id}
                                            onClick={() => setSelectedTaskId(ot.id)}
                                            className="w-full text-left bg-slate-50 hover:bg-blue-50/20 border border-slate-100 hover:border-[#1e88e5] p-3 rounded-xl text-xs font-extrabold text-slate-705 hover:text-[#1e88e5] transition-all flex items-center justify-between group"
                                        >
                                            <span className="truncate max-w-[85%]">{ot.name}</span>
                                            <ChevronRight size={13} className="text-slate-400 group-hover:text-[#1e88e5] group-hover:translate-x-0.5 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Modal Visualizador PDF Pantalla Completa */}
            {isPdfModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100">
                        {/* Cabecera del visualizador */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 leading-none">{selectedFileName}</h4>
                                    <span className="text-[10px] font-bold text-slate-450 mt-1 block">Visor de Documentos de Studia</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500">
                                    <button type="button" className="hover:text-slate-700">—</button>
                                    <span className="text-slate-300">|</span>
                                    <span>100%</span>
                                    <span className="text-slate-300">|</span>
                                    <button type="button" className="hover:text-slate-700">+</button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsPdfModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-655 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-xl transition-all"
                                    title="Cerrar vista"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Cuerpo del Visualizador PDF (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-105/70 flex justify-center">
                            <div className="bg-white w-full max-w-2xl aspect-[1/1.4] shadow-lg border border-slate-250 p-12 flex flex-col justify-between select-none relative rounded-sm">
                                <div className="absolute top-6 right-6 text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200/85 px-3 py-1 rounded-md uppercase tracking-wider">
                                    Documento Válido
                                </div>

                                <div className="space-y-2 text-left">
                                    <div className="text-[10px] font-black text-[#1e88e5] uppercase tracking-widest">ACTIVIDAD ACADÉMICA PUBLICADA EN PLATAFORMA</div>
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedTask.name}</h2>
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
                                        <span>Alumno: {activeStudent?.name}</span>
                                        <span>Matrícula: {activeStudent?.matricula}</span>
                                    </div>
                                </div>

                                <div className="flex-1 py-8 space-y-6 text-left">
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">I. Planteamiento y Desarrollo</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            De acuerdo con las instrucciones de la actividad publicadas por el docente, se presenta a continuación la resolución detallada de los ejercicios planteados para la evaluación sumativa correspondiente a este parcial.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 font-mono text-sm text-[#1e88e5] font-bold space-y-3 shadow-inner">
                                        <div className="text-center font-sans text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Ecuación Cuadrática</div>
                                        <div className="text-center">f(x) = a x² + b x + c</div>
                                        <div className="text-center text-slate-400 font-sans text-xs">Fórmula General de Resolución:</div>
                                        <div className="text-center text-slate-800">x = &frac12; [ -b &plusmn; &radic;(b² - 4ac) ] / a</div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">II. Conclusiones</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            Los valores obtenidos satisfacen plenamente las condiciones de contorno fijadas en el problema original, garantizando la convergencia del método de cálculo aplicado.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 text-center text-[9px] font-bold text-slate-450">
                                    Documento generado y resguardado a través de Studia Cloud Services · {new Date().getFullYear()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
