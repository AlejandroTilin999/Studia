import React from 'react';
import { X, CheckCircle2, Send, Calendar } from 'lucide-react';
import BaseModal from '@/Components/BaseModal';
import DatePickerEs from '@/Components/ui/DatePickerEs';
import { Template } from './TemplateCard';

export interface Recipient {
    id: number;
    nombre: string;
    apellido_paterno?: string;
    email: string;
    rol: string;
}

interface SendEmailModalProps {
    template: Template | null;
    recipients: Recipient[];
    selectedEmails: string[];
    roleFilter: string;
    diaSuspension: string;
    onDiaSuspensionChange: (val: string) => void;
    onRoleFilterChange: (role: string) => void;
    onSelectAllFiltered: () => void;
    onToggleEmail: (email: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    isProcessing: boolean;
}

export default function SendEmailModal({
    template,
    recipients,
    selectedEmails,
    roleFilter,
    diaSuspension,
    onDiaSuspensionChange,
    onRoleFilterChange,
    onSelectAllFiltered,
    onToggleEmail,
    onSubmit,
    onClose,
    isProcessing,
}: SendEmailModalProps) {
    if (!template) return null;

    // Detectar rol sugerido por el nombre de la plantilla
    const isAlumnoTemplate = template.nombre.toLowerCase().includes('alumno');
    const isDocenteTemplate = template.nombre.toLowerCase().includes('docente');
    const isSuspensionTemplate = template.tipo === 'suspension' || template.nombre.toLowerCase().includes('suspensión') || template.nombre.toLowerCase().includes('suspension');

    // Filtrar automáticamente la lista según la plantilla o filtro manual
    const filteredRecipients = recipients.filter((r) => {
        const userRole = (r.rol || '').toUpperCase();
        if (isAlumnoTemplate) {
            return userRole === 'ALUMNO';
        }
        if (isDocenteTemplate) {
            return userRole === 'DOCENTE';
        }
        if (roleFilter !== 'ALL') {
            return userRole === roleFilter;
        }
        return true;
    });

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title=""
            subtitle=""
            maxWidthClass="max-w-3xl"
            showFooter={false}
            fullBleed={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-0 text-left relative font-body">
                {/* Botón de cerrar de Windows */}
                <button
                    type="button"
                    onClick={onClose}
                    className="fixed md:absolute top-4 right-4 z-50 p-1.5 rounded-lg text-white md:text-slate-400 hover:bg-white/10 md:hover:bg-slate-100 md:hover:text-slate-700 transition-all focus:outline-none"
                >
                    <X size={16} className="stroke-[2.5]" />
                </button>

                {/* Panel Izquierdo Azul Institucional #0266E0 (col-span-2) */}
                <div className="col-span-1 md:col-span-2 bg-[#0266E0] p-6 text-white flex flex-col justify-between select-none relative rounded-t-[10px] md:rounded-l-[10px] md:rounded-tr-none shrink-0 min-h-[380px] md:min-h-[440px]">
                    <div className="space-y-6">
                        <div>
                            <img src="/assets/logo-ph-blanco.webp" alt="Prepa Hidalgo" className="h-8 md:h-10 w-auto object-contain mb-4 md:mb-6" />
                            <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                                Envío de Notificación Masiva
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-white/10 rounded-xl border border-white/15 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Plantilla Seleccionada</span>
                                <p className="text-xs text-white font-bold truncate">{template.nombre}</p>
                                <p className="text-[11px] text-blue-100 truncate italic">"{template.asunto}"</p>
                            </div>

                            <p className="text-[11px] text-blue-100 leading-relaxed font-normal">
                                Los mensajes se entregan de forma limpia mediante la infraestructura oficial de correo institucional.
                            </p>
                        </div>
                    </div>

                    <div className="text-[9px] text-blue-200 font-medium leading-tight pt-4 border-t border-white/15 hidden md:block mt-6 uppercase tracking-widest">
                        Prepahid · Comunicaciones Institucionales
                    </div>
                </div>

                {/* Panel Derecho del Formulario (col-span-3) */}
                <div className="col-span-1 md:col-span-3 p-5 md:p-6 flex flex-col justify-between relative bg-white rounded-b-[10px] md:rounded-r-[10px] md:rounded-bl-none">
                    <form onSubmit={onSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">

                            {/* Campo Especial de Fecha con Selector de Calendario */}
                            {isSuspensionTemplate && (
                                <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                                        <Calendar size={14} />
                                        <span>Seleccionar Día de Suspensión</span>
                                    </label>
                                    <DatePickerEs
                                        value={diaSuspension.includes('-') ? diaSuspension : ''}
                                        onChange={(isoVal) => {
                                            if (!isoVal) {
                                                onDiaSuspensionChange('');
                                                return;
                                            }
                                            // Formatear la fecha ISO (YYYY-MM-DD) a texto legible en español para el correo
                                            const parts = isoVal.split('-');
                                            if (parts.length === 3) {
                                                const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                                const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                                                const formattedText = d.toLocaleDateString('es-ES', options);
                                                // Capitalizar primer letra del día
                                                const capitalized = formattedText.charAt(0).toUpperCase() + formattedText.slice(1);
                                                onDiaSuspensionChange(capitalized);
                                            } else {
                                                onDiaSuspensionChange(isoVal);
                                            }
                                        }}
                                        placeholder="Seleccionar fecha en el calendario..."
                                        required={true}
                                    />
                                    {diaSuspension && (
                                        <p className="text-[11px] font-bold text-rose-700 pt-0.5">
                                            Se inyectará: <span className="font-extrabold underline">{diaSuspension}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Selector de Filtro de Rol */}
                            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 pr-10">
                                <div className="flex items-center gap-1.5">
                                    {isAlumnoTemplate ? (
                                        <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold bg-[#0266E0] text-white tracking-wide">
                                            Destinatarios: ALUMNOS
                                        </span>
                                    ) : isDocenteTemplate ? (
                                        <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold bg-[#0266E0] text-white tracking-wide">
                                            Destinatarios: DOCENTES
                                        </span>
                                    ) : (
                                        ['ALL', 'ALUMNO', 'DOCENTE'].map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => onRoleFilterChange(r)}
                                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                                                    roleFilter === r
                                                        ? 'bg-[#0266E0] text-white shadow-xs'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {r === 'ALL' ? 'Todos' : r}
                                            </button>
                                        ))
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={onSelectAllFiltered}
                                    className="text-[11px] font-bold text-[#0266E0] hover:underline shrink-0"
                                >
                                    {selectedEmails.length > 0 && selectedEmails.length === filteredRecipients.length
                                        ? 'Deseleccionar Todos'
                                        : 'Seleccionar Todos'}
                                </button>
                            </div>

                            {/* Lista de Destinatarios */}
                            <div className="space-y-2 max-h-[280px] min-h-[180px] overflow-y-auto pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/40">
                                {filteredRecipients.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                                        No se encontraron destinatarios para este rol.
                                    </div>
                                ) : (
                                    filteredRecipients.map((r) => {
                                        const isSelected = selectedEmails.includes(r.email);
                                        return (
                                            <div
                                                key={r.id}
                                                onClick={() => onToggleEmail(r.email)}
                                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                                                    isSelected
                                                        ? 'bg-blue-50/90 border-blue-200 text-blue-900 shadow-xs'
                                                        : 'bg-white border-slate-200/80 hover:border-blue-200 text-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                            isSelected ? 'bg-[#0266E0] border-[#0266E0] text-white' : 'border-slate-300'
                                                        }`}
                                                    >
                                                        {isSelected && <CheckCircle2 size={12} />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold truncate">
                                                            {r.nombre} {r.apellido_paterno || ''}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 truncate">{r.email}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                                    {r.rol}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Pie con Botones */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-slate-500">
                                {selectedEmails.length} destinatario(s)
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing || selectedEmails.length === 0}
                                    className="inline-flex items-center gap-2 bg-[#0266E0] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50 active:scale-95"
                                >
                                    <Send size={14} />
                                    <span>{isProcessing ? 'Enviando...' : 'Confirmar Envío'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </BaseModal>
    );
}
