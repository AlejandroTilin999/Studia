import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, ChevronRight, Paperclip, Download, Bell, Upload, Clock, Pencil } from 'lucide-react';
import { Task } from '../services/constants';
import { SwalHelper } from '@/utils/SwalHelper';
import { cn } from '@/lib/utils';

interface ActivityFormProps {
    editingTask: Task | null;
    onSave: (taskData: {
        nombre: string;
        descripcion: string;
        type: 'task' | 'material';
        attachments: { name: string; size: string; type: string }[];
        fecha_entrega?: string;
        puntos?: number;
    }) => void;
    onCancelEdit: () => void;
}

function ActivityForm({ editingTask, onSave, onCancelEdit }: ActivityFormProps) {
    const [activityType, setActivityType] = useState<'task' | 'material'>('task');
    const [nombre, setNombre] = useState('');
    const [fecha_entrega, setFechaEntrega] = useState('');
    const [puntos, setPuntos] = useState(10);
    const [descripcion, setDescripcion] = useState('');
    const [attachments, setAttachments] = useState<{ name: string; size: string; type: string }[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingTask) {
            setActivityType(editingTask.type || 'task');
            setNombre(editingTask.nombre);
            setFechaEntrega(editingTask.fecha_entrega || '');
            setPuntos(editingTask.puntos || 10);
            setDescripcion(editingTask.descripcion || '');
            setAttachments(editingTask.attachments || []);
        } else {
            resetForm();
        }
    }, [editingTask]);

    const resetForm = () => {
        setNombre('');
        setFechaEntrega('');
        setPuntos(10);
        setDescripcion('');
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
        if (!nombre.trim()) return;

        onSave({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            type: activityType,
            attachments,
            ...(activityType === 'task' ? {
                fecha_entrega: fecha_entrega || new Date().toISOString().split('T')[0],
                puntos: puntos,
            } : {})
        });

        resetForm();
    };

    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm h-fit">
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
                    Aviso
                </button>
            </div>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                {editingTask !== null ? <Pencil size={16} className="text-amber-500" /> : <Plus size={16} className="text-[#1e88e5]" />}
                {editingTask !== null ? 'Editar Publicación' : (activityType === 'task' ? 'Nueva Tarea' : 'Nuevo Aviso')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder={activityType === 'task' ? 'Ej. Tarea 3: Ecuaciones' : 'Ej. Material de apoyo'}
                        required
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-755 font-normal outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                    />
                </div>

                {activityType === 'task' && (
                    <>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha límite</label>
                            <input
                                type="date"
                                value={fecha_entrega}
                                onChange={e => setFechaEntrega(e.target.value)}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-755 font-normal outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Puntos máximos</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={puntos}
                                onChange={e => setPuntos(Number(e.target.value))}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-755 font-normal text-center outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Instrucciones</label>
                    <textarea
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        placeholder="Escribe las instrucciones aquí..."
                        rows={4}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-755 font-normal outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all resize-none"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Material de Apoyo</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-250 hover:border-[#1e88e5] hover:bg-slate-50/40 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all select-none"
                    >
                        <Upload size={18} className="text-slate-400" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Seleccionar archivo</span>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />

                    {attachments.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                            {attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                        <Paperclip size={12} className="text-[#1e88e5] shrink-0" />
                                        <span className="font-normal text-slate-700 truncate">{file.name}</span>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveAttachment(index)} className="text-slate-400 hover:text-rose-500 font-extrabold text-[10px] uppercase">Quitar</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2 mt-2">
                    <button type="submit" className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-extrabold text-sm transition-all active:scale-[0.98] shadow-sm ${editingTask !== null ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#1e88e5] hover:bg-blue-700'}`}>
                        {editingTask !== null ? <Pencil size={15} /> : <Plus size={15} />}
                        {editingTask !== null ? 'Guardar Cambios' : (activityType === 'task' ? 'Publicar Tarea' : 'Publicar Aviso')}
                    </button>
                    {editingTask !== null && (
                        <button type="button" onClick={onCancelEdit} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-black text-[11px] uppercase transition-all">Cancelar</button>
                    )}
                </div>
            </form>
        </div>
    );
}

interface ActivityCardProps {
    task: Task;
    index: number;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onSelectTask: (id: number) => void;
    isReadOnly?: boolean;
}

function ActivityCard({ task, index, onEdit, onDelete, onSelectTask, isReadOnly = false }: ActivityCardProps) {
    const isTask = task.type !== 'material';

    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl relative space-y-4 transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <span className={`text-[9px] font-semibold uppercase tracking-widest block ${isTask ? 'text-[#1e88e5]' : 'text-purple-600'}`}>
                        {isTask ? `Actividad ${index + 1}` : 'Aviso / Material'}
                    </span>
                    <h4 className="text-base font-black text-slate-800 tracking-tight">{task.nombre}</h4>
                </div>
                {!isReadOnly && (
                    <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(task)} className="text-slate-350 hover:text-[#1e88e5] p-2 rounded-xl transition-all"><Pencil size={14} /></button>
                        <button onClick={() => onDelete(task.id)} className="text-slate-350 hover:text-rose-500 p-2 rounded-xl transition-all"><Trash2 size={14} /></button>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-3.5 text-xs text-slate-455 font-normal uppercase tracking-wide">
                {isTask ? (
                    <>
                        <span className="flex items-center gap-1"><Calendar size={13} className="text-slate-400" /> Límite: {task.fecha_entrega || 'Sin fecha'}</span>
                        <span className="text-slate-200">|</span>
                        <span className="flex items-center gap-1"><FileText size={13} className="text-slate-400" /> Valor: {task.puntos || 10} pts</span>
                    </>
                ) : (
                    <span className="text-purple-600 font-semibold">Compartido con el grupo</span>
                )}
            </div>

            {task.descripcion && (
                <div className="space-y-1.5 pt-1">
                    <div className={`border-l-4 pl-4 py-1 text-slate-655 text-xs md:text-sm font-normal leading-relaxed whitespace-pre-line ${isTask ? 'border-[#1e88e5]' : 'border-purple-500'}`}>
                        {task.descripcion}
                    </div>
                </div>
            )}

            {task.attachments && task.attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
                            <div className="flex items-center gap-2 truncate">
                                <FileText size={15} className="text-[#1e88e5]" />
                                <span className="text-xs text-slate-700 truncate">{file.name}</span>
                            </div>
                            <button className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#1e88e5] transition-all"><Download size={12} /></button>
                        </div>
                    ))}
                </div>
            )}

            {isTask && (
                <div className="flex justify-end pt-3 border-t border-slate-50">
                    <button type="button" onClick={() => onSelectTask(task.id)} className="flex items-center gap-1 text-xs font-bold text-[#1e88e5] hover:text-blue-700 transition-colors">
                        <span>Ver Entregas y Calificar</span>
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}

interface ActivitiesTabProps {
    tasks: Task[];
    saveTasks: (newTasks: Task[]) => void;
    setSelectedTaskId: (id: number | null) => void;
    grupo: string;
    materia: string;
    isReadOnly?: boolean;
}

export default function ActivitiesTab({
    tasks,
    saveTasks,
    setSelectedTaskId,
    isReadOnly = false
}: ActivitiesTabProps) {
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const editingTask = editingTaskId !== null ? tasks.find(t => t.id === editingTaskId) || null : null;

    const handleSaveTask = (taskData: any) => {
        if (editingTaskId !== null) {
            saveTasks(tasks.map(t => t.id === editingTaskId ? { ...t, ...taskData } : t));
            setEditingTaskId(null);
        } else {
            const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
            saveTasks([...tasks, { id: nextId, ...taskData, calificaciones: {} }]);
        }
        SwalHelper.success('¡Hecho!', 'Actividad guardada correctamente.');
    };

    const handleDeleteTask = (id: number) => {
        SwalHelper.confirm('¿Eliminar?', 'Se perderán las notas asociadas.', 'Sí, eliminar', 'No', 'warning')
            .then(res => {
                if (res.isConfirmed) {
                    saveTasks(tasks.filter(t => t.id !== id));
                    SwalHelper.success('Eliminado', 'La actividad fue borrada.');
                }
            });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {!isReadOnly && (
                <div className="lg:col-span-4 h-fit">
                    <ActivityForm editingTask={editingTask} onSave={handleSaveTask} onCancelEdit={() => setEditingTaskId(null)} />
                </div>
            )}
            <div className={cn("space-y-4 max-h-[620px] overflow-y-auto pr-2 scrollbar-hide", isReadOnly ? "lg:col-span-12" : "lg:col-span-8")}>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 sticky top-0 bg-white/50 backdrop-blur-sm py-1 z-10">
                    <FileText size={16} className="text-slate-500" /> Muro de Actividades ({tasks.length})
                </h3>
                {tasks.length === 0 ? (
                    <div className="bg-white border border-slate-100 p-12 text-center text-slate-400 font-normal text-sm rounded-2xl">No hay actividades publicadas.</div>
                ) : (
                    tasks.map((t, idx) => (
                        <ActivityCard
                            key={t.id}
                            task={t}
                            index={idx}
                            onEdit={() => setEditingTaskId(t.id)}
                            onDelete={handleDeleteTask}
                            onSelectTask={setSelectedTaskId}
                            isReadOnly={isReadOnly}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
