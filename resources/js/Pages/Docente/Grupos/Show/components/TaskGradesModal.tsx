import React from 'react';
import { ArrowLeft, Calendar, FileText, ChevronRight, ChevronLeft, X, UserCircle2, ExternalLink } from 'lucide-react';
import { Task, StudentGrade } from '../services/constants';
import GradeSelector from './GradeSelector';
import StudiaPDFViewer from './StudiaPDFViewer';

const formatHumanDate = (dateStr?: string) => {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays > 1 && diffDays < 7) {
        return date.toLocaleDateString('es-ES', { weekday: 'long' }).replace(/^\w/, (c) => c.toUpperCase());
    }

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

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
    returnTaskGrade: (taskId: number, studentId: number, score: string) => Promise<any>;
    isReadOnly?: boolean;
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
    saveTasks,
    returnTaskGrade,
    isReadOnly = false
}: TaskGradesModalProps) {
    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    if (!selectedTask) return null;

    const [isReturning, setIsReturning] = React.useState(false);

    const currentStudentId = selectedStudentId || (studentGrades[0]?.id);
    const currentIndex = studentGrades.findIndex(s => s.id === currentStudentId);
    const activeStudent = studentGrades[currentIndex] || studentGrades[0];

    const studentFile = activeStudent ? selectedTask.archivos?.[activeStudent.id] : null;

    const chatKey = `${selectedTask.id}:${currentStudentId}`;
    const chatList = privateMessages[chatKey] || [];

    const fileNames = ["Resolucion_Algebra.pdf", "Ejercicios_Geometria.pdf", "Entregable_Final.pdf"];
    const selectedFileName = fileNames[currentIndex !== -1 ? currentIndex % fileNames.length : 0];

    function handleTaskGradeChange(taskId: number, studentId: number, scoreVal: string) {
        const targetTask = tasks.find(t => t.id === taskId);
        const maxPoints = targetTask?.puntos ?? 10;
        const score = parseFloat(scoreVal);
        if (scoreVal !== "" && (isNaN(score) || score < 0 || score > maxPoints)) return;

        saveTasks(tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    calificaciones: { ...t.calificaciones, [studentId]: scoreVal }
                };
            }
            return t;
        }));
    }

    const goToNext = () => {
        if (currentIndex < studentGrades.length - 1) {
            setSelectedStudentId(studentGrades[currentIndex + 1].id);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setSelectedStudentId(studentGrades[currentIndex - 1].id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button onClick={() => setSelectedTaskId(null)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft size={14} /> Volver al Muro
                </button>

                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    Calificando: {selectedTask.nombre}
                </div>
            </div>

            {/* BARRA DE NAVEGACIÓN "ZEN" (v6.0 Minimalista) */}
            <div className="bg-white border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between gap-4">

                {/* Navegación Izquierda */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Alumno</span>
                        <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{currentIndex + 1} / {studentGrades.length}</span>
                    </div>
                </div>

                {/* Info Central + Selector Integrado (Alineado a la derecha) */}
                <div className="flex-1 flex justify-end px-4">
                    <div className="relative group max-w-md">
                        <div className="flex items-center justify-end gap-2 py-1 px-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                            <h3 className="text-sm font-normal text-slate-800 tracking-tight truncate">{activeStudent?.nombre}</h3>
                            <ChevronRight size={13} className="text-slate-400 rotate-90" />
                        </div>

                        <select
                            value={currentStudentId || ''}
                            onChange={e => setSelectedStudentId(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                        >
                            {studentGrades.map(s => {
                                const gradeValue = selectedTask.calificaciones[s.id];
                                const hasGrade = gradeValue !== "" && gradeValue !== undefined;
                                return (
                                    <option key={s.id} value={s.id}>
                                        {s.nombre} {hasGrade ? `(${gradeValue})` : '—'}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Navegación Derecha */}
                <div className="flex items-center">
                    <button
                        onClick={goToNext}
                        disabled={currentIndex === studentGrades.length - 1}
                        className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4">
                        <div className="space-y-1 text-left">
                            <span className="text-[9px] font-black text-[#1e88e5] uppercase tracking-widest block">Actividad</span>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">{selectedTask.nombre}</h4>
                        </div>
                        <div className="flex flex-wrap gap-3.5 text-xs text-slate-455 font-normal uppercase tracking-wide">
                            <span className="flex items-center gap-1"><Calendar size={13} className="text-slate-400" /> Límite: {formatHumanDate(selectedTask.fecha_entrega)}</span>
                            <span className="text-slate-200">|</span>
                            <span className="flex items-center gap-1"><FileText size={13} className="text-slate-400" /> Valor: {selectedTask.puntos || 10} pts</span>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-slate-100 text-left">
                            <div className="border-l-4 border-[#1e88e5] pl-4 py-1 text-slate-655 text-sm font-semibold leading-relaxed whitespace-pre-line">
                                {selectedTask.descripcion || 'Sin instrucciones adicionales.'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4 text-left">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">Comentarios Privados</h3>

                        {chatList.length > 0 && (
                            <div className="bg-slate-50 rounded-2xl p-4 max-h-40 overflow-y-auto space-y-3.5 border border-slate-100/50">
                                {chatList.map((msg, mIdx) => (
                                    <div key={mIdx} className={`flex flex-col max-w-[85%] ${msg.sender === 'docente' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                        <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{msg.senderName} · {msg.timestamp}</span>
                                        <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${msg.sender === 'docente' ? 'bg-[#1e88e5] text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isReadOnly ? (
                            <form onSubmit={e => { e.preventDefault(); currentStudentId && sendPrivateMessage(chatKey); }} className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInputText}
                                    onChange={e => setChatInputText(e.target.value)}
                                    placeholder="Añadir un comentario para el alumno..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] transition-all"
                                />
                                <button type="submit" className="bg-[#1e88e5] hover:bg-blue-700 text-white px-5 rounded-xl font-extrabold text-xs transition-all">Enviar</button>
                            </form>
                        ) : (
                            <div className="p-3 bg-slate-50 rounded-xl text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-100/50">El foro de mensajes está cerrado</div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Entregado</span>
                        </div>
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Detalle de Calificación</span>
                            <div className="flex items-center justify-between gap-4 pt-2">
                                <span className="text-xs font-black text-slate-655 uppercase">Calificación Obtenida</span>
                                <div className="flex items-center gap-0">
                                    <GradeSelector
                                        initialValue={activeStudent ? (selectedTask.calificaciones[activeStudent.id] ?? '') : ''}
                                        max={selectedTask.puntos || 10}
                                        disabled={isReadOnly || isReturning}
                                        onChange={(val) => activeStudent && handleTaskGradeChange(selectedTask.id, activeStudent.id, val)}
                                    />
                                    <span className="text-sm font-normal text-slate-400">/{selectedTask.puntos || 10}</span>
                                </div>
                            </div>

                            {/* Botón Devolver Calificación */}
                            {!isReadOnly && activeStudent && (
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        disabled={isReturning || !selectedTask.calificaciones[activeStudent.id]}
                                        onClick={() => {
                                            setIsReturning(true);
                                            returnTaskGrade(selectedTask.id, activeStudent.id, selectedTask.calificaciones[activeStudent.id])
                                                .then(() => {
                                                    import('@/utils/SwalHelper').then(({ SwalHelper }) => {
                                                        SwalHelper.success('¡Enviado!', 'La calificación ha sido devuelta al alumno.');
                                                    });
                                                })
                                                .finally(() => setIsReturning(false));
                                        }}
                                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2
                                            ${isReturning ? 'bg-slate-100 text-slate-400' : 'bg-[#1e88e5] hover:bg-blue-700 text-white active:scale-[0.98]'}`}
                                    >
                                        {isReturning ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <ChevronRight size={14} className="-rotate-180" />
                                                Devolver Calificación
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[9px] text-slate-400 font-medium text-center mt-2 px-4 leading-tight">
                                        Al devolver, se notificará al alumno y se actualizará su promedio oficial.
                                    </p>
                                </div>
                            )}
                            <div className="pt-4 border-t border-slate-100 mt-4 space-y-2 text-left">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Entrega del Alumno</span>
                                {studentFile ? (
                                    <a
                                        href={studentFile.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between border border-slate-150 hover:bg-blue-50/25 p-3.5 rounded-xl cursor-pointer transition-all group bg-slate-50/40"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <ExternalLink size={15} className="text-[#0266E0] shrink-0" />
                                            <div className="text-left min-w-0">
                                                <span className="text-xs font-bold text-slate-755 block truncate max-w-[180px]">{studentFile.nombre || 'Documento de Google Drive'}</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase block">Abrir archivo en pestaña nueva</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={12} className="text-[#1e88e5] group-hover:translate-x-0.5 transition-transform" />
                                    </a>
                                ) : (
                                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Sin entrega disponible</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
