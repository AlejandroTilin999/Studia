# Plan de Reestructuración y Mejora del Perfil

Este plan detalla los cambios para renombrar la sección de perfil, incluir el nombre completo del usuario y restringir la edición del correo electrónico.

## Cambios Propuestos

### 1. Reestructuración de Archivos
#### [RENAME] `resources/js/Pages/Profile` -> [Perfil](file:///C:/xampp/htdocs/Studia/resources/js/Pages/Perfil)
- Renombrar la carpeta física para usar el término en español "Perfil".

### 2. Backend (Controladores y Requests)
#### [MODIFY] [ProfileController.php](file:///C:/xampp/htdocs/Studia/app/Http/Controllers/ProfileController.php)
- Actualizar el método `edit` para renderizar `Perfil/Edit` en lugar de `Profile/Edit`.

#### [MODIFY] [ProfileUpdateRequest.php](file:///C:/xampp/htdocs/Studia/app/Http/Requests/ProfileUpdateRequest.php)
- Agregar reglas de validación para `apellido_paterno` (requerido, string, max:255).
- Agregar reglas de validación para `apellido_materno` (requerido, string, max:255).

### 3. Frontend (Componentes de React)
#### [MODIFY] [UpdateProfileInformationForm.tsx](file:///C:/xampp/htdocs/Studia/resources/js/Pages/Perfil/Partials/UpdateProfileInformationForm.tsx) (después del rename)
- **Nombre Completo:** Añadir campos de entrada para Apellido Paterno y Apellido Materno.
- **Correo Electrónico:** Añadir el atributo `disabled` al campo de correo electrónico para evitar su modificación.
- **Estado Inicial:** Actualizar `useForm` para incluir los nuevos campos.

### 4. Rutas
- Las rutas en `web.php` ya apuntan al `ProfileController`, el cual ahora renderizará la vista correcta desde la nueva carpeta. No es estrictamente necesario cambiar los nombres de las rutas (`profile.edit`, etc.) a menos que se desee total consistencia, pero por ahora mantendremos la funcionalidad.

## Verificación Plan

### Automatizada
- Verificar que el controlador renderiza la nueva ruta.

### Manual
- Acceder a `/profile` y confirmar que carga la página desde la carpeta `Perfil`.
- Intentar editar el nombre y apellidos y guardar los cambios.
- Confirmar que el campo de correo electrónico está deshabilitado y no permite escritura.
