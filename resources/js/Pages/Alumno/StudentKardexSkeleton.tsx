import StudiaSkeleton from '@/Components/ui/StudiaSkeleton';

export default function StudentKardexSkeleton(_: { label?: string; sublabel?: string }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Cargando materias">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-slate-100 bg-slate-50/70 p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                            <StudiaSkeleton className="h-5 w-2/5" />
                            <StudiaSkeleton className="h-3 w-3/5" />
                        </div>
                        <StudiaSkeleton className="h-8 w-20" />
                    </div>
                    <StudiaSkeleton className="h-px w-full" />
                    <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((__, partial) => <StudiaSkeleton key={partial} className="h-16 bg-white/80" />)}
                    </div>
                    <div className="flex justify-end"><StudiaSkeleton className="h-3 w-36" /></div>
                </div>
            ))}
        </div>
    );
}
