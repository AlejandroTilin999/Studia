export type AlumnoClassRoute = { loadId: string | null; parcial: number | null; taskId: number | null };

export function buildAlumnoClassUrl(loadId: string, parcial?: number | null, taskId?: number | null): string {
    const base = `/alumno/materias/${encodeURIComponent(loadId)}`;
    if (!parcial) return base;
    return taskId ? `${base}/parcial/${parcial}/tareas/${taskId}` : `${base}/parcial/${parcial}`;
}

export function getAlumnoClassRoute(): AlumnoClassRoute {
    const match = window.location.pathname.match(/^\/alumno\/materias\/([^/]+)(?:\/parcial\/(\d+))?(?:\/tareas\/(\d+))?\/?$/);
    if (match) return { loadId: decodeURIComponent(match[1]), parcial: match[2] ? Number(match[2]) : null, taskId: match[3] ? Number(match[3]) : null };

    const params = new URLSearchParams(window.location.search);
    return { loadId: params.get('c') || params.get('id'), parcial: params.get('parcial') ? Number(params.get('parcial')) : null, taskId: params.get('a') || params.get('task') ? null : null };
}
