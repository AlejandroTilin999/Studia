# Plan de Implementación: Centro de Notificaciones con Badge en Sidebar

Este plan detalla la creación de un sistema de notificaciones centralizado, con acceso directo desde el Sidebar y un contador visual (badge) para asegurar que el administrador note las solicitudes importantes.

## Cambios Realizados (ESTADO ACTUAL)

### 1. Compartir Datos Globales (Inertia)
- Añadido `unreadNotificationsCount` a las props compartidas en `HandleInertiaRequests.php`.

### 2. Actualización del Sidebar
- Nuevo elemento "Notificaciones" con icono `Bell`.
- Badge rojo con el número de alertas pendientes.

### 3. Backend (Controlador y Rutas)
- Controlador `NotificacionController.php` creado para listar y marcar como leídas las alertas.
- Rutas registradas en `web.php`.

### 4. Frontend (Centro de Notificaciones)
- Nueva página en `Admin/Notificaciones/Index.tsx` con diseño limpio y gestión masiva de lectura.

## Nota de Reversión Académica
Se ejecutó un proceso de limpieza para eliminar las tablas de planes de estudio y lógica de ciclos cerrados, manteniendo únicamente la estructura necesaria para las notificaciones.
