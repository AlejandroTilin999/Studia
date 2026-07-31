# Plan de Rediseño Lateral y Unificación de Alertas 📐🍭✨

Este plan tiene dos objetivos: evolucionar la página de Perfil hacia un diseño de "Asistente Lateral" y estandarizar el estilo de todas las alertas SweetAlert2 del sistema para que sean coherentes con la nueva identidad visual de PrepaHID.

## 1. Configuración con Navegación Lateral 🧼
- **Estructura Split-View**:
  - **Panel Izquierdo**: Navegación vertical (Stepper) con círculos conectados por una línea.
  - **Panel Derecho**: Lienzo blanco amplio para los formularios.
- **Estilo Zen**: Eliminación de sombras, elevaciones y recuadros azules pesados para favorecer un Flat Design limpio.

## 2. Unificación de SweetAlert2 🛡️
Para asegurar que todas las alertas del sistema tengan el mismo look "Premium":

### [Backend / JS Utility]
#### [MODIFY] [SwalHelper.ts](file:///C:/xampp/htdocs/Studia/resources/js/utils/SwalHelper.ts)
- **Azul Institucional**: Cambiar el color base de `#1e88e5` al azul fuerte oficial `#0266E0`. ✅
- **Estética Plana**: 
  - Popups con `rounded-2xl` o `rounded-3xl`.
  - Botones con `rounded-lg` (casi cuadrados) y sin sombras (`shadow-none`).
- **Nuevos Métodos**: 
  - `confirmDestructive`: Estilo especial para acciones de borrado (color rojo).
  - `passwordConfirm`: Unificar el diseño del modal que pide contraseña (usado en eliminar cuenta).

### [Frontend / Components]
#### [MODIFY] [DeleteUserForm.tsx](file:///C:/xampp/htdocs/Studia/resources/js/Pages/Perfil/Partials/DeleteUserForm.tsx)
- Reemplazar el `Swal.fire` manual por el nuevo método estandarizado de `SwalHelper`.

## Beneficios
- **Consistencia Total**: No importa qué acción haga el usuario, Studia siempre le responderá con el mismo lenguaje visual.
- **Integridad de Marca**: Refuerza el azul de PrepaHID en cada rincón interactivo.

## Plan de Verificación
1. Entrar a **Mi Perfil**.
2. Guardar un cambio y verificar que el Toast de éxito use el azul oficial. ✅
3. Probar la eliminación de cuenta y verificar que el diseño sea ancho, plano y perfectamente alineado.
