import { ChevronDown } from 'lucide-react';

interface StudentCalendarCardProps {
    calendarDays?: number[];
}

export default function StudentCalendarCard({
    calendarDays = Array.from({ length: 31 }, (_, i) => i + 1)
}: StudentCalendarCardProps) {
    return (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-3 select-none">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Mi calendario</span>
                <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold text-slate-650 cursor-pointer transition-all">
                    <span>Abril</span>
                    <ChevronDown size={11} className="text-slate-400" />
                </div>
            </div>
            
            {/* Days Content */}
            <div>
                {/* Days Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => (
                        <span key={d} className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">{d}</span>
                    ))}
                </div>
                
                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center font-body">
                    {calendarDays.map((day) => {
                        const isCurrent = day === 2;
                        const hasEventDay12 = day === 12;
                        const hasEventDay13 = day === 13;

                        return (
                            <div key={day} className="h-7 w-7 flex items-center justify-center select-none relative mx-auto">
                                {isCurrent ? (
                                    <span className="w-7 h-7 bg-blue-600 text-white font-black rounded-lg flex items-center justify-center text-xs shadow-md shadow-blue-500/10 cursor-pointer hover:scale-105 transition-all">
                                        {day}
                                    </span>
                                ) : (
                                    <span className={`w-7 h-7 flex flex-col items-center justify-center rounded-lg text-xs cursor-pointer hover:bg-slate-50 transition-all ${
                                        hasEventDay12 || hasEventDay13 ? 'font-black text-slate-800' : 'font-bold text-slate-500 hover:text-slate-800'
                                    }`}>
                                        <span>{day}</span>
                                        {/* Event Indicators */}
                                        {hasEventDay12 && (
                                            <span className="absolute bottom-0.5 flex gap-0.5">
                                                <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                                                <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                                            </span>
                                        )}
                                        {hasEventDay13 && (
                                            <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-emerald-500"></span>
                                        )}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
