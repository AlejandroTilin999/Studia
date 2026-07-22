# Plan de Simplificación y Ajuste de la Página de Inicio (Welcome)

Este plan detalla los ajustes para limpiar la página de inicio, eliminando la barra de navegación y optimizando el espacio visual en dispositivos móviles.

## Cambios Propuestos

### 1. Eliminación de Navbar
#### [MODIFY] [Welcome.tsx](file:///C:/xampp/htdocs/Studia/resources/js/Pages/Welcome.tsx)
- Eliminar el componente `<Navbar />` y su importación. Esto permitirá que la sección visual azul ocupe todo el ancho superior sin interrupciones.

### 2. Optimización de la Sección Visual (Móvil)
#### [MODIFY] [Welcome.tsx](file:///C:/xampp/htdocs/Studia/resources/js/Pages/Welcome.tsx)
- **Reducción de Altura:** Ajustar la altura de la sección azul en móviles de `h-[480px]` a `h-[380px]` para que el contenido de texto sea visible más rápidamente.
- **Reposicionamiento del Logo:** Mover el logotipo blanco `logo-ph-blanco.png` desde la parte inferior a la parte superior de la sección azul (`top-10`), centrándolo o alineándolo según la estética de la imagen.
- **Ajuste de Empuje:** Reducir el padding superior del contenido (`pt-[400px]` a `pt-[320px]`) para que los títulos y botones se alineen perfectamente con la nueva altura de la sección visual.

## Plan de Verificación

### Verificación Manual
- Abrir la página en modo móvil y confirmar que no existe el menú hamburguesa ni la barra superior.
- Verificar que el logo blanco aparece arriba de la imagen de la chica.
- Asegurarse de que el texto "Todo lo que necesitas..." no se encime con la cara de la chica y sea fácil de leer.
