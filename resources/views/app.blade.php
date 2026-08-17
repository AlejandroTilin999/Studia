<!DOCTYPE html>
<html lang="es-MX">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <meta name="description" content="Prepahid: plataforma escolar para consultar actividades, calificaciones y servicios académicos.">
        @if (request()->is('admin*', 'docente*', 'alumno*', 'perfil*'))
            <meta name="robots" content="noindex, nofollow">
        @endif

        <!-- Web Application Manifest (PWA) -->
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0266E0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Prepahid" />

        <!-- Favicon y PWA Iconos -->
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/assets/icon-512.png" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Recurso común a todas las sesiones. Los banners por rol se cargan
             desde su componente para no descargar imágenes que no se usan. -->
        <link rel="preload" href="/assets/phid_logo.webp" as="image">
        @if (request()->is('alumno'))
            {{-- Se usa en la primera pantalla del alumno: descargarla antes de
                 hidratar React evita que aparezca tarde tras el loader. --}}
            <link rel="preload" href="/assets/alumno-dashboard.webp" as="image" type="image/webp" fetchpriority="high">
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
