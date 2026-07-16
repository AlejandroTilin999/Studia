/**
 * Aplica la lógica de redondeo institucional:
 * - .6 sube al siguiente entero.
 * - .5 baja al entero actual.
 */
export const formatGrade = (value: number | string | null | undefined): string | number => {
    if (value === null || value === undefined || value === '—' || value === '') {
        return '—';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '—';

    // Lógica: .6 sube, .5 baja
    return Math.floor(num + 0.4);
};
