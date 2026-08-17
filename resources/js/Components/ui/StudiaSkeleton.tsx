import { cn } from '@/lib/utils';

interface StudiaSkeletonProps {
    className?: string;
}

/** Base visual única para estados de carga de Studia. */
export default function StudiaSkeleton({ className }: StudiaSkeletonProps) {
    return <div aria-hidden="true" className={cn('animate-pulse rounded-xl bg-slate-200/65', className)} />;
}

export function StudiaTextSkeleton({ className }: StudiaSkeletonProps) {
    return <StudiaSkeleton className={cn('h-3 rounded-md', className)} />;
}
