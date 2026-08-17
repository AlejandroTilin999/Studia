export type DocenteClassRoute = {
    classId: string | null;
    parcial: number | null;
    taskId: number | null;
};

export function buildDocenteClassUrl(classId: string, parcial?: number | null, taskId?: number | null): string {
    const base = `/docente/clases/${encodeURIComponent(classId)}`;
    if (!parcial) return base;

    const partialPath = `${base}/parcial/${parcial}`;
    return taskId ? `${partialPath}/tareas/${taskId}` : partialPath;
}

export function getDocenteClassRoute(): DocenteClassRoute {
    const match = window.location.pathname.match(/^\/docente\/clases\/([^/]+)(?:\/parcial\/(\d+))?(?:\/tareas\/(\d+))?\/?$/);
    if (match) {
        return {
            classId: decodeURIComponent(match[1]),
            parcial: match[2] ? Number(match[2]) : null,
            taskId: match[3] ? Number(match[3]) : null,
        };
    }

    // Compatibilidad temporal con enlaces compartidos antes de la migración.
    const params = new URLSearchParams(window.location.search);
    return {
        classId: params.get('id'),
        parcial: params.get('parcial') ? Number(params.get('parcial')) : null,
        taskId: null,
    };
}
