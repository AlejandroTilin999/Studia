import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

const COLORS = { primary: "#0066CC" };

export default function Button({ children, onClick, className = "", style = {} }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            style={{ backgroundColor: COLORS.primary, ...style }}
            // Ajustamos el redondeo aquí:
            // rounded-t-full: redondea ambas esquinas superiores
            // rounded-bl-full: redondea la esquina inferior izquierda
            // rounded-br-none: mantiene recta la esquina inferior derecha
            className={`text-white px-10 py-3 rounded-t-full rounded-bl-full rounded-br-none font-medium transition-all hover:opacity-90 hover:scale-105 ${className}`}
        >
            {children}
        </button>
    );
}
