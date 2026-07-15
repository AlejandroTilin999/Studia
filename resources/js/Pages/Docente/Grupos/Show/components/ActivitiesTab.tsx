import React, { useState } from 'react';
import { Plus, Trash2, Calendar, FileText, ChevronRight } from 'lucide-react';
import { Task } from '../services/constants';

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
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDeadline, setNewTaskDeadline] = useState('');
    const [newTaskPoints, setNewTaskPoints] = useState(10);
    const [newTaskDescription, setNewTaskDescription] = useState('');

    function handleAddTask(e: React.FormEvent) {
        e.preventDefault();
        if (!newTaskName.trim()) return;

        const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        const newTask: Task = {
            id: nextId,
            name: newTaskName.trim(),
            description: newTaskDescription.trim(),
            deadline: newTaskDeadline || new Date().toISOString().split('T')[0],
            points: newTaskPoints,
            grades: {}
        };

        saveTasks([...tasks, newTask]);

        // Resetear form
        setNewTaskName('');
        setNewTaskDeadline('');
        setNewTaskPoints(10);
        setNewTaskDescription('');
    }

    function handleDeleteTask(id: number) {
        if (confirm('¿Estás seguro de que deseas eliminar esta actividad? Se perderán las notas asociadas.')) {
            saveTasks(tasks.filter(t => t.id !== id));
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Formulario de creación (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm h-fit">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Plus size={16} className="text-[#1e88e5]" />
                    Nueva Actividad
                </h3>
                <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título de la actividad</label>
                        <input
                            type="text"
                            value={newTaskName}
                            onChange={e => setNewTaskName(e.target.value)}
                            placeholder="Ej. Tarea 3: Ecuaciones"
                            required
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-755 font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha límite</label>
                            <input
                                type="date"
                                value={newTaskDeadline}
                                onChange={e => setNewTaskDeadline(e.target.value)}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-755 font-bold outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Puntos máx.</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={newTaskPoints}
                                onChange={e => setNewTaskPoints(Number(e.target.value))}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-755 font-bold text-center outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Instrucciones detalladas</label>
                        <textarea
                            value={newTaskDescription}
                            onChange={e => setNewTaskDescription(e.target.value)}
                            placeholder="Instrucciones para los alumnos..."
                            rows={4}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-755 font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#1e88e5] focus:border-[#1e88e5] transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-[#1e88e5] hover:bg-blue-700 text-white py-3 rounded-xl font-extrabold text-sm transition-all active:scale-[0.98] shadow-sm mt-2"
                    >
                        <Plus size={15} />
                        Publicar Actividad
                    </button>
                </form>
            </div>

            {/* Feed / Lista de Actividades (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText size={16} className="text-slate-500" />
                    Muro de Actividades ({tasks.length})
                </h3>
                {tasks.length === 0 ? (
                    <div className="bg-white border border-slate-100 p-12 text-center text-slate-455 font-semibold text-sm rounded-2xl">
                        No hay actividades publicadas para este parcial. ¡Usa el formulario de la izquierda para publicar la primera!
                    </div>
                ) : (
                    tasks.map((t, idx) => (
                        <div key={t.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative group space-y-4">
                            {/* Encabezado de la card */}
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-[#1e88e5] uppercase tracking-widest block">Actividad Académica {idx + 1}</span>
                                    <h4 className="text-base font-black text-slate-800 tracking-tight">{t.name}</h4>
                                </div>

                                {/* Acciones */}
                                <button
                                    onClick={() => handleDeleteTask(t.id)}
                                    className="text-slate-350 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all"
                                    title="Eliminar actividad"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Metadata Pillas */}
                            <div className="flex flex-wrap gap-3.5 text-xs text-slate-455 font-bold uppercase tracking-wide">
                                <span className="flex items-center gap-1">
                                    <Calendar size={13} className="text-slate-400" />
                                    Límite: {t.deadline || 'Sin fecha'}
                                </span>
                                <span className="text-slate-200">|</span>
                                <span className="flex items-center gap-1">
                                    <FileText size={13} className="text-slate-400" />
                                    Valor: {t.points || 10} pts
                                </span>
                                <span className="text-slate-200">|</span>
                                <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                                    3 / 3 Entregas
                                </span>
                            </div>

                            {/* Instrucciones */}
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Instrucciones</span>
                                <div className="border-l-4 border-[#1e88e5] pl-4 py-1 text-slate-655 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line">
                                    {t.description || 'Sin instrucciones adicionales.'}
                                </div>
                            </div>

                            {/* Pie de la card */}
                            <div className="flex justify-end pt-3 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTaskId(t.id)}
                                    className="flex items-center gap-1 text-xs font-extrabold text-[#1e88e5] hover:text-blue-700 transition-colors"
                                >
                                    <span>Ver Entregas y Calificar</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
