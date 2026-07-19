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

    const currentStudentId = selectedStudentId || (studentGrades[0]?.id);
    const activeStudent = studentGrades.find(s => s.id === currentStudentId);

    const chatKey = `${selectedTask.id}:${currentStudentId}`;
    const chatList = privateMessages[chatKey] || [];

    const fileNames = ["Resolucion_Algebra.pdf", "Ejercicios_Geometria.pdf", "Entregable_Final.pdf"];
    const indexForStudent = studentGrades.findIndex(s => s.id === currentStudentId);
    const selectedFileName = fileNames[indexForStudent !== -1 ? indexForStudent % fileNames.length : 0];

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

    return (
        <div className="space-y-6">
            <button onClick={() => setSelectedTaskId(null)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                <ArrowLeft size={14} /> Volver al Muro
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200/60 p-5 rounded-2xl">
                <div className="flex-1 max-w-md text-left">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Revisando Alumno</label>
                    <select
                        value={currentStudentId || ''}
                        onChange={e => setSelectedStudentId(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-bold outline-none focus:ring-1 focus:ring-[#1e88e5] transition-all"
                    >
                        {studentGrades.map(s => {
                            const gradeValue = selectedTask.calificaciones[s.id];
                            const hasGrade = gradeValue !== "" && gradeValue !== undefined;
                            return (
                                <option key={s.id} value={s.id}>
                                    {s.nombre} ({hasGrade ? `Calificado: ${gradeValue}` : 'Pendiente'})
                                </option>
                            );
                        })}
                    </select>
                </div>
                {activeStudent && (
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#1e88e5]/10 flex items-center justify-center text-xs font-black text-[#1e88e5]">
                            {activeStudent.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="text-left">
                            <span className="text-[10px] font-bold text-slate-400 block">{activeStudent.matricula}</span>
                            <span className="text-xs font-black text-slate-750 block">{activeStudent.nombre}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="space-y-1 text-left">
                            <span className="text-[9px] font-black text-[#1e88e5] uppercase tracking-widest block">Actividad</span>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">{selectedTask.nombre}</h4>
                        </div>
                        <div className="flex flex-wrap gap-3.5 text-xs text-slate-455 font-bold uppercase tracking-wide">
                            <span className="flex items-center gap-1"><Calendar size={13} className="text-slate-400" /> Límite: {selectedTask.fecha_entrega}</span>
                            <span className="text-slate-200">|</span>
                            <span className="flex items-center gap-1"><FileText size={13} className="text-slate-400" /> Valor: {selectedTask.puntos || 10} pts</span>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-slate-100 text-left">
                            <div className="border-l-4 border-[#1e88e5] pl-4 py-1 text-slate-655 text-sm font-semibold leading-relaxed whitespace-pre-line">
                                {selectedTask.descripcion || 'Sin instrucciones adicionales.'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4 text-left">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">Foro de Mensajes Privados</h3>
                        <div className="bg-slate-50 rounded-2xl p-4 h-64 overflow-y-auto space-y-3.5 border border-slate-100/50">
                            {chatList.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">No hay mensajes.</div>
                            ) : (
                                chatList.map((msg, mIdx) => (
                                    <div key={mIdx} className={`flex flex-col max-w-[85%] ${msg.sender === 'docente' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                        <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{msg.senderName} · {msg.timestamp}</span>
                                        <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${msg.sender === 'docente' ? 'bg-[#1e88e5] text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <form onSubmit={e => { e.preventDefault(); currentStudentId && sendPrivateMessage(chatKey); }} className="flex gap-2">
                            <input type="text" value={chatInputText} onChange={e => setChatInputText(e.target.value)} placeholder="Escribe un mensaje privado..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] transition-all" />
                            <button type="submit" className="bg-[#1e88e5] hover:bg-blue-700 text-white px-5 rounded-xl font-extrabold text-xs transition-all">Enviar</button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Entregado</span>
                        </div>
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Detalle de Calificación</span>
                            <div className="flex items-center justify-between gap-4 pt-2">
                                <span className="text-xs font-black text-slate-655 uppercase">Calificación Obtenida</span>
                                <div className="flex items-center gap-1.5">
                                    <select
                                        value={activeStudent ? (selectedTask.calificaciones[activeStudent.id] ?? '') : ''}
                                        onChange={e => activeStudent && handleTaskGradeChange(selectedTask.id, activeStudent.id, e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 outline-none focus:ring-1 focus:ring-[#1e88e5] transition-all cursor-pointer"
                                    >
                                        <option value="">— Sin Calificar —</option>
                                        {(() => {
                                            const pts = selectedTask.puntos || 10;
                                            const opts = [];
                                            for (let i = pts; i >= 0; i -= 0.5) opts.push(i);
                                            return opts.map(val => <option key={val} value={val}>{val}</option>);
                                        })()}
                                    </select>
                                    <span className="text-xs font-bold text-slate-400">/ {selectedTask.puntos || 10}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 mt-4 space-y-2 text-left">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Archivo Adjunto</span>
                                <div onClick={() => setIsPdfModalOpen(true)} className="flex items-center justify-between border border-slate-150 hover:bg-blue-50/25 p-3.5 rounded-xl cursor-pointer transition-all group bg-slate-50/40">
                                    <div className="flex items-center gap-2.5">
                                        <FileText size={15} className="text-rose-500" />
                                        <div className="text-left">
                                            <span className="text-xs font-bold text-slate-755 block truncate max-w-[130px]">{selectedFileName}</span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase block">PDF · 1.4 MB · Abrir</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={12} className="text-[#1e88e5] group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isPdfModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500"><FileText size={20} /></div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 leading-none">{selectedFileName}</h4>
                                    <span className="text-[10px] font-bold text-slate-450 mt-1 block">Visor de Studia</span>
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsPdfModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2.5 rounded-xl transition-all"><X size={16} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50 flex justify-center">
                            <div className="bg-white w-full max-w-2xl aspect-[1/1.4] shadow-lg border border-slate-200 p-12 flex flex-col justify-between relative rounded-sm">
                                <div className="space-y-2 text-left">
                                    <div className="text-[10px] font-black text-[#1e88e5] uppercase tracking-widest">ACTIVIDAD ACADÉMICA</div>
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedTask.nombre}</h2>
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
                                        <span>Alumno: {activeStudent?.nombre}</span>
                                        <span>Matrícula: {activeStudent?.matricula}</span>
                                    </div>
                                </div>
                                <div className="flex-1 py-8 text-left text-xs text-slate-500 font-medium">Contenido del documento simulado para revisión académica...</div>
                                <div className="pt-4 border-t border-slate-200 text-center text-[9px] font-bold text-slate-450">Studia Cloud Services · {new Date().getFullYear()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
