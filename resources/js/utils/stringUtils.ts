/**
 * Formats a user's full name based on optional first name, paternal, and maternal surnames.
 */
export function formatFullName(
    nombre: string = '',
    apellidoPaterno: string = '',
    apellidoMaterno: string | null = ''
): string {
    return `${nombre} ${apellidoPaterno} ${apellidoMaterno || ''}`.trim() || 'Sin nombre';
}

/**
 * Calculates the GPA (Promedio General) for an array of grades.
 */
export function calculateGPA(grades: { score: number | string }[]): string {
    if (!grades || grades.length === 0) return '0.0';
    const sum = grades.reduce((acc, curr) => acc + Number(curr.score), 0);
    return (sum / grades.length).toFixed(1);
}
