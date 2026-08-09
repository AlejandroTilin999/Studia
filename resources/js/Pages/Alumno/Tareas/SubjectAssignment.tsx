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
    CheckCircle2,
    ExternalLink,
    Image as ImageIcon,
    FileSpreadsheet,
    FileCode,
    FileArchive,
    Globe
} from 'lucide-react';
import PdfIcon from '@/Components/ui/PdfIcon';
import BackButton from '@/Components/common/BackButton';
import { COLOR_THEMES } from '@/constants/ColorThemes';

const getFileIcon = (filename: string = '') => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
        return <ImageIcon size={16} className="text-emerald-500 shrink-0" />;
    }
    if (['pdf'].includes(ext)) {
        return <PdfIcon size={18} className="shrink-0" />;
    }
    if (['doc', 'docx'].includes(ext)) {
        return <FileText size={16} className="text-blue-600 shrink-0" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return <FileSpreadsheet size={16} className="text-emerald-600 shrink-0" />;
    }
    if (['zip', 'rar', '7z'].includes(ext)) {
        return <FileArchive size={16} className="text-amber-500 shrink-0" />;
    }
    return <Globe size={16} className="text-[#0266E0] shrink-0" />;
};

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

        return items.map(item => {
            if (typeof item !== 'object' || !item) {
                const urlStr = String(item || '');
                return { url: urlStr, nombre: urlStr.split('/').pop() };
            }
            return item;
        });
    };

    const [attachedFiles, setAttachedFiles] = useState<any[]>(() => parseTaskFiles((task as any)?.archivo));

    React.useEffect(() => {
        setTaskStatus(task?.status || 'Pendiente');
        const parsed = parseTaskFiles((task as any)?.archivo);
        setCurrentServerFile(parsed[0] || null);
        setAttachedFiles(parsed);
        setDriveLink('');
    }, [task]);

    const handleSendComment = () => {
        if (!localComment.trim()) return;
        onAddComment(localComment.trim());
        setLocalComment('');
    };

    const handleFileUploadOnly = (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('tarea_id', task.id.toString());
        formData.append('archivo', file);

        import('@/utils/SwalHelper').then(({ SwalHelper }) => {
            SwalHelper.loading('Subiendo archivo...', 'Por favor espera mientras se sube tu archivo a la plataforma.');

            import('axios').then(({ default: axios }) => {
                axios.post('/alumno/tareas/entregar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                .then((res) => {
                    const newFilesList = res.data?.archivos && Array.isArray(res.data.archivos)
                        ? res.data.archivos
                        : [...attachedFiles, { url: res.data?.url || '#', nombre: res.data?.nombre || file.name }];

                    setAttachedFiles(newFilesList);
                    setCurrentServerFile(newFilesList[newFilesList.length - 1]);
                    (task as any).archivo = newFilesList;

                    SwalHelper.confirm(
                        '¡Archivo adjuntado!',
                        'El archivo se subió a la plataforma. ¿Deseas marcar la tarea como ENTREGADA o quieres adjuntar otro archivo?',
                        'Sí, Entregar Tarea',
                        'Adjuntar otro archivo',
                        'question'
                    ).then((result) => {
                        if (result.isConfirmed) {
                            setTaskStatus('Entregado');
                            task.status = 'Entregado';
                            (task as any).archivo = newFilesList;

                            try {
                                const payload = { type: 'cycle-update', msg: 'SUBMISSION_CREATED', timestamp: Date.now() };
                                const bc = new BroadcastChannel('school-cycle-channel');
                                bc.postMessage(payload);
                                bc.close();
                                localStorage.setItem('studia_rt_update', JSON.stringify(payload));
                            } catch(e) {}

                            SwalHelper.toast('¡Tarea entregada con éxito!', 'success');
                        } else {
                            SwalHelper.toast('Puedes seleccionar otro archivo cuando gustes.', 'info');
                        }
                    });
                })
                .catch(err => {
                    console.error(err);
                    SwalHelper.error('Error', 'Hubo un problema al subir tu archivo a la plataforma.');
                })
                .finally(() => setIsUploading(false));
            });
        });
    };

    const handleRealDeliver = () => {
        if (!driveLink.trim()) return;

        setIsUploading(true);

        import('axios').then(({ default: axios }) => {
            axios.post('/alumno/tareas/entregar', {
                tarea_id: task.id,
                enlace: driveLink,
                nombre: 'Documento de Drive'
            })
            .then((res) => {
                import('@/utils/SwalHelper').then(({ SwalHelper }) => {
                    SwalHelper.success('¡Entregado!', 'Tu tarea ha sido entregada al docente.');
                });
                try {
                    const bc = new BroadcastChannel('school-cycle-channel');
                    bc.postMessage({ type: 'cycle-update', msg: 'SUBMISSION_CREATED' });
                    bc.close();
                } catch(e) {}

                task.status = 'Entregado';
                setTaskStatus('Entregado');
                const fileObj = { url: driveLink, nombre: res.data?.nombre || driveLink };
                (task as any).archivo = fileObj;
                setCurrentServerFile(fileObj);
            })
            .catch(err => {
                console.error(err);
                import('@/utils/SwalHelper').then(({ SwalHelper }) => {
                    SwalHelper.error('Error', 'Asegúrate de poner un enlace válido.');
                });
            })
            .finally(() => setIsUploading(false));
        });
    };

    const handleCancelRealSubmission = () => {
        import('@/utils/SwalHelper').then(({ SwalHelper }) => {
            SwalHelper.confirm(
                '¿Anular entrega?',
                'Podrás cambiar el enlace si el docente aún no ha calificado.',
                'Sí, anular',
                'Cancelar',
                'warning'
            )
                .then((res) => {
                    if (res.isConfirmed) {
                        import('axios').then(({ default: axios }) => {
                            axios.post('/alumno/tareas/anular', { tarea_id: task.id })
                                .then(() => {
                                    SwalHelper.toast('Entrega anulada', 'info');
                                    try {
                                        const payload = { type: 'cycle-update', msg: 'SUBMISSION_CANCELLED', timestamp: Date.now() };
                                        const bc = new BroadcastChannel('school-cycle-channel');
                                        bc.postMessage(payload);
                                        bc.close();
                                        localStorage.setItem('studia_rt_update', JSON.stringify(payload));
                                    } catch(e) {}

                                    task.status = 'Pendiente';
                                    (task as any).archivo = null;
                                    setTaskStatus('Pendiente');
                                    setCurrentServerFile(null);
                                    setDriveLink('');
                                });
                        });
                    }
                });
        });
    };

    const handleRemoveSingleFile = (fileUrl: string) => {
        import('@/utils/SwalHelper').then(({ SwalHelper }) => {
            SwalHelper.confirm(
                '¿Quitar este archivo?',
                'El archivo será eliminado de tu entrega.',
                'Sí, quitar',
                'Cancelar',
                'warning'
            ).then((res) => {
                if (res.isConfirmed) {
                    SwalHelper.loading('Eliminando archivo...', 'Por favor espera mientras se remueve el archivo.');

                    import('axios').then(({ default: axios }) => {
                        axios.post('/alumno/tareas/quitar-archivo', {
                            tarea_id: task.id,
                            file_url: fileUrl
                        })
                        .then((response) => {
                            SwalHelper.toast('¡Archivo eliminado correctamente!', 'success');
                            const remainingFiles = response.data?.archivos || [];
                            setAttachedFiles(remainingFiles);
                            if (remainingFiles.length === 0) {
                                (task as any).archivo = null;
                                setTaskStatus('Pendiente');
                                task.status = 'Pendiente';
                                setCurrentServerFile(null);
                            } else {
                                (task as any).archivo = remainingFiles;
                                setCurrentServerFile(remainingFiles[remainingFiles.length - 1]);
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            SwalHelper.error('Error', 'No se pudo eliminar el archivo.');
                        });
                    });
                }
            });
        });
    };

    const isDelivered = taskStatus === 'Entregado' || taskStatus === 'Calificado';
    const serverFile = currentServerFile;

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

    if (!task) {
        return (
            <div className="p-8 text-center text-slate-400">
                <p>No se encontró la tarea seleccionada.</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">Volver</button>
            </div>
        );
    }

    const weightPercent = getTaskWeight(task.id);
    const grade = getTaskGrade(task.id);
    const isMaterialType = (task as any).type === 'material' || task.status === 'Aviso';

    return (
        <div className="space-y-8 text-left animate-in fade-in duration-200 pt-2 bg-white">

            {/* Back Button Homogéneo en Gris */}
            <div className="pb-2">
                <BackButton
                    onClick={onBack}
                    label="Volver a la lista"
                />
            </div>

            {/* Modern Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Side */}
                <div className="lg:col-span-8 space-y-8 min-w-0">

                    <div className="space-y-4">
                        <div className="space-y-1">
                           <span 
                               style={{ color: activeTheme.strokeColor }}
                               className="text-[10px] font-black uppercase tracking-widest block"
                           >
                               {isMaterialType ? 'Aviso y Material Informativo' : 'Actividad Académica'}
                           </span>
                           <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                               {task.title}
                           </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-450 uppercase tracking-wide">
                           <span>Docente: {teacherName}</span>
                           {!isMaterialType && (
                               <>
                                   <span className="text-slate-200">|</span>
                                   <span className="flex items-center gap-1.5">
                                       <Calendar size={13} />
                                       Límite: {task.deadline}
                                   </span>
                               </>
                           )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Instrucciones
                        </span>
                        <div 
                            style={{ borderColor: activeTheme.strokeColor }}
                            className="border-l-4 pl-5 py-1 text-slate-600 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line"
                        >
                            {task.desc}
                        </div>
                    </div>

                    {/* Materiales y Recurso Adjunto por el Docente */}
                    {((task as any).attachments?.length > 0 || (task as any).material_url) && (
                        <div className="space-y-3 pt-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                Materiales y Recursos Adjuntos
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(task as any).attachments?.map((file: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={file.url || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Paperclip size={16} style={{ color: activeTheme.strokeColor }} className="shrink-0" />
                                            <div className="min-w-0">
                                                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 block truncate">
                                                    {file.name || file.nombre || 'Material de apoyo'}
                                                </span>
                                                {file.size && (
                                                    <span className="text-[9px] text-slate-400 font-semibold block">
                                                        {file.size}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                                    </a>
                                ))}
                                {!(task as any).attachments && (task as any).material_url && (
                                    <a
                                        href={(task as any).material_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Paperclip size={16} style={{ color: activeTheme.strokeColor }} className="shrink-0" />
                                            <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                                                Material de estudio adjunto
                                            </span>
                                        </div>
                                        <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

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

                        <div className="flex gap-2 pt-1">
                            <input
                                type="text"
                                value={localComment}
                                onChange={e => setLocalComment(e.target.value)}
                                placeholder="Escribe un mensaje privado para el docente..."
                                className="flex-1 text-xs py-3 px-4 bg-slate-50 border border-slate-200 rounded-[14px] focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-700 transition-all outline-none"
                                onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                            />
                            <button
                                type="button"
                                onClick={handleSendComment}
                                style={{ backgroundColor: activeTheme.strokeColor }}
                                className="p-3 text-white rounded-[14px] transition-all flex items-center justify-center hover:opacity-90"
                            >
                                <Send size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="lg:col-span-4 space-y-6">

                    <div className="space-y-5 text-left bg-white">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                Tipo de Publicación
                            </span>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-extrabold text-slate-800 truncate pr-2">
                                    {task.title}
                                </span>
                                <span className="flex items-center gap-1.5 shrink-0">
                                    {isMaterialType ? (
                                        <span className="px-2.5 py-0.5 text-[9px] font-black rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                                            Aviso Informativo
                                        </span>
                                    ) : isDelivered ? (
                                        <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20" title="Entregado">
                                            <Check size={16} className="stroke-[3.5]" />
                                        </span>
                                    ) : (
                                        <span className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600" title="Pendiente">
                                            <Calendar size={14} className="stroke-[2.5]" />
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {isMaterialType ? (
                            <div className="bg-purple-50/50 border border-purple-100 rounded-[20px] p-5 text-center text-purple-700 space-y-2">
                                <span className="text-xs font-black block uppercase tracking-wide">Publicación Informativa</span>
                                <span className="text-[11px] text-purple-600/80 font-medium block leading-relaxed">
                                    Este contenido fue compartido por tu docente como aviso o material de consulta. No requiere la entrega de tareas ni otorga puntos evaluables.
                                </span>
                            </div>
                        ) : (
                            <>
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
                                                <td className="py-2 text-right font-extrabold">
                                                    {task.points ? `${parseInt(task.points)} Puntos` : '10 Puntos'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-2">Calificación Obtenida</td>
                                                <td className="py-2 text-right font-black text-[#0266E0]">
                                                    {(task as any).grade ? `${parseInt((task as any).grade)} / ${task.points ? parseInt(task.points) : 10}` : 'Sin calificar'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-3 pt-2">
                                    {isDelivered ? (
                                        <div className="space-y-4">
                                             {/* Renderizar todos los archivos adjuntados sin elevaciones/sombras y con botón para quitar */}
                                             {attachedFiles && attachedFiles.length > 0 ? (
                                                 <div className="space-y-2">
                                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                                         Archivos Entregados ({attachedFiles.length})
                                                     </span>
                                                     <div className="space-y-2">
                                                         {attachedFiles.map((fileItem, idx) => {
                                                              let targetUrl = (typeof fileItem === 'object') ? (fileItem.google_drive_url || fileItem.url || fileItem.webViewLink) : fileItem;
                                                              const driveId = (typeof fileItem === 'object') ? fileItem.google_drive_file_id : null;
                                                              
                                                              if (driveId) {
                                                                  targetUrl = `https://drive.google.com/file/d/${driveId}/view`;
                                                              } else if (targetUrl && targetUrl.includes('drive.google.com') && targetUrl.includes('/file/d/')) {
                                                                  const match = targetUrl.match(/\/file\/d\/([^\/]+)/);
                                                                  if (match && match[1]) {
                                                                      targetUrl = `https://drive.google.com/file/d/${match[1]}/view`;
                                                                  }
                                                              }

                                                              return (
                                                                  <div
                                                                      key={idx}
                                                                      className="border border-slate-200 bg-slate-50/60 rounded-lg p-3 flex items-center justify-between gap-3 transition-all group"
                                                                  >
                                                                      <a
                                                                          href={targetUrl}
                                                                          target="_blank"
                                                                          rel="noreferrer"
                                                                          className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-85"
                                                                      >
                                                                          {getFileIcon((typeof fileItem === 'object' ? (fileItem.nombre || targetUrl) : targetUrl))}
                                                                          <span className="text-xs font-bold text-slate-800 truncate max-w-[190px]">
                                                                              {(typeof fileItem === 'object' ? (fileItem.nombre || targetUrl) : targetUrl)}
                                                                          </span>
                                                                          <ExternalLink size={13} className="text-slate-400 shrink-0" />
                                                                      </a>
                                                                      {task.status !== 'Calificado' && (
                                                                          <button
                                                                              type="button"
                                                                              onClick={() => handleRemoveSingleFile(targetUrl)}
                                                                              className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-200/60 transition-all shrink-0"
                                                                              title="Quitar este archivo"
                                                                          >
                                                                              <X size={15} />
                                                                          </button>
                                                                      )}
                                                                  </div>
                                                              );
                                                          })}
                                                     </div>
                                                 </div>
                                             ) : serverFile && (
                                                 <div className="border border-slate-200 bg-slate-50/60 rounded-lg p-3 flex items-center justify-between gap-3 transition-all group">
                                                     <a
                                                         href={serverFile.google_drive_url || serverFile.url || serverFile.webViewLink}
                                                         target="_blank"
                                                         rel="noreferrer"
                                                         className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-85"
                                                     >
                                                         {getFileIcon(serverFile.nombre || serverFile.url)}
                                                         <span className="text-xs font-bold text-slate-800 truncate max-w-[190px]">
                                                             {serverFile.nombre || serverFile.url}
                                                         </span>
                                                         <ExternalLink size={13} className="text-slate-400 shrink-0" />
                                                     </a>
                                                     {task.status !== 'Calificado' && (
                                                         <button
                                                             type="button"
                                                             onClick={() => handleRemoveSingleFile(serverFile.url)}
                                                             className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-200/60 transition-all shrink-0"
                                                             title="Quitar este archivo"
                                                         >
                                                             <X size={15} />
                                                         </button>
                                                     )}
                                                 </div>
                                             )}

                                            {task.status !== 'Calificado' && (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelRealSubmission}
                                                    className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-l-full rounded-tr-full rounded-br-none flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-none border-0"
                                                >
                                                    Anular Entrega
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Lista de Archivos Adjuntados Previamente */}
                                            {attachedFiles.length > 0 && (
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                                        Archivos Adjuntados ({attachedFiles.length})
                                                    </span>
                                                    <div className="space-y-2">
                                                        {attachedFiles.map((file, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="border border-slate-200 bg-slate-50/60 rounded-lg p-3 flex items-center justify-between gap-3 transition-all group"
                                                            >
                                                                <a
                                                                    href={file.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-85"
                                                                >
                                                                    {getFileIcon(file.nombre || file.url)}
                                                                    <span className="text-xs font-bold text-slate-800 truncate max-w-[190px]">
                                                                        {file.nombre || file.url}
                                                                    </span>
                                                                    <ExternalLink size={13} className="text-slate-400 shrink-0" />
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSingleFile(file.url)}
                                                                    className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-200/60 transition-all shrink-0"
                                                                    title="Quitar este archivo"
                                                                >
                                                                    <X size={15} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            import('@/utils/SwalHelper').then(({ SwalHelper }) => {
                                                                SwalHelper.loading('Entregando tarea...', 'Registrando tu entrega al docente.');
                                                                import('axios').then(({ default: axios }) => {
                                                                    axios.post('/alumno/tareas/entregar', { tarea_id: task.id })
                                                                        .then(() => {
                                                                            setTaskStatus('Entregado');
                                                                            task.status = 'Entregado';
                                                                            try {
                                                                                const bc = new BroadcastChannel('school-cycle-channel');
                                                                                bc.postMessage({ type: 'cycle-update', msg: 'SUBMISSION_CREATED' });
                                                                                bc.close();
                                                                            } catch(e) {}
                                                                            SwalHelper.success('¡Entregado!', 'Tu tarea ha sido entregada al docente.');
                                                                        })
                                                                        .catch((err) => {
                                                                            console.error(err);
                                                                            SwalHelper.error('Error', 'No se pudo registrar la entrega.');
                                                                        });
                                                                });
                                                            });
                                                        }}
                                                        className="w-full h-11 mt-2 bg-[#0266E0] hover:bg-blue-700 text-white rounded-l-full rounded-tr-full rounded-br-none flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-none border-0"
                                                    >
                                                        Marcar como Entregada ({attachedFiles.length} {attachedFiles.length === 1 ? 'archivo' : 'archivos'})
                                                    </button>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                                                    {attachedFiles.length > 0 ? 'Adjuntar otro archivo' : 'Adjuntar Archivo de Trabajo'}
                                                </label>

                                                <div className="space-y-2">
                                                    <div className="relative border-2 border-dashed border-slate-200 hover:border-[#0266E0] rounded-2xl p-5 text-center transition-all bg-slate-50/50 hover:bg-blue-50/20">
                                                        <input
                                                            type="file"
                                                            id="file-upload"
                                                            className="hidden"
                                                            disabled={isUploading}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    handleFileUploadOnly(file);
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                                            <div className="p-3 bg-blue-50 text-[#0266E0] rounded-xl">
                                                                <Upload size={20} />
                                                            </div>
                                                            <span className="text-xs font-black text-[#0266E0] uppercase tracking-wide">
                                                                {isUploading ? 'Subiendo a la plataforma...' : (attachedFiles.length > 0 ? 'Seleccionar otro archivo' : 'Seleccionar o Subir Archivo')}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-semibold">PDF, Documentos o Imágenes</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

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
