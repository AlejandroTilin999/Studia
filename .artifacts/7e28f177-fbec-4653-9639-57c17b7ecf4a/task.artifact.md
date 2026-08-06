# Tareas de Optimización de Tiempo Real 🛰️⚡

- [x] `[x]` **Fase 1: Estabilización del Frontend**
    - [x] Implementar debounce en `useRealtime.ts` para evitar múltiples recargas simultáneas.
    - [x] Ajustar `bootstrap.ts` con parámetros de reconexión más agresivos.
- [x] `[x]` **Fase 2: Desacoplamiento del Backend**
    - [x] Cambiar eventos de `ShouldBroadcastNow` a `ShouldBroadcast` (GradeUpdated, TaskCreated, etc).
    - [x] Optimizar `config/reverb.php` (tiempos de ping y actividad).
- [ ] `[/]` **Fase 3: Verificación y Pruebas**
    - [ ] Verificar que los eventos lleguen a través de la cola.
    - [ ] Comprobar que solo ocurra una recarga tras múltiples eventos.
