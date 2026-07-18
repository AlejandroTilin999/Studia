import React from 'react';
import { Edit, Trash2, Key, FileText, Plus, UserMinus, UserPlus } from 'lucide-react';

interface ActionButtonProps {
    onClick: (e: React.MouseEvent) => void;
    title: string;
    icon: 'edit' | 'delete' | 'reset-password' | 'kardex' | 'activate' | 'plus' | 'suspend';
    variant?: 'default' | 'danger' | 'success' | 'warning';
}

export function TableActionButton({ onClick, title, icon, variant = 'default' }: ActionButtonProps) {
    const getIcon = () => {
        switch (icon) {
            case 'edit':
                return <Edit size={16} />;
            case 'delete':
                return <Trash2 size={16} />;
            case 'reset-password':
                return <Key size={16} />;
            case 'kardex':
                return <FileText size={16} />;
            case 'suspend':
                return <UserMinus size={16} />;
            case 'activate':
                return <UserPlus size={16} />;
            case 'plus':
                return <Plus size={16} />;
            default:
                return null;
        }
    };

    const getColors = () => {
        if (variant === 'danger') {
            return 'text-slate-400 hover:text-rose-600 hover:bg-rose-50/50';
        }
        if (variant === 'warning') {
            return 'text-slate-400 hover:text-amber-600 hover:bg-amber-50/50';
        }
        if (variant === 'success') {
            return 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50';
        }
        return 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/70';
    };

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            title={title}
            className={`p-2 rounded-lg transition-all inline-flex items-center justify-center ${getColors()}`}
        >
            {getIcon()}
        </button>
    );
}

interface TableActionsProps {
    children: React.ReactNode;
    align?: 'start' | 'center' | 'end';
}

export function TableActions({ children, align = 'start' }: TableActionsProps) {
    const justifyClass = align === 'end' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
    return (
        <div className={`flex items-center ${justifyClass} gap-1.5`} onClick={(e) => e.stopPropagation()}>
            {children}
        </div>
    );
}
