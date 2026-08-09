import React from 'react';
import {
    FileText,
    Image as ImageIcon,
    FileSpreadsheet,
    FileArchive,
    Globe
} from 'lucide-react';
import PdfIcon from '@/Components/ui/PdfIcon';

export const getFileIcon = (filename: string = '') => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
        return <ImageIcon size={16} className="text-emerald-500 shrink-0" />;
    }
    if (['pdf'].includes(ext)) {
        return <PdfIcon size={18} className="shrink-0" />;
    }
    if (['doc', 'docx'].includes(ext)) {
        return <FileText size={16} className="text-[#0266E0] shrink-0" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return <FileSpreadsheet size={16} className="text-emerald-600 shrink-0" />;
    }
    if (['zip', 'rar', '7z'].includes(ext)) {
        return <FileArchive size={16} className="text-amber-500 shrink-0" />;
    }
    return <Globe size={16} className="text-[#0266E0] shrink-0" />;
};
