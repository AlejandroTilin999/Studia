import React, { useState, useEffect } from 'react';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import AssignmentHeader from './components/AssignmentHeader';
import AssignmentMaterials from './components/AssignmentMaterials';
import AssignmentSidebarList from './components/AssignmentSidebarList';
import AssignmentSubmissionCard from './components/AssignmentSubmissionCard';
import { getFileIcon } from '@/utils/FileHelper';
import BackButton from '@/Components/common/BackButton';
import type { StudentTask } from '@/types/alumno';

interface SubjectAssignmentProps {
    task: StudentTask;
    otherTasks: StudentTask[];
    onBack: () => void;
    onSwitchTask: (task: StudentTask) => void;
    teacherName: string;
    themeKey?: string;
}

export default function SubjectAssignment({
    task,
    otherTasks,
    onBack,
    onSwitchTask,
    teacherName,
    themeKey = 'blue'
}: SubjectAssignmentProps) {
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;
    const [taskStatus, setTaskStatus] = useState(task?.status || 'Pendiente');
    const [currentServerFile, setCurrentServerFile] = useState((task as any)?.archivo || null);
    const [isUploading, setIsUploading] = useState(false);
    const [driveLink, setDriveLink] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<any[]>([]);

    const parseTaskFiles = (rawFile: any): any[] => {
        if (!rawFile) return [];
        let items: any[] = [];
        if (Array.isArray(rawFile)) {
            items = rawFile;
        } else if (typeof rawFile === 'object' && rawFile.url) {
            items = [rawFile];
        } else if (typeof rawFile === 'string') {
            try {
                const parsed = JSON.parse(rawFile);
                if (Array.isArray(parsed)) {
                    items = parsed;
                } else if (typeof parsed === 'object' && parsed.url) {
                    items = [parsed];
                } else if (typeof parsed === 'string' && parsed.includes('http')) {
                    items = [{ url: parsed, nombre: parsed.split('/').pop() }];
                }
            } catch (e) {
                if (rawFile.includes('http')) {
                    items = [{ url: rawFile, nombre: rawFile.split('/').pop() }];
                }
            }
        }

        return items.map((item) => {
            if (typeof item !== 'object' || !item) {
                const urlStr = String(item || '');
                return { url: urlStr, nombre: urlStr.split('/').pop() };
            }
            return item;
        });
    };

    useEffect(() => {
        setTaskStatus(task?.status || 'Pendiente');
        const parsed = parseTaskFiles((task as any)?.archivo);
        setCurrentServerFile(parsed[0] || null);
        setAttachedFiles(parsed);
        setDriveLink('');
    }, [task]);

    if (!task) {
        return (
            <div className="p-8 text-center text-slate-400">
                <p>No se encontró la tarea seleccionada.</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                    Volver
                </button>
            </div>
        );
    }

    const isMaterialType = (task as any).type === 'material' || task.status === 'Aviso';

    return (
        <div className="space-y-1 text-left animate-in fade-in duration-200 bg-white">
            {/* Navegación, título y evaluación forman una sola franja del tema. */}
            <BackButton onClick={onBack} label="Volver al trabajo de clase" />

            <section className="-mx-4 sm:-mx-6 md:-mx-8 grid grid-cols-1 lg:grid-cols-12">
                    <div className="lg:col-span-8 border-b border-slate-200">
                    <AssignmentHeader
                        title={task.title}
                        teacherName={teacherName}
                        deadline={task.deadline}
                        isMaterialType={isMaterialType}
                        strokeColor={activeTheme.strokeColor}
                        backgroundColor="#ffffff"
                        textColor="#0f172a"
                    />
                    </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <article className="lg:col-span-8 min-w-0">
                    <AssignmentMaterials
                        desc={task.desc}
                        attachments={(task as any).attachments || (task as any).archivos_adjuntos || (task as any).archivos}
                        materialUrl={(task as any).material_url || (task as any).material}
                        strokeColor={activeTheme.strokeColor}
                    />
                </article>

                {/* Columna Derecha: Tarjeta alineada a la altura de ACTIVIDAD ACADÉMICA */}
                <div className="lg:col-span-4 space-y-6 lg:-mt-[185px] lg:sticky lg:top-6">
                    {!isMaterialType && (
                        <AssignmentSubmissionCard
                            taskId={task.id}
                            submission={{
                                taskStatus,
                                setTaskStatus,
                                attachedFiles,
                                setAttachedFiles,
                                currentServerFile,
                                setCurrentServerFile,
                                driveLink,
                                setDriveLink,
                                isUploading,
                                setIsUploading,
                            }}
                            task={task}
                            points={task.points}
                            grade={task.grade}
                            strokeColor={activeTheme.strokeColor}
                            getFileIcon={getFileIcon}
                        />
                    )}

                    <AssignmentSidebarList
                        otherTasks={otherTasks}
                        currentTaskId={task.id}
                        onSwitchTask={onSwitchTask}
                    />
                </div>
            </div>
        </div>
    );
}
