/**
 * Limpia números y símbolos no válidos en nombres propios,
 * capitaliza la primera letra de cada palabra y pasa el resto a minúsculas.
 * Ejemplo: "juan123 carlos456" -> "Juan Carlos"
 * Ejemplo: "MARÍA DE LOS ÁNGELES 99" -> "María De Los Ángeles "
 */
export function capitalizeWords(val: string): string {
    if (!val) return '';
    // 1. Remover dígitos y símbolos especiales no permitidos en nombres
    const onlyLetters = val.replace(/[^a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s'-]/g, '');

    // 2. Capitalizar la primera letra de cada palabra
    return onlyLetters.replace(/\b([a-záéíóúñüA-ZÁÉÍÓÚÑÜ])([a-záéíóúñüA-ZÁÉÍÓÚÑÜ]*)/g, (_, firstChar, rest) => {
        return firstChar.toUpperCase() + rest.toLowerCase();
    });
}
