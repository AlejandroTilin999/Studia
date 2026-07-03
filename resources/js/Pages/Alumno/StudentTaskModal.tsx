import { useState } from 'react';
import { Check, Paperclip, Upload, X } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';

interface Task {
    id: number;
    title: string;
    status: string;
    desc: string;
}

interface StudentTaskModalProps {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onDeliver: (taskId: number) => void;
}

export default function StudentTaskModal({
    isOpen,
    task,
    onClose,
    onDeliver,
}: StudentTaskModalProps) {
    const [attachedFile, setAttachedFile] = useState<File | null>(null);

    if (!task) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAttachedFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!attachedFile) return;
        onDeliver(task.id);
        setAttachedFile(null);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalles de la Tarea"
            subtitle="Consulta las instrucciones y sube tus archivos de entrega"
            maxWidthClass="max-w-lg"
            onSubmit={handleSubmit}
            confirmLabel={task.status !== 'Entregado' ? 'Entregar tarea' : undefined}
            cancelLabel="Cerrar"
            isConfirmDisabled={!attachedFile}
        >
            <div>
                <h4 className="text-base font-extrabold text-slate-800 leading-tight text-left">
                    {task.title}
                </h4>
                <div className="flex gap-6 mt-3 text-xs text-left">
                    <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Fecha límite</span>
                        <span className="font-extrabold text-slate-600 block mt-0.5">25 de Abril, 11:59 PM</span>
                    </div>
                    <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Estado de entrega</span>
                        <span className={`font-extrabold block mt-0.5 ${
                            task.status === 'Pendiente' 
                                ? 'text-amber-500' 
                                : task.status === 'Entregado' 
                                    ? 'text-emerald-500' 
                                    : 'text-blue-500'
                        }`}>
                            {task.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Instructions Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-655 text-left space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Instrucciones</span>
                <p className="leading-relaxed font-medium">{task.desc}</p>
            </div>

            {/* File Upload Area */}
            <div className="space-y-3 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Subir Archivo de Entrega</span>
                
                {task.status === 'Entregado' ? (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 text-center text-emerald-600 flex flex-col items-center justify-center gap-2">
                        <Check size={28} className="bg-emerald-100 p-1.5 rounded-full" />
                        <span className="text-xs font-bold">¡Esta tarea ya ha sido entregada con éxito!</span>
                    </div>
                ) : (
                    <div className="relative">
                        <input 
                            type="file" 
                            id="task-file-input"
                            className="hidden" 
                            onChange={handleFileChange}
                        />
                        
                        {!attachedFile ? (
                            <label 
                                htmlFor="task-file-input"
                                className="border-2 border-dashed border-[#5c54f2]/30 bg-[#5c54f2]/5 hover:bg-[#5c54f2]/10 rounded-[20px] p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
                            >
                                <div className="p-3 bg-[#5c54f2]/10 rounded-2xl text-[#5c54f2] transition-colors group-hover:bg-[#5c54f2]/20">
                                    <Upload size={28} className="stroke-[2.5]" />
                                </div>
                                <span className="text-xs font-bold text-slate-700">Arrastra tu archivo para comenzar a subir</span>
                                <div className="flex items-center gap-2 w-full justify-center">
                                    <div className="h-px bg-slate-200 w-12" />
                                    <span className="text-[10px] font-bold text-slate-400">O</span>
                                    <div className="h-px bg-slate-200 w-12" />
                                </div>
                                <span className="px-4 py-2 border border-[#5c54f2] text-[#5c54f2] hover:bg-[#5c54f2]/10 font-bold rounded-xl text-xs transition-all select-none">
                                    Buscar archivo
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium mt-1">Soporta PDF, Word o Excel (máx. 10MB)</span>
                            </label>
                        ) : (
                            <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-sm flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                                        <Paperclip size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-xs font-extrabold text-slate-800 block truncate max-w-[200px] sm:max-w-[300px]">
                                            {attachedFile.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                            {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAttachedFile(null)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Eliminar archivo"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </BaseModal>
    );
}
