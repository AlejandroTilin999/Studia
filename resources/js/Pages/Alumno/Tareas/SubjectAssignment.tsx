import React, { useState, useEffect } from 'react';
import { COLOR_THEMES } from '@/constants/ColorThemes';
import AssignmentHeader from './components/AssignmentHeader';
import AssignmentMaterials from './components/AssignmentMaterials';
import AssignmentComments from './components/AssignmentComments';
import AssignmentSidebarList from './components/AssignmentSidebarList';
import AssignmentSubmissionCard from './components/AssignmentSubmissionCard';
import { getFileIcon } from '@/utils/FileHelper';

interface Task {
    id: number;
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
    comments: string[];
    onAddComment: (text: string) => void;
    teacherName: string;
    themeKey?: string;
}

export default function SubjectAssignment({
    task,
    otherTasks,
    onBack,
    onSwitchTask,
    comments,
    onAddComment,
    teacherName,
    themeKey = 'blue'
}: SubjectAssignmentProps) {
    const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.blue;
    const [taskStatus, setTaskStatus] = useState(task?.status || 'Pendiente');
    const [currentServerFile, setCurrentServerFile] = useState((task as any)?.archivo || null);
    const [localComment, setLocalComment] = useState('');
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
        <div className="space-y-6 text-left animate-in fade-in duration-200 pt-2 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Columna Izquierda: Encabezado + Materiales + Comentarios */}
                <div className="lg:col-span-8 space-y-8 min-w-0">
                    <AssignmentHeader
                        title={task.title}
                        teacherName={teacherName}
                        deadline={task.deadline}
                        isMaterialType={isMaterialType}
                        strokeColor={activeTheme.strokeColor}
                        onBack={onBack}
                    />

                    <AssignmentMaterials
                        desc={task.desc}
                        attachments={(task as any).attachments}
                        materialUrl={(task as any).material_url}
                        strokeColor={activeTheme.strokeColor}
                    />

                    <AssignmentComments
                        comments={comments}
                        localComment={localComment}
                        setLocalComment={setLocalComment}
                        onAddComment={onAddComment}
                        strokeColor={activeTheme.strokeColor}
                    />
                </div>

                {/* Columna Derecha: Tarjeta alineada a la altura de ACTIVIDAD ACADÉMICA */}
                <div className="lg:col-span-4 space-y-6 lg:pt-[44px]">
                    {!isMaterialType && (
                        <AssignmentSubmissionCard
                            taskId={task.id}
                            taskStatus={taskStatus}
                            setTaskStatus={setTaskStatus}
                            attachedFiles={attachedFiles}
                            setAttachedFiles={setAttachedFiles}
                            currentServerFile={currentServerFile}
                            setCurrentServerFile={setCurrentServerFile}
                            driveLink={driveLink}
                            setDriveLink={setDriveLink}
                            isUploading={isUploading}
                            setIsUploading={setIsUploading}
                            task={task}
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
