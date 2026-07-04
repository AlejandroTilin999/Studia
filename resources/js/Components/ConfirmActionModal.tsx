import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText: string;     // First string to type (e.g., student name or matricula)
    confirmTextLabel?: string; // Custom label for first field (defaults to 'To confirm, type "{confirmText}"')
    actionPhrase: string;    // Second string to type (e.g., "dar de baja" or "delete project")
    actionPhraseLabel?: string; // Custom label for second field (defaults to 'To confirm, type "{actionPhrase}"')
    warningMessage?: string; // Warning banner text
    confirmLabel?: string;   // Confirm button text (defaults to 'Confirm')
    confirmButtonVariant?: 'danger' | 'primary'; // Button color (defaults to 'danger')
}

export default function ConfirmActionModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    confirmTextLabel,
    actionPhrase,
    actionPhraseLabel,
    warningMessage,
    confirmLabel = 'Confirmar',
    confirmButtonVariant = 'danger',
}: ConfirmActionModalProps) {
    const [firstInput, setFirstInput] = useState('');
    const [secondInput, setSecondInput] = useState('');

    // Reset inputs when opened/closed
    useEffect(() => {
        if (!isOpen) {
            setFirstInput('');
            setSecondInput('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isMatch = firstInput.trim() === confirmText && secondInput.trim().toLowerCase() === actionPhrase.toLowerCase();

    const handleConfirmSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isMatch) {
            onConfirm();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        {title}
                    </h3>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Description */}
                <div className="px-6 pb-4">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {description}
                    </p>
                </div>

                <hr className="border-slate-100" />

                {/* Body Form */}
                <form onSubmit={handleConfirmSubmit} className="flex-1 flex flex-col">
                    <div className="p-6 space-y-4">
                        
                        {/* First confirmation input */}
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-semibold text-slate-600 block">
                                {confirmTextLabel || (
                                    <>
                                        Para confirmar, escribe <span className="font-bold text-slate-900">"{confirmText}"</span>
                                    </>
                                )}
                            </label>
                            <input
                                type="text"
                                value={firstInput}
                                onChange={e => setFirstInput(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-slate-400 focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 transition-all font-medium"
                                placeholder={confirmText}
                                autoComplete="off"
                            />
                        </div>

                        {/* Second confirmation input */}
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-semibold text-slate-600 block">
                                {actionPhraseLabel || (
                                    <>
                                        Para confirmar, escribe <span className="font-bold text-slate-900">"{actionPhrase}"</span>
                                    </>
                                )}
                            </label>
                            <input
                                type="text"
                                value={secondInput}
                                onChange={e => setSecondInput(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-slate-400 focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 transition-all font-medium"
                                placeholder={actionPhrase}
                                autoComplete="off"
                            />
                        </div>

                        {/* Warning Box */}
                        {warningMessage && (
                            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-start gap-2.5 text-left">
                                <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                                <p className="text-[12px] text-rose-600 font-bold leading-normal">
                                    {warningMessage}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all shadow-sm"
                        >
                            Cancelar
                        </button>
                        
                        <button
                            type="submit"
                            disabled={!isMatch}
                            className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
                                isMatch
                                    ? confirmButtonVariant === 'danger'
                                        ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-[0.98]'
                                        : 'bg-[#1e88e5] hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98]'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-150'
                            }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
