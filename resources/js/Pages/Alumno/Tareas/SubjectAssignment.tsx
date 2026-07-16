import * as React from 'react';
import { useState } from 'react';
import {
    ChevronLeft,
    FileText,
    Award,
    Send,
    Check,
    Upload,
    Paperclip,
    X,
    Calendar,
    MessageCircle,
    CheckCircle2
} from 'lucide-react';

interface Task {
    id: number;
    subjectName?: string;
    title: string;
    status: string;
    desc: string;
    points?: string;
    deadline?: string;
}

interface SubjectAssignmentProps {
    task: Task;
    otherTasks: Task[];
    onBack: () => void;
    onSwitchTask: (task: Task) => void;
    attachedFile: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: () => void;
    onDeliver: () => void;
    onCancelDeliver?: () => void;
    comments: string[];
    onAddComment: (text: string) => void;
    teacherName: string;
}

export default function SubjectAssignment({
    task,
    otherTasks,
    onBack,
    onSwitchTask,
    attachedFile,
    onFileChange,
    onRemoveFile,
    onDeliver,
    onCancelDeliver,
    comments,
    onAddComment,
    teacherName
}: SubjectAssignmentProps) {
    const [localComment, setLocalComment] = useState('');

    const handleSendComment = () => {
        if (!localComment.trim()) return;
        onAddComment(localComment.trim());
        setLocalComment('');
    };

    const handleUploadClick = () => {
        document.getElementById('asymmetric-file-input')?.click();
    };

    const isDelivered = task.status === 'Entregado';

    // Determinar el peso y la calificación en base de 10
    const getTaskWeight = (taskId: number) => {
        switch (taskId) {
            case 1: return 15;
            case 2: return 15;
            case 3: return 15;
            case 4: return 5;
            case 5: return 5;
            case 6: return 5;
            default: return 10;
        }
    };

    const getTaskGrade = (taskId: number) => {
        if (taskId === 6) return '9.5';
        return null;
    };

    const weightPercent = getTaskWeight(task.id);
    const grade = getTaskGrade(task.id);

    return (
        <div className="space-y-8 text-left animate-in fade-in duration-200 pt-2 bg-white">

            {/* Back Button */}
            <div className="pb-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors text-xs font-bold uppercase tracking-widest"
                >
                    <ChevronLeft size={16} />
                    Volver a la lista
                </button>
            </div>

            {/* Modern Layout (Unified grid to align right column at the same height as left column title) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Side: Title, Metadata, Instructions and private chat (8 columns) */}
                <div className="lg:col-span-8 space-y-8 min-w-0">

                    {/* Title & Metadata (Clean and without box containers) */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                           <span className="text-[10px] font-black text-[#0266E0] uppercase tracking-widest block">
                               Actividad Académica
                           </span>
                           <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                               {task.title}
                           </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-450 uppercase tracking-wide">
                           <span>Docente: {teacherName}</span>
                           <span className="text-slate-200">|</span>
                           <span className="flex items-center gap-1.5">
                               <Calendar size={13} />
                               Límite: {task.deadline}
                           </span>
                        </div>
                    </div>

                    {/* Instructions - Minimalist quote-style with a left indicator line */}
                    <div className="space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Instrucciones
                        </span>
                        <div className="border-l-4 border-[#0266E0] pl-5 py-1 text-slate-600 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line">
                            {task.desc}
                        </div>
                    </div>

                    {/* Forum / Private comments with teacher */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={16} className="text-slate-500" />
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                Foro de Mensajes Privados
                            </h4>
                        </div>

                        <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2">
                            {comments.length === 0 ? (
                                <span className="text-xs text-slate-400 font-semibold block">
                                    No hay comentarios privados en esta entrega. Envía una consulta directamente a tu docente.
                                </span>
                            ) : (
                                comments.map((cmt, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-[20px] text-xs space-y-1 text-left border border-slate-100">
                                        <span className="font-extrabold text-slate-700 block text-[10px] uppercase tracking-wider">
                                            {idx % 2 === 0 ? 'Tú (Alumno)' : teacherName}
                                        </span>
                                        <p className="text-slate-600 font-medium leading-relaxed">{cmt}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input field */}
                        <div className="flex gap-2 pt-1">
                            <input
                                type="text"
                                value={localComment}
                                onChange={e => setLocalComment(e.target.value)}
                                placeholder="Escribe un mensaje privado para el docente..."
                                className="flex-1 text-xs py-3 px-4 bg-slate-50 border border-slate-200 rounded-[14px] focus:bg-white focus:ring-1 focus:ring-[#0266E0] text-slate-700 transition-all outline-none"
                                onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                            />
                            <button
                                type="button"
                                onClick={handleSendComment}
                                className="p-3 bg-[#0266E0] hover:bg-blue-700 text-white rounded-[14px] transition-all flex items-center justify-center"
                            >
                                <Send size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Delivery Details & Actions (4 columns) - Completely borderless */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Delivery Status and Upload space (Flat, clean, borderless) */}
                    <div className="space-y-5 text-left bg-white">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                Estado de Entrega
                            </span>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-extrabold text-slate-800 truncate pr-2">
                                    {task.title}
                                </span>
                                <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-md ${
                                    isDelivered
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                    {task.status}
                                </span>
                            </div>
                        </div>

                        {/* Flat Evaluation Table (No shadows, plain font, scale of 10) */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                Detalle de Calificación
                            </span>
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[9px] text-slate-400 font-black uppercase tracking-wider">
                                        <th className="pb-1.5 font-black">Concepto de Rúbrica</th>
                                        <th className="pb-1.5 text-right font-black">Valor / Nota</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-750 font-bold">
                                    <tr>
                                        <td className="py-2">Escala Máxima</td>
                                        <td className="py-2 text-right font-extrabold">10.0 Puntos</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">Peso en Classroom (60% Total)</td>
                                        <td className="py-2 text-right font-extrabold">{weightPercent}%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">Calificación Obtenida</td>
                                        <td className="py-2 text-right font-black text-[#0266E0]">
                                            {grade ? `${grade} / 10` : 'Sin calificar'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Dynamic Button Area (No dashed boxes, pure interactive button states) */}
                        <div className="space-y-3 pt-2">
                            <input
                                type="file"
                                id="asymmetric-file-input"
                                className="hidden"
                                onChange={onFileChange}
                            />

                            {isDelivered ? (
                                <div className="space-y-4">
                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-[20px] p-4 text-center text-emerald-600 flex flex-col items-center justify-center gap-2">
                                        <CheckCircle2 size={24} className="text-emerald-500" />
                                        <div>
                                            <span className="text-xs font-black block uppercase tracking-wide">Actividad Entregada</span>
                                            <span className="text-[10px] text-emerald-600/70 font-semibold block mt-0.5">El reporte fue guardado</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onCancelDeliver}
                                        className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-l-full rounded-tr-full rounded-br-none flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-none border-0"
                                    >
                                        Anular Entrega
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Show attached file if present */}
                                    {attachedFile && (
                                        <div className="border border-slate-200 bg-white rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-none">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Paperclip size={16} className="text-slate-450 shrink-0" />
                                                <span className="text-xs font-bold text-slate-700 block truncate max-w-[170px]">
                                                    {attachedFile.name}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={onRemoveFile}
                                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Action button changes state from "Cargar" to "Entregar" */}
                                    {!attachedFile ? (
                                        <button
                                            type="button"
                                            onClick={handleUploadClick}
                                            className="w-full h-11 bg-[#0266E0] hover:bg-blue-700 text-white rounded-l-full rounded-tr-full rounded-br-none flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-none border-0"
                                        >
                                            Cargar Reporte
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={onDeliver}
                                            className="w-full h-11 bg-[#0266E0] hover:bg-blue-700 text-white rounded-l-full rounded-tr-full rounded-br-none flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-none border-0"
                                        >
                                            Entregar Actividad
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation list (Clean & borderless list) */}
                    <div className="space-y-3 pt-4 border-t border-slate-100 text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Otras Actividades del Curso
                        </span>
                        <div className="space-y-2">
                            {otherTasks.length === 0 ? (
                                <span className="text-xs text-slate-400 font-semibold block">No hay más tareas registradas.</span>
                            ) : (
                                otherTasks.map(oth => (
                                    <div
                                        key={oth.id}
                                        onClick={() => onSwitchTask(oth)}
                                        className="p-3 hover:bg-slate-50 border-0 rounded-xl cursor-pointer transition-all text-xs font-bold text-slate-655 block truncate hover:text-[#0266E0]"
                                    >
                                        {oth.title}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
