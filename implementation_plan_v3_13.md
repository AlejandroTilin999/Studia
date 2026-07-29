# Plan de Implementación: Áreas Técnicas en Especialidades (v3.13) 🛠️📂

Este plan detalla la adición de "Sub-áreas" a las especialidades (carreras técnicas) para permitir una clasificación más precisa de las materias de especialidad (ej: Programación, Redes, Gastronomía Caliente, etc.).

## 1. Evolución del Modelo de Datos 🏗️

### [NEW] Migración de Base de Datos
- Agregar columna `sub_areas` (JSON, nullable) a la tabla `especialidades`.

### [MODIFY] Modelo `Specialty.php`
- Cast de la columna `sub_areas` a `array`.

## 2. Gestión de Especialidades (Frontend) 🎨💎

### [MODIFY] `SpecialtyFormModal.tsx`
- Agregar una sección de "Áreas de la Especialidad".
- Permitir al usuario agregar y eliminar etiquetas (strings) que representen las ramas de la carrera.
- Ejemplo para Informática: `["Programación", "Bases de Datos", "Redes", "Sistemas Operativos", "Seguridad Informática"]`.

### [MODIFY] `SpecialtyController.php`
- Actualizar `store` y `update` para validar y guardar el array de `sub_areas`.

## 3. Registro de Materias (Frontend) 📚✨

### [MODIFY] `SubjectFormModal.tsx`
- **Lógica de Visibilidad:** Mostrar el campo "Área de Especialidad" cuando el tipo de materia sea "Especialidad".
- **Lógica de Opciones:** 
    - El dropdown de áreas se poblará dinámicamente con las `sub_areas` de las especialidades seleccionadas en los checkboxes.
    - Si no hay especialidades seleccionadas, se muestra un mensaje: "Selecciona un bachillerato primero".

## 4. Beneficios Esperados 🚀
- **Organización Curricular:** Permite agrupar materias técnicas por rama tecnológica o profesional.
- **Flexibilidad:** Cada carrera puede definir sus propias áreas sin afectar a las demás.

## Verificación Plan
### Técnica
- [ ] Agregar áreas a la especialidad "Informática".
- [ ] Crear una materia de tipo "Especialidad".
- [ ] Seleccionar "Informática" y verificar que el dropdown de áreas muestra "Programación", "Redes", etc.
- [ ] Guardar la materia y verificar que el área se persiste correctamente.
