<!-- resources/views/welcome.blade.php -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inicio</title>
    <!-- Esto carga Vite y tu archivo de React -->
    @vite(['resources/js/app.jsx']) 
</head>
<body>
    <div class="text-blue-500 font-bold text-2xl">
    <h1>Prueba React en Laravel</h1>
</div>
    <!-- Aquí se inyectará tu componente de React -->
    <div id="root"></div>
</body>
</html>