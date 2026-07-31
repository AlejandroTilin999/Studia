# Esquema de Base de Datos Studia (PrepaHID) 🗄️📚

A continuación se detallan las tablas operativas del sistema y sus respectivos campos. Se han excluido las tablas técnicas del sistema Laravel (`migrations`, `cache`, `jobs`, etc.).

---

## 👥 Usuarios y Perfiles

### `users`
Tabla maestra de acceso al sistema.
- **id** (bigint): Identificador único.
- **nombre** (string): Nombre(s).
- **apellido_paterno** (string): Primer apellido.
- **apellido_materno** (string): Segundo apellido.
- **email** (string): Correo institucional (login).
- **password** (string): Contraseña encriptada.
- **rol** (string): `admin`, `docente`, `alumno`.
- **activo** (boolean): Estado de la cuenta.
- **telefono** (string): Número de contacto.
- **password_changed** (boolean): Indica si ya cambió su clave inicial.

### `alumnos`
Información académica del estudiante.
- **id** (bigint): Identificador interno.
- **usuario_id** (fkey): Relación con `users`.
- **matricula** (string): Código único de alumno.
- **fecha_nacimiento** (date): Fecha de nacimiento.
- **estatus** (string): `active`, `suspended`, `graduated`.

### `docentes`
Información del personal académico.
- **id** (bigint): Identificador interno.
- **usuario_id** (fkey): Relación con `users`.
- **codigo_empleado** (string): Matrícula de profesor.
- **especialidad** (string): Carrera base.
- **areas** (json): Áreas técnicas de competencia.

---

## 🏫 Estructura Académica

### `ciclos_escolares`
Gestión de periodos de tiempo.
- **id** (bigint): Identificador.
- **nombre** (string): Ej: Ciclo 2026-2027 / Periodo A.
- **fecha_inicio / fecha_fin** (date): Rango de vigencia.
- **status** (string): `planificacion`, `activo`, `cerrado`.
- **p1 / p2 / p3 (inicio/fin/activo)**: Fechas de captura de parciales.

### `especialidades`
Carreras técnicas ofrecidas.
- **id** (bigint): Identificador.
- **nombre** (string): Ej: Informática.
- **codigo** (string): Ej: INF.
- **sub_areas** (json): Ramas técnicas de la carrera.

### `materias`
Catálogo de asignaturas.
- **id** (bigint): Identificador.
- **codigo** (string): Clave de materia.
- **nombre** (string): Nombre oficial.
- **semestre** (integer): Nivel sugerido (1-6).
- **tipo** (string): `General` o `Especialidad`.
- **area** (string): Ej: Matemáticas.

### `grupos`
Salones de clase físicos/lógicos.
- **id** (bigint): Identificador.
- **codigo** (string): Ej: 1A-INF.
- **nombre** (string): Ej: 1°A Informática.
- **especialidad** (string): Carrera asignada.
- **semestre** (integer): Semestre actual.
- **generacion** (string): Ej: 2026-2027.
- **docente_tutor_id** (fkey): Profesor titular.

---

## ⚙️ Operación Escolar

### `inscripciones`
Vinculación de alumnos con grupos y ciclos.
- **usuario_id** (fkey): Alumno.
- **grupo_id** (fkey): Grupo.
- **ciclo_id** (fkey): Periodo.
- **estatus** (string): Estado en ese ciclo.

### `cargas_academicas`
Horario y asignación docente (El puente de todo).
- **ciclo_id / grupo_id / materia_id / docente_id**: Relaciones clave.
- **uuid** (string): Identificador único para el aula virtual.
- **color_tema** (string): Personalización visual.
- **p1_cerrado / p2_cerrado / p3_cerrado**: Control de actas finales.

---

## 📝 Evaluaciones y Tareas

### `calificaciones`
Historial de notas del alumno.
- **p1 / p2 / p3 / final**: Notas parciales y definitivas.
- **estatus** (string): `aprobado`, `reprobado`.

### `criterios_evaluacion`
Esquema de calificación por parcial.
- **nombre** (string): Ej: Examen.
- **porcentaje** (integer): Ej: 50.
- **sincronizar_tareas** (boolean): Automatización.

### `tareas`
Actividades creadas por el docente.
- **nombre / descripcion / puntos / fecha_entrega**.

### `entregas_tareas`
Archivos y notas de tareas.
- **calificacion** (string): Nota obtenida.
- **archivo_url / archivo_nombre**: Datos de la entrega.

---

## 🔔 Comunicación y Auditoría

### `notificaciones`
Alertas del sistema.
- **titulo / mensaje / leido**.

### `auditoria_administrativa`
Bitácora de cambios sensibles.
- **accion / descripcion / metadata**.

### `reporte_descargas`
Control de generación de documentos.
- **tipo_reporte** (kardex, boleta, etc).

### `password_reset_requests`
Solicitudes de apoyo del Admin para claves.
