# Plan de Implementación: Dashboard de Reportes Dinámico y Completo

Este plan detalla la mejora de la barra lateral de reportes para que muestre estadísticas en tiempo real de todos los tipos de documentos, integrando animaciones de carga consistentes con el resto del sistema.

## Cambios Propuestos

### 1. Backend (Laravel)
#### [MODIFY] [ReportController.php](file:///C:/xampp/htdocs/Studia/app/Http/Controllers/ReportController.php)
- **Estadísticas Detalladas:** Actualizar `getReportStats` para desglosar cada tipo de reporte:
    - Total de Descargas.
    - Listas de Asistencia.
    - Boletas de Calificaciones.
    - Constancias de Estudios.
    - Historiales Académicos.
    - Paquetes Grupales (Lotes).
- **Carga Diferida:** Envolver `stats` y `recentDownloads` en `Inertia::defer`. Esto permitirá que la página cargue su estructura inmediatamente y muestre los indicadores de carga (puntos animados) mientras se obtienen los datos.

### 2. Frontend (React)
#### [MODIFY] [Index.tsx](file:///C:/xampp/htdocs/Studia/resources/js/Pages/Admin/Reportes/Index.tsx)
- **Gestión de Carga:** Configurar el prop `isLoading` de `AdminPageLayout` para que dependa de la presencia de `stats`. 
    - `isLoading={!stats}` activará automáticamente la animación de puntos en los widgets laterales.
- **Métricas Expandidas:** Ampliar el array de `metrics` para mostrar 4 indicadores clave en lugar de 3:
    1. **T1:** Descargas Totales.
    2. **T2:** Asistencias.
    3. **T3:** Boletas.
    4. **T4:** Constancias.
- **Gráfica de Dona Completa:** Incluir todos los tipos de reportes en los segmentos de la gráfica para una visión 360° de la actividad.

## Beneficios
- **Consistencia Visual:** El sidebar ahora mostrará los "dots" animados al cargar o recargar, igual que en el resto de la plataforma.
- **Información Completa:** El administrador tendrá una visión clara de cuántos documentos de cada tipo se están generando.
- **UX Fluida:** Al usar `Deferred`, el usuario no percibe bloqueos al entrar a la sección.

## Verificación Plan
### Manual
1. Entrar a la sección de Reportes y observar la animación de carga en los widgets laterales.
2. Generar diferentes tipos de reportes y verificar que los contadores específicos suben.
3. Confirmar que al recargar la página, se mantienen los estados y las animaciones de carga vuelven a aparecer brevemente.
