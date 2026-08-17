/** Previene Self-XSS; no sustituye la seguridad del servidor. */
export function showConsoleSafetyWarning(): void {
    // Esta llamada indirecta conserva únicamente este aviso intencional tras
    // eliminar los console.* internos del bundle de producción.
    const browserConsole = window['console'];
    browserConsole?.log(
        '%c¡ADVERTENCIA!%c\n\nSi usas esta consola, un atacante podría suplantar tu identidad y robar tu información mediante un ataque llamado Self-XSS.\nNo ingreses ni pegues ningún código que no entiendas.',
        'background:#fff200;color:#ff0000;font-family:monospace;font-size:26px;font-weight:400;padding:2px 4px;',
        'color:#f5f5f5;font-family:monospace;font-size:20px;font-weight:400;line-height:1.35;',
    );
}
