import React from 'react';
import { Award, Upload, X, ExternalLink, Send } from 'lucide-react';
import { SwalHelper } from '@/utils/SwalHelper';
import axios from 'axios';

interface AssignmentSubmissionCardProps {
    taskId: number;
    taskStatus: string;
    setTaskStatus: (status: string) => void;
    attachedFiles: any[];
    setAttachedFiles: (files: any[]) => void;
    currentServerFile: any;
    setCurrentServerFile: (file: any) => void;
    driveLink: string;
    setDriveLink: (link: string) => void;
    isUploading: boolean;
    setIsUploading: (val: boolean) => void;
    task: any;
    strokeColor: string;
    getFileIcon: (filename: string) => React.ReactNode;
}

export default function AssignmentSubmissionCard({
    taskId,
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
    task,
    strokeColor,
    getFileIcon
}: AssignmentSubmissionCardProps) {
    const isDelivered = taskStatus === 'Entregado' || taskStatus === 'Calificado';

    const notifyRealtimeUpdate = (msg: string) => {
        try {
            const payload = { type: 'cycle-update', msg, timestamp: Date.now() };
            const bc = new BroadcastChannel('school-cycle-channel');
            bc.postMessage(payload);
            bc.close();
            localStorage.setItem('studia_rt_update', JSON.stringify(payload));
        } catch (e) {}
    };

    const handleFileUploadOnly = (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('tarea_id', taskId.toString());
        formData.append('archivo', file);

        SwalHelper.loading('Subiendo archivo...', 'Por favor espera mientras se sube tu archivo.');

        axios.post('/alumno/tareas/entregar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then((res) => {
            const newFilesList = res.data?.archivos && Array.isArray(res.data.archivos)
                ? res.data.archivos
                : [...attachedFiles, { url: res.data?.url || '#', nombre: res.data?.nombre || file.name }];

            setAttachedFiles(newFilesList);
            setCurrentServerFile(newFilesList[newFilesList.length - 1]);
            task.archivo = newFilesList;

            SwalHelper.confirm(
                '¡Archivo adjuntado!',
                'El archivo se subió. ¿Deseas marcar la tarea como ENTREGADA?',
                'Sí, Entregar Tarea',
                'Adjuntar otro archivo',
                'question'
            ).then((result) => {
                if (result.isConfirmed) {
                    setTaskStatus('Entregado');
                    task.status = 'Entregado';
                    task.archivo = newFilesList;
                    notifyRealtimeUpdate('SUBMISSION_CREATED');
                    SwalHelper.toast('¡Tarea entregada con éxito!', 'success');
                } else {
                    SwalHelper.toast('Puedes seleccionar otro archivo cuando gustes.', 'info');
                }
            });
        })
        .catch((err) => {
            console.error(err);
            SwalHelper.error('Error', 'Hubo un problema al subir tu archivo.');
        })
        .finally(() => setIsUploading(false));
    };

    const handleCancelRealSubmission = () => {
        SwalHelper.confirm(
            '¿Anular entrega?',
            'Podrás cambiar los archivos si el docente aún no ha calificado.',
            'Sí, anular',
            'Cancelar',
            'warning'
        ).then((res) => {
            if (res.isConfirmed) {
                axios.post('/alumno/tareas/anular', { tarea_id: taskId })
                    .then(() => {
                        SwalHelper.toast('Entrega anulada', 'info');
                        notifyRealtimeUpdate('SUBMISSION_CANCELLED');
                        task.status = 'Pendiente';
                        task.archivo = null;
                        setTaskStatus('Pendiente');
                        setCurrentServerFile(null);
                        setDriveLink('');
                    });
            }
        });
    };

    const handleRemoveSingleFile = (fileUrl: string, e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation();

        SwalHelper.confirm(
            '¿Quitar este archivo?',
            'El archivo será eliminado de tu entrega.',
            'Sí, quitar',
            'Cancelar',
            'warning'
        ).then((res) => {
            if (res.isConfirmed) {
                SwalHelper.loading('Eliminando archivo...', 'Por favor espera.');
                axios.post('/alumno/tareas/quitar-archivo', {
                    tarea_id: taskId,
                    file_url: fileUrl
                })
                .then((response) => {
                    SwalHelper.toast('¡Archivo eliminado correctamente!', 'success');
                    const remainingFiles = response.data?.archivos || [];
                    setAttachedFiles(remainingFiles);
                    if (remainingFiles.length === 0) {
                        task.archivo = null;
                        setTaskStatus('Pendiente');
                        task.status = 'Pendiente';
                        setCurrentServerFile(null);
                    } else {
                        task.archivo = remainingFiles;
                        setCurrentServerFile(remainingFiles[remainingFiles.length - 1]);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    SwalHelper.error('Error', 'No se pudo eliminar el archivo.');
                });
            }
        });
    };

    return (
        <div className="bg-white border-y border-slate-200 py-6 space-y-5 relative">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900 tracking-tight">Estado de Entrega</h4>
                </div>

                <span className={`text-[10px] px-3 py-1 rounded-xl font-extrabold tracking-wide uppercase shadow-2xs ${
                    taskStatus === 'Calificado' 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                        : isDelivered 
                        ? 'bg-blue-600 text-white shadow-blue-500/20' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                }`}>
                    {taskStatus}
                </span>
            </div>

            {attachedFiles.length > 0 && (
                <div className="space-y-2.5 relative z-10">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Documentos Adjuntos</span>
                    <div className="space-y-2">
                        {attachedFiles.map((fileItem, idx) => (
                            <a
                                key={idx}
                                href={fileItem.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-slate-200 bg-slate-50/60 rounded-lg p-3 flex items-center justify-between gap-3 transition-all group cursor-pointer hover:bg-slate-100"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="shrink-0 flex items-center justify-center">
                                        {getFileIcon(fileItem.nombre || fileItem.url)}
                                    </div>
                                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#0266E0] truncate flex-1 transition-colors">
                                        {fileItem.nombre || 'Archivo adjunto'}
                                    </span>
                                </div>
                                
                                {!isDelivered ? (
                                    <button 
                                        onClick={(e) => handleRemoveSingleFile(fileItem.url, e)} 
                                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                                        title="Quitar archivo"
                                    >
                                        <X size={16} />
                                    </button>
                                ) : (
                                    <ExternalLink size={14} className="text-slate-400 group-hover:text-[#0266E0] shrink-0 transition-colors" />
                                )}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {!isDelivered ? (
                <div className="space-y-3.5 pt-1 relative z-10">
                    <label 
                        style={{ borderColor: `${strokeColor}40` }} 
                        className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50/80 transition-all text-center group"
                    >
                        <div style={{ backgroundColor: `${strokeColor}10` }} className="p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                            <Upload size={18} style={{ color: strokeColor }} />
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 block">Adjuntar desde tu dispositivo</span>
                            <span className="text-[10px] text-slate-400 font-medium">PDF, Word, imágenes o comprimidos</span>
                        </div>
                        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUploadOnly(e.target.files[0])} disabled={isUploading} />
                    </label>
                </div>
            ) : (
                <div className="pt-2 relative z-10">
                    <button 
                        onClick={handleCancelRealSubmission} 
                        className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 rounded-xl text-xs font-extrabold transition-all active:scale-[0.98] shadow-2xs"
                    >
                        Anular Entrega
                    </button>
                </div>
            )}
        </div>
    );
}