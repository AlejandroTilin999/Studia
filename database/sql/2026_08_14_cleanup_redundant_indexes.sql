-- STUDIA: limpieza de índices redundantes para PostgreSQL / Supabase.
-- No modifica datos. Ejecuta cada sentencia por separado en SQL Editor;
-- CREATE/DROP INDEX CONCURRENTLY no puede correr dentro de una transacción.

DROP INDEX CONCURRENTLY IF EXISTS public.idx_tareas_id_carga;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_entregas_tarea_usuario;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_calificaciones_usuario_carga_criterio;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_calificaciones_user_carga;
DROP INDEX CONCURRENTLY IF EXISTS public.uq_calificaciones_usuario_carga_criterio;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_inscripciones_usuario_ciclo_estatus;
DROP INDEX CONCURRENTLY IF EXISTS public.inscripciones_usuario_id_index;

-- Después de ejecutar, actualiza las estadísticas del optimizador.
ANALYZE public.inscripciones;
ANALYZE public.cargas_academicas;
ANALYZE public.criterios_evaluacion;
ANALYZE public.tareas;
ANALYZE public.entregas_tareas;
ANALYZE public.calificaciones;
