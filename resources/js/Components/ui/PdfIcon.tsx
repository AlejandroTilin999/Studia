import * as React from 'react';
import { FaFilePdf } from 'react-icons/fa';

interface PdfIconProps {
    className?: string;
    size?: number;
}

export default function PdfIcon({ className = '', size = 20 }: PdfIconProps) {
    return (
        <FaFilePdf 
            size={size} 
            className={`text-[#E5252A] shrink-0 ${className}`} 
        />
    );
}
