
interface GroupColorTheme {
    bg: string;
    border: string;
    text: string;
    textMateria: string;
    badgeBg: string;
    strokeColor: string;
    dotBg: string;
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
        text: 'text-[#004000ff]',
        textMateria: 'text-[#004000ff]',
        badgeBg: 'bg-emerald-500/10',
        strokeColor: '#2bad00ff',
        dotBg: 'bg-[#E6F2DD]',
    },
    amber: {
        bg: 'bg-[#FFECDB]',
        border: 'border-amber-100',
        text: 'text-amber-600',
        textMateria: 'text-amber-600',
        badgeBg: 'bg-amber-500/10',
        strokeColor: '#d97706',
        dotBg: 'bg-[#FFD6BA]',
    },
    fuchsia: {
        bg: 'bg-[#FFE4EF]',
        border: 'border-pink-100',
        text: 'text-pink-700',
        textMateria: 'text-pink-600',
        badgeBg: 'bg-pink-500/10',
        strokeColor: '#FF007F',
        dotBg: 'bg-[#FDB5CE]',
    },
    slate: {
        bg: 'bg-[#f1f5f9]',
        border: 'border-slate-200',
        text: 'text-slate-700',
        textMateria: 'text-slate-600',
        badgeBg: 'bg-slate-500/10',
        strokeColor: '#94a3b8',
        dotBg: 'bg-[#94a3b8]',
    },

    rojo: {
        bg: 'bg-[#fae8e8]',
        border: 'border-[#f4e8e8]',
        text: 'text-red-600',
        textMateria: 'text-red-600',
        badgeBg: 'bg-red-500/10',
        strokeColor: '#962626ff',
        dotBg: 'bg-[#CD2C58]',
    },
    morado: {
        bg: 'bg-[#EBEAFF]',
        border: 'border-[#f4e8f4]',
        text: 'text-[#9B7EBD]',
        textMateria: 'text-[#9B7EBD]',
        badgeBg: 'bg-purple-500/10',
        strokeColor: '#9e9be2ff',
        dotBg: 'bg-[#EBEAFF]',
    },

};
