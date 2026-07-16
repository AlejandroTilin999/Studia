import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, ChevronRight, Paperclip, Download, Bell, Upload, Clock, Pencil } from 'lucide-react';
import { Task } from '../services/constants';
import { SwalHelper } from '@/utils/SwalHelper';

interface ActivityFormProps {
    editingTask: Task | null;
    onSave: (taskData: {
        name: string;
        description: string;
        type: 'task' | 'material';
        attachments: { name: string; size: string; type: string }[];
        deadline?: string;
        dueTime?: string;
        points?: number;
    }) => void;
    onCancelEdit: () => void;
}

function ActivityForm({ editingTask, onSave, onCancelEdit }: ActivityFormProps) {
    const [activityType, setActivityType] = useState<'task' | 'material'>('task');
    const [name, setName] = useState('');
    const [deadline, setDeadline] = useState('');
    const [dueTime, setDueTime] = useState('23:59');
    const [points, setPoints] = useState(10);
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState<{ name: string; size: string; type: string }[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Efecto para rellenar campos al editar
    useEffect(() => {
        if (editingTask) {
            setActivityType(editingTask.type || 'task');
            setName(editingTask.name);
            setDeadline(editingTask.deadline || '');
            setDueTime(editingTask.dueTime || '23:59');
            setPoints(editingTask.points || 10);
            setDescription(editingTask.description || '');
            setAttachments(editingTask.attachments || []);
        } else {
            resetForm();
        }
    }, [editingTask]);

    const resetForm = () => {
        setName('');
        setDeadline('');
        setDueTime('23:59');
        setPoints(10);
        setDescription('');
        setAttachments([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files).map(file => ({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type || 'application/pdf'
        }));
        setAttachments(prev => [...prev, ...filesArray]);
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onSave({
            name: name.trim(),
            description: description.trim(),
            type: activityType,
            attachments,
            ...(activityType === 'task' ? {
                deadline: deadline || new Date().toISOString().split('T')[0],
                dueTime: dueTime || '23:59',
                points: points,
            } : {})
        });

        resetForm();
    };

    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm h-fit">
            {/* Selector de Tipo de Publicación (Estilo de la pestaña de Login) */}
            <div className="flex bg-slate-100 rounded-xl overflow-hidden w-full mb-5">
                <button
                    type="button"
                    disabled={editingTask !== null}
                    onClick={() => setActivityType('task')}
                    className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 outline-none ${
                        editingTask !== null ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                        activityType === 'task'
                            ? 'bg-[#0266E0] text-white shadow-sm'
                            : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <FileText size={14} className={activityType === 'task' ? 'text-white' : 'text-slate-400'} />
                    Tarea
                </button>
                <button
                    type="button"
                    disabled={editingTask !== null}
                    onClick={() => setActivityType('material')}
                    className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 outline-none ${
                        editingTask !== null ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                        activityType === 'material'
                            ? 'bg-[#0266E0] text-white shadow-sm'
                            : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Bell size={14} className={activityType === 'material' ? 'text-white' : 'text-slate-400'} />
                    Material / Aviso
                </button>
            </div>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                {editingTask !== null ? <Pencil size={16} className="text-amber-500" /> : <Plus size={16} className="text-[#1e88e5]" />}
                {editingTask !== null ? 'Editar Publicación' : (activityType === 'task' ? 'Nueva Tarea' : 'Nuevo Aviso o Material')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título de la publicación</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={activityType === 'task' ? 'Ej. Tarea 3: Ecuaciones' : 'Ej. Material de apoyo: PDF de repaso'}
                        required
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-755 font-normal outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                    />
                </div>

                {activityType === 'task' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha límite</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={e => setDeadline(e.target.value)}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-755 font-normal outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Hora límite</label>
                                <input
                                    type="time"
                                    value={dueTime}
                                    onChange={e => setDueTime(e.target.value)}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-755 font-normal outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Puntos máximos</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={points}
                                onChange={e => setPoints(Number(e.target.value))}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-755 font-normal text-center outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descripción o Instrucciones</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Escribe el mensaje o las instrucciones detalladas aquí..."
                        rows={4}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-755 font-normal outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all resize-none"
                    />
                </div>

                {/* Archivos adjuntos */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Adjuntar Material de Apoyo (PDF / Archivo)</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-250 hover:border-[#1e88e5] hover:bg-slate-50/40 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all select-none"
                    >
                        <Upload size={18} className="text-slate-400" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Seleccionar archivo</span>
                        <span className="text-[9px] font-semibold text-slate-400">PDF, Word, Excel o Imágenes</span>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                    />

                    {attachments.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                            {attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                        <Paperclip size={12} className="text-[#1e88e5] shrink-0" />
                                        <span className="font-normal text-slate-700 truncate" title={file.name}>{file.name}</span>
                                        <span className="text-[9px] text-slate-400 shrink-0">({file.size})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAttachment(index)}
                                        className="text-slate-400 hover:text-rose-500 font-extrabold text-[10px] uppercase tracking-wider ml-2 shrink-0"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2 mt-2">
                    <button
                        type="submit"
                        className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-extrabold text-sm transition-all active:scale-[0.98] shadow-sm ${
                            editingTask !== null ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100/50' : 'bg-[#1e88e5] hover:bg-blue-700 shadow-blue-100/50'
                        }`}
                    >
                        {editingTask !== null ? <Pencil size={15} /> : <Plus size={15} />}
                        {editingTask !== null ? 'Guardar Cambios' : (activityType === 'task' ? 'Publicar Tarea' : 'Publicar Material')}
                    </button>
                    {editingTask !== null && (
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-205 text-slate-550 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-[0.98]"
                        >
                            Cancelar Edición
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

// ==========================================
// Subcomponent: ActivityCard (Tarjeta individual)
// ==========================================
interface ActivityCardProps {
    task: Task;
    index: number;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onSelectTask: (id: number) => void;
}

function ActivityCard({ task, index, onEdit, onDelete, onSelectTask }: ActivityCardProps) {
    const isTask = task.type !== 'material';

    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-none relative group space-y-4 transition-all duration-200">
            {/* Encabezado */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <span className={`text-[9px] font-semibold uppercase tracking-widest block ${isTask ? 'text-[#1e88e5]' : 'text-purple-600'}`}>
                        {isTask ? `Actividad Académica ${index + 1}` : 'Material de Apoyo / Aviso'}
                    </span>
                    <h4 className="text-base font-black text-slate-800 tracking-tight">{task.name}</h4>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(task)}
                        className="text-slate-350 hover:text-[#1e88e5] hover:bg-blue-50 p-2 rounded-xl transition-all"
                        title="Editar publicación"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="text-slate-350 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all"
                        title="Eliminar publicación"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3.5 text-xs text-slate-455 font-normal uppercase tracking-wide">
                {isTask ? (
                    <>
                        <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-slate-400" />
                            Límite: {task.deadline || 'Sin fecha'}
                        </span>
                        <span className="text-slate-200">|</span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            Hora: {task.dueTime || '23:59'} hrs
                        </span>
                        <span className="text-slate-200">|</span>
                        <span className="flex items-center gap-1">
                            <FileText size={13} className="text-slate-400" />
                            Valor: {task.points || 10} pts
                        </span>
                    </>
                ) : (
                    <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-semibold">
                        Compartido con el grupo
                    </span>
                )}
            </div>

            {/* Descripción / Instrucciones */}
            {task.description && (
                <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {isTask ? 'Instrucciones' : 'Descripción'}
                    </span>
                    <div className={`border-l-4 pl-4 py-1 text-slate-655 text-xs md:text-sm font-normal leading-relaxed whitespace-pre-line ${isTask ? 'border-[#1e88e5]' : 'border-purple-500'}`}>
                        {task.description}
                    </div>
                </div>
            )}

            {/* Archivos adjuntos */}
            {task.attachments && task.attachments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Material Adjunto</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {task.attachments.map((file, fileIdx) => (
                            <div key={fileIdx} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl hover:bg-slate-100/50 transition-colors">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText size={15} className="text-[#1e88e5]" />
                                    <div className="flex flex-col truncate">
                                        <span className="text-xs font-normal text-slate-700 truncate" title={file.name}>{file.name}</span>
                                        <span className="text-[9px] text-slate-400">{file.size}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => alert(`Simulación: Descargando ${file.name}`)}
                                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#1e88e5] hover:border-blue-200 transition-all shadow-sm"
                                    title="Descargar archivo"
                                >
                                    <Download size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            {isTask && (
                <div className="flex justify-end pt-3 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={() => onSelectTask(task.id)}
                        className="flex items-center gap-1 text-xs font-bold text-[#1e88e5] hover:text-blue-700 transition-colors"
                    >
                        <span>Ver Entregas y Calificar</span>
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}

// ==========================================
// Main Component: ActivitiesTab
// ==========================================
interface ActivitiesTabProps {
    tasks: Task[];
    saveTasks: (newTasks: Task[]) => void;
    setSelectedTaskId: (id: number | null) => void;
    grupo: string;
    materia: string;
}

export default function ActivitiesTab({
    tasks,
    saveTasks,
    setSelectedTaskId,
    grupo,
    materia
}: ActivitiesTabProps) {
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

    // Obtener la tarea activa para pasar al formulario de edición
    const editingTask = editingTaskId !== null ? tasks.find(t => t.id === editingTaskId) || null : null;

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'grades'>) => {
        if (editingTaskId !== null) {
            const updatedTasks = tasks.map(t => {
                if (t.id === editingTaskId) {
                    return {
                        ...t,
                        ...taskData,
                        // Limpiar campos de tarea si pasó a ser un aviso
                        ...(taskData.type === 'material' ? {
                            deadline: undefined,
                            dueTime: undefined,
                            points: undefined,
                        } : {})
                    };
                }
                return t;
            });
            saveTasks(updatedTasks);
            setEditingTaskId(null);
            SwalHelper.success('¡Actualizado!', 'La publicación ha sido actualizada correctamente.');
        } else {
            const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
            const newTask: Task = {
                id: nextId,
                ...taskData,
                grades: {}
            };
            saveTasks([...tasks, newTask]);
            SwalHelper.success('¡Publicado!', `Se ha creado la ${taskData.type === 'task' ? 'tarea' : 'publicación'} con éxito.`);
        }
    };

    const handleDeleteTask = (id: number) => {
        SwalHelper.confirm(
            '¿Eliminar publicación?',
            'Se perderán las notas asociadas si es una tarea. Esta acción no se puede deshacer.',
            'Sí, eliminar',
            'Cancelar',
            'warning'
        ).then((result) => {
            if (result.isConfirmed) {
                saveTasks(tasks.filter(t => t.id !== id));
                if (editingTaskId === id) {
                    setEditingTaskId(null);
                }
                SwalHelper.success('¡Eliminado!', 'La publicación ha sido removida.');
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* Formulario (4 cols) */}
            <div className="lg:col-span-4 h-fit">
                <ActivityForm
                    editingTask={editingTask}
                    onSave={handleSaveTask}
                    onCancelEdit={() => setEditingTaskId(null)}
                />
            </div>

            {/* Muro de Actividades (8 cols - Con scrollbar) */}
            <div className="lg:col-span-8 space-y-4 max-h-[620px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 sticky top-0 bg-slate-50/50 backdrop-blur-sm py-1 z-10">
                    <FileText size={16} className="text-slate-500" />
                    Muro de Actividades ({tasks.length})
                </h3>

                {tasks.length === 0 ? (
                    <div className="bg-white border border-slate-100 p-12 text-center text-slate-455 font-normal text-sm rounded-2xl">
                        No hay actividades publicadas para este parcial. ¡Usa el formulario de la izquierda para publicar la primera!
                    </div>
                ) : (
                    tasks.map((t, idx) => (
                        <ActivityCard
                            key={t.id}
                            task={t}
                            index={idx}
                            onEdit={handleStartEdit => setEditingTaskId(t.id)}
                            onDelete={handleDeleteTask}
                            onSelectTask={setSelectedTaskId}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
