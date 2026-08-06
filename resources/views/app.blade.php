<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Preload Critical Images -->
        <link rel="preload" href="/assets/phid_logo.webp" as="image">
        <link rel="preload" href="/assets/alumna.webp" as="image">
        <link rel="preload" href="/assets/hero-img.webp" as="image">
        <link rel="preload" href="/assets/studia-logo.webp" as="image">
        <link rel="preload" href="/assets/admin-dashboard.webp" as="image">
        <link rel="preload" href="/assets/docente-dashboard.webp" as="image">

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
