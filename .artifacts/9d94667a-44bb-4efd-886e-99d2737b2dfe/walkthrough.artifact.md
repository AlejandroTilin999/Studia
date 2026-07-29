# Studia v3.17: Reestructuración y Lógica de Materias 🛠️📚

Se ha optimizado la lógica de datos y el flujo visual del formulario de registro de materias para asegurar que la información técnica se cargue correctamente y el proceso de captura sea más natural para el administrador.

## 1. Conexión de Datos Técnicos 🧠📡
Se corrigió un problema en el intercambio de información entre el servidor y el cliente:
- **Paso de Sub-áreas:** El controlador de materias ahora envía explícitamente el catálogo de ramas técnicas (sub-áreas) junto con las especialidades. Esto permite que el dropdown de "Rama / Área Técnica" se pueble dinámicamente según los bachilleratos seleccionados.

## 2. Reorganización Visual del Formulario 🎨📏
El formulario se reestructuró siguiendo el flujo mental lógico de la planeación académica:
- **Prioridad de Bachillerato:** La selección de "Bachilleratos Asociados" se movió hacia arriba, justo debajo del tipo de materia. Esto establece el contexto necesario antes de elegir la rama técnica.
- **Selector Dinámico Mejorado:** El dropdown de "Rama Técnica" ahora aparece inmediatamente después de los bachilleratos, facilitando la categorización de la materia.
- **Foco en el Objetivo:** El campo de "Descripción / Objetivo" se reubicó al final del formulario, funcionando como el detalle de cierre una vez definida la estructura base de la materia.

## 3. Estilo Minimalista Consistente 🧼💎
Se mantuvieron los ajustes estéticos previos para garantizar una interfaz ligera:
- **Normalización de Pesos:** Se eliminaron las negritas innecesarias en las etiquetas y campos de clave.
- **Normalización de Espaciado:** Se ajustó el `tracking` de las letras a su estado normal para mejorar la legibilidad.

## Verificación Final
- [x] El controlador envía `sub_areas`: OK.
- [x] El dropdown de ramas técnicas muestra opciones al marcar bachilleratos: OK.
- [x] Reordenamiento de campos en el modal: OK.
- [x] Descripción al final del formulario: OK.

> [!TIP]
> Con este nuevo orden, registrar materias técnicas es mucho más rápido, ya que el sistema te guía paso a paso desde lo general (Tipo) hasta lo específico (Rama) y lo descriptivo (Objetivo). 🚀📂
