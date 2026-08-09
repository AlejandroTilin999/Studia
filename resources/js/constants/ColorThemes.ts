export interface GroupColorTheme {
    label: string;
    bg: string;
    bgHex: string;
    border: string;
    text: string;
    textHex: string;
    textMateria: string;
    badgeBg: string;
    badgeHex: string;
    strokeColor: string;
    dotBg: string;
    borderHover: string;
    bgSoft: string;
    textDark: string;
}

export const COLOR_THEMES: Record<string, GroupColorTheme> = {
    blue: {
        label: 'Azul',
        bg: 'bg-[#e8f0fe]',
        bgHex: '#e8f0fe',
        border: 'border-blue-100',
        text: 'text-blue-700',
        textHex: '#1d4ed8',
        textMateria: 'text-blue-600',
        badgeBg: 'bg-blue-500/10',
        badgeHex: 'rgba(30, 136, 229, 0.15)',
        strokeColor: '#1e88e5',
        dotBg: 'bg-[#1e88e5]',
        borderHover: 'hover:border-blue-200',
        bgSoft: 'hover:bg-blue-50/50',
        textDark: 'text-blue-900',
    },
    emerald: {
        label: 'Verde',
        bg: 'bg-[#E6F2DD]',
        bgHex: '#E6F2DD',
        border: 'border-[#E6F2DD]',
        text: 'text-[#15803d]',
        textHex: '#15803d',
        textMateria: 'text-[#15803d]',
        badgeBg: 'bg-emerald-500/10',
        badgeHex: 'rgba(22, 163, 74, 0.15)',
        strokeColor: '#16a34a',
        dotBg: 'bg-[#16a34a]',
        borderHover: 'hover:border-emerald-200',
        bgSoft: 'hover:bg-emerald-50/50',
        textDark: 'text-emerald-900',
    },
    amber: {
        label: 'Naranja',
        bg: 'bg-[#FFECDB]',
        bgHex: '#FFECDB',
        border: 'border-amber-100',
        text: 'text-amber-700',
        textHex: '#c2410c',
        textMateria: 'text-amber-700',
        badgeBg: 'bg-amber-500/10',
        badgeHex: 'rgba(217, 119, 6, 0.15)',
        strokeColor: '#d97706',
        dotBg: 'bg-[#d97706]',
        borderHover: 'hover:border-amber-200',
        bgSoft: 'hover:bg-amber-50/50',
        textDark: 'text-amber-900',
    },
    fuchsia: {
        label: 'Rosa',
        bg: 'bg-[#FFE4EF]',
        bgHex: '#FFE4EF',
        border: 'border-pink-100',
        text: 'text-pink-700',
        textHex: '#be185d',
        textMateria: 'text-pink-700',
        badgeBg: 'bg-pink-500/10',
        badgeHex: 'rgba(253, 62, 157, 0.15)',
        strokeColor: '#fd3e9d',
        dotBg: 'bg-[#fd3e9d]',
        borderHover: 'hover:border-pink-200',
        bgSoft: 'hover:bg-pink-50/50',
        textDark: 'text-pink-900',
    },
    slate: {
        label: 'Gris',
        bg: 'bg-[#f1f5f9]',
        bgHex: '#f1f5f9',
        border: 'border-slate-200',
        text: 'text-slate-700',
        textHex: '#334155',
        textMateria: 'text-slate-600',
        badgeBg: 'bg-slate-500/10',
        badgeHex: 'rgba(100, 116, 139, 0.15)',
        strokeColor: '#64748b',
        dotBg: 'bg-[#64748b]',
        borderHover: 'hover:border-slate-300',
        bgSoft: 'hover:bg-slate-100/50',
        textDark: 'text-slate-900',
    },
    rojo: {
        label: 'Rojo',
        bg: 'bg-[#fae8e8]',
        bgHex: '#fae8e8',
        border: 'border-[#f4e8e8]',
        text: 'text-red-700',
        textHex: '#b91c1c',
        textMateria: 'text-red-700',
        badgeBg: 'bg-red-500/10',
        badgeHex: 'rgba(233, 50, 50, 0.15)',
        strokeColor: '#e93232',
        dotBg: 'bg-[#e93232]',
        borderHover: 'hover:border-red-200',
        bgSoft: 'hover:bg-red-50/50',
        textDark: 'text-red-900',
    },
    morado: {
        label: 'Morado',
        bg: 'bg-[#EBEAFF]',
        bgHex: '#EBEAFF',
        border: 'border-[#f4e8f4]',
        text: 'text-purple-700',
        textHex: '#6b21a8',
        textMateria: 'text-purple-700',
        badgeBg: 'bg-purple-500/10',
        badgeHex: 'rgba(139, 92, 246, 0.15)',
        strokeColor: '#8b5cf6',
        dotBg: 'bg-[#8b5cf6]',
        borderHover: 'hover:border-purple-200',
        bgSoft: 'hover:bg-purple-50/50',
        textDark: 'text-purple-900',
    },
};
