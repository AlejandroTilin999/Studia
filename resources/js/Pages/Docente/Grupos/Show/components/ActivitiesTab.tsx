import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Task } from '../services/constants';
import { SwalHelper } from '@/utils/SwalHelper';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import ActivityForm from './ActivityForm';
import ActivityCard from './ActivityCard';
import ParcialHeader from '@/Components/common/ParcialHeader';

interface ActivitiesTabProps {
    tasks: Task[];
    saveTasks: (newTasks: Task[]) => void;
    setSelectedTaskId: (id: number | null) => void;
    grupo: string;
    materia: string;
    isReadOnly?: boolean;
    themeKey?: string;
    studentGrades?: any[];
}

export default function ActivitiesTab({
    tasks,
    saveTasks,
    setSelectedTaskId,
    isReadOnly = false,
    themeKey = 'blue',
    studentGrades = []
}: ActivitiesTabProps) {
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);

    const editingTask = editingTaskId !== null ? tasks.find(t => t.id === editingTaskId) || null : null;
    const isFormOpen = isCreating || editingTaskId !== null;
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;

    const handleSaveTask = (taskData: any) => {
        if (editingTaskId !== null) {
            saveTasks(tasks.map(t => t.id === editingTaskId ? { ...t, ...taskData } : t));
            setEditingTaskId(null);
        } else {
            const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
            saveTasks([...tasks, { id: nextId, ...taskData, calificaciones: {} }]);
            setIsCreating(false);
        }
        SwalHelper.success('¡Hecho!', 'Actividad guardada correctamente.');
    };

    const handleDeleteTask = (id: number) => {
        SwalHelper.confirm('¿Eliminar actividad?', 'Se perderán las tareas y notas asociadas.', 'Sí, eliminar', 'No', 'warning')
            .then(res => {
                if (res.isConfirmed) {
                    SwalHelper.loading('Eliminando...', 'Sincronizando cambios en tiempo real');
                    saveTasks(tasks.filter(t => t.id !== id));
                    setTimeout(() => {
                        SwalHelper.success('Eliminado', 'La actividad fue borrada correctamente.');
                    }, 300);
                }
            });
    };

    return (
        <div className="space-y-8 text-left pb-6 w-full">
            {/* Barra Superior Minimalista */}
            {!isReadOnly && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-5 w-full">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Trabajo de Clase</h3>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">Publica y administra actividades para los estudiantes</p>
                    </div>

                    {!isFormOpen ? (
                        <button
                            type="button"
                            onClick={() => setIsCreating(true)}
                            style={{ backgroundColor: activeTheme.strokeColor }}
                            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:opacity-90 transition-all active:scale-95"
                        >
                            <Plus size={16} />
                            <span>Crear Tarea</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreating(false);
                                setEditingTaskId(null);
                            }}
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs transition-all"
                        >
                            <span>Cerrar Formulario</span>
                        </button>
                    )}
                </div>
            )}

            {/* Vista Alternada: Formulario o Secciones Minimalistas */}
            {isFormOpen && !isReadOnly ? (
                <div className="w-full animate-in fade-in zoom-in-95 duration-200 pb-4">
                    <ActivityForm
                        editingTask={editingTask}
                        onSave={handleSaveTask}
                        onCancelEdit={() => {
                            setIsCreating(false);
                            setEditingTaskId(null);
                        }}
                        themeKey={themeKey}
                    />
                </div>
            ) : (
                <div className="space-y-6 w-full">
                    {/* Encabezado de Tema estilo Google Classroom Plano (Color Dinámico) */}
                    <div className="space-y-2 w-full">
                        <ParcialHeader
                            title="Primer Parcial"
                            count={tasks.length}
                            themeKey={themeKey}
                        />

                        <div className="w-full">
                            {tasks.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 font-normal text-sm space-y-3 w-full">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                                        <FileText size={24} />
                                    </div>
                                    <p className="font-medium text-slate-600">No hay actividades publicadas en este parcial.</p>
                                    {!isReadOnly && (
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(true)}
                                            style={{ color: activeTheme.strokeColor }}
                                            className="inline-flex items-center gap-1.5 font-bold text-xs hover:underline"
                                        >
                                            <Plus size={14} /> Crear primera tarea
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200/80 w-full">
                                    {tasks.map((t, idx) => (
                                        <ActivityCard
                                            key={t.id}
                                            task={t}
                                            index={idx}
                                            onEdit={() => {
                                                setIsCreating(false);
                                                setEditingTaskId(t.id);
                                            }}
                                            onDelete={handleDeleteTask}
                                            onSelectTask={setSelectedTaskId}
                                            isReadOnly={isReadOnly}
                                            themeKey={themeKey}
                                            totalStudents={studentGrades.length}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
