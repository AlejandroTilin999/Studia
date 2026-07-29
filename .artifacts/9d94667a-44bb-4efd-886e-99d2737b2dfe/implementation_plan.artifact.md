# Plan de Implementación: Flexibilidad de Configuración en Planeación (v3.19) 🛠️⚙️

Este plan detalla los ajustes técnicos para permitir que los docentes configuren sus criterios de evaluación durante el **Modo Planeación**, manteniendo bloqueada la captura operativa (notas y tareas) hasta que el ciclo sea oficial.

## 1. Evolución del Servicio de Validación 🧠📡

#### [MODIFY] [AcademicPeriodService.php](file:///C:/xampp/htdocs/Studia/app/Services/AcademicPeriodService.php)
- Refinar `isCapturaHabilitada` para aceptar un tercer parámetro: `$tipo` (`'config'` o `'operacion'`).
- **Lógica para `'config'`:**
    - Permitido si el ciclo está en `status` **activo** O **planificacion**.
- **Lógica para `'operacion'`:**
    - Solo permitido si el ciclo está en `status` **activo** (Vigente).
    - Mantiene las validaciones de fechas y switch manual.

## 2. Ajustes en Middleware y Controladores 🛡️✅

#### [MODIFY] [EnsureCapturaHabilitada.php](file:///C:/xampp/htdocs/Studia/app/Http/Middleware/EnsureCapturaHabilitada.php)
- Detectar la ruta solicitada:
    - Si la URI contiene `/criterios`, llamar al servicio con el modo `'config'`.
    - Para el resto de rutas protegidas, usar modo `'operacion'`.

#### [MODIFY] [DocenteClassroomController.php](file:///C:/xampp/htdocs/Studia/app/Http/Controllers/DocenteClassroomController.php)
- Actualizar `getConfig` para devolver dos estados de bloqueo:
    - `lock_config`: Indica si se pueden editar criterios.
    - `lock_operacion`: Indica si se pueden subir notas/tareas.

## 3. Experiencia de Usuario (Frontend) 🎨💎

#### [MODIFY] [useGroupClass.ts](file:///C:/xampp/htdocs/Studia/resources/js/Pages/Docente/Grupos/Show/hooks/useGroupClass.ts)
- Procesar los nuevos campos de bloqueo (`lock_config`, `lock_operacion`).
- Habilitar el botón de "Configurar" en el Wizard incluso en planeación.

#### [MODIFY] [Show.tsx](file:///C:/xampp/htdocs/Studia/resources/js/Pages/Docente/Grupos/Show.tsx)
- Ajustar el banner de "Periodo Bloqueado" para que sea más específico: *"⚠️ Captura de notas bloqueada: El ciclo escolar está en fase de preparación."*

## Verificación Plan
### Técnica
- [ ] Crear un ciclo en modo planeación.
- [ ] Entrar con un usuario docente a una clase.
- [ ] Verificar que el Wizard de criterios está habilitado y permite guardar.
- [ ] Verificar que las pestañas de "Calificaciones" y "Tareas" muestran el candado y bloquean el guardado.
