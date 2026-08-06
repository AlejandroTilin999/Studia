# Plan de Optimización de Latencia y "Tormenta de Recargas" 🏎️⚡🛰️

Este plan resuelve el problema donde los eventos de tiempo real tardan hasta 50 segundos en reflejarse. El diagnóstico indica que el sistema está sufriendo una **"Tormenta de Recargas"**: el servidor emite muchos eventos seguidos (uno por cada alumno) y el navegador intenta recargar la página por cada uno, bloqueando el proceso.

## Diagnóstico Técnico
1.  **Reload Storm (Frontend)**: Cada vez que llega un evento `.GradeUpdated` o `.TaskCreated`, se ejecuta `router.reload()`. Si el docente guarda 30 tareas/notas, el alumno recibe 30 eventos y lanza 30 peticiones de recarga casi simultáneas.
2.  **Bloqueo Síncrono (Backend)**: Los eventos usan `ShouldBroadcastNow`. Esto obliga al servidor PHP a esperar que Reverb confirme la recepción de CADA mensaje antes de seguir con el siguiente alumno en el bucle.
3.  **Configuración de Latidos (Reverb)**: El intervalo de ping de 60s es muy alto, lo que puede causar que la conexión se sienta lenta al recuperarse de micro-cortes.

---

## Cambios Propuestos

### 1. Debounce de Recargas (Frontend)
#### [MODIFY] [useRealtime.ts](file:///C:/xampp/htdocs/Studia/resources/js/hooks/useRealtime.ts)
- Implementar un mecanismo de **acumulación y retardo (debounce)**.
- Si llegan 50 eventos en 1 segundo, solo se ejecutará **una única recarga** consolidada al final.
- **Efecto**: El navegador no se congela y la actualización es fluida. 🚀

### 2. Desacoplamiento de Eventos (Backend)
#### [MODIFY] [GradeUpdated.php](file:///C:/xampp/htdocs/Studia/app/Events/GradeUpdated.php) y [TaskCreated.php](file:///C:/xampp/htdocs/Studia/app/Events/TaskCreated.php)
- Cambiar `ShouldBroadcastNow` por `ShouldBroadcast`.
- **Efecto**: El servidor envía los eventos a la cola y responde inmediatamente al docente. Los eventos llegan al alumno milisegundos después sin bloquear la petición original.

### 3. Ajuste de Sensibilidad (Reverb)
#### [MODIFY] [config/reverb.php](file:///C:/xampp/htdocs/Studia/config/reverb.php)
- Reducir `ping_interval` a `30` y `activity_timeout` a `15`.
- **Efecto**: Conexión más agresiva y detección de fallos más rápida.

---

## Plan de Verificación
1. **Prueba de Estrés**: Guardar notas para un grupo de 40 alumnos como docente.
2. **Observación**:
   - El docente recibe la confirmación de "Guardado" instantáneamente.
   - El alumno ve el mensaje `[RT] Grade Updated` muchas veces en consola, pero solo ve **UNA** petición de red (XHR) de recarga.
   - La interfaz se actualiza en menos de 1 segundo. ✅

---

> [!IMPORTANT]
> El cambio a `ShouldBroadcast` requiere que el comando `php artisan queue:listen` esté corriendo (ya está configurado en tu script `npm run dev`).
