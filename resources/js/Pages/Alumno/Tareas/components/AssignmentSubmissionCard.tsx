import React from 'react';
import { Award, CheckCircle2, Upload, Paperclip, X, ExternalLink, Send } from 'lucide-react';
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

    const handleRealDeliver = () => {
        if (!driveLink.trim()) return;
        setIsUploading(true);

        axios.post('/alumno/tareas/entregar', {
            tarea_id: taskId,
            enlace: driveLink,
            nombre: 'Documento de Drive'
        })
        .then((res) => {
            SwalHelper.success('¡Entregado!', 'Tu tarea ha sido entregada al docente.');
            notifyRealtimeUpdate('SUBMISSION_CREATED');
            task.status = 'Entregado';
            setTaskStatus('Entregado');
            const fileObj = { url: driveLink, nombre: res.data?.nombre || driveLink };
            task.archivo = fileObj;
            setCurrentServerFile(fileObj);
        })
        .catch((err) => {
            console.error(err);
            SwalHelper.error('Error', 'Asegúrate de poner un enlace válido.');
        })
        .finally(() => setIsUploading(false));
    };

    const handleCancelRealSubmission = () => {
        SwalHelper.confirm(
            '¿Anular entrega?',
            'Podrás cambiar el enlace si el docente aún no ha calificado.',
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

    const handleRemoveSingleFile = (fileUrl: string) => {
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
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Tu Trabajo</span>
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${
                    isDelivered ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                    {taskStatus}
                </span>
            </div>

            {attachedFiles.length > 0 && (
                <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Archivos adjuntos</span>
                    {attachedFiles.map((fileItem, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                            <a href={fileItem.url || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 min-w-0 flex-1 hover:text-blue-600 transition-colors">
                                {getFileIcon(fileItem.nombre || fileItem.url)}
                                <span className="text-xs font-bold text-slate-800 truncate">{fileItem.nombre || 'Archivo adjunto'}</span>
                            </a>
                            {!isDelivered && (
                                <button onClick={() => handleRemoveSingleFile(fileItem.url)} className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!isDelivered ? (
                <div className="space-y-4 pt-2">
                    <label style={{ borderColor: strokeColor }} className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100/60 transition-all text-center">
                        <Upload size={20} style={{ color: strokeColor }} />
                        <span className="text-xs font-bold text-slate-700">Subir archivo de mi equipo</span>
                        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUploadOnly(e.target.files[0])} disabled={isUploading} />
                    </label>

                    <div className="flex items-center gap-2">
                        <input type="url" value={driveLink} onChange={(e) => setDriveLink(e.target.value)} placeholder="O pega enlace de Google Drive / Web..." className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
                        <button onClick={handleRealDeliver} disabled={!driveLink.trim() || isUploading} style={{ backgroundColor: strokeColor }} className="p-2.5 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-95">
                            <Send size={15} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3 pt-2">
                    <button onClick={handleCancelRealSubmission} className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all">
                        Anular Entrega
                    </button>
                </div>
            )}
        </div>
    );
}
