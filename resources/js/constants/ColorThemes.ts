export interface GroupColorTheme {
    bg: string;
    border: string;
    text: string;
    textMateria: string;
    badgeBg: string;
    strokeColor: string;
    dotBg: string;
    borderHover?: string;
    bgSoft?: string;
    textDark?: string;
}

export const COLOR_THEMES: Record<string, GroupColorTheme> = {
    blue: {
        bg: 'bg-[#e8f0fe]',
        border: 'border-blue-100',
        text: 'text-blue-700',
        textMateria: 'text-blue-600',
        badgeBg: 'bg-blue-500/10',
        strokeColor: '#1e88e5',
        dotBg: 'bg-[#1e88e5]',
    },
    emerald: {
        bg: 'bg-[#E6F2DD]',
        border: 'border-[#E6F2DD]',
        text: 'text-[#16a34a]',
        textMateria: 'text-[#16a34a]',
        badgeBg: 'bg-emerald-500/10',
        strokeColor: '#16a34a',
        dotBg: 'bg-[#16a34a]',
    },
    amber: {
        bg: 'bg-[#FFECDB]',
        border: 'border-amber-100',
        text: 'text-amber-600',
        textMateria: 'text-amber-600',
        badgeBg: 'bg-amber-500/10',
        strokeColor: '#d97706',
        dotBg: 'bg-[#d97706]',
    },
    fuchsia: {
        bg: 'bg-[#FFE4EF]',
        border: 'border-pink-100',
        text: 'text-pink-700',
        textMateria: 'text-pink-600',
        badgeBg: 'bg-pink-500/10',
        strokeColor: '#fd3e9d',
        dotBg: 'bg-[#fd3e9d]',
    },
    slate: {
        bg: 'bg-[#f1f5f9]',
        border: 'border-slate-200',
        text: 'text-slate-700',
        textMateria: 'text-slate-600',
        badgeBg: 'bg-slate-500/10',
        strokeColor: '#64748b',
        dotBg: 'bg-[#64748b]',
    },
    rojo: {
        bg: 'bg-[#fae8e8]',
        border: 'border-[#f4e8e8]',
        text: 'text-red-600',
        textMateria: 'text-red-600',
        badgeBg: 'bg-red-500/10',
        strokeColor: '#e93232',
        dotBg: 'bg-[#e93232]',
    },
    morado: {
        bg: 'bg-[#EBEAFF]',
        border: 'border-[#f4e8f4]',
        text: 'text-[#8b5cf6]',
        textMateria: 'text-[#8b5cf6]',
        badgeBg: 'bg-purple-500/10',
        strokeColor: '#8b5cf6',
        dotBg: 'bg-[#8b5cf6]',
    },
};
