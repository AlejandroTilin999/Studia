import React, { useEffect } from 'react';
import { X, Check, AlertOctagon, AlertTriangle, HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModalType = 'form' | 'confirm' | 'success' | 'error' | 'warning' | 'info';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    type?: ModalType;
    maxWidthClass?: string; // e.g. "max-w-lg", "max-w-md", "max-w-sm"
    
    // Form & Button Integration
    onSubmit?: (e: React.FormEvent) => void;
    confirmLabel?: string;                  // Label for the submit/primary button (e.g. "Registrar", "Guardar")
    cancelLabel?: string;                   // Label for the cancel/secondary button (e.g. "Cancelar", "Cerrar")
    isConfirmDisabled?: boolean;
    showFooter?: boolean;                   // Hide/show footer entirely
    customFooter?: React.ReactNode;         // Custom action buttons to override standard Cancel/Confirm
    
    headerAction?: React.ReactNode;          // Action component (like buttons) to show on the right of the header title
    children?: React.ReactNode;
}

export default function BaseModal({
    isOpen,
    onClose,
    title,
    subtitle,
    type = 'form',
    maxWidthClass = 'max-w-md',
    onSubmit,
    confirmLabel,
    cancelLabel = 'Cancelar',
    isConfirmDisabled = false,
    showFooter = true,
    customFooter,
    headerAction,
    children,
}: BaseModalProps) {
    
    // Cerrar con Escape y bloquear scroll del body
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const renderIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="bg-emerald-50 text-emerald-500 p-4 rounded-full w-fit mx-auto mb-4 animate-in fade-in zoom-in-50 duration-300">
                        <Check size={32} className="stroke-[3]" />
                    </div>
                );
            case 'error':
                return (
                    <div className="bg-rose-50 text-rose-500 p-4 rounded-full w-fit mx-auto mb-4 animate-pulse">
                        <AlertOctagon size={32} className="stroke-[2.5]" />
                    </div>
                );
            case 'warning':
                return (
                    <div className="bg-amber-50 text-amber-550 p-4 rounded-full w-fit mx-auto mb-4">
                        <AlertTriangle size={32} className="stroke-[2.5]" />
                    </div>
                );
            case 'confirm':
                return (
                    <div className="bg-blue-50 text-[#1e88e5] p-4 rounded-full w-fit mx-auto mb-4">
                        <HelpCircle size={32} className="stroke-[2.5]" />
                    </div>
                );
            case 'info':
                return (
                    <div className="bg-blue-50 text-blue-500 p-4 rounded-full w-fit mx-auto mb-4">
                        <Info size={32} className="stroke-[2.5]" />
                    </div>
                );
            default:
                return null;
        }
    };

    const isFormType = type === 'form';

    const renderFooter = () => {
        if (!showFooter) return null;

        if (customFooter) {
            return (
                <div className={cn(
                    "mt-8 flex gap-3 font-body",
                    isFormType ? "justify-end" : "justify-center"
                )}>
                    {customFooter}
                </div>
            );
        }

        return (
            <div className={cn(
                "mt-8 flex gap-3 font-body",
                isFormType ? "justify-end" : "justify-center"
            )}>
                <button 
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all focus:outline-none"
                >
                    {cancelLabel}
                </button>
                
                {(confirmLabel || onSubmit) && (
                    <button 
                        type="submit"
                        disabled={isConfirmDisabled}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none shadow-sm",
                            isConfirmDisabled
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-[#1e88e5] hover:bg-[#1565c0] text-white active:scale-[0.98]"
                        )}
                    >
                        {confirmLabel || 'Aceptar'}
                    </button>
                )}
            </div>
        );
    };

    const renderContent = () => (
        <>
            {/* Body */}
            <div className={cn("space-y-4", !isFormType && "text-center")}>
                {children}
            </div>
            {renderFooter()}
        </>
    );

    return (
        <div 
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
            <div className={cn(
                "bg-white w-full rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 relative",
                maxWidthClass
            )}>
                {/* Botón de cierre absoluto */}
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="absolute top-6 right-6 p-2 rounded-full text-slate-900 hover:bg-slate-100 transition-all focus:outline-none"
                >
                    <X size={20} className="stroke-[2.5]" />
                </button>

                {/* Icono (success/error/warning/confirm/info) */}
                {renderIcon()}

                {/* Cabecera sin bordes */}
                <div className={cn("mb-6 pr-8 text-left", !isFormType && "text-center pr-0")}>
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                            {title}
                        </h3>
                        {headerAction && (
                            <div className="shrink-0 mr-8">
                                {headerAction}
                            </div>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-slate-450 font-medium mt-1.5 leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Wrapper: form vs div */}
                {onSubmit ? (
                    <form onSubmit={onSubmit}>
                        {renderContent()}
                    </form>
                ) : (
                    <div>
                        {renderContent()}
                    </div>
                )}
            </div>
        </div>
    );
}
